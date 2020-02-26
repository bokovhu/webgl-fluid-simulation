#version 300 es

precision highp float;
precision mediump sampler3D;
precision highp isampler2D;
precision highp int;

layout(location = 0) out vec4 out_triangleVertex1;
layout(location = 1) out vec4 out_triangleVertex2;
layout(location = 2) out vec4 out_triangleVertex3;

in vec2 v_texCoords;

uniform sampler3D u_gridTexture;
uniform isampler2D u_edgeTable;
uniform isampler2D u_triangleTable;
uniform float u_isoValue;
uniform vec3 u_scale;
uniform vec3 u_offset;
uniform int u_numSheetRowsPerPass;
uniform int u_numSheetColsPerPass;
uniform int u_sheetOffset;
uniform vec3 u_gridResolution;
uniform vec3 u_gridResolutionReciprocal;
uniform vec3 u_cornerOffsets [8];
uniform int u_triangleIndex;

vec3 interpolate (
    vec3 a,
    vec3 b,
    float aValue, float bValue
) {
    if (abs (u_isoValue - aValue) < 0.01 || abs (aValue - bValue) < 0.01) {
        return a;
    }
    if (abs (u_isoValue - bValue) < 0.01) {
        return b;
    }
    float alpha = (u_isoValue - aValue) / (bValue - aValue);
    return vec3 (
        a.x + alpha * (b.x - a.x),
        a.y + alpha * (b.y - a.y),
        a.z + alpha * (b.z - a.z)
    );
}

void main () {

    vec2 pos = vec2 (
        v_texCoords.x, 
        v_texCoords.y
    );

    int triangleIndex = u_triangleIndex * 3;

    // Calculate voxel coordinates based on current texture coordinates
    float sheetIndex = float(u_sheetOffset) + floor (pos.x) + floor (pos.y) * float(u_numSheetColsPerPass);
    float xCoord = fract(pos.x);
    float yCoord = fract(pos.y);
    float zCoord = sheetIndex / u_gridResolution.z;

    // This calculation works in voxel space, not grid space
    // Must discard the last pixels of each row, column and sheet
    if (1.0 - xCoord <= u_gridResolutionReciprocal.x) {
        discard;
    }
    if (1.0 - yCoord <= u_gridResolutionReciprocal.y) {
        discard;
    }
    if (1.0 - zCoord <= u_gridResolutionReciprocal.z) {
        discard;
    }

    vec3 baseGridCoords = vec3 (xCoord, yCoord, zCoord);

    vec3 corners [8];
    float cornerValues [8];
    for (int i = 0; i < 8; i++) {
        // Pre-calculate the 8 corners
        corners [i] = (baseGridCoords + u_cornerOffsets [i]) * u_gridResolution;
        // Sample the grid, cache the values as we'll need them later too
        cornerValues [i] = texture(u_gridTexture, baseGridCoords + u_cornerOffsets [i]).x;
    }

    // Calculate the cubeIndex
    int cubeIndex = 0;

    if (cornerValues [0] < u_isoValue) {
        cubeIndex = cubeIndex | 1;
    }
    if (cornerValues [1] < u_isoValue) {
        cubeIndex = cubeIndex | 2;
    }
    if (cornerValues [2] < u_isoValue) {
        cubeIndex = cubeIndex | 4;
    }
    if (cornerValues [3] < u_isoValue) {
        cubeIndex = cubeIndex | 8;
    }
    if (cornerValues [4] < u_isoValue) {
        cubeIndex = cubeIndex | 16;
    }
    if (cornerValues [5] < u_isoValue) {
        cubeIndex = cubeIndex | 32;
    }
    if (cornerValues [6] < u_isoValue) {
        cubeIndex = cubeIndex | 64;
    }
    if (cornerValues [7] < u_isoValue) {
        cubeIndex = cubeIndex | 128;
    }

    if (cubeIndex == 0 || cubeIndex == 255) {
        discard;
    }

    int edge = texelFetch (u_edgeTable, ivec2(cubeIndex, 0), 0).x;

    if (edge == 0) {
        discard;
    }

    int triangleVertex1Index = texelFetch(u_triangleTable, ivec2(triangleIndex, cubeIndex), 0).x;

    if (triangleVertex1Index < 0) {
        discard;
    }

    int triangleVertex2Index = texelFetch(u_triangleTable, ivec2(triangleIndex + 1, cubeIndex), 0).x;
    int triangleVertex3Index = texelFetch(u_triangleTable, ivec2(triangleIndex + 2, cubeIndex), 0).x;

    // triangleVertex1Index == 0 ==> vertices[0] should be calculated

    // Calculate the vertices of the triangles

    vec3 vertices [12];

    if ((edge & 1) > 0) {
        vertices [0] = interpolate (
            corners [0],
            corners [1],
            cornerValues [0], cornerValues [1]
        );
    } 
    
    if ((edge & 2) > 0) {
        vertices [1] = interpolate (
            corners [1],
            corners [2],
            cornerValues [1], cornerValues [2]
        );
    } 
    
    if ((edge & 4)  > 0) {
        vertices [2] = interpolate (
            corners [2],
            corners [3],
            cornerValues [2], cornerValues [3]
        );
    } 
    
    if ((edge & 8) > 0) {
        vertices [3] = interpolate (
            corners [3],
            corners [0],
            cornerValues [3], cornerValues [0]
        );
    } 
    
    if ((edge & 16) > 0) {
        vertices [4] = interpolate (
            corners [4],
            corners [5],
            cornerValues [4], cornerValues [5]
        );
    } 
    
    if ((edge & 32) > 0) {
        vertices [5] = interpolate (
            corners [5],
            corners [6],
            cornerValues [5], cornerValues [6]
        );
    } 
    
    if ((edge & 64) > 0) {
        vertices [6] = interpolate (
            corners [6],
            corners [7],
            cornerValues [6], cornerValues [7]
        );
    } 
    
    if ((edge & 128) > 0) {
        vertices [7] = interpolate (
            corners [7],
            corners [4],
            cornerValues [7], cornerValues [4]
        );
    } 
    
    if ((edge & 256) > 0) {
        vertices [8] = interpolate (
            corners [0],
            corners [4],
            cornerValues [0], cornerValues [4]
        );
    } 
    
    if ((edge & 512) > 0) {
        vertices [9] = interpolate (
            corners [1],
            corners [5],
            cornerValues [1], cornerValues [5]
        );
    } 
    
    if ((edge & 1024) > 0) {
        vertices [10] = interpolate (
            corners [2],
            corners [6],
            cornerValues [2], cornerValues [6]
        );
    } 
    
    if ((edge & 2048) > 0) {
        vertices [11] = interpolate (
            corners [3],
            corners [7],
            cornerValues [3], cornerValues [7]
        );
    }

    out_triangleVertex1 = vec4(
        u_scale * vertices [triangleVertex1Index],
        1.0
    );
    out_triangleVertex2 = vec4 (
        u_scale * vertices [triangleVertex2Index], 
        1.0
    );
    out_triangleVertex3 = vec4 (
        u_scale * vertices [triangleVertex3Index], 
        1.0
    );

}