#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_velocityGrid;
uniform sampler3D u_grid;
uniform vec3 u_gridSize;
uniform vec3 u_gridStep;
uniform int u_layerOffset;
uniform float u_timestep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

float trilinear (in vec3 p) {

    // p.xyz E [0, u_gridSize.x|y|z)
    ivec3 c000 = ivec3 (
        int(floor(p.x)), int(floor(p.y)), int(floor(p.z))
    );
    ivec3 c100 = ivec3 (
        int(floor(p.x + 1.01)), int(floor(p.y)), int(floor(p.z))
    );
    ivec3 c010 = ivec3(
        int(floor(p.x)), int(floor(p.y + 1.01)), int(floor(p.z))
    );
    ivec3 c001 = ivec3(
        int(floor(p.x)), int(floor(p.y)), int(floor(p.z + 1.01))
    );
    ivec3 c110 = ivec3(
        int(floor(p.x + 1.01)), int(floor(p.y + 1.01)), int(floor(p.z))
    );
    ivec3 c101 = ivec3(
        int(floor(p.x + 1.01)), int(floor(p.y)), int(floor(p.z + 1.01))
    );
    ivec3 c011 = ivec3(
        int(floor(p.x)), int(floor(p.y + 1.01)), int(floor(p.z + 1.01))
    );
    ivec3 c111 = ivec3(
        int(floor(p.x + 1.01)), int(floor(p.y + 1.01)), int(floor(p.z + 1.01))
    );

    float xd = (p.x - floor(p.x));
    float yd = (p.y - floor(p.y));
    float zd = (p.z - floor(p.z));

    float v000 = texelFetch(u_grid, c000, 0).x;
    float v100 = texelFetch(u_grid, c100, 0).x;
    float v010 = texelFetch(u_grid, c010, 0).x;
    float v001 = texelFetch(u_grid, c001, 0).x;
    float v110 = texelFetch(u_grid, c110, 0).x;
    float v101 = texelFetch(u_grid, c101, 0).x;
    float v011 = texelFetch(u_grid, c011, 0).x;
    float v111 = texelFetch(u_grid, c111, 0).x;

    float v00 = v000 * (1.0 - xd) + v100 * xd;
    float v01 = v001 * (1.0 - xd) + v101 * xd;
    float v10 = v010 * (1.0 - xd) + v110 * xd;
    float v11 = v011 * (1.0 - xd) + v111 * xd;

    float v0 = v00 * (1.0 - yd) + v10 * yd;
    float v1 = v01 * (1.0 - yd) + v11 * yd;

    return v0 * (1.0 - zd) + v1 * zd;

}

vec4 advect (in vec3 coords) {

    vec3 p = (coords * u_gridSize) 
        - texture (u_velocityGrid, coords).xyz * u_timestep;
    // float amount = trilinear (p);
    p = p / u_gridSize;
    float amount = texture(u_grid, p).x;
    
    if (amount <= 0.01) amount = 0.0;

    return vec4(amount);

}

void main () {

    out_layer1 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}