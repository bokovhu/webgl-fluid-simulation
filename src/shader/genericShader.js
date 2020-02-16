export class GenericShader {

    constructor (gl, type) {
        this.gl = gl
        this.type = type
        this.compiled = false
        this.deleted = false
        this.source = ''
        this.handle = gl.createShader (type)
    }

    attachSource(source) {
        this.source = source
        this.gl.shaderSource (this.handle, source)
    }
    compile() {

        if (this.compiled) {
            throw new Error ('Shader is already compiled!');
        }

        if (this.deleted) {
            throw new Error ('Cannot compile shader, as it was deleted!');
        }

        this.gl.compileShader (this.handle)

        let compileStatus = this.gl.getShaderParameter (this.handle, this.gl.COMPILE_STATUS)

        if (compileStatus) {
            this.compiled = true;
        } else {
            this.compiled = false;
            console.log (`Could not compile shader! Info log: ${this.getInfoLog ()}`)
        }

    }
    getInfoLog() {
        return this.gl.getShaderInfoLog (this.handle)
    }
    delete() {
        this.gl.deleteShader (this.handle)
        this.deleted = true;
    }
}
