import {
    UniformSetter,
    FloatUniformSetter,
    Float2UniformSetter,
    Float3UniformSetter,
    Float4UniformSetter,
    IntUniformSetter,
    BooleanUniformSetter,
    Matrix2UniformSetter,
    Matrix3UniformSetter,
    Matrix4UniformSetter,
    NonExistingUniformSetter,
    NotSupportedUniformSetter
} from './uniformSetters';

import { GenericShader } from './genericShader';

export class ShaderProgram {
    constructor(gl) {
        this.gl = gl;
        this.shaders = [];
        this.linked = false;
        this.validated = false;
        this.uniformSetters = {};
        this.uniformLocations = {};
        this.uniformInformation = {};
        this.attributeLocations = {};
        this.attributeInformation = {};
        this.infoFetched = false;
        this.handle = gl.createProgram();
    }

    getUniformLocation(name) {
        return this.uniformLocations[name];
    }
    setUniform(name, value) {
        if (!this.uniformSetters[name]) {
            this.uniformSetters[name] = new NonExistingUniformSetter(name);
        }
        this.uniformSetters[name].apply(value);
    }
    getUniforms() {
        let result = [];
        Object.keys(this.uniformInformation).forEach((key) => result.push(this.uniformInformation[key]));
        return result;
    }
    getUniformInfo(name) {
        return this.uniformInformation[name];
    }
    getAttributeLocation(name) {
        if (this.attributeLocations.hasOwnProperty(name)) {
            return this.attributeLocations[name];
        }
        return -1;
    }
    getAttributeInfo(name) {
        return this.attributeInformation[name];
    }
    getAttributes() {
        let result = [];
        Object.keys(this.attributeInformation).forEach((key) => result.push(this.attributeInformation[key]));
        return result;
    }

    attachShader(shader) {
        if (!shader.compiled) {
            throw new Error('Shader must be compiled before attaching it to a program!');
        }
        if (shader.deleted) {
            throw new Error('Deleted shaders cannot be attached to programs!');
        }
        this.gl.attachShader(this.handle, shader.handle);
        this.shaders.push(shader);
    }
    link() {
        if (this.linked) {
            throw new Error('Program is already linked!');
        }

        this.gl.linkProgram(this.handle);
        let linkStatus = this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS);
        if (linkStatus) {
            this.linked = true;
        } else {
            this.linked = false;
            console.log(`Could not link a shader program! Info log: ${this.getInfoLog()}`);
        }
    }
    validate() {
        if (this.validated) {
            throw new Error('Program is already validated!');
        }

        this.gl.validateProgram(this.handle);
        let validateStatus = this.gl.getProgramParameter(this.handle, this.gl.VALIDATE_STATUS);
        if (validateStatus) {
            this.validated = true;
        } else {
            this.validated = false;
            console.log(`Could not validate a shader program! Info log: ${this.getInfoLog()}`);
        }
    }
    deleteShaders() {
        this.shaders.forEach((shader) => shader.delete());
    }
    getInfoLog() {
        return this.gl.getProgramInfoLog(this.handle);
    }

    createUniformSetterForUniform(info, location) {
        switch (info.type) {
            case this.gl.FLOAT:
                return new FloatUniformSetter(this.gl, location);
            case this.gl.FLOAT_VEC2:
                return new Float2UniformSetter(this.gl, location);
            case this.gl.FLOAT_VEC3:
                return new Float3UniformSetter(this.gl, location);
            case this.gl.FLOAT_VEC4:
                return new Float4UniformSetter(this.gl, location);
            case this.gl.INT:
            case this.gl.UNSIGNED_INT:
            case this.gl.SAMPLER_2D:
            case this.gl.SAMPLER_3D:
            case this.gl.SAMPLER_CUBE:
            case this.gl.INT_SAMPLER_2D:
            case this.gl.INT_SAMPLER_3D:
            case this.gl.INT_SAMPLER_CUBE:
            case this.gl.UNSIGNED_INT_SAMPLER_2D:
            case this.gl.UNSIGNED_INT_SAMPLER_3D:
            case this.gl.UNSIGNED_INT_SAMPLER_CUBE:
                return new IntUniformSetter(this.gl, location);
            case this.gl.BOOL:
                return new BooleanUniformSetter(this.gl, location);
            case this.gl.FLOAT_MAT2:
                return new Matrix2UniformSetter(this.gl, location);
            case this.gl.FLOAT_MAT3:
                return new Matrix3UniformSetter(this.gl, location);
            case this.gl.FLOAT_MAT4:
                return new Matrix4UniformSetter(this.gl, location);
            default:
                return new NotSupportedUniformSetter(info.name, info.type);
        }
    }

    fetchInfo() {
        let numUniforms = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            let uniformInfo = this.gl.getActiveUniform(this.handle, i);
            let uniformLocation = this.gl.getUniformLocation(this.handle, uniformInfo.name);
            this.uniformInformation[uniformInfo.name] = uniformInfo;
            this.uniformLocations[uniformInfo.name] = uniformLocation;

            let setter = this.createUniformSetterForUniform(uniformInfo, uniformLocation);
            this.uniformSetters[uniformInfo.name] = setter;
        }

        let numAttribs = this.gl.getProgramParameter(this.handle, this.gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttribs; i++) {
            let attribInfo = this.gl.getActiveAttrib(this.handle, i);
            this.attributeLocations[attribInfo.name] = i;
            this.attributeInformation[attribInfo.name] = attribInfo;
        }

        this.infoFetched = true;
    }

    use() {
        if (!this.linked) {
            throw new Error('Cannot use a shader program before it has been linked!');
        }

        if (!this.validated) {
            throw new Error('Cannot use a shader program before it has been validated!');
        }

        this.gl.useProgram(this.handle);
        if (!this.infoFetched) {
            this.fetchInfo();
        }
    }
}
