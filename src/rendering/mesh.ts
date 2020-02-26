import { ShaderProgram } from './shader/shaderProgram';
import { vec3 } from 'gl-matrix';

var CALCULATE_MESH_CENTER = false;

interface Vertex {
    position: [number, number, number];
    normal: [number, number, number];
}

type VertexOrNumberArray = Array<Vertex | number>;

export default class Mesh {
    private vao: WebGLVertexArrayObject;
    private vbo: WebGLBuffer;
    private primitiveType: GLenum;
    private vertexCount: number;
    private vertexData: Float32Array;
    public center: vec3 = vec3.create();

    constructor(private gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.primitiveType = gl.TRIANGLES;
        this.vertexCount = 0;
        this.vertexData = new Float32Array();
    }

    setup(shaderProgram: ShaderProgram) {
        this.gl.bindVertexArray(this.vao);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);

        let positionAttributeLocation = shaderProgram.getAttributeLocation('a_vertexPosition');
        let normalAttributeLocation = shaderProgram.getAttributeLocation('a_vertexNormal');

        if (positionAttributeLocation >= 0) {
            this.gl.enableVertexAttribArray(positionAttributeLocation);
            this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 6 * 4, 0);
        }

        if (normalAttributeLocation >= 0) {
            this.gl.enableVertexAttribArray(normalAttributeLocation);
            this.gl.vertexAttribPointer(normalAttributeLocation, 3, this.gl.FLOAT, true, 6 * 4, 3 * 4);
        }

        this.gl.bindVertexArray(null);
    }

    upload(vertices: Vertex[] | number[][]) {
        let start = Date.now();

        this.vertexData = new Float32Array(6 * vertices.length);

        let avgX = 0.0;
        let avgY = 0.0;
        let avgZ = 0.0;

        if (vertices.length > 0) {
            for (let vertexIndex = 0; vertexIndex < vertices.length; vertexIndex++) {
                let vertex = vertices[vertexIndex];

                let pos = 'position' in vertex ? vertex['position'] : [ vertex[0], vertex[1], vertex[2] ];
                let norm = 'normal' in vertex ? vertex['normal'] : [ vertex[3], vertex[4], vertex[5] ];

                this.vertexData[vertexIndex * 6 + 0] = pos[0];
                this.vertexData[vertexIndex * 6 + 1] = pos[1];
                this.vertexData[vertexIndex * 6 + 2] = pos[2];

                this.vertexData[vertexIndex * 6 + 3] = norm[0];
                this.vertexData[vertexIndex * 6 + 4] = norm[1];
                this.vertexData[vertexIndex * 6 + 5] = norm[2];

                if (CALCULATE_MESH_CENTER) {
                    avgX += pos[0];
                    avgY += pos[1];
                    avgZ += pos[2];
                }
            }
        }

        this.vertexCount = vertices.length;

        if (CALCULATE_MESH_CENTER) {
            avgX /= this.vertexCount;
            avgY /= this.vertexCount;
            avgZ /= this.vertexCount;

            vec3.set(this.center, avgX, avgY, avgZ);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexData, this.gl.STATIC_DRAW);

        let end = Date.now();
        console.log(`Upload done, vertex count: ${this.vertexCount}, took ${end - start} ms`);
    }

    uploadRaw(verticesBuffer: Float32Array, vertexCount: number) {
        this.vertexCount = vertexCount;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesBuffer, this.gl.STATIC_DRAW);

        if (CALCULATE_MESH_CENTER) {
            let avgX =
                verticesBuffer.filter((_, idx) => idx % 6 == 0).reduce((total, current) => total + current) /
                vertexCount;
            let avgY =
                verticesBuffer.filter((_, idx) => idx % 6 == 1).reduce((total, current) => total + current) /
                vertexCount;
            let avgZ =
                verticesBuffer.filter((_, idx) => idx % 6 == 2).reduce((total, current) => total + current) /
                vertexCount;

            vec3.set(this.center, avgX, avgY, avgZ);
        }
    }

    draw() {
        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.primitiveType, 0, this.vertexCount);
    }
}

export function makeBox(
    gl: WebGL2RenderingContext,
    shaderProgram: ShaderProgram,
    dims: [number, number, number],
    offset: [number, number, number]
) {
    let x = offset;
    let s = dims;
    s[0] /= 2.0;
    s[1] /= 2.0;
    s[2] /= 2.0;

    let vertices = [];

    vertices.push(
        // Front face

        [ x[0] - s[0], x[1] + s[1], x[2] - s[2], 0, 0, -1 ],
        [ x[0] + s[0], x[1] + s[1], x[2] - s[2], 0, 0, -1 ],
        [ x[0] - s[0], x[1] - s[1], x[2] - s[2], 0, 0, -1 ],
        [ x[0] + s[0], x[1] + s[1], x[2] - s[2], 0, 0, -1 ],
        [ x[0] + s[0], x[1] - s[1], x[2] - s[2], 0, 0, -1 ],
        [ x[0] - s[0], x[1] - s[1], x[2] - s[2], 0, 0, -1 ],
        // Right face

        [ x[0] + s[0], x[1] + s[1], x[2] - s[2], 1, 0, 0 ],
        [ x[0] + s[0], x[1] + s[1], x[2] + s[2], 1, 0, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] - s[2], 1, 0, 0 ],
        [ x[0] + s[0], x[1] + s[1], x[2] + s[2], 1, 0, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] + s[2], 1, 0, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] - s[2], 1, 0, 0 ],
        // Back face

        [ x[0] - s[0], x[1] + s[1], x[2] + s[2], 0, 0, 1 ],
        [ x[0] + s[0], x[1] + s[1], x[2] + s[2], 0, 0, 1 ],
        [ x[0] - s[0], x[1] - s[1], x[2] + s[2], 0, 0, 1 ],
        [ x[0] + s[0], x[1] + s[1], x[2] + s[2], 0, 0, 1 ],
        [ x[0] + s[0], x[1] - s[1], x[2] + s[2], 0, 0, 1 ],
        [ x[0] - s[0], x[1] - s[1], x[2] + s[2], 0, 0, 1 ],
        // Left face

        [ x[0] - s[0], x[1] + s[1], x[2] - s[2], -1, 0, 0 ],
        [ x[0] - s[0], x[1] + s[1], x[2] + s[2], -1, 0, 0 ],
        [ x[0] - s[0], x[1] - s[1], x[2] - s[2], -1, 0, 0 ],
        [ x[0] - s[0], x[1] + s[1], x[2] + s[2], -1, 0, 0 ],
        [ x[0] - s[0], x[1] - s[1], x[2] + s[2], -1, 0, 0 ],
        [ x[0] - s[0], x[1] - s[1], x[2] - s[2], -1, 0, 0 ],
        // Top face

        [ x[0] - s[0], x[1] + s[1], x[2] - s[2], 0, 1, 0 ],
        [ x[0] + s[0], x[1] + s[1], x[2] - s[2], 0, 1, 0 ],
        [ x[0] - s[0], x[1] + s[1], x[2] + s[2], 0, 1, 0 ],
        [ x[0] + s[0], x[1] + s[1], x[2] - s[2], 0, 1, 0 ],
        [ x[0] + s[0], x[1] + s[1], x[2] + s[2], 0, 1, 0 ],
        [ x[0] - s[0], x[1] + s[1], x[2] + s[2], 0, 1, 0 ],
        // Bottom face

        [ x[0] - s[0], x[1] - s[1], x[2] - s[2], 0, -1, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] - s[2], 0, -1, 0 ],
        [ x[0] - s[0], x[1] - s[1], x[2] + s[2], 0, -1, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] - s[2], 0, -1, 0 ],
        [ x[0] + s[0], x[1] - s[1], x[2] + s[2], 0, -1, 0 ],
        [ x[0] - s[0], x[1] - s[1], x[2] + s[2], 0, -1, 0 ]
    );

    let mesh = new Mesh(gl);
    mesh.setup(shaderProgram);
    mesh.upload(vertices);

    return mesh;
}
