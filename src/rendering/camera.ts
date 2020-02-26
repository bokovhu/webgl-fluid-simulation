import { mat4, vec3 } from 'gl-matrix';

export default interface Camera {
    view: mat4;
    projection: mat4;
    position: vec3;
};
