#version 300 es

precision mediump float;

in vec2 v_texCoords;

uniform sampler2D u_texture;

out vec4 out_color;

void main () {
    out_color = texture2D(u_texture, v_texCoords);
}