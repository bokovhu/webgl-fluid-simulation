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

vec3 reflectDestination (in vec3 destination) {

    vec3 d = destination;

    if (destination.x <= 2.0) {
        d.x += -1.0;
    }
    if (destination.x >= u_textureResolution.x - 2.0) {
        d.x -= 1.0;
    }

    if (destination.y <= 2.0) {
        d.y += -1.0;
    }
    if (destination.y >= u_textureResolution.y - 2.0) {
        d.y -= 1.0;
    }

    if (destination.z <= 2.0) {
        d.z += -1.0;
    }
    if (destination.z >= u_textureResolution.z - 2.0) {
        d.z -= 1.0;
    }

    return d;

}

vec4 advect (in vec3 coords) {

    float a = u_advectionScale * u_timestep;

    vec3 v = (coords * u_textureResolution) 
        - texture (u_velocityGrid, coords).xyz * u_timestep;
    v = reflectDestination (v);
    v = v / u_textureResolution;

    return vec4(texture (u_scalarGrid, v));

}

void main () {

    out_layer1 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}