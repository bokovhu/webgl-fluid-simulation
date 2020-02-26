import Main from './src/main.ts';
import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

const FluidSimWasm = require('./src/wasm/fluidsim_wasm.js');
FluidSimWasm().then((wasmModule) => {
    let main = new Main(wasmModule);
    main.start();
});
