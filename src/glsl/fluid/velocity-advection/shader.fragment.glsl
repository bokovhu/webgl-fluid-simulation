#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform vec3 u_gridSize;
uniform vec3 u_gridStep;
uniform vec3 u_stepX;
uniform vec3 u_stepY;
uniform vec3 u_stepZ;
uniform int u_layerOffset;
uniform float u_timestep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec3 trilinear (in vec3 p) {

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

    vec3 v000 = texelFetch(u_grid, c000, 0).xyz;
    vec3 v100 = texelFetch(u_grid, c100, 0).xyz;
    vec3 v010 = texelFetch(u_grid, c010, 0).xyz;
    vec3 v001 = texelFetch(u_grid, c001, 0).xyz;
    vec3 v110 = texelFetch(u_grid, c110, 0).xyz;
    vec3 v101 = texelFetch(u_grid, c101, 0).xyz;
    vec3 v011 = texelFetch(u_grid, c011, 0).xyz;
    vec3 v111 = texelFetch(u_grid, c111, 0).xyz;

    vec3 v00 = v000 * (1.0 - xd) + v100 * xd;
    vec3 v01 = v001 * (1.0 - xd) + v101 * xd;
    vec3 v10 = v010 * (1.0 - xd) + v110 * xd;
    vec3 v11 = v011 * (1.0 - xd) + v111 * xd;

    vec3 v0 = v00 * (1.0 - yd) + v10 * yd;
    vec3 v1 = v01 * (1.0 - yd) + v11 * yd;

    return v0 * (1.0 - zd) + v1 * zd;

}

vec4 advect (in vec3 coords) {

    if (abs(coords.x) <= u_stepX.x) {
        return -1.0 * texture(u_grid, coords + u_stepX);
    } else if (abs (1.0 - coords.x) <= u_stepX.x) {
        return -1.0 * texture(u_grid, coords - u_stepX);
    }

    if (abs(coords.y) <= u_stepY.y) {
        return -1.0 * texture(u_grid, coords + u_stepY);
    } else if (abs(1.0 - coords.y) <= u_stepY.y) {
        return -1.0 * texture(u_grid, coords - u_stepY);
    }

    if (abs(coords.z) <= u_stepZ.z) {
        return -1.0 * texture(u_grid, coords + u_stepZ);
    } else if (abs(1.0 - coords.z) <= u_stepZ.z) {
        return -1.0 * texture(u_grid, coords - u_stepZ);
    }

    vec3 p = (coords * u_gridSize) 
        - texture (u_grid, coords).xyz * u_timestep;
    p = p / u_gridSize;
    // return vec4 (trilinear (p), 1.0);

    return vec4(texture (u_grid, p));

}

void main () {

    out_layer1 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}