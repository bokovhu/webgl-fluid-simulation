import './main.css';

import BlinnPhong from './rendering/shader/blinnPhongShader';
import GameGUI from './gui/gui';
import { mat4, vec2, vec3 } from 'gl-matrix';
import GPUMarcher from './marching-cubes/gpuMarcher';
import AnimatedGrid from './marching-cubes/grid';
import FluidSimulation from './fluid/fluidSimulation';

export default class Main {
    private gui: GameGUI;
    private canvas: HTMLCanvasElement;
    private gl: WebGL2RenderingContext;
    private isoLevel: number;
    private appTime: number;
    private camera: any;
    private light: any;
    private material: any;
    private resolution: vec2;
    private lastFrameTimestamp: number;
    private width: number;
    private height: number;
    private aspectRatio: number;
    private delta: number;
    private gpuMarcher: GPUMarcher;
    private grid: AnimatedGrid;
    private gridCenter: vec3 = vec3.create();
    private modelMatrix: mat4 = mat4.create();
    private fluidSimulation: FluidSimulation;

    constructor() {}

    createGui() {
        this.gui = new GameGUI(this);
        this.gui.init();
    }

    createWebGLContext() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.gl = this.canvas.getContext('webgl2');
        if (this.gl == null) {
            throw new Error('Could not get WebGL 2 rendering context!');
        }
    }

    initGLObjects() {
        // This extension is required to allow float type textures as color attachments
        // for framebuffer objects
        this.gl.getExtension('EXT_color_buffer_float');

        // This extension is required to allow LINEAR filtering for float type textures
        this.gl.getExtension('OES_texture_float_linear');

        this.createMesh();

        this.gl.cullFace(this.gl.FRONT_AND_BACK);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    createMesh() {
        this.grid = new AnimatedGrid(this.gl, 128, 128, 128, 1.0 / 12.0, 1.0 / 12.0, 1.0 / 12.0);

        this.gpuMarcher = new GPUMarcher(this.gl);
        this.gpuMarcher.setup(this.grid);

        this.fluidSimulation = new FluidSimulation(this.gl, [ 128, 128, 128 ], 1.0 / 60.0);

        let fb = new Float32Array(128 * 128 * 128);
        let ptr = 0;

        for (let z = 0; z < 128; z++) {
            for (let y = 0; y < 128; y++) {
                for (let x = 0; x < 128; x++) {
                    let pos = vec3.fromValues(x / 128.0, y / 128.0, z / 128.0);
                    vec3.scale(pos, pos, 4.0);
                    vec3.sub(pos, pos, vec3.fromValues(2.0, 2.0, 2.0));
                    let val = vec3.dist(pos, vec3.fromValues(0.0, 0.0, 0.0)) * 128.0;
                    val += Math.random() * 128.0 - 64.0;
                    if (val < 0.0) val = 0.0;
                    fb[ptr++] = val;
                }
            }
        }

        this.fluidSimulation.pressureGridTexture.upload(fb);
        this.fluidSimulation.otherPressureGridTexture.upload(fb);
    }

    initProperties() {
        this.appTime = 0.0;

        this.isoLevel = 128;

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
            this.gridCenter,
            0.5 * (this.grid.xSize * this.grid.xScale),
            0.5 * (this.grid.ySize * this.grid.yScale),
            0.5 * (this.grid.zSize * this.grid.zScale)
        );

        vec3.set(this.camera.position, this.gridCenter[0], this.camera.orbitHeight, this.gridCenter[2]);
        vec3.add(this.camera.position, this.camera.position, [
            Math.cos(this.appTime * this.camera.orbitSpeed) * this.camera.orbitRadius,
            0.0,
            Math.sin(this.appTime * this.camera.orbitSpeed) * this.camera.orbitRadius
        ]);

        mat4.lookAt(this.camera.view, this.camera.position, this.gridCenter, [ 0, 1, 0 ]);
        mat4.identity(this.modelMatrix);

        this.fluidSimulation.update(this.delta);

        // this.grid.update([ this.resolution[0], this.resolution[1] ], this.delta);
        this.gpuMarcher.draw(
            (bp) => {
                bp.setCamera(this.camera);
                bp.setLight(this.light);
                bp.setMaterial(this.material);
                bp.setModel(this.modelMatrix);
            },
            this.grid,
            [ this.resolution[0], this.resolution[1] ],
            this.isoLevel,
            // this.grid.texture
            this.fluidSimulation.pressureGridTexture
        );
    }
}
