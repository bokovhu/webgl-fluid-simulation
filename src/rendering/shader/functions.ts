import { GenericShader } from './genericShader';
import { ShaderProgram } from './shaderProgram';

function makeShader(gl: WebGL2RenderingContext, source: string, type: GLenum): GenericShader {
    let shader = new GenericShader(gl, type);
    shader.attachSource(source);
    shader.compile();

    if (!shader.compiled) {
        throw new Error('Shader could not be compiled!');
    }

    return shader;
}

function makeVertexShader(gl: WebGL2RenderingContext, source: string): GenericShader {
    return makeShader(gl, source, gl.VERTEX_SHADER);
}

function makeFragmentShader(gl: WebGL2RenderingContext, source: string): GenericShader {
    return makeShader(gl, source, gl.FRAGMENT_SHADER);
}

function makeProgramFromShaders(gl: WebGL2RenderingContext, shaders: GenericShader[]): ShaderProgram {
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

function makeProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string): ShaderProgram {
    return makeProgramFromShaders(gl, [ makeVertexShader(gl, vertexSource), makeFragmentShader(gl, fragmentSource) ]);
}

function makeProgramForVertexTransformFeedback(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string,
    varyings: string[],
    feedbackFormat: GLenum
): ShaderProgram {
    let vertexShader: GenericShader = makeVertexShader(gl, vertexSource);
    let fragmentShader: GenericShader = makeFragmentShader(gl, fragmentSource);
    let program = new ShaderProgram(gl);

    program.attachShader(vertexShader);
    program.attachShader(fragmentShader);
    program.transformFeedbackVaryings(varyings, feedbackFormat);

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

export { makeProgram, makeProgramFromShaders, makeProgramForVertexTransformFeedback };
