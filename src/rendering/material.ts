import { vec3 } from 'gl-matrix';

export default interface Material {
    diffuse: vec3;
    specular: vec3;
    shininess: number;
};
