// crt vibes from: https://www.shadertoy.com/view/WdjfDy

uniform float iTime;

out vec4 fragColor;

vec2 curve(vec2 uv)
{
	uv = (uv - 0.5) * 2.0;
	uv *= 1.1;	
	uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
	uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
	uv  = (uv / 2.0) + 0.5;
	uv =  uv *0.92 + 0.04;
	return uv;
}

void main()
{
	// vec4 color = texture(sTD2DInputs[0], vUV.st);
	vec2 uv = vUV.st;
	// uv = curve( uv );

	// Chromatic
	vec3 col;
	col.r = texture(sTD2DInputs[0], vec2(uv.x+0.003,uv.y)).x;
	col.g = texture(sTD2DInputs[0], vec2(uv.x+0.000,uv.y)).y;
	col.b = texture(sTD2DInputs[0], vec2(uv.x-0.003,uv.y)).z;

	col *= step(0.0, uv.x) * step(0.0, uv.y);
	col *= 1.0 - step(1.0, uv.x) * 1.0 - step(1.0, uv.y);

	// col *= 0.5 + 0.5*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y); // vignette
	// col *= vec3(0.95,1.05,0.95); // green tint

	col *= 0.9+0.1*sin(10.0*iTime+uv.y*500.0);
	col *= 0.99+0.01*sin(110.0*iTime);

	vec4 color = vec4(col,1.0);
	fragColor = TDOutputSwizzle(color);
}
