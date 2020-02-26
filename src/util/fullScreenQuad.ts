import shaderVertexSource from '../glsl/tex-to-screen/shader.vertex.glsl';
import shaderFragmentSource from '../glsl/tex-to-screen/shader.fragment.glsl';
import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgram } from '../rendering/shader/functions';

class TexturedFullScreenQuadProgram {
    private program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(this.gl, shaderVertexSource, shaderFragmentSource);
    }

    setTexture(texture: WebGLTexture) {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.program.setUniform('u_texture', 0);
    }

    use() {
        this.program.use();
    }
}

export default class TextureFullScreenQuad {
    private vao: WebGLVertexArrayObject;
    private vbo: WebGLBuffer;
    private program: TexturedFullScreenQuadProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.create();
    }

    create() {
        this.vao = this.gl.createVertexArray();
        this.vbo = this.gl.createBuffer();

        this.gl.bindVertexArray(this.vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);

        let vertexData = new Float32Array([
            -1.0,
            1.0,
            0.0,
            1.0,
            1.0,
            1.0,
            0.0,
            1.0,
            -1.0,
            -1.0,
            0.0,
            1.0,
            1.0,
            1.0,
            0.0,
            1.0,
            1.0,
            -1.0,
            0.0,
            1.0,
            -1.0,
            -1.0,
            0.0,
            1.0
        ]);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);

        this.program = new TexturedFullScreenQuadProgram(this.gl);
    }

    draw(texture: WebGLTexture) {
        this.program.use();
        this.program.setTexture(texture);
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
}
