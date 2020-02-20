import './main.css';

import BlinnPhong from './shader/user/blinnPhongShader';
import GameGUI from './gui/gui'
import { mat4, vec2, vec3 } from 'gl-matrix';
import Grid from './marching-cubes/grid'
import JSMarcher from './marching-cubes/jsMarcher'
import WasmMarcher from './marching-cubes/wasmMarcher'
import Mesh from './mesh/mesh'
import Model from './model/model';
import GPUMarcher from './marching-cubes/gpuMarcher';
import MarchingCubes from './marching-cubes/marchingCubes';
import Grid1D from './marching-cubes/grid/grid1D';
import SimplexNoiseFieldGenerator from './marching-cubes/fieldgen/simplexNoise';
import SphereFieldGenerator from './marching-cubes/fieldgen/sphere';
import RandomFieldGenerator from './marching-cubes/fieldgen/random';
import TerrainFieldGenerator from './marching-cubes/fieldgen/terrain';

export default class Main {

    constructor(wasmModule) {
        this.wasmModule = wasmModule
    }

    createGui() {
        this.gui = new GameGUI (this)
        this.gui.init ()
    }

    createWebGLContext() {
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl2');
        if (this.gl == null) {
            throw new Error('Could not get WebGL 2 rendering context!');
        }
    }

    initGLObjects() {
        this.program = new BlinnPhong(this.gl);

        this.createMesh();

        this.gl.cullFace(this.gl.FRONT);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    generateMarchingCubesResult() {

        console.log ('Marching')
        this.marchingCubes.march (this.program.program, this.isoLevel)

    }

    createMesh() {

        this.marchingCubes = new MarchingCubes (
            this.gl,
            new Grid1D (
                128, 128, 128,
                1.0 / 8.0, 1.0 / 8.0, 1.0 / 8.0
            ),
            new TerrainFieldGenerator (),
            new WasmMarcher (this.gl, this.wasmModule),
            {
                debugMarch: true
            }
        )
        this.marchingCubes.generate ()

        this.generateMarchingCubesResult();

    }

    initProperties() {
        this.appTime = 0.0;

        this.isoLevel = 36

        this.models = [];

        this.camera = {
            position: vec3.create(),
            view: mat4.create(),
            projection: mat4.create(),
            orbitRadius: 20.0,
            orbitCenter: vec3.fromValues(0, 0, 0),
            orbitSpeed: 0.25,
            orbitHeight: 6.0
        };
        this.light = {
            type: 'directional',
            direction: vec3.fromValues(-0.5, -0.8, -0.3),
            position: vec3.fromValues(0.0, 0.0, 0.0),
            intensity: vec3.fromValues(1.0, 0.78, 0.42),
            ambient: vec3.fromValues(0.1, 0.15, 0.2)
        };
        vec3.normalize(this.light.direction, this.light.direction);

        this.material = {
            diffuse: [ 1.0, 0.2, 0.2 ],
            specular: [ 0.5, 0.5, 0.5 ],
            shininess: 32.0
        };
        
        this.resolution = vec2.create();
    }

    start() {
        this.initProperties();
        this.createGui();
        this.createWebGLContext();
        this.initGLObjects();

        this.lastFrameTimestamp = Date.now();

        window.onresize = this.onResized.bind(this);
        this.onResized();

        window.requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    onResized() {
        this.gl.canvas.width = window.innerWidth;
        this.gl.canvas.height = window.innerHeight;

        this.width = this.gl.canvas.width;
        this.height = this.gl.canvas.height;
        this.resolution[0] = this.width;
        this.resolution[1] = this.height;
        this.aspectRatio = this.width / this.height;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        mat4.perspective(this.camera.projection, 3.141592653 / 3.0, this.aspectRatio, 0.01, 100.0);
    }

    onAnimationFrame() {
        this.gui.stats.begin();

        let now = Date.now();
        this.delta = (now - this.lastFrameTimestamp) * 0.001;
        this.lastFrameTimestamp = now;
        this.appTime += this.delta;

        this.onDraw();

        this.gui.stats.end();

        window.requestAnimationFrame(this.onAnimationFrame.bind(this));
    }

    onDraw() {
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        vec3.set(
            this.camera.position,
            Math.cos(this.appTime * this.camera.orbitSpeed) * this.camera.orbitRadius,
            this.camera.orbitHeight,
            Math.sin(this.appTime * this.camera.orbitSpeed) * this.camera.orbitRadius
        );

        mat4.lookAt(this.camera.view, this.camera.position, this.camera.orbitCenter, [ 0, 1, 0 ]);

        this.program.use();
        this.program.setCamera(this.camera);
        this.program.setLight(this.light);
        this.program.setMaterial(this.material);

        this.marchingCubes.render (
            (model) => {
                this.program.setModel (model.modelMatrix)
            }
        )

    }
}
