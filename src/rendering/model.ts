import { mat4, vec3 } from 'gl-matrix';
import Mesh from './mesh';
import { ShaderProgram } from './shader/shaderProgram';

var CALCULATE_MODEL_CENTER = false;

export default class Model {
    public modelMatrix: mat4 = mat4.create();
    public meshes: Mesh[] = [];
    public center: vec3 = vec3.create();

    constructor(private gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    setup(shaderProgram: ShaderProgram): void {
        this.meshes.forEach((mesh) => mesh.setup(shaderProgram));
    }

    draw(): void {
        if (CALCULATE_MODEL_CENTER) {
            vec3.set(
                this.center,
                this.meshes.map((mesh) => mesh.center[0]).reduce((total, current) => total + current) /
                    this.meshes.length,
                this.meshes.map((mesh) => mesh.center[1]).reduce((total, current) => total + current) /
                    this.meshes.length,
                this.meshes.map((mesh) => mesh.center[2]).reduce((total, current) => total + current) /
                    this.meshes.length
            );
        }

        this.meshes.forEach((mesh) => {
            mesh.draw();
        });
    }
}
