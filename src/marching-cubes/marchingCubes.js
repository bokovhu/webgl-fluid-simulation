import { LAYOUT_CONTINOUS_ARRAY, LAYOUT_ARRAY_OF_SHEETS, LAYOUT_3D_ARRAY } from './grid/memoryLayout';
import Model from '../model/model';
import Mesh from '../mesh/mesh';

export default class MarchingCubes {
    constructor(gl, grid, fieldGenerator, marcher, options) {
        this.gl = gl;
        this.grid = grid;
        this.fieldGenerator = fieldGenerator;
        this.marcher = marcher;
        this.options = options || {};
    }

    generate() {
        let start = window.performance.now();
        this.grid.generate(this.fieldGenerator);
        let end = window.performance.now();

        if (this.options.debugGenerate) {
            console.log(`Generating the scalar field took ${end - start} ms`);
        }
    }

    march(shaderProgram, isoLevel) {
        if (!this.marcher.supports[this.grid.memoryLayout]) {
            throw new Error('The current cube marcher does not support the memory layout of the grid!');
        }
        if (this.marcher.skipMarch) {
            return;
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
                    if (this.marcher.prepare) {
                        this.marcher.prepare({
                            outVertices: this.vertexBuffer,
                            field: this.grid.field,
                            fieldSize: [ this.grid.xSize, this.grid.ySize, this.grid.zSize ]
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

    render(preRender) {
        let start = window.performance.now();

        if (this.marcher.customRender) {
            this.marcher.render(this);
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
}
