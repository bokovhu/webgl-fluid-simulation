import { makeProgram } from '../../shader/functions'

import vertexSource from '../../glsl/marching-cubes/marching-pass.vertex.glsl'
import fragmentSource from '../../glsl/marching-cubes/marching-pass.fragment.glsl'

export default class MarcherProgram {

    constructor (gl) {

        this.gl = gl
        this.program = makeProgram (
            this.gl,
            vertexSource,
            fragmentSource
        )
        this.program.use ()

    }

}