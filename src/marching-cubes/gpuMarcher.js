import MarcherProgram from "./gpu/marcherProgram"

const MARCH_BATCH_SIZE_X = 32
const MARCH_BATCH_SIZE_Y = 32
const MARCH_BATCH_SIZE_Z = 32

export default class GPUMarcher {

    constructor (gl) {
        this.gl = gl

        this.fbo = this.gl.createFramebuffer ()
        this.marcherProgram = new MarcherProgram (this.gl)
    }

    prepare (options) {

        const fieldSize = options.fieldSize

        this.vertex1Texture = this.gl.createTexture ()
        this.vertex2Texture = this.gl.createTexture ()
        this.vertex3Texture = this.gl.createTexture ()

        this.prepareVertexTexture (this.vertex1Texture)
        this.prepareVertexTexture (this.vertex2Texture)
        this.prepareVertexTexture (this.vertex3Texture)

        this.gl.bindFramebuffer (this.gl.FRAMEBUFFER, this.fbo)
        this.gl.framebufferTexture2D (this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.vertex1Texture, 0)
        this.gl.framebufferTexture2D (this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT1, this.gl.TEXTURE_2D, this.vertex2Texture, 0)
        this.gl.framebufferTexture2D (this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT2, this.gl.TEXTURE_2D, this.vertex3Texture, 0)

        this.fieldTexture = this.gl.createTexture ()
        this.gl.bindTexture (this.gl.TEXTURE_3D, this.fieldTexture)
        this.gl.texImage3D (
            this.gl.TEXTURE_3D,
            0,
            this.gl.R32F,
            fieldSize [0], fieldSize [1], fieldSize [2],
            0,
            this.gl.RED,
            this.gl.FLOAT,
            null
        )

        this.gl.texParameteri (this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
        this.gl.texParameteri (this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.texParameteri (this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri (this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri (this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE)
        

    }

    prepareVertexTexture (vertexTexture) {

        this.gl.bindTexture (this.gl.TEXTURE_2D, vertexTexture)
        this.gl.texImage2D (
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA32F,
            MARCH_BATCH_SIZE_X * MARCH_BATCH_SIZE_Z,
            MARCH_BATCH_SIZE_Y * 8,
            0,
            this.gl.RGBA,
            this.gl.FLOAT,
            null
        )

        this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
        this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri (this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

    }

}