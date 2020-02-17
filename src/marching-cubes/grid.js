import SimplexNoise from 'simplex-noise';

export default class Grid {
    constructor(xSize, ySize, zSize, xScale, yScale, zScale) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.zSize = zSize;
        this.xScale = xScale;
        this.yScale = yScale;
        this.zScale = zScale;
        this.totalSize = this.xSize * this.ySize * this.zSize
        this.field = new Float32Array(xSize * ySize * zSize);
    }

    generate() {
        let total = this.xSize * this.ySize * this.zSize;

        let sheetSize = this.xSize * this.ySize;
        let rowSize = this.xSize;

        let simplex = new SimplexNoise();

        for (let i = 0; i < total; i++) {
            let z = Math.floor(i / sheetSize);
            let y = Math.floor((i - z * sheetSize) / rowSize);
            let x = Math.floor(i - (z * sheetSize + y * rowSize));

            let val = simplex.noise3D(x * this.xScale, y * this.yScale, z * this.zScale);
            val = Math.floor(Math.min(255.0, Math.max(0.0, 255.0 * (val + 1) / 2.0)));

            this.field[i] = val;
        }
    }
}
