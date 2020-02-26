import { LAYOUT_CONTINOUS_ARRAY } from './memoryLayout';
import Grid from './grid';
import FieldGenerator from '../fieldgen/fieldGenerator';

export default class Grid1D implements Grid {
    public totalSize: number;
    public sheetSize: number;
    public rowSize: number;
    public field: Float32Array;
    public useIntegers: boolean = true;
    public memoryLayout: string = LAYOUT_CONTINOUS_ARRAY;

    constructor(
        public xSize: number,
        public ySize: number,
        public zSize: number,
        public xScale: number,
        public yScale: number,
        public zScale: number
    ) {
        this.totalSize = this.xSize * this.ySize * this.zSize;
        this.sheetSize = this.xSize * this.zSize;
        this.rowSize = this.xSize;
        this.field = new Float32Array(xSize * ySize * zSize);
    }

    generate(generator: FieldGenerator): void {
        for (let i = 0; i < this.totalSize; i++) {
            let z = Math.floor(i / this.sheetSize);
            let y = Math.floor((i - z * this.sheetSize) / this.rowSize);
            let x = Math.floor(i - (z * this.sheetSize + y * this.rowSize));

            this.field[i] = generator.generate([ x, y, z ], this);
        }
    }
}
