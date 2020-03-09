import Texture3D from "../rendering/texture3D";
import FrameBuffer from "../rendering/frameBuffer";
import Grid from "../marching-cubes/grid";
import { vec3 } from "gl-matrix";
import DiffusionProgram from "./program/diffusion";
import CopyTexture3DProgram from "./program/copyTexture3D";
import ExternalForcesProgram from "./program/externalForces";
import AdvectionProgram from "./program/advection";
import VelocityAdvectionProgram from "./program/velocityAdvection";
import PressureProgram from "./program/pressure";
import Layered3DTextureProgram from "./program/layered3DTextureProgram";
import ProjectionProgram from "./program/projection";
import LevelSetProgram from "./program/levelSet";
import MaskProgram from "./program/mask";

class PingPong<T> {
    private values: [T, T] = [null, null];
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
    velocityGrid: PingPong<Texture3D>;
    levelSetGrid: PingPong<Texture3D>;
    massGrid: PingPong<Texture3D>;
    framebuffer: FrameBuffer;

    vao: WebGLVertexArrayObject;
    vbo: WebGLBuffer;
    private pressureDiffusion: DiffusionProgram;
    private textureCopy: CopyTexture3DProgram;
    private externalForces: ExternalForcesProgram;
    private advection: AdvectionProgram;
    private velocityAdvection: VelocityAdvectionProgram;
    private pressure: PressureProgram;
    private projection: ProjectionProgram;
    private levelSet: LevelSetProgram;
    private mask: MaskProgram;
    private skipFrames: number = 0;
    // private maskPressure: MaskPressureProgram;

    private timeAccumulator: number = 0.0;
    private drawBuffers = [0, 1, 2, 3];

    diffusionScale: number = 0.2;
    diffusionSteps: number = 10;
    gravity: vec3 = vec3.fromValues(0.0, -500.0, 0.0);

    constructor(
        private gl: WebGL2RenderingContext,
        grid: Grid,
        private timestep: number
    ) {
        this.xSize = grid.xSize;
        this.ySize = grid.ySize;
        this.zSize = grid.zSize;

        this.pressureDiffusion = new DiffusionProgram(this.gl);
        this.textureCopy = new CopyTexture3DProgram(this.gl);
        this.externalForces = new ExternalForcesProgram(this.gl);
        this.advection = new AdvectionProgram(this.gl);
        this.velocityAdvection = new VelocityAdvectionProgram(this.gl);
        this.pressure = new PressureProgram(this.gl);
        this.projection = new ProjectionProgram(this.gl);
        this.levelSet = new LevelSetProgram(this.gl);
        this.mask = new MaskProgram(this.gl);
        // this.maskPressure = new MaskPressureProgram(this.gl);

        this.framebuffer = new FrameBuffer(this.gl, this.xSize, this.ySize);

        this.setup();
    }

    private setup(): void {
        this.setupPressureGrid();
        this.setupPass();
    }

    private setupPressureGrid(): void {
        let textures = [];
        for (let i = 0; i < 6; i++) {
            textures.push(
                new Texture3D(this.gl, {
                    width: this.xSize,
                    height: this.ySize,
                    depth: this.zSize,
                    internalFormat: this.gl.R32F,
                    format: this.gl.RED,
                    minFilter: this.gl.LINEAR,
                    magFilter: this.gl.LINEAR
                })
            );
        }
        for (let i = 0; i < 2; i++) {
            textures.push(
                new Texture3D(this.gl, {
                    width: this.xSize,
                    height: this.ySize,
                    depth: this.zSize,
                    internalFormat: this.gl.RGBA32F,
                    format: this.gl.RGBA,
                    minFilter: this.gl.LINEAR,
                    magFilter: this.gl.LINEAR,
                    dataType: this.gl.FLOAT
                })
            );
        }

        this.pressureGrid = new PingPong(textures[0], textures[1]);
        this.levelSetGrid = new PingPong(textures[2], textures[3]);
        this.massGrid = new PingPong(textures[4], textures[5]);
        this.velocityGrid = new PingPong(textures[6], textures[7]);
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

        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(vertexData),
            this.gl.STATIC_DRAW
        );

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
    }

    get pressureGridTexture(): Texture3D {
        return this.pressureGrid.current;
    }

    get otherPressureGridTexture(): Texture3D {
        return this.pressureGrid.other;
    }

    get levelSetTexture(): Texture3D {
        return this.levelSetGrid.current;
    }

    get otherLevelSetTexture(): Texture3D {
        return this.levelSetGrid.other;
    }

    get velocityGridTexture(): Texture3D {
        return this.velocityGrid.current;
    }

    get otherVelocityGridTexture(): Texture3D {
        return this.velocityGrid.other;
    }

    private drawInto3DTexture<T extends Layered3DTextureProgram>(
        target: Texture3D,
        program: T,
        onBeforeDrawLayer: (program: T) => void
    ): void {
        this.gl.bindVertexArray(this.vao);

        for (let pass = 0; pass < this.zSize / 4; pass++) {
            this.framebuffer.bind();

            this.framebuffer.colorAttachmentLayer(0, target, 4 * pass, false);
            this.framebuffer.colorAttachmentLayer(
                1,
                target,
                4 * pass + 1,
                false
            );
            this.framebuffer.colorAttachmentLayer(
                2,
                target,
                4 * pass + 2,
                false
            );
            this.framebuffer.colorAttachmentLayer(
                3,
                target,
                4 * pass + 3,
                false
            );
            this.framebuffer.drawBuffers(this.drawBuffers);
            this.framebuffer.clear();
            this.framebuffer.applyViewport();

            program.use();
            program.setLayerOffset(pass * 4);
            onBeforeDrawLayer(program);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }
    }

    private computeIntoPingPong3DTexture<T extends Layered3DTextureProgram>(
        buffer: PingPong<Texture3D>,
        program: T,
        onBeforeDrawLayer: (program: T) => void
    ) {
        this.drawInto3DTexture(buffer.other, program, onBeforeDrawLayer);
        this.gl.flush();
        this.gl.finish();
        buffer.flip();
        this.copyTexture3D(buffer.current, buffer.other, this.framebuffer);
        this.gl.flush();
        this.gl.finish();
        buffer.flip();
    }

    private applyDiffusion() {
        for (
            let diffuseStep = 0;
            diffuseStep < this.diffusionSteps;
            diffuseStep++
        ) {
            this.computeIntoPingPong3DTexture(
                this.velocityGrid,
                this.pressureDiffusion,
                p => {
                    p.setGrid(this.velocityGrid.current);
                    p.setViscosity(this.diffusionScale);
                    p.setTimestep(this.timestep);
                }
            );
        }
    }

    private applyExternalForces() {
        this.computeIntoPingPong3DTexture(
            this.velocityGrid,
            this.externalForces,
            p => {
                p.setGrid(this.velocityGrid.current);
                p.setMassGrid(this.massGrid.current);
                p.setForce(this.gravity);
                p.setTimestep(this.timestep);
            }
        );
    }

    private advectVelocityField() {
        this.computeIntoPingPong3DTexture(
            this.velocityGrid,
            this.velocityAdvection,
            p => {
                p.setGrid(this.velocityGrid.current);
                p.setTimestep(this.timestep);
            }
        );
    }

    private advectMassField() {
        this.computeIntoPingPong3DTexture(this.massGrid, this.advection, p => {
            p.setGrid(this.massGrid.current);
            p.setVelocityGrid(this.velocityGrid.current);
            p.setTimestep(this.timestep);
        });
    }

    private computePressureField() {
        // this.maskPressureField();
        for (let i = 0; i < 10; i++) {
            // this.maskPressureField();
            this.computeIntoPingPong3DTexture(
                this.pressureGrid,
                this.pressure,
                p => {
                    p.setGrid(this.pressureGrid.current);
                    p.setVelocityGrid(this.velocityGrid.current);
                    p.setMassGrid(this.massGrid.current);
                }
            );
        }
    }

    private projectVelocity() {
        this.computeIntoPingPong3DTexture(
            this.velocityGrid,
            this.projection,
            p => {
                p.setGrid(this.velocityGrid.current);
                p.setPressureGrid(this.pressureGrid.current);
            }
        );
    }

    private calculateLevelSet() {
        this.computeIntoPingPong3DTexture(
            this.levelSetGrid,
            this.levelSet,
            p => {
                p.setGrid(this.massGrid.current);
            }
        );
    }

    private maskPressureField() {
        this.computeIntoPingPong3DTexture(this.pressureGrid, this.mask, p => {
            p.setMassGrid(this.massGrid.current);
        });
    }

    private maskVelocityField() {
        this.computeIntoPingPong3DTexture(this.velocityGrid, this.mask, p => {
            p.setMassGrid(this.massGrid.current);
        });
    }

    private skippedFrames: number = 0;

    update(delta: number): void {

        if (this.skippedFrames++ < this.skipFrames) {
            return;
        }
        this.skippedFrames = 0;

        this.gl.bindVertexArray(this.vao);

        this.advectVelocityField();
        this.applyExternalForces();
        this.applyDiffusion();
        this.computePressureField();
        this.projectVelocity();

        this.advectMassField();

        this.calculateLevelSet();

        this.framebuffer.unbind();
        this.framebuffer.resetViewport();
    }

    private copyTexture3D(
        source: Texture3D,
        target: Texture3D,
        fb: FrameBuffer
    ) {
        this.gl.bindVertexArray(this.vao);

        for (let pass = 0; pass < target.depth / 4; pass++) {
            fb.bind();
            fb.colorAttachmentLayer(0, target, pass * 4 + 0, false);
            fb.colorAttachmentLayer(1, target, pass * 4 + 1, false);
            fb.colorAttachmentLayer(2, target, pass * 4 + 2, false);
            fb.colorAttachmentLayer(3, target, pass * 4 + 3, false);
            fb.drawBuffers(this.drawBuffers);
            fb.clear();
            fb.applyViewport();

            this.textureCopy.use();
            this.textureCopy.setGrid(source);
            this.textureCopy.setLayerOffset(pass * 4);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }

        fb.unbind();
        fb.resetViewport();
    }
}
