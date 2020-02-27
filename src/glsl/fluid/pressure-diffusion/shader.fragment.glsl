#version 300 es

precision highp float;
precision highp sampler3D;

layout(location = 0) out vec4 out_layer1;
layout(location = 1) out vec4 out_layer2;
layout(location = 2) out vec4 out_layer3;
layout(location = 3) out vec4 out_layer4;

in vec2 v_texCoords;

uniform float u_diffusionScale;
uniform sampler3D u_pressureGrid;
uniform vec3 u_gridSize;
uniform int u_layerOffset;
uniform vec3 u_voxelStep;
uniform float u_timestep;


const float EPSILON = 0.0001;

vec4 diffuseCorner (in vec3 coords) {

    float a = u_timestep * u_diffusionScale;

    vec4 v = texture(u_pressureGrid, coords);

    if (coords.z < EPSILON) {
        // Front layer
        if (coords.y < EPSILON) {
            // Top row
            if (coords.x < EPSILON) {
                // Top left corner
                return v
                    + a * ( 
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0)) 
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else if (abs(1.0 - coords.x) < EPSILON) {
                // Top right corner
                return v 
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else {
                // This shouldn't be a corner
                return v;
            }
        } else if (abs (1.0 - coords.y) < EPSILON) {
            // Bottom row
            if (coords.x < EPSILON) {
                // Bottom left corner
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else if (abs (1.0 - coords.x) < EPSILON) {
                // Bottom right corner
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else {
                // This shouldn't be a corner
                return v;
            }
        } else {
            // This shouldn't be a corner
            return v;
        }
    } else if (abs (1.0 - coords.z) < EPSILON) {
        // Rear layer
        if (coords.y < EPSILON) {
            // Top row
            if (coords.x < EPSILON) {
                // Top left corner
                return v
                    + a * ( 
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0)) 
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else if (abs(1.0 - coords.x) < EPSILON) {
                // Top right corner
                return v 
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else {
                // This shouldn't be a corner
                return v;
            }
        } else if (abs (1.0 - coords.y) < EPSILON) {
            // Bottom row
            if (coords.x < EPSILON) {
                // Bottom left corner
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else if (abs (1.0 - coords.x) < EPSILON) {
                // Bottom right corner
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 3.0 * v
                    );
            } else {
                // This shouldn't be a corner
                return v;
            }
        } else {
            // This shouldn't be a corner
            return v;
        }
    } else {
        // This shouldn't be a corner
        return v;
    }

}

vec4 diffuseEdge (in vec3 coords) {

    float a = u_timestep * u_diffusionScale;

    // With edges, (X,Y), (X,Z) or (Y,Z) are constants
    vec4 v = texture (u_pressureGrid, coords);

    if (coords.z < EPSILON) {
        // Edge in the front layer
        if (coords.y < EPSILON) {
            // Top row edge
            return v
                + a * (
                    texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                    + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                    - 4.0 * v
                );
        } else if (abs (1.0 - coords.y) < EPSILON) {
            // Bottom row edge
            return v
                + a * (
                    texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                    + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                    - 4.0 * v
                );
        } else {
            // Not a (Y,Z) edge
            if (coords.x < EPSILON) {
                // Left edge
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else if (abs (1.0 - coords.x) < EPSILON) {
                // Right edge
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else {
                // Shouldn't be a possible edge
                return v;
            }
        }
    } else if (abs(1.0 - coords.z) < EPSILON) {
        // Edge in the rear layer
        if (coords.y < EPSILON) {
            // Top row edge
            return v
                + a * (
                    texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                    + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                    - 4.0 * v
                );
        } else if (abs (1.0 - coords.y) < EPSILON) {
            // Bottom row edge
            return v
                + a * (
                    texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                    + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                    + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                    - 4.0 * v
                );
        } else {
            // Not a (Y,Z) edge
            if (coords.x < EPSILON) {
                // Left edge
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else if (abs (1.0 - coords.x) < EPSILON) {
                // Right edge
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else {
                // Shouldn't be a possible edge
                return v;
            }
        }
    } else {
        // It's an (X,Y) edge
        if (coords.x < EPSILON) {
            // Left side of the cube
            if (coords.y < EPSILON) {
                // Top left edge from front to back
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else if (abs(1.0 - coords.y) < EPSILON) {
                // Bottom left edge from front to back
                return v
                    + a * (
                        texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else {
                // Shouldn't be a possible edge
                return v;
            }
        } else if (abs(1.0 - coords.x) < EPSILON) {
            // Right side of the cube
            if (coords.y < EPSILON) {
                // Top right edge from front to back
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else if (abs(1.0 - coords.y) < EPSILON) {
                // Bottom right edge from front to back
                return v
                    + a * (
                        texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                        + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                        + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                        + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                        - 4.0 * v
                    );
            } else {
                // Shouldn't be a possible edge
                return v;
            }
        } else {
            // Shouldn't be a possible edge
            return v;
        }
    }

}

vec4 diffuseXYPlane (in vec3 coords) {

    float a = u_timestep * u_diffusionScale;

    // XY Plane --> Z = constant
    vec4 v = texture (u_pressureGrid, coords);

    if (coords.z < EPSILON) {
        // Front XY plane
        return v 
            + a * (
                texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                - 5.0 * v
            );
    } else if (abs (1.0 - coords.z) < EPSILON) {
        // Rear XY plane
        return v
            + a * (
                texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                - 5.0 * v
            );
    } else {
        // This isn't an edge-case XY plane
        return v;
    }

}

vec4 diffuseZXPlane (in vec3 coords) {

    float a = u_timestep * u_diffusionScale;

    // ZX plane --> Y = constant
    vec4 v = texture (u_pressureGrid, coords);

    if (coords.y < EPSILON) {
        // Top ZX plane
        return v
            + a * (
                texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                - 5.0 * v
            );
    } else if (abs(1.0 - coords.y) < EPSILON) {
        // Bottom ZX plane
        return v
            + a * (
                texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                - 5.0 * v
            );
    } else {
        // This isn't an edge-case ZX plane
        return v;
    }

}

vec4 diffuseYZPlane (in vec3 coords) {

    float a = u_timestep * u_diffusionScale;

    // YZ plane --> X = constant
    vec4 v = texture (u_pressureGrid, coords);

    if (coords.x < EPSILON) {
        // Left YZ plane
        return v
            + a * (
                texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                - 5.0 * v
            );
    } else if (abs(1.0 - coords.x) < EPSILON) {
        // Right YZ plane
        return v
            + a * (
                texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
                + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
                + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
                - 5.0 * v
            );
    } else {
        // This isn't an edge-case ZX plane
        return v;
    }

}

vec4 diffuseInside (in vec3 coords) {
    
    float a = u_timestep * u_diffusionScale;

    // YZ plane --> X = constant
    vec4 v = texture (u_pressureGrid, coords);

    return v
        + a * (
            texture (u_pressureGrid, coords + vec3(u_voxelStep.x, 0.0, 0.0))
            + texture (u_pressureGrid, coords - vec3(u_voxelStep.x, 0.0, 0.0))
            + texture (u_pressureGrid, coords + vec3(0.0, u_voxelStep.y, 0.0))
            + texture (u_pressureGrid, coords - vec3(0.0, u_voxelStep.y, 0.0))
            + texture (u_pressureGrid, coords + vec3(0.0, 0.0, u_voxelStep.z))
            + texture (u_pressureGrid, coords - vec3(0.0, 0.0, u_voxelStep.z))
            - 6.0 * v
        );

}

int numEdgeCaseCoords (in vec3 coords) {
    int n = 0;
    n = n + ((coords.x < EPSILON || abs(1.0 - coords.x) < EPSILON) ? 1 : 0);
    n = n + ((coords.y < EPSILON || abs(1.0 - coords.y) < EPSILON) ? 1 : 0);
    n = n + ((coords.z < EPSILON || abs(1.0 - coords.z) < EPSILON) ? 1 : 0);
    return n;
}

vec4 diffuse (
    in vec3 coords
) {

    int n = numEdgeCaseCoords (coords);
    if (n == 0) {
        // Simple, "inside everything" diffusion
        return diffuseInside (coords);
    } else if (n == 1) {
        // Edge plane
        if (coords.x < EPSILON || abs(1.0 - coords.x) < EPSILON) {
            return diffuseYZPlane (coords);
        } else if (coords.y < EPSILON || abs(1.0 - coords.y) < EPSILON) {
            return diffuseZXPlane (coords);
        } else if (coords.z < EPSILON || abs(1.0 - coords.z) < EPSILON) {
            return diffuseXYPlane (coords);
        } else {
            // Don't know about this
            return texture (u_pressureGrid, coords);
        }
    } else if (n == 2) {
        // It's an edge
        return diffuseEdge (coords);
    } else if (n == 3) {
        // It's a corner
        return diffuseCorner (coords);
    } else {
        // Don't know about this
        return texture (u_pressureGrid, coords);
    }

}

void main () {

    vec3 p1 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) ) / u_gridSize.z
    );
    vec3 p2 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 1.0 ) / u_gridSize.z
    );
    vec3 p3 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 2.0 ) / u_gridSize.z
    );
    vec3 p4 = vec3 (
        v_texCoords.x,
        v_texCoords.y,
        ( float(u_layerOffset) + 3.0 ) / u_gridSize.z
    );

    out_layer1 = diffuse (p1);
    out_layer2 = diffuse (p2);
    out_layer3 = diffuse (p3);
    out_layer4 = diffuse (p4);

}