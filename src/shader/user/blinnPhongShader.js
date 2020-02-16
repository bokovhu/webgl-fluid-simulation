import { makeProgram } from '../functions';
import vertexSource from '../../glsl/blinn-phong/shader.vertex.glsl';
import fragmentSource from '../../glsl/blinn-phong/shader.fragment.glsl';

export default class BlinnPhongShader {
    constructor(gl) {
        this.gl = gl;
        this.program = makeProgram(this.gl, vertexSource, fragmentSource);
        this.program.use();
    }

    use() {
        this.program.use();
    }

    setMaterial(material) {
        this.program.setUniform('u_materialDiffuse', material['diffuse'] || [ 0.5, 0.5, 0.5 ]);
        this.program.setUniform('u_materialSpecular', material['specular'] || [ 1.0, 1.0, 1.0 ]);
        this.program.setUniform('u_materialShininess', material['shininess'] || 2.0);
    }

    setLight(light) {
        let type = light['type'] || 'point';

        this.program.setUniform('u_lightFalloffLinear', light['falloffLinear'] || 0.98);
        this.program.setUniform('u_lightFalloffExponential', light['falloffExponential'] || 0.7);
        this.program.setUniform('u_lightAmbient', light['ambient'] || [ 0.05, 0.05, 0.05 ]);
        this.program.setUniform('u_lightIntensity', light['intensity'] || [ 1.0, 1.0, 1.0 ]);

        if (type === 'spot') {
            this.program.setUniform('u_lightType', 3);
            this.program.setUniform('u_lightPosition', light['position'] || [ 0.0, 0.0, 0.0 ]);
            this.program.setUniform('u_lightDirection', light['direction'] || [ 0.0, 0.0, 1.0 ]);
        } else if (type === 'point') {
            this.program.setUniform('u_lightType', 1);
            this.program.setUniform('u_lightPosition', light['position'] || [ 0.0, 0.0, 0.0 ]);
        } else {
            this.program.setUniform('u_lightType', 2);
            this.program.setUniform('u_lightDirection', light['direction'] || [ 0.0, 0.0, 1.0 ]);
        }
    }

    setCamera(camera) {
        if (!camera.view || !camera.projection || !camera.position) {
            throw new Error('Camera must have view, projection and position!');
        }

        this.program.setUniform('u_viewPosition', camera.position);
        this.program.setUniform('u_viewMatrix', camera.view);
        this.program.setUniform('u_projectionMatrix', camera.projection);
    }

    setModel(model) {
        this.program.setUniform('u_modelMatrix', model);
    }
}
