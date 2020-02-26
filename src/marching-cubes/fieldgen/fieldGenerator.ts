export interface FieldGeneratorGenerateOptions {
    xScale?: number;
    yScale?: number;
    zScale?: number;
    xSize?: number;
    ySize?: number;
    zSize?: number;
    useIntegers?: boolean;
}

export default interface FieldGenerator {
    generate(coords: [number, number, number], options?: FieldGeneratorGenerateOptions): number;
};
