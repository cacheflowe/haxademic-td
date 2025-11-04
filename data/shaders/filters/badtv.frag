// badtv.glsl converted for TouchDesigner GLSL TOP
// Original: alteredq / http://alteredqualia.com/
// Film grain & scanlines shader
// Ported and adapted for TouchDesigner by Copilot

// TouchDesigner uniforms
uniform float uTime;
uniform int uGrayscale;
uniform float uNIntensity;
uniform float uSIntensity;
uniform float uSCount;

uniform float iTime;

out vec4 fragColor;

void main() {
    vec4 color = texture(sTD2DInputs[0], vUV);

    float x = vUV.x * vUV.y * uTime * 1000.0;
    x = mod(x, 13.0) * mod(x, 123.0);
    float dx = mod(x, 0.01);

    vec3 cResult = color.rgb + color.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);

    vec2 sc = vec2(
        sin(vUV.y * uSCount),
        cos(vUV.y * uSCount)
    );
    cResult += color.rgb * vec3(sc.x, sc.y, sc.x) * uSIntensity;
    cResult = color.rgb + clamp(uNIntensity, 0.0, 1.0) * (cResult - color.rgb);

    if (uGrayscale == 1) {
        float gray = cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11;
        cResult = vec3(gray);
    }

    fragColor = TDOutputSwizzle(vec4(cResult, color.a));
}
