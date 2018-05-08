attribute vec2 position;
uniform float angle, scale, width, height;

void main() {
  float aspect = width / height;
  gl_Position = vec4(
    scale * (cos(angle) * position.x - sin(angle) * position.y),
    aspect * scale * (sin(angle) * position.x + cos(angle) * position.y),
    0,
    1.0);
}