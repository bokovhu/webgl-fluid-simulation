import './main.css';

import BlinnPhong from './shader/user/blinnPhongShader';
import GameGUI from './gui/gui'
import { mat4, vec2, vec3 } from 'gl-matrix';
import Grid, { GridOptions } from './marching-cubes/grid'
import CPUCubeMarcher from './marching-cubes/cpuCubeMarcher';
import SimplexNoise from 'simplex-noise';

export default class Main {
    constructor() {}

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

    generateScalarFields() {
        
        this.grid.generateFields ()

    }

    generateModels() {
        
        this.grid.generateModels (this.program.program)
        this.models = this.grid.models

    }

    generateMarchingCubesResult() {

        let start = Date.now();

        this.generateModels();

        let end = Date.now();
        console.log(`Finished marching cubes in ${end - start} ms`);
    }

    createMesh() {
        this.grid = new Grid (
            this.gl,
            new GridOptions ()
        )

        this.generateScalarFields();
        this.generateMarchingCubesResult();
    }

    initProperties() {
        this.appTime = 0.0;

        this.isoLevel = -0.4;

        this.fieldSize = [ 32, 32, 32 ];
        this.voxelSize = 1.0 / 8.0;
        this.chunkStartX = 0;
        this.chunkStartY = 0;
        this.chunkStartZ = 0;
        this.chunkEndX = 0;
        this.chunkEndY = 0;
        this.chunkEndZ = 0;

        this.models = [];
        this.fields = [];

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

        // this.generateMarchingCubesResult ()

        this.models.forEach((model) => {
            this.program.setModel(model.modelMatrix);
            model.draw();
        });
    }
}