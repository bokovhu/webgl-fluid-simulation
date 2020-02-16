var WARN_ON_NON_EXISTING = false;
var WARN_ON_NOT_SUPPORTED = false;

export class FloatUniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform1f(this.uniformLocation, value);
    }
}
export class Float2UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform2f(this.uniformLocation, value[0], value[1]);
    }
}
export class Float3UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform3f(this.uniformLocation, value[0], value[1], value[2]);
    }
}
export class Float4UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform4f(this.uniformLocation, value[0], value[1], value[2], value[3]);
    }
}
export class IntUniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform1i(this.uniformLocation, value);
    }
}
export class BooleanUniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniform1i(this.uniformLocation, value ? 1 : 0);
    }
}
export class Matrix2UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniformMatrix2fv(this.uniformLocation, false, value);
    }
}
export class Matrix3UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniformMatrix3fv(this.uniformLocation, false, value);
    }
}
export class Matrix4UniformSetter {
    constructor(gl, uniformLocation) {
        this.gl = gl;
        this.uniformLocation = uniformLocation;
    }
    apply(value) {
        this.gl.uniformMatrix4fv(this.uniformLocation, false, value);
    }
}
export class NonExistingUniformSetter {
    constructor(uniformName) {
        this.uniformName = uniformName;
    }
    apply(value) {
        if (WARN_ON_NON_EXISTING) {
            console.log(`No uniform can be found with the name '${this.uniformName}'!`);
        }
    }
}
export class NotSupportedUniformSetter {
    constructor(uniformName, uniformType) {
        this.uniformName = uniformName;
        this.uniformType = uniformType;
    }
    apply(value) {
        if (WARN_ON_NOT_SUPPORTED) {
            console.log(`Uniform '${this.uniformName}' has unsupported uniform type (${this.uniformType})!`);
        }
    }
}
