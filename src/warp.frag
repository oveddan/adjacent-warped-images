#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uImage;
uniform vec2 uMouse;
varying vec2 v_texcoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform float width;//: reglInstance.context('viewportWidth'),
uniform float height;

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  
  float res = mix(
                  mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
                  mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
  return res*res;
}

#define PI 3.14

vec2 toRadialCoords(vec2 val, float scale) {
  return vec2(length(val) * scale, sin(val.y/length(val)) / PI);
}

float noisyWaveHeight(vec2 val) {
  vec2 xy = val - v_texcoord;
  return noise(toRadialCoords(xy, 1./20.) + sin(u_time / 2.) * cos(u_time / 2.));
}

vec2 noisyNormal(vec2 val) {
  float d = 1.;
  vec2 vdx = val + vec2(0., d);
  vec2 vdy = val + vec2(d, 0.);
  
  float n = noisyWaveHeight(val);
  float ndx = noisyWaveHeight(vdx);
  float ndy = noisyWaveHeight(vdy);
  
  return vec2(ndx - n, ndy - n) / d;
}

void main() {
  vec2 mouse = uMouse;
  float n = abs(noise(toRadialCoords(v_texcoord-mouse, 20.) + sin(u_time * PI * uMouse / 2.)));
  // n += abs(sin(u_time / 10.)) / 10.;
  float cursorStrength = smoothstep(.3, 0., length(mouse- v_texcoord));
  vec2 warpedPosition = v_texcoord + n  * cursorStrength;
  warpedPosition.y = 1.-clamp(warpedPosition.y, 0., 1.);
  warpedPosition.x = clamp(warpedPosition.x, 0., 1.);
  vec4 color = texture2D(uImage, warpedPosition);
  // color = texture2D(uImage, v_texcoord);
  // color = mix(color, vec4(0.), cursorStrength);
  // color = vec4(uMouse.x, uMouse.y, 0., 1.);
  // color = vec4(abs(n), 0., 0., 1.);
  // color = vec4(cursorStrength, 0., 0., 1.);
  gl_FragColor = color;
}