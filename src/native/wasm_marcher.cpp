#include <stddef.h>
#include <stdio.h>
#include <emscripten.h>

#ifdef __cplusplus
extern "C" {
#endif

uint32_t EMSCRIPTEN_KEEPALIVE calculateVertices (float* outVertices) {

    for (uint32_t i = 0; i < 128; i++) {
        outVertices [i] = 0.5;
    }

    return 128;

}

#ifdef __cplusplus
}
#endif