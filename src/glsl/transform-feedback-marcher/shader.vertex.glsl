#version 300 es

precision mediump float;
precision mediump sampler3D;
precision highp isampler2D;

flat out vec3 tri1Point1;
flat out vec3 tri1Normal1;
flat out vec3 tri1Point2;
flat out vec3 tri1Normal2;
flat out vec3 tri1Point3;
flat out vec3 tri1Normal3;

flat out vec3 tri2Point1;
flat out vec3 tri2Normal1;
flat out vec3 tri2Point2;
flat out vec3 tri2Normal2;
flat out vec3 tri2Point3;
flat out vec3 tri2Normal3;

flat out vec3 tri3Point1;
flat out vec3 tri3Normal1;
flat out vec3 tri3Point2;
flat out vec3 tri3Normal2;
flat out vec3 tri3Point3;
flat out vec3 tri3Normal3;

flat out vec3 tri4Point1;
flat out vec3 tri4Normal1;
flat out vec3 tri4Point2;
flat out vec3 tri4Normal2;
flat out vec3 tri4Point3;
flat out vec3 tri4Normal3;

flat out vec3 tri5Point1;
flat out vec3 tri5Normal1;
flat out vec3 tri5Point2;
flat out vec3 tri5Normal2;
flat out vec3 tri5Point3;
flat out vec3 tri5Normal3;

layout (location = 0) in vec3 a_coords;

uniform vec3 u_offset;
uniform sampler3D u_grid;
uniform isampler2D u_edgeTable;
uniform isampler2D u_triangleTable;

void noTriangles () {

    tri1Point1 = vec3(-0.5, -0.5, 0.0);
    tri1Point2 = vec3(0.0, 0.5, 0.0);
    tri1Point3 = vec3(0.5, -0.5, 0.0);
    tri2Point1 = vec3(0.0);
    tri2Point2 = vec3(0.0);
    tri2Point3 = vec3(0.0);
    tri3Point1 = vec3(0.0);
    tri3Point2 = vec3(0.0);
    tri3Point3 = vec3(0.0);
    tri4Point1 = vec3(0.0);
    tri4Point2 = vec3(0.0);
    tri4Point3 = vec3(0.0);
    tri5Point1 = vec3(0.0);
    tri5Point2 = vec3(0.0);
    tri5Point3 = vec3(0.0);

}

vec3 interp (vec3 p1, vec3 p2, float v1, float v2, float iso) {
    if (abs (iso - v1) < 0.01) return p1;
    if (abs (iso - v2) < 0.01) return p2;
    float a = (iso - v1) / (v2 - v1);
    return vec3 (
        p1.x + (p2.x - p1.x) * a,
        p1.y + (p2.y - p1.y) * a,
        p1.z + (p2.z - p1.z) * a
    );
}

void main () {

    ivec3 gridSize = textureSize(u_grid, 0);
    vec3 s = vec3 (1.0 / float(gridSize.x), 1.0 / float(gridSize.y), 1.0 / float(gridSize.z));

    vec3 c0 = a_coords + u_offset;
    vec3 c1 = a_coords + u_offset + vec3(s.x, 0.0, 0.0);
    vec3 c2 = a_coords + u_offset + vec3(s.x, 0.0, s.z);
    vec3 c3 = a_coords + u_offset + vec3(0.0, 0.0, s.z);
    vec3 c4 = a_coords + u_offset + vec3(0.0, s.y, 0.0);
    vec3 c5 = a_coords + u_offset + vec3(s.x, s.y, 0.0);
    vec3 c6 = a_coords + u_offset + vec3(s.x, s.y, s.z);
    vec3 c7 = a_coords + u_offset + vec3(0.0, s.y, s.z);

    const float isoLevel = 32.0;

    int cubeIndex = 0;

    if (texture (u_grid, c0).x < isoLevel) {
        cubeIndex = cubeIndex | 1;
    }
    if (texture (u_grid, c1).x < isoLevel) {
        cubeIndex = cubeIndex | 2;
    }
    if (texture (u_grid, c2).x < isoLevel) {
        cubeIndex = cubeIndex | 4;
    }
    if (texture (u_grid, c3).x < isoLevel) {
        cubeIndex = cubeIndex | 8;
    }
    if (texture (u_grid, c4).x < isoLevel) {
        cubeIndex = cubeIndex | 16;
    }
    if (texture (u_grid, c5).x < isoLevel) {
        cubeIndex = cubeIndex | 32;
    }
    if (texture (u_grid, c6).x < isoLevel) {
        cubeIndex = cubeIndex | 64;
    }
    if (texture (u_grid, c7).x < isoLevel) {
        cubeIndex = cubeIndex | 128;
    }

    if (cubeIndex == 0 || cubeIndex == 255) {
        noTriangles ();
    }

    int edge = texelFetch (u_edgeTable, ivec2(cubeIndex, 0), 0).x;

    vec3 vertices[12];

    if ((edge & 1) > 0) {
        vertices[0] = interp (c0, c1, texture(u_grid, c0).x, texture(u_grid, c1).x, isoLevel);
    }
    if ((edge & 2) > 0) {
        vertices[1] = interp (c1, c2, texture(u_grid, c1).x, texture(u_grid, c2).x, isoLevel);
    }
    if ((edge & 4) > 0) {
        vertices[2] = interp (c2, c3, texture(u_grid, c2).x, texture(u_grid, c3).x, isoLevel);
    }
    if ((edge & 8) > 0) {
        vertices[3] = interp (c3, c0, texture(u_grid, c3).x, texture(u_grid, c0).x, isoLevel);
    }

    if ((edge & 16) > 0) {
        vertices[4] = interp (c4, c5, texture(u_grid, c4).x, texture(u_grid, c5).x, isoLevel);
    }
    if ((edge & 32) > 0) {
        vertices[5] = interp (c5, c6, texture(u_grid, c5).x, texture(u_grid, c6).x, isoLevel);
    }
    if ((edge & 64) > 0) {
        vertices[6] = interp (c6, c7, texture(u_grid, c6).x, texture(u_grid, c7).x, isoLevel);
    }
    if ((edge & 128) > 0) {
        vertices[7] = interp (c7, c3, texture(u_grid, c7).x, texture(u_grid, c3).x, isoLevel);
    }

    if ((edge & 256) > 0) {
        vertices[8] = interp (c0, c4, texture(u_grid, c0).x, texture(u_grid, c4).x, isoLevel);
    }
    if ((edge & 512) > 0) {
        vertices[9] = interp (c1, c5, texture(u_grid, c1).x, texture(u_grid, c5).x, isoLevel);
    }
    if ((edge & 1024) > 0) {
        vertices[10] = interp (c2, c6, texture(u_grid, c2).x, texture(u_grid, c6).x, isoLevel);
    }
    if ((edge & 2048) > 0) {
        vertices[11] = interp (c3, c7, texture(u_grid, c3).x, texture(u_grid, c7).x, isoLevel);
    }

    int tri1v1 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 0), 0).x;
    int tri1v2 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 1), 0).x;
    int tri1v3 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 2), 0).x;

    if (tri1v1 != -1) {

        tri1Point1 = vertices[tri1v1];
        tri1Point2 = vertices[tri1v2];
        tri1Point3 = vertices[tri1v3];

        vec3 a = tri1Point2 - tri1Point1;
        vec3 b = tri1Point3 - tri1Point1;
        vec3 n = normalize (cross (a, b));

        tri1Normal1 = n;
        tri1Normal2 = n;
        tri1Normal3 = n;

    } else {
        tri1Point1 = vec3(0.0);
        tri1Point2 = vec3(0.0);
        tri1Point3 = vec3(0.0);
    }


    int tri2v1 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 3), 0).x;
    int tri2v2 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 4), 0).x;
    int tri2v3 = texelFetch (u_triangleTable, ivec2 (cubeIndex, 5), 0).x;

    if (tri2v1 != -1) {

        tri2Point1 = vertices[tri2v1];
        tri2Point2 = vertices[tri2v2];
        tri2Point3 = vertices[tri2v3];

        vec3 a = tri2Point2 - tri2Point1;
        vec3 b = tri2Point3 - tri2Point1;
        vec3 n = normalize (cross (a, b));

        tri2Normal1 = n;
        tri2Normal2 = n;
        tri2Normal3 = n;

    } else {
        tri2Point1 = vec3(0.0);
        tri2Point2 = vec3(0.0);
        tri2Point3 = vec3(0.0);
    }

}