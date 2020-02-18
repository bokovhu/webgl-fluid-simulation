import SimplexNoise from 'simplex-noise';

export default class SimplexNoiseFieldGenerator {
    constructor() {
        this.simplex = new SimplexNoise();
    }

    generate(coords, options) {
        const x = coords[0];
        const y = coords[1];
        const z = coords[2];

        const xScale = options.xScale;
        const yScale = options.yScale;
        const zScale = options.zScale;

        let val = this.simplex.noise3D(x * xScale, y * yScale, z * zScale);

        if (options.useIntegers) {
            val = Math.floor(Math.min(255.0, Math.max(0.0, 255.0 * (val + 1) / 2.0)));
        }

        return val;
    }
}
