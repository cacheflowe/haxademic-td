// vhs effect from: https://www.shadertoy.com/view/dtGyzR

uniform float iTime;

out vec4 fragColor;

// VHS Scanline Effect
// by McStuffings 2023
// License: MIT

// Helper to generate noise from a vec2.
float noise(vec2 st) {
    return (TDSimplexNoise(st * 1000.) + 1.0) / 2.0; // Map from [-1, 1] to [0, 1]
}

// Helper to generate noise from a float (e.g., time).
float noise(float t) {
    return (TDSimplexNoise(vec2(t * 1000.)) + 1.0) / 2.0;
}

void main() {
    vec2 uv = vUV.st;
    vec2 res = uTDOutputInfo.res.xy; // TouchDesigner provides resolution here

    // Scanline settings
    float blendFactor = 0.1; // Use lower values for subtle scanline effect.
    float scanlineHeight = 4.0;
    float scanlineIntensity = 0.25;
    float scrollSpeed = 16.0; // Use +/- values for up/down movement.
    vec3 color = vec3(1.0, 1.0, 1.0);
    
    // Grain settings
    float grainIntensity = 2.0;
    vec2 grainSeed = vec2(12.9898, 78.233) + iTime * 0.4; // Varying the seed over time
    
    // Glitch settings
    // Use higher values in this section for extreme effect.
    float glitchProbability = 0.4;
    float glitchIntensityX = 0.001; // Intensity of the horizontal jitter
    float glitchIntensityY = .003; // Intensity of the vertical jitter
    
    // Vertical Band settings
    float bandSpeed = 0.2;
    float bandHeight = 0.01;
    float bandIntensity = 0.3;
    float bandChoppiness = 0.6;
    float staticAmount = 0.09;
    float warpFactor = .02;
    float chromaAmount = .4;
    
    // Moving VHS effect
    float scanline = sin((uv.y * res.y - iTime * scrollSpeed) * (1.0 / scanlineHeight));
    vec3 vhsColor = color * scanline * scanlineIntensity;

    // Grain effect
    float grain = noise(uv + grainSeed.x);
    vhsColor += grain * grainIntensity;

    // Glitch Effect
    if (noise(iTime) < glitchProbability) {
        float glitchOffsetX = (noise(iTime * 12.9898) - 0.5) * glitchIntensityX;
        float glitchOffsetY = (noise(iTime * 78.233) - 0.5) * glitchIntensityY;
        uv += vec2(glitchOffsetX, glitchOffsetY);
    }

    // VHS Band
    float bandPos = fract(iTime * bandSpeed);
    float bandNoise = noise(uv * res.y);

    if (abs(uv.y - bandPos) < bandHeight) {
        // Add static with choppiness
        float randomStatic = bandNoise * bandChoppiness;
        vhsColor += vec3(randomStatic) * staticAmount;

        // Add warp effect with choppiness
        uv.x += sin(uv.y * res.y * 10.0 + randomStatic) * warpFactor;

        // Chromatic aberration with choppiness
        vec3 chromaColor = vec3(
            texture(sTD2DInputs[0], uv + vec2(chromaAmount * randomStatic, 0.0)).r,
            texture(sTD2DInputs[0], uv).g,
            texture(sTD2DInputs[0], uv - vec2(chromaAmount * randomStatic, 0.0)).b
        );

        // Mix chromatic aberration with reduced intensity
        float adjustedIntensity = bandIntensity * (1.0 - randomStatic);
        vhsColor = mix(vhsColor, chromaColor, adjustedIntensity);
    }

    // Original color before applying scanlines (but after the glitch, noise, and vertical band)
    vec3 originalColor = texture(sTD2DInputs[0], uv).rgb;

    // Blend the original color with the VHS effect
    vec3 finalColor = mix(originalColor, vhsColor, blendFactor);
    fragColor = TDOutputSwizzle(vec4(finalColor, 1.0));
}
