#version 300 es

precision highp float;

layout(location = 0) in vec2 a_vertex;

uniform sampler2D u_vertex1Texture;
uniform sampler2D u_vertex2Texture;
uniform sampler2D u_vertex3Texture;

out vec3 v_vertexPosition;
out vec3 v_vertexNormal;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;

void main () {

    ivec2 tc = ivec2(int(a_vertex.x) * 1, int(a_vertex.y));
    int vertexIndex = gl_VertexID % 3;

    vec4 v1 = texelFetch(u_vertex1Texture, tc, 0);
    vec4 v2 = texelFetch(u_vertex2Texture, tc, 0);
    vec4 v3 = texelFetch(u_vertex3Texture, tc, 0);
    
    if (v1.w < 0.01) {
        gl_Position = vec4(0.0);
        v_vertexNormal = vec3(0.0);
        v_vertexPosition = vec3(0.0);
    } else {

        vec3 a = v3.xyz - v1.xyz;
        vec3 b = v2.xyz - v1.xyz;
        vec3 n = normalize (cross (a, b));

        vec3 vPos;

        if (vertexIndex == 0) {
            vPos = v1.xyz;
        } else if (vertexIndex == 1) {
            vPos = v2.xyz;
        } else {
            vPos = v3.xyz;
        }


        gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(vPos, 1.0);
        v_vertexNormal = n;
        v_vertexPosition = (vec4(vPos, 1.0)).xyz;

    }

}