import { vec3 } from "gl-matrix";

export enum LightSourceType {
    point = 1,
    directional = 2,
    spot = 3
}

export default interface LightSource {
    type?: LightSourceType
    falloffLinear?: number
    falloffExponential?: number
    ambient: vec3
    intensity: vec3
    position?: vec3
    direction?: vec3
}