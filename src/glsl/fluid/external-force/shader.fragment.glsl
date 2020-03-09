#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform sampler3D u_massGrid;
uniform vec3 u_force;
uniform vec3 u_gridSize;
uniform int u_layerOffset;
uniform float u_timestep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 applyForce (in vec3 coords) {


    float mass = texture(u_massGrid, coords).x;
    if (mass <= 0.05) {
        // return texture (u_grid, coords) * 0.0001;
        return vec4(0.0);
    }


    vec3 newVelocity = texture (u_grid, coords).xyz
        + u_force * u_timestep;

    return vec4(newVelocity, 1.0);

}

void main () {

    out_layer1 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}