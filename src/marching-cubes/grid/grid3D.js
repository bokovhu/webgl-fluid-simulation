import { LAYOUT_3D_ARRAY } from './memoryLayout'

export default class Grid3D {

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
            let row = []
            for (let j = 0; j < this.ySize; j++) {
                row.push (new Float32Array (this.xSize))
            }
            this.field.push (row)
        }

        this.useIntegers = true
        this.memoryLayout = LAYOUT_3D_ARRAY
    }

    generate (generator) {

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