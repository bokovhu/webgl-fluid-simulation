#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_pressureGrid;
uniform sampler3D u_velocityGrid;
uniform vec3 u_textureResolution;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

vec4 projectVelocity (in vec3 coords) {

    vec3 stepX = vec3(1.0 / u_textureResolution.x, 0.0, 0.0);
    vec3 stepY = vec3(0.0, 1.0 / u_textureResolution.y, 0.0);
    vec3 stepZ = vec3(0.0, 0.0, 1.0 / u_textureResolution.z);

    float pLeft = texture(u_pressureGrid, coords - stepX).x;
    float pRight = texture(u_pressureGrid, coords + stepX).x;
    float pTop = texture(u_pressureGrid, coords - stepY).x;
    float pBottom = texture(u_pressureGrid, coords + stepY).x;
    float pFront = texture(u_pressureGrid, coords - stepZ).x;
    float pRear = texture(u_pressureGrid, coords + stepZ).x;

    float pCenter = texture(u_pressureGrid, coords).x;

    vec3 mask = vec3(1.0, 1.0, 1.0);
    vec3 obstacleVelocity = vec3(0.0, 0.0, 0.0);

    if (abs(coords.x) <= stepX.x) {
        // return -1.0 * texture(u_velocityGrid, coords + stepX);
        mask.x = 0.0;
        obstacleVelocity.x = stepX.x;
        pLeft = pCenter;
    } else if (abs (1.0 - coords.x) <= stepX.x) {
        // return -1.0 * texture(u_velocityGrid, coords - stepX);
        mask.x = 0.0;
        obstacleVelocity.x = -stepX.x;
        pRight = pCenter;
    }

    if (abs(coords.y) <= stepY.y) {
        // return -1.0 * texture(u_velocityGrid, coords + stepY);
        mask.y = 0.0;
        obstacleVelocity.y = stepY.y;
        pTop = pCenter;
    } else if (abs(1.0 - coords.y) <= stepY.y) {
        // return -1.0 * texture(u_velocityGrid, coords - stepY);
        mask.y = 0.0;
        obstacleVelocity.y = -stepY.y;
        pBottom = pCenter;
    }

    if (abs(coords.z) <= stepZ.z) {
        // return -1.0 * texture(u_velocityGrid, coords + stepZ);
        mask.z = 0.0;
        obstacleVelocity.z = stepY.z;
        pFront = pCenter;
    } else if (abs(1.0 - coords.z) <= stepZ.z) {
        // return -1.0 * texture(u_velocityGrid, coords - stepZ);
        mask.z = 0.0;
        obstacleVelocity.z = -stepY.z;
        pRear = pCenter;
    }

    vec3 gradP = 0.5 * vec3(pRight - pLeft, pBottom - pTop, pRear - pFront);

    vec3 oldVelocity = texture(u_velocityGrid, coords).xyz;
    vec3 newVelocity = oldVelocity - gradP;

    return vec4((mask * newVelocity) + obstacleVelocity, 0.0);

}

void main () {

    out_layer1 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_textureResolution.z));
    out_layer2 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_textureResolution.z));
    out_layer3 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_textureResolution.z));
    out_layer4 = projectVelocity(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_textureResolution.z));

}