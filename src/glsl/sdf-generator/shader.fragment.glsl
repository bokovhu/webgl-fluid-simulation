#version 300 es

precision highp float;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoord;

uniform int u_layerOffset;
uniform vec3 u_gridSize;
uniform float u_time;

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); 
}

float sdTorus( vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdSphere( vec3 p, float s ) {
  return length(p) - s;
}

float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float sdf (in vec3 p) {

    float val = sdSphere (
        p + vec3 ( 
            random (vec2 (1.0, 0.0)) * 3.0 - 1.5 + random(vec2(5.0, 0.0)) * cos (u_time * 2.0 * random(vec2(6.0, 0.0)) + random(vec2(11.0, 0.0))), 
            random (vec2 (2.0, 0.0)) * 3.0 - 1.5 + random(vec2(7.0, 0.0)) * cos (u_time * 2.0 * random(vec2(8.0, 0.0)) + random(vec2(12.0, 0.0))), 
            random (vec2 (3.0, 0.0)) * 3.0 - 1.5 + random(vec2(9.0, 0.0)) * cos (u_time * 2.0 * random(vec2(10.0, 0.0)) + random(vec2(13.0, 0.0)))
        ),
        random (vec2 (4.0, 0.0))
    );

    for (int i = 1; i < 10; i++) {
        val = opSmoothUnion (
            val,
            sdSphere (
                p + vec3 ( 
                    random (vec2 (1.0, float(i))) * 3.0 - 1.5 + random(vec2(5.0, float(i))) * cos (u_time * 2.0 * random(vec2(6.0, float(i))) + random(vec2(11.0, float(i)))), 
                    random (vec2 (2.0, float(i))) * 3.0 - 1.5 + random(vec2(7.0, float(i))) * cos (u_time * 2.0 * random(vec2(8.0, float(i))) + random(vec2(12.0, float(i)))), 
                    random (vec2 (3.0, float(i))) * 3.0 - 1.5 + random(vec2(9.0, float(i))) * cos (u_time * 2.0 * random(vec2(10.0, float(i))) + random(vec2(13.0, float(i))))
                ),
                random (vec2 (4.0, float(i) + 1.0))
            ),
            0.5
        );
    }

    return clamp (255.0 * val, 0.0, 255.0);
}

vec3 map (in vec3 p) {
    return 4.0 * (p * 2.0 - 1.0);
}

void main () {

    if (v_texCoord.x == 0.0 || v_texCoord.x == 1.0 || v_texCoord.y == 0.0 || v_texCoord.y == 1.0) {
        out_layer1 = vec4(255.0);
        out_layer2 = vec4(255.0);
        out_layer3 = vec4(255.0);
        out_layer4 = vec4(255.0);
    } else {

        vec3 p1 = vec3 (
            v_texCoord.x,
            v_texCoord.y,
            ( float(u_layerOffset) + 0.0 ) / u_gridSize.z
        );
        vec3 p2 = vec3 (
            v_texCoord.x,
            v_texCoord.y,
            ( float(u_layerOffset) + 1.0 ) / u_gridSize.z
        );
        vec3 p3 = vec3 (
            v_texCoord.x,
            v_texCoord.y,
            ( float(u_layerOffset) + 2.0 ) / u_gridSize.z
        );
        vec3 p4 = vec3 (
            v_texCoord.x,
            v_texCoord.y,
            ( float(u_layerOffset) + 3.0 ) / u_gridSize.z
        );

        out_layer1 = vec4(sdf(map (p1)));
        out_layer2 = vec4(sdf(map (p2)));
        out_layer3 = vec4(sdf(map (p3)));
        out_layer4 = vec4(sdf(map (p4)));

    }

}