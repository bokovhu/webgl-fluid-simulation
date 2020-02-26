import Marcher, { MarcherSupportsType, MarcherPrepareOptions, MarchIndexType } from './marcher';
import { FieldType } from './grid/grid';
import MarchingCubes from './marchingCubes';
import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgramForVertexTransformFeedback } from '../rendering/shader/functions';
import shaderVertexSource from '../glsl/transform-feedback-marcher/shader.vertex.glsl';
import shaderFragmentSource from '../glsl/transform-feedback-marcher/shader.fragment.glsl';
import { LAYOUT_CONTINOUS_ARRAY } from './grid/memoryLayout';
import { vec3 } from 'gl-matrix';
import BlinnPhongShader from '../rendering/shader/blinnPhongShader';
import triangleTable from './triangleTable';
import edgeTable from './edgeTable';

class TransformFeedbackMarcherProgram {
    private program: ShaderProgram;

    constructor(private gl: WebGL2RenderingContext) {
        this.create();
    }

    create(): void {
        let varyings = [];
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                varyings.push(`tri${i + 1}Point${j + 1}`);
                varyings.push(`tri${i + 1}Normal${j + 1}`);
            }
        }

        this.program = makeProgramForVertexTransformFeedback(
            this.gl,
            shaderVertexSource,
            shaderFragmentSource,
            varyings,
            this.gl.INTERLEAVED_ATTRIBS
        );
    }

    use(): void {
        this.program.use();
    }

    setOffset(offset: vec3): void {
        this.program.setUniform('u_offset', offset);
    }

    setGridTexture(texture: WebGLTexture): void {
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_3D, texture);
        this.program.setUniform('u_grid', 0);
    }

    setEdgeTableTexture(texture: WebGLTexture): void {
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.program.setUniform('u_edgeTable', 1);
    }

    setTriangleTableTexture(texture: WebGLTexture): void {
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.program.setUniform('u_triangleTable', 2);
    }
}

export default class TransformFeedbackMarcher implements Marcher {
    public supports: MarcherSupportsType = {};
    public skipMarch: boolean = true;
    public customRender: boolean = true;
    private program: TransformFeedbackMarcherProgram = null;
    private triangleStepVao: WebGLVertexArrayObject = null;
    private triangleStepInputVbo: WebGLBuffer = null;
    private triangleStepTransformFeedback: WebGLTransformFeedback = null;
    private triangleStepOutputTbo: WebGLBuffer = null;
    private renderStepVbo: WebGLBuffer = null;
    private renderStepVao: WebGLVertexArrayObject = null;
    private gridTexture: WebGLTexture = null;
    private triangleStepOutputSize: number = 0;
    private renderProgram: BlinnPhongShader = null;
    private numTriangles: number = 0;
    private numVertices: number = 0;
    private marchSize: number = 0;
    private triTableTexture: WebGLTexture = null;
    private edgeTableTexture: WebGLTexture = null;

    private initialized: boolean = false;

    constructor(private gl: WebGL2RenderingContext) {
        this.program = new TransformFeedbackMarcherProgram(gl);
        this.renderProgram = new BlinnPhongShader(gl);
    }

    prepare(options: MarcherPrepareOptions): void {}

    calculate(
        outVertices: Float32Array,
        field: FieldType,
        fromIndex: MarchIndexType,
        toIndex: MarchIndexType,
        gridXSize: number,
        gridYSize: number,
        gridZSize: number,
        vertexOffsetX: number,
        vertexOffsetY: number,
        vertexOffsetZ: number,
        scaleX: number,
        scaleY: number,
        scaleZ: number,
        isoLevel: number
    ): number {
        return 0;
    }

    private init(marchingCubes: MarchingCubes): void {
        // Will march 4 sheets at a time
        this.marchSize = marchingCubes.grid.sheetSize * 4;
        this.numTriangles = this.marchSize * 5;
        this.numVertices = this.numTriangles * 3;

        // Step 1 - Calculate triangles
        //    Input is numTriangles points
        //    Output is 6 * 5 vec3's
        //         out vec3 tri1Point1, tri1Normal1
        //         out vec3 tri1Point2, tri1Normal2
        //         out vec3 tri1Point3, tri1Normal3
        //         out vec3 tri2Point1, tri2Normal1
        //         out vec3 tri2Point2, tri2Normal2
        //         out vec3 tri2Point3, tri2Normal3
        //         out vec3 tri3Point1, tri3Normal1
        //         out vec3 tri3Point2, tri3Normal2
        //         out vec3 tri3Point3, tri3Normal3
        //         out vec3 tri4Point1, tri4Normal1
        //         out vec3 tri4Point2, tri4Normal2
        //         out vec3 tri4Point3, tri4Normal3
        //         out vec3 tri5Point1, tri5Normal1
        //         out vec3 tri5Point2, tri5Normal2
        //         out vec3 tri5Point3, tri5Normal3

        let triangleStepInputData = new Float32Array(this.numTriangles * 3);
        let ptr = 0;
        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < marchingCubes.grid.ySize; y++) {
                for (let x = 0; x < marchingCubes.grid.xSize; x++) {
                    for (let j = 0; j < 5; j++) {
                        triangleStepInputData[ptr++] = x / marchingCubes.grid.xSize;
                        triangleStepInputData[ptr++] = y / marchingCubes.grid.ySize;
                        triangleStepInputData[ptr++] = z / marchingCubes.grid.zSize;
                    }
                }
            }
        }

        this.triangleStepOutputSize = this.numTriangles * 3 * 2 * 3 * Float32Array.BYTES_PER_ELEMENT;

        this.triangleStepVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.triangleStepVao);
        this.triangleStepInputVbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleStepInputVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, triangleStepInputData, this.gl.STATIC_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindVertexArray(null);

        this.triangleStepTransformFeedback = this.gl.createTransformFeedback();
        this.triangleStepOutputTbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.triangleStepOutputTbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.triangleStepOutputSize, this.gl.STATIC_READ);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.triangleStepTransformFeedback);
        this.gl.bindBufferBase(this.gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.triangleStepOutputTbo);
        this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, null);

        this.renderStepVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.renderStepVao);
        this.renderStepVbo = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderStepVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.triangleStepOutputSize, this.gl.STREAM_DRAW);

        this.gl.enableVertexAttribArray(0);
        this.gl.enableVertexAttribArray(1);

        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribPointer(
            1,
            3,
            this.gl.FLOAT,
            false,
            6 * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );

        this.gl.bindVertexArray(null);

        this.gridTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.gridTexture);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.gl.R32F,
            marchingCubes.grid.xSize,
            marchingCubes.grid.ySize,
            marchingCubes.grid.zSize,
            0,
            this.gl.RED,
            this.gl.FLOAT,
            marchingCubes.grid.field as Float32Array
        );
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);

        this.triTableTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.triTableTexture);

        let triTableTextureData = new Int32Array(256 * 16);
        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 16; x++) {
                triTableTextureData[y * 16 + x] = triangleTable[y][x];
            }
        }

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.R32I,
            256,
            16,
            0,
            this.gl.RED_INTEGER,
            this.gl.INT,
            triTableTextureData
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

        this.edgeTableTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.edgeTableTexture);

        let edgeTableTextureData = new Int32Array(256);
        for (let i = 0; i < 256; i++) {
            edgeTableTextureData[i] = edgeTable[i];
        }
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.R32I,
            256,
            1,
            0,
            this.gl.RED_INTEGER,
            this.gl.INT,
            edgeTableTextureData
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    }

    render(marchingCubes: MarchingCubes, beforeCustomRender: () => void): void {
        if (!this.initialized) {
            this.init(marchingCubes);
            this.initialized = true;
        }

        // Upload grid texture
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.gridTexture);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.gl.R32F,
            marchingCubes.grid.xSize,
            marchingCubes.grid.ySize,
            marchingCubes.grid.zSize,
            0,
            this.gl.RED,
            this.gl.FLOAT,
            marchingCubes.grid.field as Float32Array
        );

        let marchSize = marchingCubes.grid.sheetSize * 4;
        let totalSteps = marchingCubes.grid.totalSize / marchSize;

        let offset = vec3.create();

        for (let i = 0; i < totalSteps; i++) {
            this.program.use();
            this.program.setGridTexture(this.gridTexture);
            vec3.set(offset, 0, 0, marchSize * i / marchingCubes.grid.zSize);
            this.program.setOffset(offset);
            this.program.setEdgeTableTexture(this.edgeTableTexture);
            this.program.setTriangleTableTexture(this.triTableTexture);

            this.gl.enable(this.gl.RASTERIZER_DISCARD);

            this.gl.bindVertexArray(this.triangleStepVao);
            this.gl.bindTransformFeedback(this.gl.TRANSFORM_FEEDBACK, this.triangleStepTransformFeedback);
            
            this.gl.beginTransformFeedback(this.gl.POINTS);
            this.gl.drawArrays(this.gl.POINTS, 0, marchSize);
            this.gl.endTransformFeedback();

            this.gl.disable(this.gl.RASTERIZER_DISCARD);

            this.gl.bindBuffer(this.gl.TRANSFORM_FEEDBACK_BUFFER, this.triangleStepOutputTbo);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderStepVbo);
            this.gl.copyBufferSubData(
                this.gl.TRANSFORM_FEEDBACK_BUFFER,
                this.gl.ARRAY_BUFFER,
                0,
                0,
                this.triangleStepOutputSize
            );
            beforeCustomRender();

            this.gl.bindVertexArray(this.renderStepVao);
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numVertices);
        }
    }
}
