import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import { vertexInterpolate, calculateCorners, calculateWorldCorners } from './functions';
import { vec3 } from 'gl-matrix';
import Mesh from '../mesh/mesh';
import Model from '../model/model';

const MAX_NUM_TRIANGLES_PER_MESH = 65536;

export default class CPUCubeMarcher {
    constructor(gl) {
        this.gl = gl;
    }

    createModel(scalarField, fieldDimensions, level) {
        let start = Date.now();

        let xSize = fieldDimensions[0];
        let ySize = fieldDimensions[1];
        let zSize = fieldDimensions[2];

        let gridZScale = xSize * ySize;
        let gridYScale = xSize;

        let xVoxelCount = xSize - 1;
        let yVoxelCount = ySize - 1;
        let zVoxelCount = zSize - 1;

        let meshVertices = [];
        let numTriangles = 0;
        let meshes = [];

        let vertices = [
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ],
            [ 0, 0, 0 ]
        ];

        let cubeIndexTotalTime = 0;
        let edgeTotalTime = 0;
        let vertexTotalTime = 0;

        for (let z = 0; z < zVoxelCount; z++) {
            for (let y = 0; y < yVoxelCount; y++) {
                for (let x = 0; x < xVoxelCount; x++) {
                    // let cubeIndexStart = window.performance.now();

                    // Calculate the index of the cube in the edge table
                    let cubeIndex = 0;

                    let corners = calculateCorners(x, y, z);

                    let powerOfTwo = 1;
                    for (let i = 0; i < 8; i++) {
                        let corner = corners[i];
                        if (scalarField[corner[2] * gridZScale + corner[1] * gridYScale + corner[0]] < level) {
                            cubeIndex += powerOfTwo;
                        }
                        powerOfTwo *= 2;
                    }

                    if (cubeIndex == 0 || cubeIndex == 256) continue;

                    // Clamp cube index value
                    if (cubeIndex >= edgeTable.length) {
                        cubeIndex = edgeTable.length - 1;
                    }

                    // cubeIndexTotalTime += window.performance.now() - cubeIndexStart;

                    // let edgeStart = window.performance.now();

                    // No triangles to create
                    if (edgeTable[cubeIndex] == 0) continue;

                    if (edgeTable[cubeIndex] & 1) {
                        vertices[0] = vertexInterpolate(
                            corners[0],
                            corners[1],
                            scalarField[corners[0][2] * gridZScale + corners[0][1] * gridYScale + corners[0][0]],
                            scalarField[corners[1][2] * gridZScale + corners[1][1] * gridYScale + corners[1][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 2) {
                        vertices[1] = vertexInterpolate(
                            corners[1],
                            corners[2],
                            scalarField[corners[1][2] * gridZScale + corners[1][1] * gridYScale + corners[1][0]],
                            scalarField[corners[2][2] * gridZScale + corners[2][1] * gridYScale + corners[2][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 4) {
                        vertices[2] = vertexInterpolate(
                            corners[2],
                            corners[3],
                            scalarField[corners[2][2] * gridZScale + corners[2][1] * gridYScale + corners[2][0]],
                            scalarField[corners[3][2] * gridZScale + corners[3][1] * gridYScale + corners[3][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 8) {
                        vertices[3] = vertexInterpolate(
                            corners[3],
                            corners[0],
                            scalarField[corners[3][2] * gridZScale + corners[3][1] * gridYScale + corners[3][0]],
                            scalarField[corners[0][2] * gridZScale + corners[0][1] * gridYScale + corners[0][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 16) {
                        vertices[4] = vertexInterpolate(
                            corners[4],
                            corners[5],
                            scalarField[corners[4][2] * gridZScale + corners[4][1] * gridYScale + corners[4][0]],
                            scalarField[corners[5][2] * gridZScale + corners[5][1] * gridYScale + corners[5][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 32) {
                        vertices[5] = vertexInterpolate(
                            corners[5],
                            corners[6],
                            scalarField[corners[5][2] * gridZScale + corners[5][1] * gridYScale + corners[5][0]],
                            scalarField[corners[6][2] * gridZScale + corners[6][1] * gridYScale + corners[6][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 64) {
                        vertices[6] = vertexInterpolate(
                            corners[6],
                            corners[7],
                            scalarField[corners[6][2] * gridZScale + corners[6][1] * gridYScale + corners[6][0]],
                            scalarField[corners[7][2] * gridZScale + corners[7][1] * gridYScale + corners[7][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 128) {
                        vertices[7] = vertexInterpolate(
                            corners[7],
                            corners[4],
                            scalarField[corners[7][2] * gridZScale + corners[7][1] * gridYScale + corners[7][0]],
                            scalarField[corners[4][2] * gridZScale + corners[4][1] * gridYScale + corners[4][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 256) {
                        vertices[8] = vertexInterpolate(
                            corners[0],
                            corners[4],
                            scalarField[corners[0][2] * gridZScale + corners[0][1] * gridYScale + corners[0][0]],
                            scalarField[corners[4][2] * gridZScale + corners[4][1] * gridYScale + corners[4][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 512) {
                        vertices[9] = vertexInterpolate(
                            corners[1],
                            corners[5],
                            scalarField[corners[1][2] * gridZScale + corners[1][1] * gridYScale + corners[1][0]],
                            scalarField[corners[5][2] * gridZScale + corners[5][1] * gridYScale + corners[5][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 1024) {
                        vertices[10] = vertexInterpolate(
                            corners[2],
                            corners[6],
                            scalarField[corners[2][2] * gridZScale + corners[2][1] * gridYScale + corners[2][0]],
                            scalarField[corners[6][2] * gridZScale + corners[6][1] * gridYScale + corners[6][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 2048) {
                        vertices[11] = vertexInterpolate(
                            corners[3],
                            corners[7],
                            scalarField[corners[3][2] * gridZScale + corners[3][1] * gridYScale + corners[3][0]],
                            scalarField[corners[7][2] * gridZScale + corners[7][1] * gridYScale + corners[7][0]],
                            level
                        );
                    }

                    // edgeTotalTime += window.performance.now() - edgeStart;

                    // let vertexStart = window.performance.now();

                    for (let i = 0; triangleTable[cubeIndex][i] != -1; i += 3) {
                        let p1 = vertices[triangleTable[cubeIndex][i]];
                        let p2 = vertices[triangleTable[cubeIndex][i + 1]];
                        let p3 = vertices[triangleTable[cubeIndex][i + 2]];

                        let v1 = vec3.fromValues(p2[0], p2[1], p2[2]);
                        vec3.sub(v1, v1, vec3.fromValues(p1[0], p1[1], p1[2]));
                        let v2 = vec3.fromValues(p3[0], p3[1], p3[2]);
                        vec3.sub(v2, v2, vec3.fromValues(p1[0], p1[1], p1[2]));
                        let normal = vec3.create();
                        normal = vec3.cross(normal, v1, v2);
                        normal = vec3.normalize(normal, normal);

                        meshVertices.push({
                            position: p1,
                            normal: normal
                        });
                        meshVertices.push({
                            position: p2,
                            normal: normal
                        });
                        meshVertices.push({
                            position: p3,
                            normal: normal
                        });
                        numTriangles += 1;
                    }

                    // vertexTotalTime += window.performance.now() - vertexStart;

                    if (numTriangles >= MAX_NUM_TRIANGLES_PER_MESH) {
                        let mesh = new Mesh(this.gl);
                        mesh.upload(meshVertices);
                        meshes.push(mesh);
                        meshVertices = [];
                        numTriangles = 0;
                    }
                }
            }
        }

        if (numTriangles != 0) {
            let mesh = new Mesh(this.gl);
            mesh.upload(meshVertices);
            meshes.push(mesh);
        }

        let model = new Model(this.gl);
        meshes.forEach((mesh) => model.meshes.push(mesh));

        let end = Date.now();
        console.log(`Marching cubes - createModel () took ${end - start}`);
        console.log(`Marching cubes - cube index time: ${cubeIndexTotalTime}`);
        console.log(`Marching cubes - edge time: ${edgeTotalTime}`);
        console.log(`Marching cubes - vertex time: ${vertexTotalTime}`);

        return model;
    }
}
