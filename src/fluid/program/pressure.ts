import Layered3DTextureProgram from "./layered3DTextureProgram";
import vertexSource from "../../glsl/fluid/shader.vertex.glsl";
import fragmentSource from "../../glsl/fluid/pressure/shader.fragment.glsl";
import { ShaderProgram } from "../../rendering/shader/shaderProgram";
import { makeProgram } from "../../rendering/shader/functions";
import Texture3D from "../../rendering/texture3D";

export default class PressureProgram extends Layered3DTextureProgram {

    protected makeProgram(): ShaderProgram {
        return makeProgram (this.gl, vertexSource, fragmentSource);
    }

    setVelocityGrid(grid: Texture3D) {
        grid.bind(1);
        this.program.setUniform('u_velocityGrid', 1);
    }

    setMassGrid(grid: Texture3D) {
        grid.bind(2);
        this.program.setUniform('u_massGrid', 2);
    }

}