import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import { vertexInterpolate, calculateCorners } from './functions';
import { vec3 } from 'gl-matrix';
import Mesh from '../mesh/mesh';
import Model from '../model/model';

const MAX_NUM_TRIANGLES_PER_MESH = 32 * 32 * 32 * 5;

export default class CPUCubeMarcher {
    constructor(gl, options) {
        this.gl = gl;

        this.options = (options || {})

        this.smoothNormals = !!this.options ['smoothNormals'];
    }

    createModel(scalarField, fieldDimensions, level) {
        let xSize = fieldDimensions[0];
        let ySize = fieldDimensions[1];
        let zSize = fieldDimensions[2];

        let gridZScale = xSize * ySize;
        let gridYScale = xSize;

        let xVoxelCount = xSize - 1;
        let yVoxelCount = ySize - 1;
        let zVoxelCount = zSize - 1;

        let meshVertices = [];
        let meshVertexPositions = [];
        let meshFaces = [];
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

        for (let z = 0; z < zVoxelCount; z++) {
            for (let y = 0; y < yVoxelCount; y++) {
                for (let x = 0; x < xVoxelCount; x++) {

                    // Calculate the index of the cube in the edge table
                    let cubeIndex = 0;

                    let corners = calculateCorners(x, y, z);

                    let powerOfTwo = 1;
                    for (let i = 0; i < 8; i++) {
                        let corner = corners[i];
                        if (scalarField[corner[2]][corner[1]][corner[0]] < level) {
                            cubeIndex += powerOfTwo;
                        }
                        powerOfTwo *= 2;
                    }

                    if (cubeIndex == 0 || cubeIndex == 256) continue;

                    // Clamp cube index value
                    if (cubeIndex >= edgeTable.length) {
                        cubeIndex = edgeTable.length - 1;
                    }

                    // No triangles to create
                    if (edgeTable[cubeIndex] == 0) continue;

                    if (edgeTable[cubeIndex] & 1) {
                        vertices[0] = vertexInterpolate(
                            corners[0],
                            corners[1],
                            scalarField[corners[0][2]][corners[0][1]][corners[0][0]],
                            scalarField[corners[1][2]][corners[1][1]][corners[1][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 2) {
                        vertices[1] = vertexInterpolate(
                            corners[1],
                            corners[2],
                            scalarField[corners[1][2]][corners[1][1]][corners[1][0]],
                            scalarField[corners[2][2]][corners[2][1]][corners[2][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 4) {
                        vertices[2] = vertexInterpolate(
                            corners[2],
                            corners[3],
                            scalarField[corners[2][2]][corners[2][1]][corners[2][0]],
                            scalarField[corners[3][2]][corners[3][1]][corners[3][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 8) {
                        vertices[3] = vertexInterpolate(
                            corners[3],
                            corners[0],
                            scalarField[corners[3][2]][corners[3][1]][corners[3][0]],
                            scalarField[corners[0][2]][corners[0][1]][corners[0][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 16) {
                        vertices[4] = vertexInterpolate(
                            corners[4],
                            corners[5],
                            scalarField[corners[4][2]][corners[4][1]][corners[4][0]],
                            scalarField[corners[5][2]][corners[5][1]][corners[5][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 32) {
                        vertices[5] = vertexInterpolate(
                            corners[5],
                            corners[6],
                            scalarField[corners[5][2]][corners[5][1]][corners[5][0]],
                            scalarField[corners[6][2]][corners[6][1]][corners[6][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 64) {
                        vertices[6] = vertexInterpolate(
                            corners[6],
                            corners[7],
                            scalarField[corners[6][2]][corners[6][1]][corners[6][0]],
                            scalarField[corners[7][2]][corners[7][1]][corners[7][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 128) {
                        vertices[7] = vertexInterpolate(
                            corners[7],
                            corners[4],
                            scalarField[corners[7][2]][corners[7][1]][corners[7][0]],
                            scalarField[corners[4][2]][corners[4][1]][corners[4][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 256) {
                        vertices[8] = vertexInterpolate(
                            corners[0],
                            corners[4],
                            scalarField[corners[0][2]][corners[0][1]][corners[0][0]],
                            scalarField[corners[4][2]][corners[4][1]][corners[4][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 512) {
                        vertices[9] = vertexInterpolate(
                            corners[1],
                            corners[5],
                            scalarField[corners[1][2]][corners[1][1]][corners[1][0]],
                            scalarField[corners[5][2]][corners[5][1]][corners[5][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 1024) {
                        vertices[10] = vertexInterpolate(
                            corners[2],
                            corners[6],
                            scalarField[corners[2][2]][corners[2][1]][corners[2][0]],
                            scalarField[corners[6][2]][corners[6][1]][corners[6][0]],
                            level
                        );
                    }

                    if (edgeTable[cubeIndex] & 2048) {
                        vertices[11] = vertexInterpolate(
                            corners[3],
                            corners[7],
                            scalarField[corners[3][2]][corners[3][1]][corners[3][0]],
                            scalarField[corners[7][2]][corners[7][1]][corners[7][0]],
                            level
                        );
                    }

                    for (let i = 0; triangleTable[cubeIndex][i] != -1; i += 3) {
                        let p1 = vertices[triangleTable[cubeIndex][i]];
                        let p2 = vertices[triangleTable[cubeIndex][i + 1]];
                        let p3 = vertices[triangleTable[cubeIndex][i + 2]];

                        if (this.smoothNormals) {

                            let p1Index = -1;
                            for (let j = 0; j < meshVertexPositions.length; j++) {
                                let vp = meshVertexPositions [j]
                                if (vec3.equals (p1, vp)) {
                                    p1Index = j
                                    break;
                                }
                            }
                            if (p1Index == -1) {
                                meshVertexPositions.push(p1);
                                p1Index = meshVertexPositions.length - 1;
                                meshVertices.push({ pos: p1, faces: [] });
                            }
                            meshVertices[p1Index].faces.push(numTriangles);

                            let p2Index = -1;
                            for (let j = 0; j < meshVertexPositions.length; j++) {
                                let vp = meshVertexPositions [j]
                                if (vec3.equals (p2, vp)) {
                                    p2Index = j
                                    break;
                                }
                            }
                            if (p2Index == -1) {
                                meshVertexPositions.push(p2);
                                p2Index = meshVertexPositions.length - 1;
                                meshVertices.push({ pos: p2, faces: [] });
                            }
                            meshVertices[p2Index].faces.push(numTriangles);

                            let p3Index = -1;
                            for (let j = 0; j < meshVertexPositions.length; j++) {
                                let vp = meshVertexPositions [j]
                                if (vec3.equals (p3, vp)) {
                                    p3Index = j
                                    break;
                                }
                            }
                            if (p3Index == -1) {
                                meshVertexPositions.push(p3);
                                p3Index = meshVertexPositions.length - 1;
                                meshVertices.push({ pos: p3, faces: [] });
                            }
                            meshVertices[p3Index].faces.push(numTriangles);

                            meshFaces.push([ p1Index, p2Index, p3Index ]);

                            numTriangles += 1;

                        } else {
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
                    }

                }
            }
        }

        if (numTriangles != 0) {
            let mesh = new Mesh(this.gl);

            if (this.smoothNormals) {
                let finalVertices = [];
                for (let i = 0; i < numTriangles; i++) {
                    let face = meshFaces[i];

                    let v1 = meshVertices[face[0]];
                    let v2 = meshVertices[face[1]];
                    let v3 = meshVertices[face[2]];

                    v1.normal = (v1.normal || vec3.fromValues (0, 0, 0))
                    v2.normal = (v2.normal || vec3.fromValues (0, 0, 0))
                    v3.normal = (v3.normal || vec3.fromValues (0, 0, 0))

                    let a = vec3.fromValues (v2.pos[0], v2.pos[1], v2.pos[2])
                    vec3.sub (a, a, vec3.fromValues (v1.pos[0], v1.pos[1], v1.pos[2]))

                    let b = vec3.fromValues (v3.pos[0], v3.pos[1], v3.pos[2])
                    vec3.sub (b, b, vec3.fromValues (v1.pos[0], v1.pos[1], v1.pos[2]))

                    let faceNormal = vec3.create ()
                    vec3.cross (faceNormal, a, b)
                    vec3.normalize (faceNormal, faceNormal)

                    vec3.add (v1.normal, v1.normal, faceNormal)
                    vec3.add (v2.normal, v2.normal, faceNormal)
                    vec3.add (v3.normal, v3.normal, faceNormal)

                }

                for (let i = 0; i < numTriangles; i++) {

                    let face = meshFaces [i]

                    let v1 = meshVertices[face[0]];
                    let v2 = meshVertices[face[1]];
                    let v3 = meshVertices[face[2]];

                    vec3.normalize (v1.normal, v1.normal)
                    vec3.normalize (v2.normal, v2.normal)
                    vec3.normalize (v3.normal, v3.normal)

                    finalVertices.push ({position: v1.pos, normal: v1.normal})
                    finalVertices.push ({position: v2.pos, normal: v2.normal})
                    finalVertices.push ({position: v3.pos, normal: v3.normal})

                }

                mesh.upload(finalVertices);
                meshes.push(mesh);
            } else {
                mesh.upload(meshVertices);
                meshes.push(mesh);
            }
        }

        let model = new Model(this.gl);
        meshes.forEach((mesh) => model.meshes.push(mesh));

        return model;
    }
}
