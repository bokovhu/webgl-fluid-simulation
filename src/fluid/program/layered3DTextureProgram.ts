import { ShaderProgram } from "../../rendering/shader/shaderProgram";
import Texture3D from "../../rendering/texture3D";
import { vec3 } from "gl-matrix";

export default abstract class Layered3DTextureProgram {

    protected program: ShaderProgram;
    protected gridSize: vec3 = vec3.create();
    protected gridStep: vec3 = vec3.create();
    protected gridStepX: vec3 = vec3.create();
    protected gridStepY: vec3 = vec3.create();
    protected gridStepZ: vec3 = vec3.create();

    constructor(protected gl: WebGL2RenderingContext) {
        this.program = this.makeProgram();
    }

    protected abstract makeProgram(): ShaderProgram;

    use () {
        this.program.use ();
    }

    setLayerOffset(offset: number): void {
        this.program.setUniform("u_layerOffset", offset);
    }
    setGrid(grid: Texture3D): void {
        grid.bind(0);
        this.program.setUniform("u_grid", 0);

        vec3.set(this.gridSize, grid.width, grid.height, grid.depth);
        vec3.set(
            this.gridStep,
            1.0 / this.gridSize[0],
            1.0 / this.gridSize[1],
            1.0 / this.gridSize[2]
        );

        vec3.set(this.gridStepX, this.gridStep[0], 0, 0);
        vec3.set(this.gridStepY, 0, this.gridStep[1], 0);
        vec3.set(this.gridStepZ, 0, 0, this.gridStep[2]);

        if (this.program.hasUniform("u_gridSize")) {
            this.program.setUniform("u_gridSize", this.gridSize);
        }
        if (this.program.hasUniform("u_gridStep")) {
            this.program.setUniform("u_gridStep", this.gridStep);
        }
        if (this.program.hasUniform("u_stepX")) {
            this.program.setUniform("u_stepX", this.gridStepX);
        }
        if (this.program.hasUniform("u_stepY")) {
            this.program.setUniform("u_stepY", this.gridStepY);
        }
        if (this.program.hasUniform("u_stepZ")) {
            this.program.setUniform("u_stepZ", this.gridStepZ);
        }
    }
    setTimestep(timestep: number): void {
        if (this.program.hasUniform('u_timestep')) {
            this.program.setUniform('u_timestep', timestep);
        }
    }
}
