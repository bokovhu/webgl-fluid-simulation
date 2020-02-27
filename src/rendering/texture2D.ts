import Texture, { TextureConfiguration, fillMissingConfigWithDefaults } from './texture';

export default class Texture2D implements Texture {
    handle: WebGLTexture;
    minFilter: GLenum;
    magFilter: GLenum;
    wrapS: GLenum;
    wrapT: GLenum;
    format: GLenum;
    internalFormat: GLenum;
    dataType: GLenum;
    width: number;
    height: number;
    data: Float32Array | Int32Array = null;

    constructor(private gl: WebGL2RenderingContext, config: TextureConfiguration) {
        this.handle = gl.createTexture();
        config = fillMissingConfigWithDefaults(gl, config);
        console.log (config)

        this.minFilter = config.minFilter;
        this.magFilter = config.magFilter;
        this.wrapS = config.wrapS;
        this.wrapT = config.wrapT;
        this.format = config.format;
        this.internalFormat = config.internalFormat;
        this.dataType = config.dataType;
        this.width = config.width;
        this.height = config.height;
        this.data = config.data;

        this.setup();
    }

    private setup(): void {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.magFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.wrapT);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.internalFormat,
            this.width,
            this.height,
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
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.handle);
    }

    upload(data: Float32Array | Int32Array): void {
        this.gl.bindTexture (this.gl.TEXTURE_3D, this.handle)
        this.gl.texImage2D (
            this.gl.TEXTURE_2D,
            0,
            this.internalFormat,
            this.width, this.height,
            0,
            this.format,
            this.dataType,
            data
        )
    }
}
