# Marching cubes possible memory layouts

* 3-dimensional array
    * Marcher input is a block to process
* 2-dimensional array - Each sub-array is a complete sheet
    * Marcher input is the starting and ending sheet to process
* 1-dimensional array - All values of the 3D texture in a single continous array
    * Marcher input is the starting and ending index to process

# Marching cubes test cases

* Simplex noise
* Sphere in the middle
* Random values

# Marchers

* Pure JavaScript marcher
* WebAssembly marcher
* GPU marcher

| Marcher | Memory layout type | Test case | Performance (frame time in ms) |
| Pure JS | 1D array | Simplex noise | |
| Pure JS | 2D array | Simplex noise | |
| Pure JS | 3D array | Simplex noise | |
| WebAssembly | 1D array | Simplex noise | |
| WebAssembly | 2D array | Simplex noise | |
| WebAssembly | 3D array | Simplex noise | |
