#version 300 es

precision highp float;

layout(location = 0) in vec3 a_vertexPosition;
layout(location = 1) in vec3 a_vertexNormal;

out vec3 v_vertexPosition;
out vec3 v_vertexNormal;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;

void main () {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4 (a_vertexPosition, 1.0);
    v_vertexNormal = a_vertexNormal;
    v_vertexPosition = (u_modelMatrix * vec4(a_vertexPosition, 1.0)).xyz;
}