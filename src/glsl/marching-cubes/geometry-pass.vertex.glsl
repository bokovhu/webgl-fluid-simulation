#version 300 es

precision highp float;
precision highp int;

layout(location = 0) in vec4 a_vertexPosition;

out vec2 v_texCoords;

uniform int u_numSheetRowsPerPass;
uniform int u_numSheetColsPerPass;

void main () {
    gl_Position = a_vertexPosition;
    v_texCoords = vec2 (
        (a_vertexPosition.x * 0.5 + 0.5) * float (u_numSheetColsPerPass),
        (1.0 - (a_vertexPosition.y * 0.5 + 0.5)) * float (u_numSheetRowsPerPass)
    );
}