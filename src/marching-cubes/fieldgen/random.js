export default class RandomFieldGenerator {

    constructor () {

    }

    generate (coords, options) {

        let val = Math.random ()

        if (options.useIntegers) {
            val = Math.floor (val * 255.0)
        } else {
            val *= 2.0
            val -= 1.0
        }

        return val

    }

}