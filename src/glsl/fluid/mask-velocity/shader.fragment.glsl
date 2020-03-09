#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_velocityGrid;
uniform sampler3D u_levelSetGrid;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 maskVelocity(in vec3 coords) {

    float level = texture(u_levelSetGrid, coords).x;
    if (level > 0.0) {
        return vec4(0.0);
    }

    return texture(u_velocityGrid, coords);

}

void main () {

    out_layer1 = maskVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = maskVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = maskVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = maskVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}