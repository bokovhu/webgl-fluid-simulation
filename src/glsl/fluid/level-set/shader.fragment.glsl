#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform vec3 u_gridSize;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 calculateLevel (in vec3 coords) {

    float mass = texture(u_grid, coords).x;
    if (mass > 0.1) {
        return vec4(-1.0);
    }
    return vec4(1.0);

    // return vec4(-1.0 * mass / 50.0);

}

void main () {
    
    out_layer1 = calculateLevel(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = calculateLevel(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = calculateLevel(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = calculateLevel(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}