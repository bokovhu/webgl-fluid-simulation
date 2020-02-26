#version 300 es

precision highp float;

layout(location = 0) in vec4 a_position;
out vec2 v_texCoord;

void main () {
    gl_Position = a_position;
    v_texCoord = vec2 (
        (a_position.x * 0.5 + 0.5),
        (1.0 - (a_position.y * 0.5 + 0.5))
    );
}