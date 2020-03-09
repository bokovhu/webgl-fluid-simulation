#version 300 es

precision highp float;
precision highp sampler3D;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

uniform float u_viscosity;
uniform sampler3D u_grid;
uniform vec3 u_gridSize;
uniform int u_layerOffset;
uniform vec3 u_voxelStep;
uniform float u_timestep;

const float EPSILON = 0.0001;

vec4 diffuse (
    in vec3 coords
) {

    vec3 stepX = vec3(1.0 / u_gridSize.x, 0.0, 0.0);
    vec3 stepY = vec3(0.0, 1.0 / u_gridSize.y, 0.0);
    vec3 stepZ = vec3(0.0, 0.0, 1.0 / u_gridSize.z);

    if (abs(coords.x) <= stepX.x) {
        return texture(u_grid, coords);
    } else if (abs(1.0 - coords.x) <= stepX.x) {
        return texture(u_grid, coords);
    }

    if (abs(coords.y) <= stepY.y) {
        return texture(u_grid, coords);
    } else if (abs(1.0 - coords.y) <= stepY.y) {
        return texture(u_grid, coords);
    }

    if (abs(coords.z) <= stepZ.z) {
        return texture(u_grid, coords);
    } else if (abs(1.0 - coords.z) <= stepZ.z) {
        return texture(u_grid, coords);
    }

    vec3 velLeft = texture(u_grid, coords - stepX).xyz;
    vec3 velRight = texture(u_grid, coords + stepX).xyz;
    vec3 velTop = texture(u_grid, coords - stepY).xyz;
    vec3 velBottom = texture(u_grid, coords + stepY).xyz;
    vec3 velFront = texture(u_grid, coords - stepZ).xyz;
    vec3 velRear = texture(u_grid, coords + stepZ).xyz;

    vec3 vel = texture(u_grid, coords).xyz;

    float alpha = 1.0 / (u_viscosity * u_timestep);
    float beta = 1.0 / (6.0 + alpha);

    vec3 newVelocity = (velLeft + velRight + velBottom + velTop + velFront + velRear + alpha * vel) * beta;
    return vec4(newVelocity, 0.0);

}

void main () {

    vec3 p1 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 0.5 ) / u_gridSize.z
    );
    vec3 p2 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 1.5 ) / u_gridSize.z
    );
    vec3 p3 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 2.5 ) / u_gridSize.z
    );
    vec3 p4 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 3.5 ) / u_gridSize.z
    );

    out_layer1 = diffuse (p1);
    out_layer2 = diffuse (p2);
    out_layer3 = diffuse (p3);
    out_layer4 = diffuse (p4);

}