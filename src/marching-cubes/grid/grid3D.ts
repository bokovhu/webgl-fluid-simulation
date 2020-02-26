import { LAYOUT_3D_ARRAY } from './memoryLayout'
import Grid from './grid';
import FieldGenerator from '../fieldgen/fieldGenerator';

export default class Grid3D implements Grid {

    public totalSize: number;
    public sheetSize: number;
    public rowSize: number;
    public field: Float32Array[][] = [];
    public useIntegers: boolean = true;
    public memoryLayout: string = LAYOUT_3D_ARRAY;

    constructor(
        public xSize: number,
        public ySize: number,
        public zSize: number,
        public xScale: number,
        public yScale: number,
        public zScale: number
    ) {
        this.sheetSize = this.xSize * this.zSize
        this.rowSize = this.xSize
        this.field = []
        for (let i = 0; i < this.zSize; i++) {
            let row = []
            for (let j = 0; j < this.ySize; j++) {
                row.push (new Float32Array (this.xSize))
            }
            this.field.push (row)
        }
    }

    generate (generator: FieldGenerator): void {

        for (let z = 0; z < this.zSize; z++) {
            for (let y = 0; y < this.ySize; y++) {
                for (let x = 0; x < this.xSize; x++) {

                    this.field [z][y][x] = generator.generate (
                        [x, y, z],
                        this
                    )

                }
            }
        }

    }

}