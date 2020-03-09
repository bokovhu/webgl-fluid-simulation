#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_originalVelocityGrid;
uniform sampler3D u_levelSetGrid;
uniform vec3 u_externalForce;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;
uniform float u_timestep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 applyForce (in vec3 coords) {

    float levelSetValue = texture(u_levelSetGrid, coords).x;
    // No velocity outside the fluid
    if (levelSetValue > 0.0) return vec4(0.0);

    return texture (u_originalVelocityGrid, coords)
        + vec4(u_externalForce, 0.0) * u_timestep;

}

void main () {

    out_layer1 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = applyForce(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}