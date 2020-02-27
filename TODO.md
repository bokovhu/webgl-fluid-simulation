# Fluid simulation overview

1. Velocity diffusion
2. Pressure diffusion
3. Velocity confinement


## 1. Diffusion

### Algorithm

```
INPUT: 
    in:     float[Depth][Height][Width]
    out:    float[Depth][Height][Width]
    scale:  float
    dt:     float
STEPS:
    1) a := dt * scale
    2) Handle borders
        2.1) Handle front and back layers
            2.1.1) for (y := (1) -> (Height - 1))
                2.1.1.1) for (x := (1) -> (Width - 1))
                    2.1.1.1.1) out [0][y][x]            
                        = in [0][y][x] 
                            + a * ( 
                                in[0][y - 1][x] + 
                                in[0][y + 1][x] + 
                                in[0][y][x - 1] + 
                                in[0][y][x + 1] + 
                                in[1][y][x] 
                                - 5.0 * in[0][y][x] 
                            )
                    2.1.1.1.2) out [Depth - 1][y][x]   
                         = in [Depth - 1][y][x] 
                            + a * ( 
                                in[Depth - 1][y - 1][x] + 
                                in[Depth - 1][y + 1][x] + 
                                in[Depth - 1][y][x - 1] + 
                                in[Depth - 1][y][x + 1] + 
                                in[Depth - 2][y][x] 
                                - 5.0 * in[0][y][x] 
                            )
        2.2) Handle top and bottom layers
            2.2.1) for (z := (1) -> (Depth - 1))
                2.2.1.1) for (x := (1) -> (Width - 1))
                    2.2.1.1.1) out [z][0][x]            
                        = in [z][0][x] 
                            + a * ( 
                                in[z - 1][0][x] + 
                                in[z + 1][0][x] + 
                                in[z][0][x - 1] + 
                                in[z][0][x + 1] + 
                                in[z][1][x] 
                                - 5.0 * in[z][0][x] 
                            )
                    2.2.1.1.2) out [z][Height - 1][x]   
                        = in [z][Height - 1][x]
                            + a * (
                                in[z - 1][Height - 1][x] +
                                in[z + 1][Height - 1][x] + 
                                in[z][Height - 1][x - 1] +
                                in[z][Height - 1][x + 1] +
                                in[z][Height - 2][x]
                                - 5.0 * in[z][Height - 1][x]
                            )
```