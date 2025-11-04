// badtv2.glsl converted for TouchDesigner GLSL TOP
// Original: https://www.shadertoy.com/view/ldXGW4
// Ported and adapted for TouchDesigner by Copilot

// TouchDesigner uniforms
uniform float iTime;

out vec4 fragColor;

// Effect toggles (set as uniforms or constants as needed)
float vertJerkOpt = 1.0;
float vertMovementOpt = 1.0;
float bottomStaticOpt = 1.0;
float scalinesOpt = 1.0;
float rgbOffsetOpt = 1.0;
float horzFuzzOpt = 1.0;

// Use TouchDesigner's built-in noise function
float snoise(vec2 v) {
    return TDSimplexNoise(v);
}

float staticV(vec2 uv) {
    float staticHeight = snoise(vec2(9.0, iTime * 1.2 + 3.0)) * 0.3 + 5.0;
    float staticAmount = snoise(vec2(1.0, iTime * 1.2 - 6.0)) * 0.1 + 0.3;
    float staticStrength = snoise(vec2(-9.75, iTime * 0.6 - 3.0)) * 2.0 + 2.0;
    return (1.0 - step(snoise(vec2(5.0 * pow(iTime, 2.0) + pow(uv.x * 7.0, 1.2), pow((mod(iTime, 100.0) + 100.0) * uv.y * 0.3 + 3.0, staticHeight))), staticAmount)) * staticStrength;
}

void main() {
    vec2 uv = vUV;

    float jerkOffset = (1.0 - step(snoise(vec2(iTime * 1.3, 5.0)), 0.8)) * 0.05;
    float fuzzOffset = snoise(vec2(iTime * 15.0, uv.y * 80.0)) * 0.003;
    float largeFuzzOffset = snoise(vec2(iTime * 1.0, uv.y * 25.0)) * 0.004;

    float vertMovementOn = (1.0 - step(snoise(vec2(iTime * 0.2, 8.0)), 0.4)) * vertMovementOpt;
    float vertJerk = (1.0 - step(snoise(vec2(iTime * 1.5, 5.0)), 0.6)) * vertJerkOpt;
    float vertJerk2 = (1.0 - step(snoise(vec2(iTime * 5.5, 5.0)), 0.2)) * vertJerkOpt;
    float yOffset = abs(sin(iTime) * 4.0) * vertMovementOn + vertJerk * vertJerk2 * 0.3;
    float y = mod(uv.y + yOffset, 1.0);

    float xOffset = (fuzzOffset + largeFuzzOffset) * horzFuzzOpt;

    float staticVal = 0.0;
    for (float yOff = -1.0; yOff <= 1.0; yOff += 1.0) {
        float maxDist = 5.0 / 200.0;
        float dist = yOff / 200.0;
        staticVal += staticV(vec2(uv.x, uv.y + dist)) * (maxDist - abs(dist)) * 1.5;
    }
    staticVal *= bottomStaticOpt;

    float red   = texture(sTD2DInputs[0], vec2(uv.x + xOffset - 0.01 * rgbOffsetOpt, y)).r + staticVal;
    float green = texture(sTD2DInputs[0], vec2(uv.x + xOffset, y)).g + staticVal;
    float blue  = texture(sTD2DInputs[0], vec2(uv.x + xOffset + 0.01 * rgbOffsetOpt, y)).b + staticVal;

    vec3 color = vec3(red, green, blue);
    float scanline = sin(uv.y * 800.0) * 0.04 * scalinesOpt;
    color -= scanline;

    fragColor = TDOutputSwizzle(vec4(color, 1.0));
}
