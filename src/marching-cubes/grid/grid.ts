import FieldGenerator from '../fieldgen/fieldGenerator';

type NumberOrFloat32Array = number[] | Float32Array;
export type FieldType = NumberOrFloat32Array | NumberOrFloat32Array[] | NumberOrFloat32Array[][];

export default interface Grid {
    xSize: number;
    ySize: number;
    zSize: number;
    xScale: number;
    yScale: number;
    zScale: number;
    totalSize: number;
    sheetSize: number;
    rowSize: number;
    field: FieldType;

    useIntegers: boolean;
    memoryLayout: string;

    generate(generator: FieldGenerator): void;
};
