import MarchingCubes from './marchingCubes';
import Grid, { FieldType } from './grid/grid';

export type MarchIndexType = number | number[];
export type MarcherSupportsType = { [key: string]: (...args: any[]) => number };

export interface MarcherPrepareOptions {
    outVertices?: Float32Array | number[];
    field?: FieldType;
    fieldSize?: [number, number, number];
    numMaxVertices?: number;
    grid?: Grid;
}

export default interface Marcher {
    supports: MarcherSupportsType;
    skipMarch?: boolean;
    customRender?: boolean;
    prepare?(options?: MarcherPrepareOptions): void;
    calculate?(
        outVertices: Float32Array,
        field: FieldType,
        fromIndex: MarchIndexType,
        toIndex: MarchIndexType,
        gridXSize: number,
        gridYSize: number,
        gridZSize: number,
        vertexOffsetX: number,
        vertexOffsetY: number,
        vertexOffsetZ: number,
        scaleX: number,
        scaleY: number,
        scaleZ: number,
        isoLevel: number
    ): number;
    render?(marchingCubes: MarchingCubes, beforeCustomRender?: () => void): void;
};
