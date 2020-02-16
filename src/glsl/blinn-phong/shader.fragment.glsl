#version 300 es

#define LIGHT_POINT 1
#define LIGHT_DIRECTIONAL 2
#define LIGHT_SPOT 3

precision highp float;

in vec3 v_vertexPosition;
in vec3 v_vertexNormal;

uniform vec3 u_materialDiffuse;
uniform vec3 u_materialSpecular;
uniform float u_materialShininess;

uniform vec3 u_lightPosition;
uniform vec3 u_lightDirection;
uniform float u_lightFalloffLinear;
uniform float u_lightFalloffExponential;
uniform int u_lightType;
uniform vec3 u_lightIntensity;
uniform vec3 u_lightAmbient;

uniform vec3 u_viewPosition;

out vec4 out_color;

void main () {

    vec3 lightDir = normalize (-u_lightDirection);

    if (u_lightType == LIGHT_POINT) {
        lightDir = normalize (u_lightPosition - v_vertexPosition);
    }

    vec3 viewDir = normalize (u_viewPosition - v_vertexPosition);
    vec3 halfwayDir = normalize (lightDir + viewDir);

    vec3 ambient = u_materialDiffuse * u_lightAmbient;

    float diffuseContribution = max( dot (v_vertexNormal, lightDir), 0.0 );
    vec3 diffuse = u_materialDiffuse * u_lightIntensity;

    float specularContribution = pow ( max (dot (v_vertexNormal, halfwayDir), 0.0), u_materialShininess );
    vec3 specular = u_materialSpecular * u_lightIntensity;

    out_color = vec4 (
        ambient + diffuse * diffuseContribution + specular * specularContribution,
        1.0
    );
    
}