#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform sampler3D u_pressureGrid;
uniform vec3 u_gridSize;
uniform vec3 u_stepX;
uniform vec3 u_stepY;
uniform vec3 u_stepZ;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 projectVelocity (in vec3 coords) {

    float pLeft = texture(u_pressureGrid, coords - u_stepX).x;
    float pRight = texture(u_pressureGrid, coords + u_stepX).x;
    float pTop = texture(u_pressureGrid, coords - u_stepY).x;
    float pBottom = texture(u_pressureGrid, coords + u_stepY).x;
    float pFront = texture(u_pressureGrid, coords - u_stepZ).x;
    float pRear = texture(u_pressureGrid, coords + u_stepZ).x;

    float pCenter = texture(u_pressureGrid, coords).x;

    vec3 mask = vec3(1.0, 1.0, 1.0);
    vec3 obstacleVelocity = vec3(0.0, 0.0, 0.0);

    if (abs(coords.x) <= u_stepX.x) {
        mask.x = 0.0;
        obstacleVelocity.x = 1.0;
        pLeft = pCenter;
    } else if (abs (1.0 - coords.x) <= u_stepX.x) {
        mask.x = 0.0;
        obstacleVelocity.x = -1.0;
        pRight = pCenter;
    }

    if (abs(coords.y) <= u_stepY.y) {
        mask.y = 0.0;
        obstacleVelocity.y = 1.0;
        pTop = pCenter;
    } else if (abs(1.0 - coords.y) <= u_stepY.y) {
        mask.y = 0.0;
        obstacleVelocity.y = -1.0;
        pBottom = pCenter;
    }

    if (abs(coords.z) <= u_stepZ.z) {
        mask.z = 0.0;
        obstacleVelocity.z = 1.0;
        pFront = pCenter;
    } else if (abs(1.0 - coords.z) <= u_stepZ.z) {
        mask.z = 0.0;
        obstacleVelocity.z = -1.0;
        pRear = pCenter;
    }

    vec3 gradP = 0.5 * vec3(pRight - pLeft, pBottom - pTop, pRear - pFront);

    vec3 oldVelocity = texture(u_grid, coords).xyz;
    vec3 newVelocity = oldVelocity - gradP;

    return vec4((mask * newVelocity) + obstacleVelocity, 1.0);

}

void main () {

    out_layer1 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}