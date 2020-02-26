import { LAYOUT_CONTINOUS_ARRAY, LAYOUT_ARRAY_OF_SHEETS, LAYOUT_3D_ARRAY } from './grid/memoryLayout';
import Model from '../rendering/model';
import Mesh from '../rendering/mesh';
import FieldGenerator from './fieldgen/fieldGenerator';
import Marcher from './marcher';
import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { vec3 } from 'gl-matrix';
import Grid from './grid/grid';

export interface MarchingCubesOptions {
    debugGenerate?: boolean;
    marchStep?: number;
    debugMarch?: boolean;
    debugRender?: boolean;
}

export default class MarchingCubes {
    private model: Model = null;
    private vertexBuffer: Float32Array = null;
    private center: vec3 = vec3.create();

    constructor(
        private gl: WebGL2RenderingContext,
        public grid: Grid,
        private fieldGenerator: FieldGenerator,
        private marcher: Marcher,
        public options: MarchingCubesOptions
    ) {}

    generate() {
        let start = window.performance.now();
        this.grid.generate(this.fieldGenerator);
        let end = window.performance.now();

        vec3.set(
            this.center,
            this.grid.xSize / 2.0 * this.grid.xScale,
            this.grid.ySize / 2.0 * this.grid.yScale,
            this.grid.zSize / 2.0 * this.grid.zScale
        );

        if (this.options.debugGenerate) {
            console.log(`Generating the scalar field took ${end - start} ms`);
        }
    }

    march(shaderProgram: ShaderProgram, isoLevel: number) {
        if (this.marcher.skipMarch) {
            return;
        }

        if (!this.marcher.supports[this.grid.memoryLayout]) {
            throw new Error('The current cube marcher does not support the memory layout of the grid!');
        }

        let start = window.performance.now();

        let model = this.model;
        if (!model) {
            model = new Model(this.gl);
        }

        let reuseModel = model.meshes.length > 0;

        switch (this.grid.memoryLayout) {
            case LAYOUT_CONTINOUS_ARRAY:
                let marchStep = this.options.marchStep;
                if (!marchStep) {
                    marchStep = this.grid.sheetSize * 4;
                }

                if (!this.vertexBuffer) {
                    this.vertexBuffer = new Float32Array(marchStep * 5 * 3 * 6);
                    let numMaxVertices = marchStep * 5 * 3;
                    if (this.marcher.prepare) {
                        this.marcher.prepare({
                            outVertices: this.vertexBuffer,
                            field: this.grid.field,
                            fieldSize: [ this.grid.xSize, this.grid.ySize, this.grid.zSize ],
                            numMaxVertices: numMaxVertices,
                            grid: this.grid
                        });
                    }
                }

                for (let i = 0; i < this.grid.totalSize; i += marchStep) {
                    let z = Math.floor(i / this.grid.sheetSize);
                    let y = Math.floor((i - z * this.grid.sheetSize) / this.grid.rowSize);
                    let x = Math.floor(i - (z * this.grid.sheetSize + y * this.grid.rowSize));

                    let numVertices = this.marcher.calculate(
                        this.vertexBuffer,
                        this.grid.field,
                        i,
                        i + marchStep,
                        this.grid.xSize,
                        this.grid.ySize,
                        this.grid.zSize,
                        0,
                        0,
                        0,
                        this.grid.xScale,
                        this.grid.yScale,
                        this.grid.zScale,
                        isoLevel
                    );

                    let mesh = model.meshes[Math.floor(i / marchStep)] || new Mesh(this.gl);
                    mesh.uploadRaw(this.vertexBuffer, numVertices);

                    if (!reuseModel) {
                        model.meshes.push(mesh);
                    }
                }

                break;
            case LAYOUT_ARRAY_OF_SHEETS:
                break;
            case LAYOUT_3D_ARRAY:
                break;
        }

        if (!reuseModel) {
            model.setup(shaderProgram);
            this.model = model;
        }

        let end = window.performance.now();

        if (this.options.debugMarch) {
            console.log(`Cube marching took ${end - start} ms`);
        }
    }

    render(preRender: (model: Model) => void, beforeCustomRender: () => void) {
        let start = window.performance.now();

        if (this.marcher.customRender) {
            this.marcher.render(this, beforeCustomRender);
        } else {
            if (preRender) {
                preRender(this.model);
            }
            this.model.draw();
        }

        let end = window.performance.now();

        if (this.options.debugRender) {
            console.log(`Rendering took ${end - start} ms`);
        }
    }

    get centerPoint(): vec3 {
        return this.center;
    }
}
