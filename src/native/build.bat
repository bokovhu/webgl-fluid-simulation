emsdk activate latest
emsdk_env
em++ wasm_marcher.cpp -o wasm_marcher.js -s SINGLE_FILE=1 -s MODULARIZE=1 -s EXPORT_NAME=WasmMarcher -s BINARYEN_METHOD='native-wasm' -s WASM=1 -s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']"