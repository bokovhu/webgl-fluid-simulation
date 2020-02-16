import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import { vertexInterpolate, calculateCorners, calculateWorldCorners } from './functions';
import { vec3 } from 'gl-matrix';
import Mesh from '../mesh/mesh';
import Model from '../model/model';

const MAX_NUM_TRIANGLES_PER_MESH = 65536;

function applyEdge(
    vertices,
    scalarField,
    corners,
    worldCorners,
    cubeIndex,
    index,
    c1,
    c2,
    gridZScale,
    gridYScale,
    level
) {
    let mask = 1 << index;
    if (edgeTable[cubeIndex] & mask) {
        vertices[index] = vertexInterpolate(
            worldCorners[c1],
            worldCorners[c2],
            scalarField[corners[c1][2] * gridZScale + corners[c1][1] * gridYScale + corners[c1][0]],
            scalarField[corners[c2][2] * gridZScale + corners[c2][1] * gridYScale + corners[c2][0]],
            level
        );
    }
}

export default class CPUCubeMarcher {
    constructor(gl) {
        this.gl = gl;
    }

    createModel(scalarField, fieldDimensions, voxelSize, level) {
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

        let voxelSizeX = voxelSize[0];
        let voxelSizeY = voxelSize[1];
        let voxelSizeZ = voxelSize[2];
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
                    let worldCorners = calculateWorldCorners(corners, voxelSizeX, voxelSizeY, voxelSizeZ);

                    let powerOfTwo = 1;
                    for (let i = 0; i < 8; i++) {
                        let corner = corners[i];
                        if (scalarField[corner[2] * gridZScale + corner[1] * gridYScale + corner[0]] < level) {
                            cubeIndex |= powerOfTwo;
                        }
                        powerOfTwo *= 2;
                    }

                    // Clamp cube index value
                    if (cubeIndex >= edgeTable.length) {
                        cubeIndex = edgeTable.length - 1;
                    }

                    // No triangles to create
                    if (edgeTable[cubeIndex] == 0) continue;

                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        0,
                        0,
                        1,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        1,
                        1,
                        2,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        2,
                        2,
                        3,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        3,
                        3,
                        0,
                        gridZScale,
                        gridYScale,
                        level
                    );

                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        4,
                        4,
                        5,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        5,
                        5,
                        6,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        6,
                        6,
                        7,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        7,
                        7,
                        4,
                        gridZScale,
                        gridYScale,
                        level
                    );

                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        8,
                        0,
                        4,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        9,
                        1,
                        5,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        10,
                        2,
                        6,
                        gridZScale,
                        gridYScale,
                        level
                    );
                    applyEdge(
                        vertices,
                        scalarField,
                        corners,
                        worldCorners,
                        cubeIndex,
                        11,
                        3,
                        7,
                        gridZScale,
                        gridYScale,
                        level
                    );

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

        return model;
    }
}
