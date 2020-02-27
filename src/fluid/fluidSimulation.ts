import { ShaderProgram } from '../rendering/shader/shaderProgram';

import vertexSource from '../glsl/fluid/shader.vertex.glsl';
import pressureDiffusionFragmentSource from '../glsl/fluid/pressure-diffusion/shader.fragment.glsl';
import { makeProgram } from '../rendering/shader/functions';
import Texture3D from '../rendering/texture3D';
import FrameBuffer from '../rendering/frameBuffer';

export class PressureDiffusionProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(gl, vertexSource, pressureDiffusionFragmentSource);
    }

    setDiffusionScale(scale: number) {
        this.program.setUniform('u_diffusionScale', scale);
    }

    setGrid(grid: Texture3D) {
        grid.bind(0);
        this.program.setUniform('u_pressureGrid', 0);
        this.program.setUniform('u_gridSize', [ grid.width, grid.height, grid.depth ]);
        this.program.setUniform('u_voxelStep', [ 1.0 / grid.width, 1.0 / grid.height, 1.0 / grid.depth ]);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform('u_layerOffset', offset);
    }

    setTimestep(timestep: number) {
        this.program.setUniform('u_timestep', timestep);
    }

    use(): void {
        this.program.use();
    }
}

class PingPong<T> {
    private values: [T, T] = [ null, null ];
    private index: number = 0;

    constructor(first: T, second: T) {
        this.values[0] = first;
        this.values[1] = second;
    }

    flip(): void {
        this.index = (this.index + 1) % 2;
    }

    get current(): T {
        return this.values[this.index];
    }

    get other(): T {
        return this.values[(this.index + 1) % 2];
    }
}

export default class FluidSimulation {
    xSize: number;
    ySize: number;
    zSize: number;
    pressureGrid: PingPong<Texture3D>;
    framebuffer: FrameBuffer;

    vao: WebGLVertexArrayObject;
    vbo: WebGLBuffer;
    private pressureDiffusion: PressureDiffusionProgram;

    private timeAccumulator: number = 0.0;

    constructor(private gl: WebGL2RenderingContext, size: [number, number, number], private timestep: number) {
        this.xSize = size[0];
        this.ySize = size[1];
        this.zSize = size[2];

        this.pressureDiffusion = new PressureDiffusionProgram(this.gl);
        this.framebuffer = new FrameBuffer(this.gl, this.xSize, this.ySize);

        this.setup();
    }

    private setup(): void {
        this.setupPressureGrid();
        this.setupPass();
    }

    private setupPressureGrid(): void {
        let textures = [];
        for (let i = 0; i < 2; i++) {
            textures.push(
                new Texture3D(this.gl, {
                    width: this.xSize,
                    height: this.ySize,
                    depth: this.zSize,
                    internalFormat: this.gl.R32F,
                    format: this.gl.RED,
                    minFilter: this.gl.NEAREST,
                    magFilter: this.gl.NEAREST
                })
            );
        }

        this.pressureGrid = new PingPong(textures[0], textures[1]);
    }

    private setupPass(): void {
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        let vertexData: number[] = [];
        vertexData.push(-1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, -1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexData), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
    }

    get pressureGridTexture(): Texture3D {
        return this.pressureGrid.current;
    }

    get otherPressureGridTexture(): Texture3D {
        return this.pressureGrid.other;
    }

    update(delta: number): void {
        this.timeAccumulator += delta > this.timestep ? this.timestep : delta;

        let drawBuffers = [ 0, 1, 2, 3 ];

        this.gl.bindVertexArray(this.vao);

        while (this.timeAccumulator >= this.timestep) {
            // Pressure diffusion

            for (let pass = 0; pass < this.zSize / 4; pass++) {
                this.framebuffer.bind();

                this.framebuffer.colorAttachmentLayer(0, this.pressureGrid.other, 4 * pass, false);
                this.framebuffer.colorAttachmentLayer(1, this.pressureGrid.other, 4 * pass + 1, false);
                this.framebuffer.colorAttachmentLayer(2, this.pressureGrid.other, 4 * pass + 2, false);
                this.framebuffer.colorAttachmentLayer(3, this.pressureGrid.other, 4 * pass + 3, false);
                this.framebuffer.drawBuffers(drawBuffers);
                this.framebuffer.clear();
                this.framebuffer.applyViewport();

                this.pressureDiffusion.use();
                this.pressureDiffusion.setGrid(this.pressureGrid.current);
                this.pressureDiffusion.setDiffusionScale(0.5);
                this.pressureDiffusion.setTimestep(this.timestep);

                this.pressureDiffusion.setLayerOffset(pass * 4);

                this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

            }

            this.pressureGrid.flip();

            this.timeAccumulator -= this.timestep;
        }

        this.framebuffer.unbind();
        this.framebuffer.resetViewport();
    }
}
