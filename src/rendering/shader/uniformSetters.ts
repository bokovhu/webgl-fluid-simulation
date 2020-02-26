import { vec2, vec3, vec4, mat2, mat3, mat4 } from "gl-matrix";

export interface UniformSetter {
    apply (value: any): void
}

var WARN_ON_NON_EXISTING = false;
var WARN_ON_NOT_SUPPORTED = false;

export class FloatUniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: number) {
        this.gl.uniform1f(this.uniformLocation, value);
    }
}
export class Float2UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: vec2) {
        this.gl.uniform2f(this.uniformLocation, value[0], value[1]);
    }
}
export class Float3UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: vec3) {
        this.gl.uniform3f(this.uniformLocation, value[0], value[1], value[2]);
    }
}
export class Float4UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: vec4) {
        this.gl.uniform4f(this.uniformLocation, value[0], value[1], value[2], value[3]);
    }
}
export class IntUniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: number) {
        this.gl.uniform1i(this.uniformLocation, value);
    }
}
export class BooleanUniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: any) {
        this.gl.uniform1i(this.uniformLocation, value ? 1 : 0);
    }
}
export class Matrix2UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: mat2) {
        this.gl.uniformMatrix2fv(this.uniformLocation, false, value);
    }
}
export class Matrix3UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: mat3) {
        this.gl.uniformMatrix3fv(this.uniformLocation, false, value);
    }
}
export class Matrix4UniformSetter implements UniformSetter {
    constructor(private gl: WebGL2RenderingContext, private uniformLocation: WebGLUniformLocation) {
    }
    apply(value: mat4) {
        this.gl.uniformMatrix4fv(this.uniformLocation, false, value);
    }
}
export class NonExistingUniformSetter implements UniformSetter {
    constructor(private uniformName: string) {
    }
    apply(value: any) {
        if (WARN_ON_NON_EXISTING) {
            console.log(`No uniform can be found with the name '${this.uniformName}'!`);
        }
    }
}
export class NotSupportedUniformSetter implements UniformSetter {
    constructor(private uniformName: string, private uniformType: GLenum) {
    }
    apply(value: any) {
        if (WARN_ON_NOT_SUPPORTED) {
            console.log(`Uniform '${this.uniformName}' has unsupported uniform type (${this.uniformType})!`);
        }
    }
}
