import Texture2D from './texture2D';
import { vec4 } from 'gl-matrix';
import Texture3D from './texture3D';

export default class FrameBuffer {
    handle: WebGLFramebuffer;
    attachments: [];

    constructor(private gl: WebGL2RenderingContext, public width: number, public height: number) {
        this.handle = gl.createFramebuffer();
    }

    bind(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.handle);
    }

    clear(color: [number, number, number, number] = [ 0, 0, 0, 0 ], bits: number = this.gl.COLOR_BUFFER_BIT): void {
        this.gl.clearColor(color[0], color[1], color[2], color[3]);
        this.gl.clear(bits);
    }

    colorAttachment(attachmentIndex: number, texture: Texture2D, doCheck: boolean = true) {
        if (doCheck) {
            if (texture.width != this.width || texture.height != this.height) {
                throw new Error('The dimensions of the attachment must match the framebuffer dimensions!');
            }
        }

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0 + attachmentIndex,
            this.gl.TEXTURE_2D,
            texture.handle,
            0
        );

        if (doCheck) {
            if (!this.check()) {
                console.log(
                    `Framebuffer not complete after attaching color attachment ${attachmentIndex}: ${this.getError()}`
                );
            }
        }
    }

    depthAttachment(texture: Texture2D, doCheck: boolean = true) {
        if (doCheck) {
            if (texture.width != this.width || texture.height != this.height) {
                throw new Error('The dimensions of the attachment must match the framebuffer dimensions!');
            }
        }

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_ATTACHMENT,
            this.gl.TEXTURE_2D,
            texture.handle,
            0
        );

        if (doCheck) {
            if (!this.check()) {
                console.log(`Framebuffer not complete after attaching depth attachment: ${this.getError()}`);
            }
        }
    }

    stencilAttachment(texture: Texture2D, doCheck: boolean = true) {
        if (doCheck) {
            if (texture.width != this.width || texture.height != this.height) {
                throw new Error('The dimensions of the attachment must match the framebuffer dimensions!');
            }
        }

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.STENCIL_ATTACHMENT,
            this.gl.TEXTURE_2D,
            texture.handle,
            0
        );

        if (doCheck) {
            if (!this.check()) {
                console.log(`Framebuffer not complete after attaching stencil attachment: ${this.getError()}`);
            }
        }
    }

    depthStencilAttachment(texture: Texture2D, doCheck: boolean = true) {
        if (doCheck) {
            if (texture.width != this.width || texture.height != this.height) {
                throw new Error('The dimensions of the attachment must match the framebuffer dimensions!');
            }
        }

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.DEPTH_STENCIL_ATTACHMENT,
            this.gl.TEXTURE_2D,
            texture.handle,
            0
        );

        if (doCheck) {
            if (!this.check()) {
                console.log(`Framebuffer not complete after attaching depth-stencil attachment: ${this.getError()}`);
            }
        }
    }

    colorAttachmentLayer(attachmentIndex: number, texture: Texture3D, layer: number, doCheck: boolean = true) {
        if (doCheck) {
            if (texture.width != this.width || texture.height != this.height) {
                throw new Error('The dimensions of the attachment must match the framebuffer dimensions!');
            }

            if (layer < 0 || layer >= texture.depth) {
                throw new Error('Layer must be in range [0, textureDepth]!');
            }
        }

        this.gl.framebufferTextureLayer(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0 + attachmentIndex,
            texture.handle,
            0,
            layer
        );

        if (doCheck) {
            if (!this.check()) {
                console.log(
                    `Framebuffer not complete after attaching color attachment ${attachmentIndex} of texture layer ${layer}: ${this.getError()}`
                );
            }
        }
    }

    check(): boolean {
        let status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        return status == this.gl.FRAMEBUFFER_COMPLETE;
    }

    getError(): string {
        let status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        switch (status) {
            case this.gl.FRAMEBUFFER_COMPLETE:
                return '';
            case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
                return 'Incomplete attachment';
            case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
                return 'Missing attachment';
            case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
                return 'Dimensions of attachments do not match';
            case this.gl.FRAMEBUFFER_UNSUPPORTED:
                return 'Attachment is unsupported';
            default:
                return 'Unknown framebuffer status';
        }
    }

    applyViewport(): void {
        this.gl.viewport(0, 0, this.width, this.height);
    }

    resetViewport(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    }

    drawBuffers(color: number[], depth: boolean = false, stencil: boolean = false): void {
        let drawBuffers = [];
        color.forEach((c) => drawBuffers.push(this.gl.COLOR_ATTACHMENT0 + c));
        if (depth) drawBuffers.push(this.gl.DEPTH_ATTACHMENT);
        if (stencil) drawBuffers.push(this.gl.STENCIL_ATTACHMENT);
        this.gl.drawBuffers(drawBuffers);
    }

    unbind(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
}
