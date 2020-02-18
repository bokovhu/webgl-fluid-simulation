export default class SphereFieldGenerator {

    constructor () {

    }

    generate (coords, options) {

        // x is in range [0, width]
        // y is in range [0, height]
        // z is in range [0, depth]

        let x = coords[0];
        let y = coords[1];
        let z = coords[2];

        const xScale = options.xScale;
        const yScale = options.yScale;
        const zScale = options.zScale;

        const xSize = options.xSize;
        const ySize = options.ySize;
        const zSize = options.zSize;

        x /= xSize
        x *= 2.0
        x -= 1

        y /= ySize
        y *= 2.0
        y -= 1

        z /= zSize
        z *= 2.0
        z -= 1

        // x, y, z are in range [-1, 1]

        const distance = Math.sqrt (x * x + y * y + z * z)
        const radius = 0.8
        let val = distance - radius

        if (options.useIntegers) {
            // If inside the volume, val should be negative
            // At exactly the center of the sphere, it is equal to -radius
            // At the furthest point, it is sqrt(2) - radius
            val += radius
            val /= Math.sqrt (2.0)
            val = Math.floor (Math.max (0, Math.min (255, val * 255.0)))
        }

        return val

    }

}