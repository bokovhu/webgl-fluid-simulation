import { ShaderProgram } from "../rendering/shader/shaderProgram";

import vertexSource from "../glsl/fluid/shader.vertex.glsl";
import diffusionFragmentSource from "../glsl/fluid/diffusion/shader.fragment.glsl";
import copyTexture3DFragmentSource from "../glsl/fluid/tex-copy/shader.fragment.glsl";
import externalForceFragmentSource from "../glsl/fluid/external-force/shader.fragment.glsl";
import advectionFragmentSource from "../glsl/fluid/advection/shader.fragment.glsl";
import velocityAdvectionFragmentSource from "../glsl/fluid/velocity-advection/shader.fragment.glsl";
import pressureFragmentSource from "../glsl/fluid/pressure/shader.fragment.glsl";
import projectionFragmentSource from "../glsl/fluid/projection/shader.fragment.glsl";
import maskPressureFragmentSource from "../glsl/fluid/mask-pressure/shader.fragment.glsl";
import { makeProgram } from "../rendering/shader/functions";
import Texture3D from "../rendering/texture3D";
import FrameBuffer from "../rendering/frameBuffer";
import Grid from "../marching-cubes/grid";
import { vec3 } from "gl-matrix";

interface Layered3DTextureProgram {
    setLayerOffset(offset: number);
    use(): void;
}

export class DiffusionProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(gl, vertexSource, diffusionFragmentSource);
    }

    setDiffusionScale(scale: number) {
        this.program.setUniform("u_diffusionScale", scale);
    }

    setGrid(grid: Texture3D) {
        grid.bind(0);
        this.program.setUniform("u_pressureGrid", 0);
        this.program.setUniform("u_gridSize", [
            grid.width,
            grid.height,
            grid.depth
        ]);
        this.program.setUniform("u_voxelStep", [
            1.0 / grid.width,
            1.0 / grid.height,
            1.0 / grid.depth
        ]);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }

    setTimestep(timestep: number) {
        this.program.setUniform("u_timestep", timestep);
    }

    use(): void {
        this.program.use();
    }
}

export class CopyTexture3DProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(
            gl,
            vertexSource,
            copyTexture3DFragmentSource
        );
    }

    use() {
        this.program.use();
    }

    setTexture(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_texture", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

export class ExternalForcesProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(
            gl,
            vertexSource,
            externalForceFragmentSource
        );
    }

    use() {
        this.program.use();
    }

    setTexture(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_originalVelocityGrid", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
    }

    setLevelSetField(texture: Texture3D) {
        texture.bind(1);
        this.program.setUniform("u_levelSetGrid", 1);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }

    setExternalForce(force: vec3) {
        this.program.setUniform("u_externalForce", force);
    }

    setTimestep(timestep: number) {
        this.program.setUniform("u_timestep", timestep);
    }
}

export class AdvectionProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(gl, vertexSource, advectionFragmentSource);
    }

    use() {
        this.program.use();
    }

    setVelocityGrid(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_velocityGrid", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
    }

    setScalarGrid(texture: Texture3D) {
        texture.bind(1);
        this.program.setUniform("u_scalarGrid", 1);
    }

    setAdvectionScale(scale: number) {
        this.program.setUniform("u_advectionScale", scale);
    }

    setTimestep(timestep: number) {
        this.program.setUniform("u_timestep", timestep);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

export class VelocityAdvectionProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(
            gl,
            vertexSource,
            velocityAdvectionFragmentSource
        );
    }

    use() {
        this.program.use();
    }

    setVelocityGrid(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_velocityGrid", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
    }

    setTimestep(timestep: number) {
        this.program.setUniform("u_timestep", timestep);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

export class PressureProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(gl, vertexSource, pressureFragmentSource);
    }

    use() {
        this.program.use();
    }

    setVelocityGrid(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_velocityGrid", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
        this.program.setUniform("u_voxelStep", [
            1.0 / texture.width,
            1.0 / texture.height,
            1.0 / texture.depth
        ]);
    }

    setPressureGrid(texture: Texture3D) {
        texture.bind(1);
        this.program.setUniform("u_originalPressureGrid", 1);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

export class ProjectionProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(gl, vertexSource, projectionFragmentSource);
    }

    use() {
        this.program.use();
    }

    setVelocityGrid(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_velocityGrid", 0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
    }

    setPressureGrid(texture: Texture3D) {
        texture.bind(1);
        this.program.setUniform("u_pressureGrid", 1);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

export class MaskPressureProgram implements Layered3DTextureProgram {
    program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = makeProgram(
            gl,
            vertexSource,
            maskPressureFragmentSource
        );
    }

    use() {
        this.program.use();
    }

    setPressureGrid(texture: Texture3D) {
        texture.bind(0);
        this.program.setUniform("u_textureResolution", [
            texture.width,
            texture.height,
            texture.depth
        ]);
        this.program.setUniform("u_pressureGrid", 0);
    }

    setLevelSetGrid(texture: Texture3D) {
        texture.bind(1);
        this.program.setUniform("u_levelSetGrid", 1);
    }

    setLayerOffset(offset: number) {
        this.program.setUniform("u_layerOffset", offset);
    }
}

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
    private maskPressure: MaskPressureProgram;

    private timeAccumulator: number = 0.0;
    private drawBuffers = [0, 1, 2, 3];

    diffusionScale: number = 1.0;
    diffusionSteps: number = 2;
    advectionScale: number = 1.0;
    gravity: vec3 = vec3.fromValues(0.0, -50.0, 0.0);

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
        this.maskPressure = new MaskPressureProgram(this.gl);

        this.framebuffer = new FrameBuffer(this.gl, this.xSize, this.ySize);

        this.setup();
    }

    private setup(): void {
        this.setupPressureGrid();
        this.setupPass();
    }

    private setupPressureGrid(): void {
        let textures = [];
        for (let i = 0; i < 4; i++) {
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
                    internalFormat: this.gl.RGBA16F,
                    format: this.gl.RGBA,
                    minFilter: this.gl.LINEAR,
                    magFilter: this.gl.LINEAR,
                    dataType: this.gl.FLOAT
                })
            );
        }

        this.pressureGrid = new PingPong(textures[0], textures[1]);
        this.levelSetGrid = new PingPong(textures[2], textures[3]);
        this.velocityGrid = new PingPong(textures[4], textures[5]);
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

    private applyPressureDiffusion() {
        for (
            let diffuseStep = 0;
            diffuseStep < this.diffusionSteps;
            diffuseStep++
        ) {
            this.drawInto3DTexture(
                this.pressureGrid.other,
                this.pressureDiffusion,
                p => {
                    p.setGrid(this.pressureGrid.current);
                    p.setDiffusionScale(this.diffusionScale);
                    p.setTimestep(this.timestep);
                }
            );

            // current is the previous, we've drawn into other
            this.pressureGrid.flip();

            // now current is the new texture, other is the old
            // copy current into old so that they are the same
            this.copyTexture3D(
                this.pressureGrid.current,
                this.pressureGrid.other,
                this.framebuffer
            );

            this.pressureGrid.flip();
        }
    }

    private applyVelocityDiffusion() {}

    private applyExternalForces() {
        this.drawInto3DTexture(
            this.velocityGrid.other,
            this.externalForces,
            p => {
                p.setTexture(this.velocityGrid.current);
                p.setLevelSetField(this.levelSetGrid.current);
                p.setExternalForce(this.gravity);
                p.setTimestep(this.timestep);
            }
        );

        // current is the previous, we've drawn into other
        this.velocityGrid.flip();

        // now current is the new texture, other is the old
        // copy current into old so that they are the same
        this.copyTexture3D(
            this.velocityGrid.current,
            this.velocityGrid.other,
            this.framebuffer
        );

        this.velocityGrid.flip();
    }

    private advectVelocityField() {
        this.drawInto3DTexture(
            this.velocityGrid.other,
            this.velocityAdvection,
            p => {
                p.setVelocityGrid(this.velocityGrid.current);
                p.setTimestep(this.timestep);
            }
        );

        this.velocityGrid.flip();

        this.copyTexture3D(
            this.velocityGrid.current,
            this.velocityGrid.other,
            this.framebuffer
        );

        this.velocityGrid.flip();
    }

    private advectLevelSetField() {
        this.drawInto3DTexture(this.levelSetGrid.other, this.advection, p => {
            p.setVelocityGrid(this.velocityGrid.current);
            p.setScalarGrid(this.levelSetGrid.current);
            p.setTimestep(this.timestep);
        });

        this.levelSetGrid.flip();

        this.copyTexture3D(
            this.levelSetGrid.current,
            this.levelSetGrid.other,
            this.framebuffer
        );

        this.levelSetGrid.flip();
    }

    private advectPressureField() {}

    private computePressureField() {
        for (let i = 0; i < 10; i++) {
            this.drawInto3DTexture(
                this.pressureGrid.other,
                this.pressure,
                p => {
                    p.setVelocityGrid(this.velocityGrid.current);
                    p.setPressureGrid(this.pressureGrid.current);
                }
            );

            // current is the previous, we've drawn into other
            this.pressureGrid.flip();

            // now current is the new texture, other is the old
            // copy current into old so that they are the same
            this.copyTexture3D(
                this.pressureGrid.current,
                this.pressureGrid.other,
                this.framebuffer
            );

            this.pressureGrid.flip();
        }
    }

    private maskPressureField() {
        this.drawInto3DTexture(
            this.pressureGrid.other,
            this.maskPressure,
            p => {
                p.setLevelSetGrid(this.levelSetGrid.current);
                p.setPressureGrid(this.pressureGrid.current);
            }
        );

        // current is the previous, we've drawn into other
        this.pressureGrid.flip();

        // now current is the new texture, other is the old
        // copy current into old so that they are the same
        this.copyTexture3D(
            this.pressureGrid.current,
            this.pressureGrid.other,
            this.framebuffer
        );

        this.pressureGrid.flip();

        this.drawInto3DTexture(
            this.velocityGrid.other,
            this.maskPressure,
            p => {
                p.setLevelSetGrid(this.levelSetGrid.current);
                p.setPressureGrid(this.velocityGrid.current);
            }
        );

        // current is the previous, we've drawn into other
        this.velocityGrid.flip();

        // now current is the new texture, other is the old
        // copy current into old so that they are the same
        this.copyTexture3D(
            this.velocityGrid.current,
            this.velocityGrid.other,
            this.framebuffer
        );

        this.velocityGrid.flip();
    }

    private projectVelocity() {
        this.drawInto3DTexture(this.velocityGrid.other, this.projection, p => {
            p.setVelocityGrid(this.velocityGrid.current);
            p.setPressureGrid(this.pressureGrid.current);
        });

        // current is the previous, we've drawn into other
        this.velocityGrid.flip();

        // now current is the new texture, other is the old
        // copy current into old so that they are the same
        this.copyTexture3D(
            this.velocityGrid.current,
            this.velocityGrid.other,
            this.framebuffer
        );

        this.velocityGrid.flip();
    }

    update(delta: number): void {
        this.timeAccumulator += delta > this.timestep ? this.timestep : delta;

        this.gl.bindVertexArray(this.vao);

        while (this.timeAccumulator >= this.timestep) {
            this.advectLevelSetField();

            this.applyExternalForces();
            this.advectVelocityField();
            // this.applyVelocityDiffusion ();

            this.computePressureField();
            this.applyPressureDiffusion ();
            this.projectVelocity();

            this.maskPressureField();

            /* this.levelSetGrid.flip ()
            this.copyTexture3D (this.levelSetGrid.current, this.levelSetGrid.other, this.framebuffer)
            this.levelSetGrid.flip () */
            this.timeAccumulator -= this.timestep;
        }

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
            this.textureCopy.setTexture(source);
            this.textureCopy.setLayerOffset(pass * 4);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }

        fb.unbind();
        fb.resetViewport();
    }
}
