// vhs effect from: https://www.shadertoy.com/view/dtGyzR

uniform float iTime;

out vec4 fragColor;

// Replaced custom rand function with a lookup into TouchDesigner's noise texture.
float rand(vec2 co){
    // Use the red channel of the noise map for a random value.
    return texture(sTDNoiseMap, co).r;
}

void main()
{
    // --- Parameters ---
    float horz_wav_strength = 0.15;
    float horz_wav_screen_size = 50.0;
    float horz_wav_vert_size = 100.0;
    float dotted_noise_strength = 0.2;
    float horz_dist_strength = 1.0 / 115.0;
 
	vec2 uv = vUV.st;
    vec2 distorted_uv = uv;

    float time360 = mod(iTime, 360.0);

    // --- Generate random values ---
    float rand1 = rand(vec2(time360, time360));
    float rand2 = rand(vec2(time360, rand1));

    float rand1xy = rand(vec2(rand1 * uv.x, rand2 * uv.y));
    float rand2xy = rand(vec2(rand1 * uv.y, rand2 * uv.x));
  
    float rand1y = rand(vec2(rand1 * uv.y, rand2));
    float rand2y = rand(vec2(rand1y, rand1y));
        
    // --- Horizontal wave distortion ---
    distorted_uv.x -= rand1 * rand2 * horz_wav_strength * exp(-pow((uv.y - rand1) * horz_wav_vert_size, 2.0) / horz_wav_screen_size);
        
    vec4 outColor = texture(sTD2DInputs[0], distorted_uv);

    // --- Dotted noise and further horizontal displacement ---
    if (((rand2y / 100.0 > rand1y))) {
        if ((rand2xy < dotted_noise_strength)) {
            outColor = vec4(vec3(rand1xy), 1.0);
        }
    }
	else {
		distorted_uv.x += rand1y * horz_dist_strength * sin(uv.y * 3.141);
		outColor = texture(sTD2DInputs[0], fract(distorted_uv)); // fract to wrap UVs
	}

    fragColor = TDOutputSwizzle(outColor);
}