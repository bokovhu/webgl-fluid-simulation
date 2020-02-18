import { LAYOUT_ARRAY_OF_SHEETS } from './memoryLayout'

export default class Grid2D {

    constructor (xSize, ySize, zSize, xScale, yScale, zScale) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.zSize = zSize;
        this.xScale = xScale;
        this.yScale = yScale;
        this.zScale = zScale;
        this.sheetSize = this.xSize * this.zSize
        this.rowSize = this.xSize
        this.field = []
        for (let i = 0; i < this.zSize; i++) {
            this.field.push (new Float32Array (this.sheetSize))
        }

        this.useIntegers = true
        this.memoryLayout = LAYOUT_ARRAY_OF_SHEETS
    }

    generate (generator) {

        for (let z = 0; z < this.zSize; z++) {

            for (let i = 0; i < this.sheetSize; i++) {

                let y = Math.floor (i / this.rowSize)
                let x = Math.floor (i - (y * this.rowSize))

                this.field [z][i] = generator.generate (
                    [x, y, z],
                    this
                )

            }

        }

    }

}