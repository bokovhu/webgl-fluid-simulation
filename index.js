import Main from './src/main';
import { glMatrix } from 'gl-matrix';

glMatrix.setMatrixArrayType(Array);

let main = new Main();
main.start();
