import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgram } from '../rendering/shader/functions';

import geometryPassVertexSource from '../glsl/marching-cubes/geometry-pass.vertex.glsl';
import geometryPassFragmentSource from '../glsl/marching-cubes/geometry-pass.fragment.glsl';
import renderPassVertexSource from '../glsl/marching-cubes/render-pass.vertex.glsl';
import BlinnPhongShader from '../rendering/shader/blinnPhongShader';
import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import Grid from './grid/grid';

export default class GPUMarcher {
    gridTexture: WebGLTexture;
    triangleVertex1Texture: WebGLTexture;
    triangleVertex2Texture: WebGLTexture;
    triangleVertex3Texture: WebGLTexture;
    edgeTableTexture: WebGLTexture;
    triangleTableTexture: WebGLTexture;

    geometryPassVao: WebGLVertexArrayObject;
    geometryPassVbo: WebGLBuffer;

    renderPassVao: WebGLVertexArrayObject;
    renderPassVbo: WebGLBuffer;

    geometryPassProgram: ShaderProgram;
    renderPassProgram: BlinnPhongShader;

    numSheetRowsPerGeometryPass: number = 8;
    numSheetColsPerGeometryPass: number = 8;
    numSheetsPerGeometryPass: number = this.numSheetRowsPerGeometryPass * this.numSheetColsPerGeometryPass;

    numRenderPassVertices: number = 0;

    vertexTextureSize: [number, number] = [ 0, 0 ];

    geometryPassFramebuffer: WebGLFramebuffer;

    constructor(private gl: WebGL2RenderingContext) {
        this.geometryPassProgram = makeProgram(this.gl, geometryPassVertexSource, geometryPassFragmentSource);
        this.renderPassProgram = new BlinnPhongShader(this.gl, renderPassVertexSource);
        console.log(this.geometryPassProgram.getUniforms());
    }

    setup(grid: Grid): void {
        this.createTextures(grid);
        this.setupGeometryPass();
        this.setupRenderPass(grid);
    }

    private createTextures(grid: Grid): void {
        this.createLookupTableTextures();
        this.createGridTexture(grid);
        this.createVertexTextures(grid);
    }

    private createLookupTableTextures(): void {
        this.triangleTableTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleTableTexture);

        let triTableTextureData = new Int32Array(256 * 16);

        // triangle table has 256 rows, 16 columns

        let ptr = 0;
        for (let row = 0; row < 256; row++) {
            for (let col = 0; col < 16; col++) {
                triTableTextureData[ptr++] = triangleTable[row][col];
            }
        }

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.R32I,
            16,
            256,
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

    private createGridTexture(grid: Grid): void {
        this.gridTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_3D, this.gridTexture);
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0,
            this.gl.R32F,
            grid.xSize,
            grid.ySize,
            grid.zSize,
            0,
            this.gl.RED,
            this.gl.FLOAT,
            grid.field as Float32Array
        );
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);
    }

    private createVertexTextures(grid: Grid): void {
        let vertexTextureWidth: number = grid.xSize * this.numSheetColsPerGeometryPass;
        let vertexTextureHeight: number = grid.ySize * this.numSheetRowsPerGeometryPass;

        this.vertexTextureSize = [ vertexTextureWidth, vertexTextureHeight ];

        // Vertex 1 texture
        // This one requires 4 floats / pixel

        this.triangleVertex1Texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex1Texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA32F,
            vertexTextureWidth,
            vertexTextureHeight,
            0,
            this.gl.RGBA,
            this.gl.FLOAT,
            null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        // Vertex 2 texture
        // Vertex 2 & 3 textures require 3 floats per pixel

        this.triangleVertex2Texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex2Texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA32F,
            vertexTextureWidth,
            vertexTextureHeight,
            0,
            this.gl.RGBA,
            this.gl.FLOAT,
            null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        // Vertex 3 texture

        this.triangleVertex3Texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex3Texture);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.gl.RGBA32F,
            vertexTextureWidth,
            vertexTextureHeight,
            0,
            this.gl.RGBA,
            this.gl.FLOAT,
            null
        );
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
    }

    private setupGeometryPass(): void {
        this.geometryPassVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.geometryPassVao);

        this.geometryPassVbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.geometryPassVbo);

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

        this.geometryPassFramebuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.geometryPassFramebuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.triangleVertex1Texture,
            0
        );
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT1,
            this.gl.TEXTURE_2D,
            this.triangleVertex2Texture,
            0
        );
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT2,
            this.gl.TEXTURE_2D,
            this.triangleVertex3Texture,
            0
        );

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    private setupRenderPass(grid: Grid): void {
        const numVerticesPerTriangle = 3;
        const numVoxelsPerRenderPass = grid.xSize * grid.ySize * this.numSheetsPerGeometryPass;
        const numFloatsPerVertex = 2;

        this.numRenderPassVertices = numVoxelsPerRenderPass * numVerticesPerTriangle;
        let vertexData = new Float32Array(numFloatsPerVertex * this.numRenderPassVertices);

        let ptr = 0;
        
        for (let y = 0; y < this.vertexTextureSize[1]; y++) {
            for (let x = 0; x < this.vertexTextureSize[0]; x++) {
                for (let i = 0; i < numVerticesPerTriangle; i++) {
                    vertexData[ptr++] = x;
                    vertexData[ptr++] = y;
                }
            }
        }

        console.log(vertexData);

        this.renderPassVao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.renderPassVao);
        this.renderPassVbo = this.gl.createBuffer();

        this.gl.enableVertexAttribArray(0);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.renderPassVbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexData, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindVertexArray(null);
    }

    draw(
        blinnPhongConfigurer: (bp: BlinnPhongShader) => void,
        grid: Grid,
        resolution: [number, number],
        isoValue: number
    ) {
        let numPasses = grid.zSize / this.numSheetsPerGeometryPass;

        let gridResolution = [ grid.xSize, grid.ySize, grid.zSize ];
        let gridResolutionReciprocal = [ 1.0 / grid.xSize, 1.0 / grid.ySize, 1.0 / grid.zSize ];
        let cornerOffsets = [
            [ 0, 0, 0 ],
            [ gridResolutionReciprocal[0], 0, 0 ],
            [ gridResolutionReciprocal[0], 0, gridResolutionReciprocal[2] ],
            [ 0, 0, gridResolutionReciprocal[2] ],
            [ 0, gridResolutionReciprocal[1], 0 ],
            [ gridResolutionReciprocal[0], gridResolutionReciprocal[1], 0 ],
            [ gridResolutionReciprocal[0], gridResolutionReciprocal[1], gridResolutionReciprocal[2] ],
            [ 0, gridResolutionReciprocal[1], gridResolutionReciprocal[2] ]
        ];
        let gridScale = [ grid.xScale, grid.yScale, grid.zScale ];

        for (let i = 0; i < numPasses; i++) {
            for (let triangleIndex = 0; triangleIndex < 5; triangleIndex++) {
                // Set-up the geometry pass FBO for rendering

                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.geometryPassFramebuffer);
                this.gl.viewport(0, 0, this.vertexTextureSize[0], this.vertexTextureSize[1]);
                this.gl.drawBuffers([
                    this.gl.COLOR_ATTACHMENT0,
                    this.gl.COLOR_ATTACHMENT1,
                    this.gl.COLOR_ATTACHMENT2
                ]);
                this.gl.clearColor(0, 0, 0, 0);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT);

                // Configure the geometry pass shader for the current pass
                this.geometryPassProgram.use();

                // Basic options
                this.geometryPassProgram.setUniform('u_sheetOffset', i * this.numSheetsPerGeometryPass);
                this.geometryPassProgram.setUniform('u_numSheetsPerPass', this.numSheetsPerGeometryPass);
                this.geometryPassProgram.setUniform('u_numSheetRowsPerPass', this.numSheetRowsPerGeometryPass);
                this.geometryPassProgram.setUniform('u_numSheetColsPerPass', this.numSheetColsPerGeometryPass);
                this.geometryPassProgram.setUniform('u_scale', gridScale);
                this.geometryPassProgram.setUniform('u_gridResolution', gridResolution);
                this.geometryPassProgram.setUniform('u_gridResolutionReciprocal', gridResolutionReciprocal);
                this.geometryPassProgram.setUniform('u_isoValue', isoValue);
                cornerOffsets.forEach((val, idx) =>
                    this.geometryPassProgram.setUniform(`u_cornerOffsets[${idx}]`, val)
                );
                this.geometryPassProgram.setUniform('u_triangleIndex', triangleIndex);

                // Grid and LUT textures
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_3D, this.gridTexture);
                this.geometryPassProgram.setUniform('u_gridTexture', 0);

                this.gl.activeTexture(this.gl.TEXTURE1);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.edgeTableTexture);
                this.geometryPassProgram.setUniform('u_edgeTable', 1);

                this.gl.activeTexture(this.gl.TEXTURE2);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleTableTexture);
                this.geometryPassProgram.setUniform('u_triangleTable', 2);

                // Bind the geometry pass VAO, and draw it
                // It's only a single full-screen quad
                this.gl.bindVertexArray(this.geometryPassVao);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

                // Bind the original FBO, and restore viewport
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                this.gl.viewport(0, 0, resolution[0], resolution[1]);

                // Prepare for the rendering pass
                this.renderPassProgram.use();

                // Configure the shader using some external config source
                blinnPhongConfigurer(this.renderPassProgram);

                // Bind the vertex textures
                this.gl.activeTexture(this.gl.TEXTURE0);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex1Texture);
                this.renderPassProgram.program.setUniform('u_vertex1Texture', 0);

                this.gl.activeTexture(this.gl.TEXTURE1);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex2Texture);
                this.renderPassProgram.program.setUniform('u_vertex2Texture', 1);

                this.gl.activeTexture(this.gl.TEXTURE2);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.triangleVertex3Texture);
                this.renderPassProgram.program.setUniform('u_vertex3Texture', 2);

                // Draw the render pass VAO
                this.gl.bindVertexArray(this.renderPassVao);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numRenderPassVertices);
            }
        }
    }
}
