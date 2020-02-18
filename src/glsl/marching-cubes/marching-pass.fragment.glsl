#version 300 es

precision mediump float;
precision mediump sampler3D;

uniform sampler3D u_field;
uniform vec3 u_fieldSize;
uniform vec3 u_vertexOffset;
uniform vec3 u_scale;
uniform vec3 u_baseCoords;

layout(location = 0) out vec4 out_vertex1;
layout(location = 1) out vec4 out_vertex2;
layout(location = 2) out vec4 out_vertex3;

void main () {

    vec2 texPos = gl_FragCoord.xy;
    int layer = int (texPos.x / u_fieldSize.x);

    out_vertex1 = vec4(0.0);
    out_vertex2 = vec4(0.0);
    out_vertex3 = vec4(0.0);

}