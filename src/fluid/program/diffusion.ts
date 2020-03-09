import Layered3DTextureProgram from "./layered3DTextureProgram";
import vertexSource from "../../glsl/fluid/shader.vertex.glsl";
import fragmentSource from "../../glsl/fluid/diffusion/shader.fragment.glsl";
import { makeProgram } from "../../rendering/shader/functions";
import { ShaderProgram } from "../../rendering/shader/shaderProgram";

export default class DiffusionProgram extends Layered3DTextureProgram {
    protected makeProgram(): ShaderProgram {
        return makeProgram(this.gl, vertexSource, fragmentSource);
    }

    setViscosity(viscosity: number): void {
        this.program.setUniform("u_viscosity", viscosity);
    }
}
