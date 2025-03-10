# haxademic-td

A personal toolkit & demo playground

## TODO

- Bring in tox-saver from Dean
- Implement base_debug from ragan in our Debug extension
- Figure out licensing
- Bring in components from Gatorade

## GLSL infos

From: https ://docs.derivative.ca/Write_a_GLSL_TOP

Built-in uniforms & functions:
```glsl
// Helpers
uniform sampler2D sTDNoiseMap;  // A 256x256 8-bit Red-only channel texture that has random data.
uniform sampler1D sTDSineLookup; // A Red-only texture that goes from 0 to 1 in a sine shape.

// Noise functions
float TDPerlinNoise(vec2 v);
float TDPerlinNoise(vec3 v);
float TDPerlinNoise(vec4 v);
float TDSimplexNoise(vec2 v);
float TDSimplexNoise(vec3 v);
float TDSimplexNoise(vec4 v);

// Information about the textures
TDTexInfo uTDOutputInfo; // The current texture context
TDTexInfo uTD2DInfos[]; // only exists if inputs are connected 

// Converts between RGB and HSV color space
vec3 TDHSVToRGB(vec3 c);
vec3 TDRGBToHSV(vec3 c);

// Applies a small random noise to the color to help avoid banding in some cases.
vec4 TDDither(vec4 color);
```

Extras:
```glsl
#define PI     3.14159265358
#define TWO_PI 6.28318530718
```

Correct aspect ratio: 
```glsl
float width = 1./uTDOutputInfo.res.z;
float height = 1./uTDOutputInfo.res.w;
vec2 aspect = width * uTDOutputInfo.res.wz; // swizzle height/width
vec2 p = vUV.xy / aspect;
```


## Python snippets

[run()](https://derivative.ca/UserGuide/Run_Command_Examples)

```python
# Call a class function with a delay
run(lambda: self.BroadcastVals(), delayFrames=30)
# Call a global function with a delay
run("broadcastVals()", delayFrames=30)
# Call a function with an argument
run("TurnOff(args[0])", oldConnection, delayFrames=1)
# Call a script DAT with an argument and a delay
op('text_script_example').run('arg1=something', delayFrames=1)
```