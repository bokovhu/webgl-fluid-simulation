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

float divergence (in vec3 coords) {

    float dx = texture(u_velocityGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0)).x - texture(u_velocityGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0)).x;
    float dy = texture(u_velocityGrid, coords + vec3(0.0, u_voxelStep.y, 0.0)).y - texture(u_velocityGrid, coords - vec3(0.0, u_voxelStep.y, 0.0)).y;
    float dz = texture(u_velocityGrid, coords + vec3(0.0, 0.0, u_voxelStep.z)).z - texture(u_velocityGrid, coords - vec3(0.0, 0.0, u_voxelStep.z)).z;

    return 0.5 * (dx + dy + dz);

}

vec4 computePressure (in vec3 coords) {

    float div = divergence (coords);

    // float p = texture(u_originalPressureGrid, coords);

    float pLeft = texture(u_originalPressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0)).x;
    float pRight = texture(u_originalPressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0)).x;
    float pTop = texture(u_originalPressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0)).x;
    float pBottom = texture(u_originalPressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0)).x;
    float pFront = texture(u_originalPressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z)).x;
    float pRear = texture(u_originalPressureGrid, coords + vec3(0.0. 0.0, u_voxelStep.z)).x;

    // TODO: Boundary and obstacle cell handling
    //       corresponding pressure values should be set to p

    return (1.0 / 6.0) * ( pLeft + pRight + pTop + pBottom + pFront + pRear - div );

}

void main () {

    out_layer1 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.0) / u_textureResolution.z));
    out_layer2 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.0) / u_textureResolution.z));
    out_layer3 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.0) / u_textureResolution.z));
    out_layer4 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.0) / u_textureResolution.z));

}