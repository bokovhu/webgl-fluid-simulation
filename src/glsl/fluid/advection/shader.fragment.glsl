#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_velocityGrid;
uniform sampler3D u_scalarGrid;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;
uniform float u_timestep;
uniform float u_advectionScale;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 advect (in vec3 coords) {

    vec3 p = (coords * u_textureResolution) 
        - texture (u_velocityGrid, coords).xyz * u_timestep;
    p = p / u_textureResolution;

    if (p.x < 0.0) p.x = -1.0 * p.x;
    if (p.x > 1.0) p.x = 1.0 - (p.x - 1.0);
    if (p.y < 0.0) p.y = -1.0 * p.y;
    if (p.y > 1.0) p.y = 1.0 - (p.y - 1.0);
    if (p.z < 0.0) p.z = -1.0 * p.z;
    if (p.z > 1.0) p.z = 1.0 - (p.z - 1.0);

    /* if (abs(v.x) <= 0.001 || abs(1.0 - v.x) <= 0.001 || abs(v.y) <= 0.001 || abs(1.0 - v.y) <= 0.001 || abs(v.z) <= 0.001 || abs(1.0 - v.z) <= 0.001) {
        return vec4(0.0);
    } */

    return vec4(texture (u_scalarGrid, p));

}

void main () {

    out_layer1 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}