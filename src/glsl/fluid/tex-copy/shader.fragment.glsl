#version 300 es

precision highp float;
precision highp sampler3D;

uniform sampler3D u_grid;
uniform vec3 u_gridSize;
uniform int u_layerOffset;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

void main () {

    out_layer1 = texelFetch(
        u_grid, 
        ivec3 (
            int(v_texCoords.x * u_gridSize.x), 
            int(v_texCoords.y * u_gridSize.y), 
            u_layerOffset + 0
        ),
        0
    );
    out_layer2 = texelFetch(
        u_grid, 
        ivec3 (
            int(v_texCoords.x * u_gridSize.x), 
            int(v_texCoords.y * u_gridSize.y), 
            u_layerOffset + 1
        ),
        0
    );
    out_layer3 = texelFetch(
        u_grid, 
        ivec3 (
            int(v_texCoords.x * u_gridSize.x), 
            int(v_texCoords.y * u_gridSize.y), 
            u_layerOffset + 2
        ),
        0
    );
    out_layer4 = texelFetch(
        u_grid, 
        ivec3 (
            int(v_texCoords.x * u_gridSize.x), 
            int(v_texCoords.y * u_gridSize.y), 
            u_layerOffset + 3
        ),
        0
    );
}