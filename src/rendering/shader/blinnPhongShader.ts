import { makeProgram } from './functions';
import vertexSource from '../../glsl/blinn-phong/shader.vertex.glsl';
import fragmentSource from '../../glsl/blinn-phong/shader.fragment.glsl';
import { ShaderProgram } from './shaderProgram';
import { mat4 } from 'gl-matrix';
import LightSource, { LightSourceType } from '../light';
import Camera from '../camera';
import Material from '../material';

export default class BlinnPhongShader {
    public program: ShaderProgram = null;

    constructor(private gl: WebGL2RenderingContext, alternativeVertexSource?: string | null) {
        let vs = vertexSource;
        if (alternativeVertexSource && alternativeVertexSource != null) {
            vs = alternativeVertexSource;
        }
        this.program = makeProgram(this.gl, vs, fragmentSource);
        this.program.use();
    }

    use(): void {
        this.program.use();
    }

    setMaterial(material: Material): void {
        this.program.setUniform('u_materialDiffuse', material['diffuse']);
        this.program.setUniform('u_materialSpecular', material['specular']);
        this.program.setUniform('u_materialShininess', material['shininess']);
    }

    setLight(light: LightSource): void {
        this.program.setUniform('u_lightType', light.type);

        if ('falloffLinear' in light) {
            this.program.setUniform('u_lightFalloffLinear', light.falloffLinear);
        }
        if ('falloffExponential' in light) {
            this.program.setUniform('u_lightFalloffExponential', light.falloffExponential);
        }

        this.program.setUniform('u_lightAmbient', light.ambient);
        this.program.setUniform('u_lightIntensity', light.intensity);

        if (light.type === LightSourceType.spot) {
            this.program.setUniform('u_lightPosition', light.position);
            this.program.setUniform('u_lightDirection', light.direction);
        } else if (light.type === LightSourceType.point) {
            this.program.setUniform('u_lightPosition', light.position);
        } else {
            this.program.setUniform('u_lightDirection', light.direction);
        }
    }

    setCamera(camera: Camera): void {
        this.program.setUniform('u_viewPosition', camera.position);
        this.program.setUniform('u_viewMatrix', camera.view);
        this.program.setUniform('u_projectionMatrix', camera.projection);
    }

    setModel(model: mat4): void {
        this.program.setUniform('u_modelMatrix', model);
    }
}
