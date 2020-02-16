import { mat4 } from 'gl-matrix';

export default class Model {
    constructor(gl) {
        this.gl = gl;
        this.modelMatrix = mat4.create();
        this.meshes = [];
    }

    setup(shaderProgram) {
        this.meshes.forEach((mesh) => mesh.setup(shaderProgram));
    }

    draw() {
        this.meshes.forEach((mesh) => {
            mesh.draw();
        });
    }
}
