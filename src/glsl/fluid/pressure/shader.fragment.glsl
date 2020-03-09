#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_originalPressureGrid;
uniform sampler3D u_velocityGrid;
uniform sampler3D u_levelSetGrid;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;
uniform vec3 u_voxelStep;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

const float MAX_PRESSURE = 200.0;

float divergence (in vec3 coords) {

    float dx = texture(u_velocityGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0)).x - texture(u_velocityGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0)).x;
    float dy = texture(u_velocityGrid, coords + vec3(0.0, u_voxelStep.y, 0.0)).y - texture(u_velocityGrid, coords - vec3(0.0, u_voxelStep.y, 0.0)).y;
    float dz = texture(u_velocityGrid, coords + vec3(0.0, 0.0, u_voxelStep.z)).z - texture(u_velocityGrid, coords - vec3(0.0, 0.0, u_voxelStep.z)).z;

    return 0.5 * (dx + dy + dz);

}

vec4 computePressure (in vec3 coords) {
/*
    float level = texture(u_levelSetGrid, coords).x;
    if (level > 30.0) {
        return vec4(0.0);
    }*/

    float div = divergence (coords);

    vec3 stepX = vec3(1.0 / u_textureResolution.x, 0.0, 0.0);
    vec3 stepY = vec3(0.0, 1.0 / u_textureResolution.y, 0.0);
    vec3 stepZ = vec3(0.0, 0.0, 1.0 / u_textureResolution.z);

    if (abs(coords.x) <= stepX.x) {
        return texture(u_originalPressureGrid, coords + stepX);
    } else if (abs (1.0 - coords.x) <= stepX.x) {
        return texture(u_originalPressureGrid, coords - stepX);
    }

    if (abs(coords.y) <= stepY.y) {
        return texture(u_originalPressureGrid, coords + stepY);
    } else if (abs(1.0 - coords.y) <= stepY.y) {
        return texture(u_originalPressureGrid, coords - stepY);
    }

    if (abs(coords.z) <= stepZ.z) {
        return texture(u_originalPressureGrid, coords + stepZ);
    } else if (abs(1.0 - coords.z) <= stepZ.z) {
        return texture(u_originalPressureGrid, coords - stepZ);
    }

    float pLeft = texture(u_originalPressureGrid, coords - stepX).x;
    float pRight = texture(u_originalPressureGrid, coords + stepX).x;
    float pTop = texture(u_originalPressureGrid, coords - stepY).x;
    float pBottom = texture(u_originalPressureGrid, coords + stepY).x;
    float pFront = texture(u_originalPressureGrid, coords - stepZ).x;
    float pRear = texture(u_originalPressureGrid, coords + stepZ).x;

    float pressure = (1.0 / 6.0) * ( pLeft + pRight + pTop + pBottom + pFront + pRear - div );
    // pressure = clamp(pressure, -MAX_PRESSURE, MAX_PRESSURE);

    return vec4( pressure );

}

void main () {

    out_layer1 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}