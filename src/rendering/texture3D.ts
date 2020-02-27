import Texture, { TextureConfiguration, fillMissingConfigWithDefaults } from './texture';

export default class Texture3D implements Texture {
    handle: WebGLTexture;
    minFilter: GLenum;
    magFilter: GLenum;
    wrapS: GLenum;
    wrapT: GLenum;
    wrapR: GLenum;
    format: GLenum;
    internalFormat: GLenum;
    dataType: GLenum;
    width: number;
    height: number;
    depth: number;
    data: Float32Array | Int32Array = null;

    constructor(private gl: WebGL2RenderingContext, config: TextureConfiguration) {
        this.handle = this.gl.createTexture();
        config = fillMissingConfigWithDefaults(gl, config, false);
        console.log (config)

        this.minFilter = config.minFilter;
        this.magFilter = config.magFilter;
        this.wrapS = config.wrapS;
        this.wrapT = config.wrapT;
        this.wrapR = config.wrapR;
        this.format = config.format;
        this.internalFormat = config.internalFormat;
        this.dataType = config.dataType;
        this.width = config.width;
        this.height = config.height;
        this.depth = config.depth;
        this.data = config.data;

        this.setup();
    }

    private setup(): void {
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.handle);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.wrapT);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.wrapR);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.internalFormat,
            this.width,
            this.height,
            this.depth,
            0,
            this.format,
            this.dataType,
            this.data
        );
    }

    bind(textureUnit?: number | null): void {
        if (textureUnit != null) {
            this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        }
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.handle);
    }
}
