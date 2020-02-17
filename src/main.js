import './main.css';

import BlinnPhong from './shader/user/blinnPhongShader';
import * as dat from 'dat.gui';
import Stats from 'stats.js';
import { mat4, vec2, vec3 } from 'gl-matrix';
import Mesh, { makeBox } from './mesh/mesh';
import CPUCubeMarcher from './marching-cubes/cpuCubeMarcher';
import SimplexNoise from 'simplex-noise';

export default class Main {
    constructor() {}

    createGui() {
        this.gui = new dat.GUI();

        let materialFolder = this.gui.addFolder('Material');

        let materialDiffuseFolder = materialFolder.addFolder('Diffuse');
        materialDiffuseFolder.add(this.material.diffuse, '0', 0.0, 1.0);
        materialDiffuseFolder.add(this.material.diffuse, '1', 0.0, 1.0);
        materialDiffuseFolder.add(this.material.diffuse, '2', 0.0, 1.0);

        let materialSpecularFolder = materialFolder.addFolder('Specular');
        materialSpecularFolder.add(this.material.specular, '0', 0.0, 1.0);
        materialSpecularFolder.add(this.material.specular, '1', 0.0, 1.0);
        materialSpecularFolder.add(this.material.specular, '2', 0.0, 1.0);

        materialFolder.add(this.material, 'shininess', 0.0, 500.0);

        let lightFolder = this.gui.addFolder('Light');
        lightFolder.add(this.light, 'type', [ 'point', 'directional', 'spot' ]);

        let lightPosFolder = lightFolder.addFolder('Position');
        lightPosFolder.add(this.light.position, '0', -10.0, 10.0, 0.5);
        lightPosFolder.add(this.light.position, '1', -10.0, 10.0, 0.5);
        lightPosFolder.add(this.light.position, '2', -10.0, 10.0, 0.5);

        let lightDirFolder = lightFolder.addFolder('Direction');
        lightDirFolder.add(this.light.direction, '0', -1, 1, 0.05);
        lightDirFolder.add(this.light.direction, '1', -1, 1, 0.05);
        lightDirFolder.add(this.light.direction, '2', -1, 1, 0.05);

        let lightIntensityFolder = lightFolder.addFolder('Intensity');
        lightIntensityFolder.add(this.light.intensity, '0', 0.0, 5.0, 0.05);
        lightIntensityFolder.add(this.light.intensity, '1', 0.0, 5.0, 0.05);
        lightIntensityFolder.add(this.light.intensity, '2', 0.0, 5.0, 0.05);

        let lightAmbientFolder = lightFolder.addFolder('Ambient');
        lightAmbientFolder.add(this.light.ambient, '0', 0.0, 1.0, 0.05);
        lightAmbientFolder.add(this.light.ambient, '1', 0.0, 1.0, 0.05);
        lightAmbientFolder.add(this.light.ambient, '2', 0.0, 1.0, 0.05);

        let marchingCubesFolder = this.gui.addFolder('Marching Cubes');
        let isoLevelController = marchingCubesFolder.add(this, 'isoLevel', -1.0, 1.0, 0.03);
        isoLevelController.onFinishChange(() => {
            this.generateMarchingCubesResult();
        });

        let cameraFolder = this.gui.addFolder('Camera');
        let cameraOrbitCenterFolder = cameraFolder.addFolder('Orbit Center');
        cameraOrbitCenterFolder.add(this.camera.orbitCenter, '0', -10, 10, 0.1);
        cameraOrbitCenterFolder.add(this.camera.orbitCenter, '1', -10, 10, 0.1);
        cameraOrbitCenterFolder.add(this.camera.orbitCenter, '2', -10, 10, 0.1);
        cameraFolder.add(this.camera, 'orbitHeight', -25, 25, 0.1);
        cameraFolder.add(this.camera, 'orbitSpeed', 0.05, 2.0, 0.01);
        cameraFolder.add(this.camera, 'orbitRadius', 4.0, 50.0, 0.5);

        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
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
        let fields = [];

        for (let fieldZ = this.chunkStartZ; fieldZ <= this.chunkEndZ; fieldZ++) {
            for (let fieldY = this.chunkStartY; fieldY <= this.chunkEndY; fieldY++) {
                for (let fieldX = this.chunkStartX; fieldX <= this.chunkEndX; fieldX++) {
                    let scalarField = [];

                    for (let z = 0; z < this.fieldSize[2]; z++) {
                        for (let y = 0; y < this.fieldSize[1]; y++) {
                            for (let x = 0; x < this.fieldSize[0]; x++) {
                                scalarField.push(
                                    this.simplex.noise3D(
                                        fieldX * this.fieldSize[0] * this.voxelSize + x * this.voxelSize,
                                        fieldY * this.fieldSize[1] * this.voxelSize + y * this.voxelSize,
                                        fieldZ * this.fieldSize[2] * this.voxelSize + z * this.voxelSize
                                    )
                                );
                            }
                        }
                    }

                    fields.push(scalarField);
                }
            }
        }

        this.fields = fields;
    }

    generateModels() {
        let models = [];

        let numChunksZ = Math.abs(this.chunkEndZ - this.chunkStartZ) + 1;
        let numChunksY = Math.abs(this.chunkEndY - this.chunkStartY) + 1;
        let numChunksX = Math.abs(this.chunkEndX - this.chunkStartX) + 1;

        let chunkZOffset = -this.chunkStartZ;
        let chunkYOffset = -this.chunkStartY;
        let chunkXOffset = -this.chunkStartX;

        for (let fieldZ = this.chunkStartZ; fieldZ <= this.chunkEndZ; fieldZ++) {
            for (let fieldY = this.chunkStartY; fieldY <= this.chunkEndY; fieldY++) {
                for (let fieldX = this.chunkStartX; fieldX <= this.chunkEndX; fieldX++) {
                    let modelIndex =
                        (fieldZ + chunkZOffset) * (numChunksY * numChunksX) +
                        (fieldY + chunkYOffset) * numChunksX +
                        (fieldX + chunkXOffset);
                    console.log(`Generating model at chunk [${fieldX}, ${fieldY}, ${fieldZ}], index ${modelIndex}`);

                    let model = this.cubeMarcher.createModel(this.fields[modelIndex], this.fieldSize, this.isoLevel);
                    model.setup(this.program.program);
                    mat4.scale(model.modelMatrix, model.modelMatrix, [
                        this.voxelSize,
                        this.voxelSize,
                        this.voxelSize
                    ]);
                    model.modelMatrix = mat4.translate(model.modelMatrix, model.modelMatrix, [
                        fieldX * this.voxelSize * (this.fieldSize[0] - 1),
                        fieldY * this.voxelSize * (this.fieldSize[1] - 1),
                        fieldZ * this.voxelSize * (this.fieldSize[2] - 1)
                    ]);

                    models.push(model);
                }
            }
        }

        this.models = models;
    }

    generateMarchingCubesResult() {
        let start = Date.now();

        this.generateModels();

        let end = Date.now();
        console.log(`Finished marching cubes in ${end - start} ms`);
    }

    createMesh() {
        this.simplex = new SimplexNoise();
        this.cubeMarcher = new CPUCubeMarcher(this.gl);

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
        this.stats.begin();

        let now = Date.now();
        this.delta = (now - this.lastFrameTimestamp) * 0.001;
        this.lastFrameTimestamp = now;
        this.appTime += this.delta;

        this.onDraw();

        this.stats.end();

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
