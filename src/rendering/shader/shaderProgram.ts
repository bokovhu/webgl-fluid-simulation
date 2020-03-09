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

type UniformSettersMapType = { [key: string]: UniformSetter };
type UniformLocationsMapType = { [key: string]: WebGLUniformLocation };
type UniformInformationMapType = { [key: string]: WebGLActiveInfo };
type AttributeLocationsMapType = { [key: string]: number };
type AttributeInformationMapType = { [key: string]: WebGLActiveInfo };

export class ShaderProgram {
    private shaders: GenericShader[] = [];
    private isLinked: boolean = false;
    private isValidated: boolean = false;
    private uniformSetters: UniformSettersMapType = {};
    private uniformInformation: UniformInformationMapType = {};
    private uniformLocations: UniformLocationsMapType = {};
    private attributeLocations: AttributeLocationsMapType = {};
    private attributeInformation: AttributeInformationMapType = {};
    private infoFetched: boolean = false;
    private handle: WebGLProgram = null;

    constructor(private gl: WebGL2RenderingContext) {
        this.handle = gl.createProgram();
    }

    getUniformLocation(name: string): WebGLUniformLocation {
        return this.uniformLocations[name];
    }
    setUniform(name: string, value: any): void {
        if (!this.uniformSetters[name]) {
            this.uniformSetters[name] = new NonExistingUniformSetter(name);
        }
        this.uniformSetters[name].apply(value);
    }
    hasUniform(name: string): boolean {
        return name in this.uniformInformation;
    }
    getUniforms(): WebGLActiveInfo[] {
        return Object.keys(this.uniformInformation).map((key) => this.uniformInformation[key]);
    }
    getUniformInfo(name: string): WebGLActiveInfo {
        return this.uniformInformation[name];
    }
    getAttributeLocation(name: string): GLint {
        if (this.attributeLocations.hasOwnProperty(name)) {
            return this.attributeLocations[name];
        }
        return -1;
    }
    getAttributeInfo(name: string): WebGLActiveInfo {
        return this.attributeInformation[name];
    }
    getAttributes(): WebGLActiveInfo[] {
        return Object.keys(this.attributeInformation).map((key) => this.attributeInformation[key]);
    }

    attachShader(shader: GenericShader) {
        if (!shader.compiled) {
            throw new Error('Shader must be compiled before attaching it to a program!');
        }
        if (shader.deleted) {
            throw new Error('Deleted shaders cannot be attached to programs!');
        }
        this.gl.attachShader(this.handle, shader.handle);
        this.shaders.push(shader);
    }
    link(): void {
        if (this.isLinked) {
            throw new Error('Program is already linked!');
        }

        this.gl.linkProgram(this.handle);
        let linkStatus = this.gl.getProgramParameter(this.handle, this.gl.LINK_STATUS);
        if (linkStatus) {
            this.isLinked = true;
        } else {
            this.isLinked = false;
            console.log(`Could not link a shader program! Info log: ${this.getInfoLog()}`);
        }
    }
    validate(): void {
        if (this.isValidated) {
            throw new Error('Program is already validated!');
        }

        this.gl.validateProgram(this.handle);
        let validateStatus = this.gl.getProgramParameter(this.handle, this.gl.VALIDATE_STATUS);
        if (validateStatus) {
            this.isValidated = true;
        } else {
            this.isValidated = false;
            console.log(`Could not validate a shader program! Info log: ${this.getInfoLog()}`);
        }
    }
    deleteShaders(): void {
        this.shaders.forEach((shader) => shader.delete());
    }
    getInfoLog(): string {
        return this.gl.getProgramInfoLog(this.handle);
    }

    createUniformSetterForUniform(info: WebGLActiveInfo, location: WebGLUniformLocation) {
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

            if (uniformInfo.size > 1) {
                for (let arrayIndex = 0; arrayIndex < uniformInfo.size; arrayIndex++) {
                    let uniformName = uniformInfo.name.replace( /\[0\]/, `[${arrayIndex}]` )
                    let arrayElementLocation = this.gl.getUniformLocation (
                        this.handle,
                        uniformName
                    )
                    console.log(`Location of ${uniformName} ==> ${arrayElementLocation}`)
                    this.uniformSetters [uniformName] = this.createUniformSetterForUniform (
                        uniformInfo,
                        arrayElementLocation
                    )
                }
            } else {

                let setter = this.createUniformSetterForUniform(uniformInfo, uniformLocation);
                this.uniformSetters[uniformInfo.name] = setter;

            }
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
        if (!this.isLinked) {
            throw new Error('Cannot use a shader program before it has been linked!');
        }

        if (!this.isValidated) {
            throw new Error('Cannot use a shader program before it has been validated!');
        }

        this.gl.useProgram(this.handle);
        if (!this.infoFetched) {
            this.fetchInfo();
        }
    }

    get linked(): boolean {
        return this.isLinked;
    }

    get validated(): boolean {
        return this.isValidated;
    }

    transformFeedbackVaryings(varyings: string[], format: GLenum) {
        this.gl.transformFeedbackVaryings(this.handle, varyings, format);
    }
}
