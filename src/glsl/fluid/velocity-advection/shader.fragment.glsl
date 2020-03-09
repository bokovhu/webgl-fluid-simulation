#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_velocityGrid;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;
uniform float u_timestep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 advect (in vec3 coords) {

    vec3 stepX = vec3(1.0 / u_textureResolution.x, 0.0, 0.0);
    vec3 stepY = vec3(0.0, 1.0 / u_textureResolution.y, 0.0);
    vec3 stepZ = vec3(0.0, 0.0, 1.0 / u_textureResolution.z);

    if (abs(coords.x) <= stepX.x) {
        return -1.0 * texture(u_velocityGrid, coords + stepX);
    } else if (abs (1.0 - coords.x) <= stepX.x + 0.01) {
        return -1.0 * texture(u_velocityGrid, coords - stepX);
    }

    if (abs(coords.y) <= stepY.y) {
        return -1.0 * texture(u_velocityGrid, coords + stepY);
    } else if (abs(1.0 - coords.y) <= stepY.y + 0.01) {
        return -1.0 * texture(u_velocityGrid, coords - stepY);
    }

    if (abs(coords.z) <= stepZ.z) {
        return -1.0 * texture(u_velocityGrid, coords + stepZ);
    } else if (abs(1.0 - coords.z) <= stepZ.z) {
        return -1.0 * texture(u_velocityGrid, coords - stepZ);
    }

    vec3 p = (coords * u_textureResolution) 
        - texture (u_velocityGrid, coords).xyz * u_timestep;
    p = p / u_textureResolution;

    return vec4(texture (u_velocityGrid, p));

}

void main () {

    out_layer1 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = advect(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}