import { LAYOUT_CONTINOUS_ARRAY } from './grid/memoryLayout';
import Grid from './grid/grid';
import FieldGenerator from './fieldgen/fieldGenerator';

import vertexSource from '../glsl/sdf-generator/shader.vertex.glsl';
import fragmentSource from '../glsl/sdf-generator/shader.fragment.glsl';
import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgram } from '../rendering/shader/functions';

export default class AnimatedGrid implements Grid {
    totalSize: number;
    sheetSize: number;
    rowSize: number;
    field: Float32Array;
    useIntegers: boolean = false;
    memoryLayout: string = LAYOUT_CONTINOUS_ARRAY;

    texture: WebGLTexture;
    framebuffer: WebGLFramebuffer;

    vao: WebGLVertexArrayObject;
    vbo: WebGLBuffer;

    program: ShaderProgram;

    private time: number = 0.0;

    constructor(
        private gl: WebGL2RenderingContext,
        public xSize: number,
        public ySize: number,
        public zSize: number,
        public xScale: number,
        public yScale: number,
        public zScale: number
    ) {
        this.totalSize = this.xSize * this.ySize * this.zSize;
        this.sheetSize = this.xSize * this.zSize;
        this.rowSize = this.xSize;
        this.field = new Float32Array(xSize * ySize * zSize);
        this.program = makeProgram(this.gl, vertexSource, fragmentSource);
        this.setup();
    }

    private setup(): void {
        this.createFieldTexture();
        this.createFramebuffer();
        this.setupPass();
    }

    private createFieldTexture(): void {
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.texture);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.gl.R32F,
            this.xSize,
            this.ySize,
            this.zSize,
            0,
            this.gl.RED,
            this.gl.FLOAT,
            this.field
        );
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    private createFramebuffer(): void {
        this.framebuffer = this.gl.createFramebuffer();
    }

    private setupPass(): void {
        this.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.vao);

        this.vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        let vertexData: number[] = [];
        vertexData.push(-1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);
        vertexData.push(1.0, 1.0, 0.0, 1.0);
        vertexData.push(1.0, -1.0, 0.0, 1.0);
        vertexData.push(-1.0, -1.0, 0.0, 1.0);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertexData), this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 4, this.gl.FLOAT, false, 0, 0);
    }

    generate(generator: FieldGenerator): void {}

    update(resolution: [number, number], delta: number): void {
        this.time += delta;

        let numAttachments = 4;
        let drawBuffers = [];
        for (let i = 0; i < numAttachments; i++) {
            drawBuffers.push(this.gl.COLOR_ATTACHMENT0 + i);
        }

        let numPasses = this.zSize / numAttachments;
        for (let i = 0; i < numPasses; i++) {

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            for (let j = 0; j < numAttachments; j++) {
                this.gl.framebufferTextureLayer(
                    this.gl.FRAMEBUFFER,
                    this.gl.COLOR_ATTACHMENT0 + j,
                    this.texture,
                    0,
                    i * numAttachments + j
                );
            }
            this.gl.drawBuffers(drawBuffers);
            this.gl.viewport(0, 0, this.xSize, this.ySize);

            this.gl.clearColor(255, 255, 255, 255);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            this.program.use();

            this.program.setUniform('u_layerOffset', i * numAttachments);
            this.program.setUniform('u_gridSize', [ this.xSize, this.ySize, this.zSize ]);
            this.program.setUniform('u_time', this.time);

            this.gl.bindVertexArray(this.vao);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, resolution[0], resolution[1]);
    }
}
