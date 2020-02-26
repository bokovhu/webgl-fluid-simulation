export class GenericShader {
    private isCompiled: boolean = false;
    private isDeleted: boolean = false;
    private source: string = '';
    public handle: WebGLShader = null;

    constructor(private gl: WebGL2RenderingContext, private type: GLenum) {
        this.handle = gl.createShader(type);
    }

    attachSource(source: string): void {
        this.source = source;
        this.gl.shaderSource(this.handle, source);
    }
    compile(): void {
        if (this.isCompiled) {
            throw new Error('Shader is already compiled!');
        }

        if (this.isDeleted) {
            throw new Error('Cannot compile shader, as it was deleted!');
        }

        this.gl.compileShader(this.handle);

        let compileStatus = this.gl.getShaderParameter(this.handle, this.gl.COMPILE_STATUS);

        if (compileStatus) {
            this.isCompiled = true;
        } else {
            this.isCompiled = false;
            console.log(`Could not compile shader! Info log: ${this.getInfoLog()}`);
        }
    }
    getInfoLog(): string {
        return this.gl.getShaderInfoLog(this.handle);
    }
    delete(): void {
        this.gl.deleteShader(this.handle);
        this.isDeleted = true;
    }

    get compiled(): boolean {
        return this.isCompiled;
    }

    get deleted(): boolean {
        return this.isDeleted;
    }
}
