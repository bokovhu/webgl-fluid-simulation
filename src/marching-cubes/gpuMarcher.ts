import { ShaderProgram } from '../rendering/shader/shaderProgram';
import { makeProgram } from '../rendering/shader/functions';

import geometryPassVertexSource from '../glsl/marching-cubes/geometry-pass.vertex.glsl';
import geometryPassFragmentSource from '../glsl/marching-cubes/geometry-pass.fragment.glsl';
import renderPassVertexSource from '../glsl/marching-cubes/render-pass.vertex.glsl';
import BlinnPhongShader from '../rendering/shader/blinnPhongShader';
import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import Grid from './grid';
import Texture3D from '../rendering/texture3D';
import Texture2D from '../rendering/texture2D';
import FrameBuffer from '../rendering/frameBuffer';

export default class GPUMarcher {
    /* gridTexture: WebGLTexture;
    triangleVertex1Texture: WebGLTexture;
    triangleVertex2Texture: WebGLTexture;
    triangleVertex3Texture: WebGLTexture; */

    gridTexture: Texture3D
    triangleVertexTextures: Texture2D[] = []
    geometryPassFramebuffer: FrameBuffer
    
    edgeTableTexture: Texture2D;
    triangleTableTexture: Texture2D;

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

    // geometryPassFramebuffer: WebGLFramebuffer;

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
        let triTableTextureData = new Int32Array(256 * 16);

        let ptr = 0;
        for (let row = 0; row < 256; row++) {
            for (let col = 0; col < 16; col++) {
                triTableTextureData[ptr++] = triangleTable[row][col];
            }
        }

        this.triangleTableTexture = new Texture2D (
            this.gl,
            {
                width: 16, height: 256,
                internalFormat: this.gl.R32I, format: this.gl.RED_INTEGER,
                dataType: this.gl.INT,
                data: triTableTextureData,
                minFilter: this.gl.NEAREST, magFilter: this.gl.NEAREST
            }
        )

        let edgeTableTextureData = new Int32Array(256);
        for (let i = 0; i < 256; i++) {
            edgeTableTextureData[i] = edgeTable[i];
        }

        this.edgeTableTexture = new Texture2D (
            this.gl,
            {
                width: 256, height: 1,
                internalFormat: this.gl.R32I, format: this.gl.RED_INTEGER,
                dataType: this.gl.INT,
                data: edgeTableTextureData,
                minFilter: this.gl.NEAREST, magFilter: this.gl.NEAREST
            }
        )

    }

    private createGridTexture(grid: Grid): void {
        this.gridTexture = new Texture3D (
            this.gl,
            {
                width: grid.xSize, height: grid.ySize, depth: grid.zSize,
                format: this.gl.RED,
                data: grid.field
            }
        )
    }

    private createVertexTextures(grid: Grid): void {
        let vertexTextureWidth: number = grid.xSize * this.numSheetColsPerGeometryPass;
        let vertexTextureHeight: number = grid.ySize * this.numSheetRowsPerGeometryPass;

        this.vertexTextureSize = [ vertexTextureWidth, vertexTextureHeight ];

        for (let i = 0; i < 3; i++) {
            this.triangleVertexTextures.push (
                new Texture2D (
                    this.gl,
                    {
                        width: vertexTextureWidth, height: vertexTextureHeight,
                        internalFormat: this.gl.RGBA32F, format: this.gl.RGBA,
                        dataType: this.gl.FLOAT,
                        minFilter: this.gl.NEAREST, magFilter: this.gl.NEAREST
                    }
                )
            )
        }

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

        this.geometryPassFramebuffer = new FrameBuffer (this.gl, this.vertexTextureSize[0], this.vertexTextureSize[1])
        this.geometryPassFramebuffer.bind ()
        for (let i = 0; i < this.triangleVertexTextures.length; i++) {
            this.geometryPassFramebuffer.colorAttachment (i, this.triangleVertexTextures[i])
        }

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
        isoValue: number,
        gridTexture?: Texture3D
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

                this.geometryPassFramebuffer.bind ()
                this.geometryPassFramebuffer.applyViewport ()
                this.geometryPassFramebuffer.drawBuffers ([0, 1, 2])
                this.geometryPassFramebuffer.clear ()

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
               if (gridTexture) {
                    // this.gl.bindTexture (this.gl.TEXTURE_3D, gridTexture)
                    gridTexture.bind (0)
                } else {
                    // this.gl.bindTexture(this.gl.TEXTURE_3D, this.gridTexture.handle);
                    this.gridTexture.bind (0)
                }
               this.geometryPassProgram.setUniform('u_gridTexture', 0);

               this.edgeTableTexture.bind (1)
               this.geometryPassProgram.setUniform('u_edgeTable', 1);

               this.triangleTableTexture.bind (2)
               this.geometryPassProgram.setUniform('u_triangleTable', 2);

                // Bind the geometry pass VAO, and draw it
                // It's only a single full-screen quad
                this.gl.bindVertexArray(this.geometryPassVao);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

                // Bind the original FBO, and restore viewport
                this.geometryPassFramebuffer.unbind ()
                this.geometryPassFramebuffer.resetViewport ()

                // Prepare for the rendering pass
                this.renderPassProgram.use();

                // Configure the shader using some external config source
                blinnPhongConfigurer(this.renderPassProgram);

                // Bind the vertex textures
               for (let i = 0; i < this.triangleVertexTextures.length; i++) {
                   this.triangleVertexTextures [i].bind (i)
                   this.renderPassProgram.program.setUniform(`u_vertex${i}Texture`, i);
               }

                // Draw the render pass VAO
                this.gl.bindVertexArray(this.renderPassVao);
                this.gl.drawArrays(this.gl.TRIANGLES, 0, this.numRenderPassVertices);
            }
        }
    }
}
