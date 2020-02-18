import {
    LAYOUT_CONTINOUS_ARRAY
} from './grid/memoryLayout'

export default class WasmMarcher {
    constructor(gl, wasmModule) {
        this.gl = gl;
        this.wasmModule = wasmModule;

        this.wasmCalculate = this.wasmModule.cwrap('wasmCubeMarch_calculate', 'number', [
            // float* outVertices
            'number',
            // float* field
            'number',
            // uint32_t fromIndex, uint32_t toIndex
            'number',
            'number',
            // uint32_t fieldSizeX, uint32_t fieldSizeY, uint32_t fieldSizeZ
            'number',
            'number',
            'number',
            // float vertexOffsetX, float vertexOffsetY, float vertexOffsetZ
            'number',
            'number',
            'number',
            // float scaleX, float scaleY, float scaleZ
            'number',
            'number',
            'number',
            // float isoLevel
            'number'
        ]);
        this.supports = {};
        this.supports[LAYOUT_CONTINOUS_ARRAY] = this.calculate;
    }

    prepare(options) {
        const outVertices = options.outVertices;
        const field = options.field;

        // Create output array on the heap
        this.wasmOutputVerticesPointer = this.wasmModule._malloc(outVertices.length * outVertices.BYTES_PER_ELEMENT);
        this.wasmOutputVerticesIndex = this.wasmOutputVerticesPointer / outVertices.BYTES_PER_ELEMENT;

        // Create field array on the heap
        this.wasmFieldPointer = this.wasmModule._malloc(field.length * field.BYTES_PER_ELEMENT);
        this.wasmFieldIndex = this.wasmFieldPointer / field.BYTES_PER_ELEMENT;
    }

    calculate(
        /// The function places the generated vertices inside this array
        outVertices,
        /// The scalar field to process
        field,
        /// The starting (inclusive) and ending (exclusive) index of the cube marching
        fromIndex,
        toIndex,
        /// The size of the field in the X, Y and Z directions
        fieldSizeX,
        fieldSizeY,
        fieldSizeZ,
        /// The X, Y and Z offset to apply to all generated vertices
        vertexOffsetX,
        vertexOffsetY,
        vertexOffsetZ,
        /// The X, Y and Z scale to apply to all generated vertices
        scaleX,
        scaleY,
        scaleZ,
        /// The level of the isosurface, below which a point is considered to be inside the volume
        isoLevel
    ) {
        // Copy scalar field to WASM heap
        this.wasmModule.HEAPF32.set(field, this.wasmFieldIndex);

        // Call native function
        let numVertices = this.wasmCalculate(
            this.wasmOutputVerticesPointer,
            this.wasmFieldPointer,
            fromIndex,
            toIndex,
            fieldSizeX,
            fieldSizeY,
            fieldSizeZ,
            vertexOffsetX,
            vertexOffsetY,
            vertexOffsetZ,
            scaleX,
            scaleY,
            scaleZ,
            isoLevel
        );

        // Copy results back to output vertices
        outVertices.set(
            this.wasmModule.HEAPF32.slice(this.wasmOutputVerticesIndex, this.wasmOutputVerticesIndex + 6 * numVertices)
        );

        return numVertices;
    }
}
