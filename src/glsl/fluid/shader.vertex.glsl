#version 300 es

precision highp float;

layout(location = 0) in vec4 a_vertexPosition;

out vec2 v_texCoords;

void main () {
    gl_Position = a_vertexPosition;
    v_texCoords = vec2 (
        (0.5 * a_vertexPosition.x + 0.5),
        1.0 - (0.5 * a_vertexPosition.y + 0.5)
    );
}