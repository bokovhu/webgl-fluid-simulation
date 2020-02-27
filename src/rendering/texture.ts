export interface TextureConfiguration {
    width: number;
    height: number;
    depth?: number;
    data?: Float32Array | Int32Array | null;
    minFilter?: GLenum | null;
    magFilter?: GLenum | null;
    wrapS?: GLenum | null;
    wrapT?: GLenum | null;
    wrapR?: GLenum | null;
    format?: GLenum | null;
    internalFormat?: GLenum | null;
    dataType?: GLenum | null;
}

export default interface Texture {

    handle: WebGLTexture;

    minFilter: GLenum;
    magFilter: GLenum;

    format: GLenum;
    internalFormat: GLenum;
    dataType: GLenum;

    bind (textureUnit?: number | null): void
    upload (data: Float32Array | Int32Array): void

}

export function fillMissingConfigWithDefaults (
    gl: WebGL2RenderingContext,
    config: TextureConfiguration,
    twoDimensional: boolean = true
): TextureConfiguration {

    if (!('minFilter' in config) || !config.minFilter) {
        config.minFilter = gl.LINEAR;
    }
    if (!('magFilter' in config) || !config.magFilter) {
        config.magFilter = gl.LINEAR;
    }
    if (!('wrapS' in config) || !config.wrapS) {
        config.wrapS = gl.CLAMP_TO_EDGE;
    }
    if (!('wrapT' in config) || !config.wrapT) {
        config.wrapT = gl.CLAMP_TO_EDGE;
    }

    if (!twoDimensional) {
        if (!('wrapR' in config) || !config.wrapR) {
            config.wrapR = gl.CLAMP_TO_EDGE
        }
    }

    if (!('format' in config) || !config.format) {
        if ('internalFormat' in config && config.internalFormat) {
            switch (config.internalFormat) {
                case gl.RED_INTEGER:
                case gl.R32F:
                    config.format = gl.RED;
                    config.format = gl.RED;
                    break;
                case gl.RGBA:
                case gl.RGBA32F:
                    config.format = gl.RGBA;
                    break;
                default:
                    throw new Error('Could not deduce format from internal format!');
            }
        } else {
            // Both format and internal format are missing
            config.format = gl.RGBA;
            config.internalFormat = gl.RGBA32F;
        }
    }
    if (!('internalFormat' in config) || !config.internalFormat) {
        if ('format' in config && config.format) {
            switch (config.format) {
                case gl.RED:
                    config.internalFormat = gl.R32F;
                    break;
                case gl.RGBA:
                    config.internalFormat = gl.RGBA32F;
                    break;
                default:
                    throw new Error('Could not deduce internal format from format!');
            }
        } else {
            // In theory, this should not happen here
            config.format = gl.RGBA;
            config.internalFormat = gl.RGBA32F;
        }
    }
    if (!('dataType' in config) || !config.dataType) {
        switch (config.internalFormat) {
            case gl.RED_INTEGER:
                config.dataType = gl.INT;
                break;
            case gl.R32F:
            case gl.RGBA32F:
                config.dataType = gl.FLOAT;
                break;
            default:
                throw new Error('Could not deduce data type from internal format!');
        }
    }

    return config;

}