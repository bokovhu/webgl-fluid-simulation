import { GenericShader } from './genericShader';
import { ShaderProgram } from './shaderProgram';

function makeShader(gl, source, type) {
    let shader = new GenericShader(gl, type);
    shader.attachSource(source);
    shader.compile();

    if (!shader.compiled) {
        throw new Error('Shader could not be compiled!');
    }

    return shader;
}

function makeVertexShader(gl, source) {
    return makeShader(gl, source, gl.VERTEX_SHADER);
}

function makeFragmentShader(gl, source) {
    return makeShader(gl, source, gl.FRAGMENT_SHADER);
}

function makeProgramFromShaders(gl, shaders) {
    let program = new ShaderProgram(gl);

    shaders.forEach((shader) => program.attachShader(shader));
    program.link();

    if (!program.linked) {
        throw new Error('Could not link program!');
    }

    program.validate();
    if (!program.validated) {
        throw new Error('Could not validate program!');
    }

    program.deleteShaders();
    program.use();

    return program;
}

function makeProgram(gl, vertexSource, fragmentSource) {
    return makeProgramFromShaders(gl, [ makeVertexShader(gl, vertexSource), makeFragmentShader(gl, fragmentSource) ]);
}

export { makeProgram };
