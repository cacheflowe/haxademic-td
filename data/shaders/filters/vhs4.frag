// VHS effect adapted for TouchDesigner GLSL TOP
// Original: https://www.shadertoy.com/view/ltSSWV
// Author: JT (shaderview@protonmail.com), CC0

// TouchDesigner uniforms
uniform float iTime;

out vec4 fragColor;

#define PI 3.1415926

// Color channel separation
vec3 colorSplit(vec2 uv, vec2 s)
{
    vec3 color;
    color.r = texture(sTD2DInputs[0], uv - s).r;
    color.g = texture(sTD2DInputs[0], uv     ).g;
    color.b = texture(sTD2DInputs[0], uv + s).b;
    return color;
}

// Interlacing effect
vec2 interlace(vec2 uv, float s)
{
    uv.x += s * (4.0 * fract((uv.y * float(textureSize(sTD2DInputs[0], 0).y)) / 2.0) - 1.0);
    return uv;
}

// Fault (horizontal displacement)
vec2 fault(vec2 uv, float s)
{
    float v = pow(0.5 - 0.5 * cos(2.0 * PI * uv.y), 100.0) * sin(2.0 * PI * uv.y);
    uv.x += v * s;
    return uv;
}

// Random horizontal jitter using TouchDesigner noise
vec2 rnd(vec2 uv, float s)
{
    // Use TouchDesigner's built-in noise function for randomness
    float n = TDSimplexNoise(uv * 0.05);
    uv.x += s * (2.0 * n - 1.0);
    return uv;
}

void main()
{
    float t = iTime / 10.0;

    vec2 uv = vUV.xy;

    // Use noise for s value
    float s = TDSimplexNoise(vec2(t * 0.2, 0.5));

    uv = interlace(uv, s * 0.005);

    // Use noise for r value
    float r = TDSimplexNoise(vec2(t, 0.0));

    uv = fault(uv + vec2(0.0, fract(t * 2.0)), 5.0 * sign(r) * pow(abs(r), 5.0)) - vec2(0.0, fract(t * 2.0));
    uv = rnd(uv, s * 0.02);

    vec3 color = colorSplit(uv, vec2(s * 0.02, 0.0));

    // Mix with noise texture for extra glitch
    color = mix(color, vec3(TDSimplexNoise(uv * 1000. + t * 100.0)), 0.25);

    fragColor = TDOutputSwizzle(vec4(color, 1.0));
}
