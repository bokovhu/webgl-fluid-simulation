import Layered3DTextureProgram from "./layered3DTextureProgram";
import vertexSource from "../../glsl/fluid/shader.vertex.glsl";
import fragmentSource from "../../glsl/fluid/tex-copy/shader.fragment.glsl";
import { ShaderProgram } from "../../rendering/shader/shaderProgram";
import { makeProgram } from "../../rendering/shader/functions";

export default class CopyTexture3DProgram extends Layered3DTextureProgram {

    protected makeProgram (): ShaderProgram {
        return makeProgram (this.gl, vertexSource, fragmentSource);
    }

}