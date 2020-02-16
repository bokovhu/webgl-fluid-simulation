import { EPSILON } from './constants';
import { vec3 } from 'gl-matrix';

export function vertexInterpolate(p1, p2, v1, v2, level) {
    if (Math.abs(level - v1) < EPSILON) {
        return p1;
    }

    if (Math.abs(level - v2) < EPSILON) {
        return p2;
    }

    if (Math.abs(v1 - v2) < EPSILON) {
        return p1;
    }

    let alpha = (level - v1) / (v2 - v1);

    return vec3.fromValues(
        p1[0] + (p2[0] - p1[0]) * alpha,
        p1[1] + (p2[1] - p1[1]) * alpha,
        p1[2] + (p2[2] - p1[2]) * alpha
    );
}

export function calculateCorners(x, y, z) {
    return [
        [ x, y, z ],
        [ x + 1, y, z ],
        [ x + 1, y, z + 1 ],
        [ x, y, z + 1 ],
        [ x, y + 1, z ],
        [ x + 1, y + 1, z ],
        [ x + 1, y + 1, z + 1 ],
        [ x, y + 1, z + 1 ]
    ];
}

export function calculateWorldCorners(corners, vsx, vsy, vsz) {
    return [
        [ corners[0][0] * vsx, corners[0][1] * vsy, corners[0][2] * vsz ],
        [ corners[1][0] * vsx, corners[1][1] * vsy, corners[1][2] * vsz ],
        [ corners[2][0] * vsx, corners[2][1] * vsy, corners[2][2] * vsz ],
        [ corners[3][0] * vsx, corners[3][1] * vsy, corners[3][2] * vsz ],
        [ corners[4][0] * vsx, corners[4][1] * vsy, corners[4][2] * vsz ],
        [ corners[5][0] * vsx, corners[5][1] * vsy, corners[5][2] * vsz ],
        [ corners[6][0] * vsx, corners[6][1] * vsy, corners[6][2] * vsz ],
        [ corners[7][0] * vsx, corners[7][1] * vsy, corners[7][2] * vsz ]
    ];
}
