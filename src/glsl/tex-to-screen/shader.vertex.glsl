#version 300 es

precision mediump float;

layout(location = 0) in vec4 a_vertexPosition;

out vec2 v_texCoords;

void main () {
    gl_Position = a_vertexPosition;
    vec2 ndc = a_vertexPosition.xy;
    ndc *= 0.5;
    ndc += vec2(0.5);
    ndc.y = 1.0 - ndc.y;
    v_texCoords = ndc;
}