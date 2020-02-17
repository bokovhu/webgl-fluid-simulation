import SimplexNoise from 'simplex-noise';
import CPUCubeMarcher from './cpuCubeMarcher';
import { mat4 } from 'gl-matrix'

export class SimplexNoiseFieldGenerator {

    constructor () {
        this.simplex = new SimplexNoise ()
    }

    generate (fieldSize, offset, scale) {

        let depth = fieldSize [2]
        let height = fieldSize [1]
        let width = fieldSize [0]

        let field = []

        for (let z = 0; z < depth; z++) {
            let sheet = []
            for (let y = 0; y < height; y++) {
                let row = []
                for (let x = 0; x < width; x++) {
                    let value = this.simplex.noise3D (
                        offset [0] + x * scale[0],
                        offset [1] + y * scale [1],
                        offset [2] + z * scale [2]
                    )
                    // value is between -1 and 1
                    value += 1.0
                    value /= 2.0

                    // value is between 0 and 1
                    value *= 255.0
                    value = Math.min (value, 255.0)
                    value = Math.max (0, value)
                    value = Math.floor (value)

                    row.push (value)
                }
                sheet.push (row)
            }
            field.push (sheet)
        }

        return field

    }

}

export class GridOptions {

    constructor () {
        this.chunkStartX = 0
        this.chunkEndX = 0
        this.chunkStartY = 0
        this.chunkEndY = 0
        this.chunkStartZ = 0
        this.chunkEndZ = 0
        this.fieldSizeX = 32
        this.fieldSizeY = 32
        this.fieldSizeZ = 32
        this.fieldGenerator = new SimplexNoiseFieldGenerator ()
        this.voxelSizeX = 0.125
        this.voxelSizeY = 0.125
        this.voxelSizeZ = 0.125
        this.isoLevel = 128
    }

}

export default class Grid {

    constructor (gl, options) {

        this.gl = gl
        this.options = options
        this.fields = []
        this.models = []
        this.cubeMarcher = new CPUCubeMarcher (gl, { smoothNormals: false })

    }

    generateFields () {

        let fields = []

        let generator = this.options.fieldGenerator

        let fieldSize = [this.options.fieldSizeX, this.options.fieldSizeY, this.options.fieldSizeZ]
        let fieldScale = [this.options.voxelSizeX, this.options.voxelSizeY, this.options.voxelSizeZ]

        for (let fieldZ = this.options.chunkStartZ; fieldZ <= this.options.chunkEndZ; fieldZ++) {
            for (let fieldY = this.options.chunkStartY; fieldY <= this.options.chunkEndY; fieldY++) {
                for (let fieldX = this.options.chunkStartX; fieldX <= this.options.chunkEndX; fieldX++) {

                    let offset = [
                        fieldX * (this.options.fieldSizeX - 1) * this.options.voxelSizeX,
                        fieldY * (this.options.fieldSizeY - 1) * this.options.voxelSizeY,
                        fieldZ * (this.options.fieldSizeZ - 1) * this.options.voxelSizeZ
                    ]

                    fields.push (
                        generator.generate (fieldSize, offset, fieldScale)
                    )

                }
            }
        }

        this.fields = fields

    }

    generateModels (program) {

        let models = [];

        let numChunksZ = Math.abs(this.options.chunkEndZ - this.options.chunkStartZ) + 1;
        let numChunksY = Math.abs(this.options.chunkEndY - this.options.chunkStartY) + 1;
        let numChunksX = Math.abs(this.options.chunkEndX - this.options.chunkStartX) + 1;

        let chunkZOffset = -this.options.chunkStartZ;
        let chunkYOffset = -this.options.chunkStartY;
        let chunkXOffset = -this.options.chunkStartX;

        let fieldSize = [
            this.options.fieldSizeX,
            this.options.fieldSizeY,
            this.options.fieldSizeZ
        ]

        for (let fieldZ = this.options.chunkStartZ; fieldZ <= this.options.chunkEndZ; fieldZ++) {
            for (let fieldY = this.options.chunkStartY; fieldY <= this.options.chunkEndY; fieldY++) {
                for (let fieldX = this.options.chunkStartX; fieldX <= this.options.chunkEndX; fieldX++) {

                    let modelIndex =
                        (fieldZ + chunkZOffset) * (numChunksY * numChunksX) +
                        (fieldY + chunkYOffset) * numChunksX +
                        (fieldX + chunkXOffset);

                    let model = this.cubeMarcher.createModel(this.fields[modelIndex], fieldSize, this.options.isoLevel);
                    model.setup(program);

                    mat4.translate(model.modelMatrix, model.modelMatrix, [
                        fieldX * this.options.voxelSizeX * (this.options.fieldSizeX - 1),
                        fieldY * this.options.voxelSizeY * (this.options.fieldSizeY - 1),
                        fieldZ * this.options.voxelSizeZ * (this.options.fieldSizeZ - 1)
                    ]);

                    mat4.scale(model.modelMatrix, model.modelMatrix, [
                        this.options.voxelSizeX,
                        this.options.voxelSizeY,
                        this.options.voxelSizeZ
                    ]);

                    models.push(model);
                }
            }
        }

        this.models = models;

    }

}