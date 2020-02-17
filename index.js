import Main from './src/main';
import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

const FluidSimWasm = require('./src/wasm/fluidsim_wasm.js');
FluidSimWasm().then((wasmModule) => {
    let main = new Main(wasmModule);
    main.start();
});

/*
const WasmMarcherModule = require('./src/native/wasm_marcher.js');
const wasmMarcher = WasmMarcherModule().then((Module) => {
    console.log(Module);

    let vertices = [];
    for (let i = 0; i < 128; i++) {
        vertices[i] = -1.0;
    }

    let array = Module._malloc(128 * 4);
    Module.HEAPF32.set(vertices, array >> 2);
    let result = Module.ccall('calculateVertices', 'number', [ 'number' ], [ array ]);
    console.log(`calculateVertices returned ${result}`);
    vertices = Module.HEAPF32.slice(array >> 2, (array >> 2) + result);
    console.log (vertices)
    Module._free(array);
});
*/
