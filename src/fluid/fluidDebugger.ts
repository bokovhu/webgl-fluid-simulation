import { ShaderProgram } from "../rendering/shader/shaderProgram";
import { makeProgram } from "../rendering/shader/functions";
import { mat4, vec3 } from "gl-matrix";
import Texture3D from "../rendering/texture3D";

const PRESSURE_POINTS_VS = 
`#version 300 es
precision mediump float;
layout(location = 0) in vec3 a_coords;
out vec3 v_coords;
uniform mat4 u_projection;
uniform mat4 u_view;
uniform vec3 u_scale;
void main() {
    gl_Position = u_projection * u_view * vec4(a_coords * u_scale, 1.0);
    v_coords = a_coords;
    gl_PointSize = 2.0;
}
`
const PRESSURE_POINTS_FS =
`#version 300 es
precision mediump float;
precision mediump sampler3D;
in vec3 v_coords;
out vec4 out_color;
uniform sampler3D u_pressureGrid;
uniform float u_minPressure;
uniform float u_maxPressure;
const vec3 lowPressure = vec3(0.0, 0.0, 1.0);
const vec3 highPressure = vec3(1.0, 0.0, 0.0);
void main () {
    float pressure = texture(u_pressureGrid, v_coords).x;
    pressure = clamp(pressure, u_minPressure, u_maxPressure);
    pressure = (pressure - u_minPressure) / (u_maxPressure - u_minPressure);
    if (pressure < 0.05) {
        discard;
    } else {
        out_color = vec4(mix (lowPressure, highPressure, pressure), 1.0);
    }
}
`

class PressurePointsProgram {

    private program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram (this.gl, PRESSURE_POINTS_VS, PRESSURE_POINTS_FS);
    }

    use (): void {
        this.program.use ();
    }

    setProjection(proj: mat4) {
        this.program.setUniform('u_projection', proj);
    }
    setView (view: mat4) {
        this.program.setUniform('u_view', view);
    }
    setScale(scale: vec3) {
        this.program.setUniform('u_scale', scale);
    }
    setPressureGrid(grid: Texture3D) {
        grid.bind(0);
        this.program.setUniform('u_pressureGrid', 0);
    }
    setMinMaxPressure(min: number, max: number) {
        this.program.setUniform('u_minPressure', min);
        this.program.setUniform('u_maxPressure', max);
    }

}

export default class FluidDebugger {
    private pointsVao: WebGLVertexArrayObject;
    private pointsVbo: WebGLBuffer;
    private linesVao: WebGLVertexArrayObject;
    private linesVbo: WebGLBuffer;

    private numPointVertices: number = 0;
    private numLineVertices: number = 0;

    private minPressure: number = 0.0;
    private maxPressure: number = 10.0;
    private gridScale: vec3 = vec3.fromValues(0, 0, 0);

    private pressurePoints: PressurePointsProgram;

    constructor(private gl: WebGL2RenderingContext) {

        this.pressurePoints = new PressurePointsProgram (this.gl);

    }

    setup(gridSize: [number, number, number], gridScale: [number, number, number]) {

        vec3.set (this.gridScale, gridScale[0], gridScale[1], gridScale[2]);

        this.pointsVao = this.gl.createVertexArray ()
        this.linesVao = this.gl.createVertexArray ()
        this.pointsVbo = this.gl.createBuffer ()
        this.linesVbo = this.gl.createBuffer ()

        this.gl.bindVertexArray(this.pointsVao);
        this.gl.bindBuffer (this.gl.ARRAY_BUFFER, this.pointsVbo);
        let pointsData: Float32Array = new Float32Array (gridSize[0] * gridSize[1] * gridSize[2] * 3);
        let ptr = 0;
        for (let z = 0; z < gridSize[2]; z++) {
            for (let y = 0; y < gridSize[1]; y++) {
                for (let x = 0; x < gridSize[0]; x++) {
                    pointsData[ptr++] = x / gridSize[0];
                    pointsData[ptr++] = y / gridSize[1];
                    pointsData[ptr++] = z / gridSize[2];
                }
            }
        }
        this.gl.bufferData (this.gl.ARRAY_BUFFER, pointsData, this.gl.STATIC_DRAW);
        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer (0, 3, this.gl.FLOAT, false, 0, 0);

        this.numPointVertices = gridSize[0] * gridSize[1] * gridSize[2];

    }

    draw (proj: mat4, view: mat4, pressureGrid: Texture3D) {

        this.pressurePoints.use ()
        this.pressurePoints.setProjection(proj);
        this.pressurePoints.setView(view);
        this.pressurePoints.setMinMaxPressure (this.minPressure, this.maxPressure);
        this.pressurePoints.setScale (this.gridScale);
        this.pressurePoints.setPressureGrid(pressureGrid);

        this.gl.bindVertexArray(this.pointsVao);
        this.gl.drawArrays(this.gl.POINTS, 0, this.numPointVertices);

    }

}
