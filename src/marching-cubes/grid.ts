import vertexSource from '../glsl/sdf-generator/shader.vertex.glsl';
import fragmentSource from '../glsl/sdf-generator/shader.fragment.glsl';
import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgram } from '../rendering/shader/functions';
import Texture3D from '../rendering/texture3D';
import FrameBuffer from '../rendering/frameBuffer';

export default class Grid {
    totalSize: number;
    sheetSize: number;
    rowSize: number;
    field: Float32Array;
    useIntegers: boolean = false;

    texture: Texture3D;
    framebuffer: FrameBuffer;

    vao: WebGLVertexArrayObject;
    vbo: WebGLBuffer;

    program: ShaderProgram;

    private time: number = 0.0;

    constructor(
        private gl: WebGL2RenderingContext,
        public xSize: number,
        public ySize: number,
        public zSize: number,
        public xScale: number,
        public yScale: number,
        public zScale: number
    ) {
        this.totalSize = this.xSize * this.ySize * this.zSize;
        this.sheetSize = this.xSize * this.zSize;
        this.rowSize = this.xSize;
        this.field = new Float32Array(xSize * ySize * zSize);
        this.program = makeProgram(this.gl, vertexSource, fragmentSource);
        this.setup();
    }

    private setup(): void {
        this.createFieldTexture();
        this.createFramebuffer();
        this.setupPass();
    }

    private createFieldTexture(): void {
        this.texture = new Texture3D (
            this.gl,
            {
                width: this.xSize, height: this.ySize, depth: this.zSize,
                internalFormat: this.gl.R32F, format: this.gl.RED, dataType: this.gl.FLOAT
            }
        )
    }

    private createFramebuffer(): void {
        this.framebuffer = new FrameBuffer (this.gl, this.xSize, this.ySize)
    }

    private setupPass(): void {
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        let vertexData: number[] = [];
        vertexData.push(-1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, -1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexData), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
    }

    update(resolution: [number, number], delta: number): void {
        this.time += delta;

        let numAttachments = 4;
        let drawBuffers = [];
        for (let i = 0; i < numAttachments; i++) {
            drawBuffers.push(i);
        }

        let numPasses = this.zSize / numAttachments;
        for (let i = 0; i < numPasses; i++) {

            this.framebuffer.bind ()
            for (let j = 0; j < numAttachments; j++) {
                this.framebuffer.colorAttachmentLayer (j, this.texture, i * numAttachments + j, false)
            }
            this.framebuffer.drawBuffers (drawBuffers)
            this.framebuffer.clear ([255, 255, 255, 255])
            this.framebuffer.applyViewport ()

            this.program.use();

            this.program.setUniform('u_layerOffset', i * numAttachments);
            this.program.setUniform('u_gridSize', [ this.xSize, this.ySize, this.zSize ]);
            this.program.setUniform('u_time', this.time);

            this.gl.bindVertexArray(this.vao);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }

        /* this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, resolution[0], resolution[1]); */
        this.framebuffer.unbind ()
        this.framebuffer.resetViewport ()
    }
}
