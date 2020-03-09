#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform sampler3D u_velocityGrid;
uniform sampler3D u_massGrid;
uniform vec3 u_gridSize;
uniform int u_layerOffset;
uniform vec3 u_stepX;
uniform vec3 u_stepY;
uniform vec3 u_stepZ;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

const float MAX_PRESSURE = 200.0;

float divergence (in vec3 coords) {

    float dx = texture(u_velocityGrid, coords + u_stepX).x - texture(u_velocityGrid, coords - u_stepX).x;
    float dy = texture(u_velocityGrid, coords + u_stepY).y - texture(u_velocityGrid, coords - u_stepY).y;
    float dz = texture(u_velocityGrid, coords + u_stepZ).z - texture(u_velocityGrid, coords - u_stepZ).z;

    return 0.5 * (dx + dy + dz);

}

vec4 computePressure (in vec3 coords) {

    /*
    float level = texture(u_massGrid, coords).x;
    if (level < 0.0) {
        return vec4(0.0);
    }*/

    float div = divergence (coords);

    float pLeft = texture(u_grid, coords - u_stepX).x;
    float pRight = texture(u_grid, coords + u_stepX).x;
    float pTop = texture(u_grid, coords - u_stepY).x;
    float pBottom = texture(u_grid, coords + u_stepY).x;
    float pFront = texture(u_grid, coords - u_stepZ).x;
    float pRear = texture(u_grid, coords + u_stepZ).x;
    float pCenter = texture(u_grid, coords).x;

    if (abs(coords.x) <= u_stepX.x) {
        // return /* texture(u_grid, coords + u_stepX) */ vec4(0.0);
        pLeft = pCenter;
        // return vec4(0.0);
        // return vec4(pRight);
    } else if (abs (1.0 - coords.x) <= u_stepX.x) {
        // return /* texture(u_grid, coords - u_stepX) */ vec4(0.0);
        pRight = pCenter;
        // return vec4(0.0);
        // return vec4(pLeft);
    }

    if (abs(coords.y) <= u_stepY.y) {
        // return /* texture(u_grid, coords - u_stepX) */ vec4(0.0);
        pTop = pCenter;
        // return vec4(0.0);
        // return vec4(pTop);
    } else if (abs(1.0 - coords.y) <= u_stepY.y) {
        // return /* texture(u_grid, coords - u_stepX) */ vec4(0.0);
        pBottom = pCenter;
        // return vec4(0.0);
        // return vec4(pBottom);
    }

    if (abs(coords.z) <= u_stepZ.z) {
        // return /* texture(u_grid, coords - u_stepX) */ vec4(0.0);
        pFront = pCenter;
        // return vec4(0.0);
        // return vec4(pRear);
    } else if (abs(1.0 - coords.z) <= u_stepZ.z) {
        // return /* texture(u_grid, coords - u_stepX) */ vec4(0.0);
        pRear = pCenter;
        // return vec4(0.0);
        // return vec4(pFront);
    }

    float mass = texture(u_massGrid, coords).x;
    float pressure = (1.0 / 6.0) * ( pLeft + pRight + pTop + pBottom + pFront + pRear - div );
    // pressure = clamp(pressure, -MAX_PRESSURE, MAX_PRESSURE);

    return vec4( pressure );

}

void main () {

    out_layer1 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 0.5) / u_gridSize.z));
    out_layer2 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 1.5) / u_gridSize.z));
    out_layer3 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 2.5) / u_gridSize.z));
    out_layer4 = computePressure(vec3 (v_texCoords.x, v_texCoords.y, (float(u_layerOffset) + 3.5) / u_gridSize.z));

}