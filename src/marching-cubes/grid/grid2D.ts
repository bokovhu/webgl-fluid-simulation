import { LAYOUT_ARRAY_OF_SHEETS } from './memoryLayout';
import Grid from './grid';
import FieldGenerator from '../fieldgen/fieldGenerator';

export default class Grid2D implements Grid {
    public totalSize: number;
    public sheetSize: number;
    public rowSize: number;
    public field: Float32Array[] = [];
    public useIntegers: boolean = true;
    public memoryLayout: string = LAYOUT_ARRAY_OF_SHEETS;

    constructor(
        public xSize: number,
        public ySize: number,
        public zSize: number,
        public xScale: number,
        public yScale: number,
        public zScale: number
    ) {
        this.sheetSize = this.xSize * this.zSize;
        this.rowSize = this.xSize;
        this.field = [];
        for (let i = 0; i < this.zSize; i++) {
            this.field.push(new Float32Array(this.sheetSize));
        }
    }

    generate(generator: FieldGenerator): void {
        for (let z = 0; z < this.zSize; z++) {
            for (let i = 0; i < this.sheetSize; i++) {
                let y = Math.floor(i / this.rowSize);
                let x = Math.floor(i - y * this.rowSize);

                this.field[z][i] = generator.generate([ x, y, z ], this);
            }
        }
    }
}
