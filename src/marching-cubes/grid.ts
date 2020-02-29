import Texture3D from "../rendering/texture3D";

export default interface Grid {
    xSize: number
    ySize: number
    zSize: number

    xScale: number
    yScale: number
    zScale: number
    
    texture: Texture3D
}