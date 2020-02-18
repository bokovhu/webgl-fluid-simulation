import { LAYOUT_CONTINOUS_ARRAY } from './memoryLayout'

export default class Grid1D {

    constructor (xSize, ySize, zSize, xScale, yScale, zScale) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.zSize = zSize;
        this.xScale = xScale;
        this.yScale = yScale;
        this.zScale = zScale;
        this.totalSize = this.xSize * this.ySize * this.zSize
        this.sheetSize = this.xSize * this.zSize
        this.rowSize = this.xSize
        this.field = new Float32Array(xSize * ySize * zSize);

        this.useIntegers = true
        this.memoryLayout = LAYOUT_CONTINOUS_ARRAY
    }

    generate (generator) {

        for (let i = 0; i < this.totalSize; i++) {

            let z = Math.floor(i / this.sheetSize);
            let y = Math.floor((i - z * this.sheetSize) / this.rowSize);
            let x = Math.floor(i - (z * this.sheetSize + y * this.rowSize));

            this.field [i] = generator.generate (
                [x, y, z],
                this
            )

        }

    }

}