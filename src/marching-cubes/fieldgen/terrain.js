import SimplexNoise from 'simplex-noise';

export default class TerrainFieldGenerator {
    constructor() {
        this.simplex = new SimplexNoise();
    }

    generate(coords, options) {
        let x = coords[0];
        let y = coords[1];
        let z = coords[2];

        const xScale = options.xScale;
        const yScale = options.yScale;
        const zScale = options.zScale;

        const xSize = options.xSize;
        const ySize = options.ySize;
        const zSize = options.zSize;

        let noiseVal = 0.25 + 0.25 * (this.simplex.noise2D(x * xScale / 8.0, z * zScale / 8.0) / 2.0 + 0.5);

        let normalizedY = y / ySize;

        let val = normalizedY - noiseVal;
        if (normalizedY < noiseVal) {
            val = 0.0;
        }

        if (options.useIntegers) {
            val = Math.floor(val * 255.0);
        }

        return val;
    }
}
