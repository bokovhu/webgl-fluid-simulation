#version 300 es

precision highp float;

layout(location = 0) in vec3 a_vertexPosition;

void main () {
    gl_Position = vec4 (a_vertexPosition, 1.0);
}