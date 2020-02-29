#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_texture;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

void main () {

    out_layer1 = texture(u_texture, vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.0) / u_textureResolution.z));
    out_layer2 = texture(u_texture, vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.0) / u_textureResolution.z));
    out_layer3 = texture(u_texture, vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.0) / u_textureResolution.z));
    out_layer4 = texture(u_texture, vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.0) / u_textureResolution.z));
}