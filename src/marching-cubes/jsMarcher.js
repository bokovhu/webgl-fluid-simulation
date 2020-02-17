import triangleTable from './triangleTable';
import edgeTable from './edgeTable';
import { vec3 } from 'gl-matrix';

function interp(v, ax, ay, az, bx, by, bz, v1, v2, level) {
    if (Math.abs(level - v1) < 0.01 || Math.abs(v1 - v2) < 0.01) {
        v[0] = ax;
        v[1] = ay;
        v[2] = az;
        return;
    }
    if (Math.abs(level - v2) < 0.01) {
        v[0] = bx;
        v[1] = by;
        v[2] = bz;
        return;
    }
    let alpha = (level - v1) / (v2 - v1);
    v[0] = ax + (bx - ax) * alpha;
    v[1] = ay + (by - ay) * alpha;
    v[2] = az + (bz - az) * alpha;
}

export default class JSMarcher {
    constructor(gl) {
        this.gl = gl;
    }

    /// Returns the number of vertices created
    calculate(
        /// The function places the generated vertices inside this array
        outVertices,
        /// The scalar field to process
        field,
        /// The starting (inclusive) and ending (exclusive) index of the cube marching
        fromIndex,
        toIndex,
        /// The size of the field in the X, Y and Z directions
        fieldSizeX,
        fieldSizeY,
        fieldSizeZ,
        /// The X, Y and Z offset to apply to all generated vertices
        vertexOffsetX,
        vertexOffsetY,
        vertexOffsetZ,
        /// The X, Y and Z scale to apply to all generated vertices
        scaleX,
        scaleY,
        scaleZ,
        /// The level of the isosurface, below which a point is considered to be inside the volume
        isoLevel
    ) {
        let sheetSize = fieldSizeX * fieldSizeY;
        let rowSize = fieldSizeX;
        let numVertices = 0;

        let vertices = [];
        for (let i = 0; i < 12; i++) {
            vertices[i] = [ 0.0, 0.0, 0.0 ];
        }

        let triSideA = vec3.create();
        let triSideB = vec3.create();
        let p1 = vec3.create();
        let p2 = vec3.create();
        let p3 = vec3.create();
        let normal = vec3.create();

        for (let index = fromIndex; index < toIndex; index++) {
            // index = (z * sheetSize) + (y * rowSize) + x

            let z = Math.floor(index / sheetSize);
            let y = Math.floor((index - z * sheetSize) / rowSize);
            let x = Math.floor(index - (z * sheetSize + y * rowSize));

            // The scalar field is a latice, and we are iterating voxels
            // We must thus skip the boundary items
            if (x == fieldSizeX - 1) continue;
            if (y == fieldSizeY - 1) continue;
            if (z == fieldSizeZ - 1) continue;

            // Calculate the corners of the current voxel

            let c0x = x;
            let c0y = y;
            let c0z = z;
            let c0i = index;

            let c1x = x + 1;
            let c1y = y;
            let c1z = z;
            let c1i = c1z * sheetSize + c1y * rowSize + c1x;

            let c2x = x + 1;
            let c2y = y;
            let c2z = z + 1;
            let c2i = c2z * sheetSize + c2y * rowSize + c2x;

            let c3x = x;
            let c3y = y;
            let c3z = z + 1;
            let c3i = c3z * sheetSize + c3y * rowSize + c3x;

            let c4x = x;
            let c4y = y + 1;
            let c4z = z;
            let c4i = c4z * sheetSize + c4y * rowSize + c4x;

            let c5x = x + 1;
            let c5y = y + 1;
            let c5z = z;
            let c5i = c5z * sheetSize + c5y * rowSize + c5x;

            let c6x = x + 1;
            let c6y = y + 1;
            let c6z = z + 1;
            let c6i = c6z * sheetSize + c6y * rowSize + c6x;

            let c7x = x;
            let c7y = y + 1;
            let c7z = z + 1;
            let c7i = c7z * sheetSize + c7y * rowSize + c7x;

            // Calculate the index of the current voxel in the edge table
            let cubeIndex = 0;

            if (field[c0i] < isoLevel) cubeIndex |= 1;
            if (field[c1i] < isoLevel) cubeIndex |= 2;
            if (field[c2i] < isoLevel) cubeIndex |= 4;
            if (field[c3i] < isoLevel) cubeIndex |= 8;
            if (field[c4i] < isoLevel) cubeIndex |= 16;
            if (field[c5i] < isoLevel) cubeIndex |= 32;
            if (field[c6i] < isoLevel) cubeIndex |= 64;
            if (field[c7i] < isoLevel) cubeIndex |= 128;

            // All points of the voxel are either fully inside or outside of the volume
            if (cubeIndex == 0 || cubeIndex == 255) {
                continue;
            }

            // No triangles to create
            if (edgeTable[cubeIndex] == 0) {
                continue;
            }

            // Calculate vertices based on edge table values and linear interpolation

            if (edgeTable[cubeIndex] & 1) {
                interp(vertices[0], c0x, c0y, c0z, c1x, c1y, c1z, field[c0i], field[c1i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 2) {
                interp(vertices[1], c1x, c1y, c1z, c2x, c2y, c2z, field[c1i], field[c2i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 4) {
                interp(vertices[2], c2x, c2y, c2z, c3x, c3y, c3z, field[c2i], field[c3i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 8) {
                interp(vertices[3], c3x, c3y, c3z, c0x, c0y, c0z, field[c3i], field[c0i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 16) {
                interp(vertices[4], c4x, c4y, c4z, c5x, c5y, c5z, field[c4i], field[c5i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 32) {
                interp(vertices[5], c5x, c5y, c5z, c6x, c6y, c6z, field[c5i], field[c6i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 64) {
                interp(vertices[6], c6x, c6y, c6z, c7x, c7y, c7z, field[c6i], field[c7i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 128) {
                interp(vertices[7], c7x, c7y, c7z, c4x, c4y, c4z, field[c7i], field[c4i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 256) {
                interp(vertices[8], c0x, c0y, c0z, c4x, c4y, c4z, field[c0i], field[c4i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 512) {
                interp(vertices[9], c1x, c1y, c1z, c5x, c5y, c5z, field[c1i], field[c5i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 1024) {
                interp(vertices[10], c2x, c2y, c2z, c6x, c6y, c6z, field[c2i], field[c6i], isoLevel);
            }
            if (edgeTable[cubeIndex] & 2048) {
                interp(vertices[11], c3x, c3y, c3z, c7x, c7y, c7z, field[c3i], field[c7i], isoLevel);
            }

            // Build the triangles
            for (let i = 0; triangleTable[cubeIndex][i] != -1; i += 3) {
                vec3.set(
                    p1,
                    vertexOffsetX + vertices[triangleTable[cubeIndex][i]][0] * scaleX,
                    vertexOffsetY + vertices[triangleTable[cubeIndex][i]][1] * scaleY,
                    vertexOffsetZ + vertices[triangleTable[cubeIndex][i]][2] * scaleZ
                );

                vec3.set(
                    p2,
                    vertexOffsetX + vertices[triangleTable[cubeIndex][i + 1]][0] * scaleX,
                    vertexOffsetY + vertices[triangleTable[cubeIndex][i + 1]][1] * scaleY,
                    vertexOffsetZ + vertices[triangleTable[cubeIndex][i + 1]][2] * scaleZ
                );

                vec3.set(
                    p3,
                    vertexOffsetX + vertices[triangleTable[cubeIndex][i + 2]][0] * scaleX,
                    vertexOffsetY + vertices[triangleTable[cubeIndex][i + 2]][1] * scaleY,
                    vertexOffsetZ + vertices[triangleTable[cubeIndex][i + 2]][2] * scaleZ
                );

                vec3.set(triSideA, p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]);
                vec3.set(triSideB, p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);
                vec3.cross(normal, triSideA, triSideB);
                vec3.normalize(normal, normal);

                // Copy result to output

                outVertices.set(p1, numVertices * 6);
                outVertices.set(normal, numVertices * 6 + 3);
                outVertices.set(p2, (numVertices + 1) * 6);
                outVertices.set(normal, (numVertices + 1) * 6 + 3);
                outVertices.set(p3, (numVertices + 2) * 6);
                outVertices.set(normal, (numVertices + 2) * 6 + 3);

                numVertices += 3;
            }
        }

        return numVertices;
    }
}
