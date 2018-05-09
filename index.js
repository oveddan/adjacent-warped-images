import regl from 'regl'
import { resolve } from 'url';
const mouse = require('mouse-change')()

// const warpFrag = require('./warp.frag');
// const warpVert = require('./warp.vert');
var fs = require('fs');

var str = fs.readFileSync('./warp.frag', 'utf8');

const canvas = document.getElementById('canvas');
const reglInstance = regl(canvas);



const drawTextureImage = reglInstance({
  frag: `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform sampler2D uImage;
    uniform vec2 uMouse;
    varying vec2 v_texcoord;
    uniform float u_time;

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
      float n = noise(toRadialCoords(v_texcoord-uMouse, 1./10.) + sin(u_time * 2.));
      float cursorStrength = smoothstep(.02, 0., length(uMouse- v_texcoord));
      vec4 color = texture2D(uImage, v_texcoord+ n * 10. * cursorStrength);
      // color = vec4(uMouse.x, uMouse.y, 0., 1.);
      gl_FragColor = color;
    }
  `,
  vert: `
    attribute vec2 a_position;
    attribute vec2 a_texcoord;
    varying vec2 v_texcoord;

    void main() {
      gl_Position = vec4(a_position, 0., 1.);;
      v_texcoord = a_texcoord;
    }
  `,

  attributes: {
    a_texcoord: [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0],
    a_position: [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]
  },
  context: {
    boundingRect: () => canvas.getBoundingClientRect()
  },
  uniforms: {
    //
    // Dynamic properties can be functions.  Each function gets passed:
    //
    //  * context: which contains data about the current regl environment
    //  * props: which are user specified arguments
    //  * batchId: which is the index of the draw command in the batch
    //
    u_time: reglInstance.context('time'),
    uMouse: function({boundingRect, drawingBufferWidth, drawingBufferHeight}) {
      let mouseX
      if (mouse.x <= boundingRect.left) {
        mouseX = 0
      } else if (mouse.x > boundingRect.right) {
        mouseX = drawingBufferWidth
      } else {
        mouseX = mouse.x - boundingRect.left
      }

      let mouseY
      if (mouse.y >= boundingRect.bottom) {
        mouseY = 0
      } else if (mouse.y < boundingRect.top) {
        mouseY = drawingBufferHeight
      } else {
        mouseY = drawingBufferHeight - (mouse.y - boundingRect.top)
      }

       console.log([mouseX / boundingRect.width, mouseY / boundingRect.height])
      return [mouseX / boundingRect.width, mouseY / boundingRect.height]
    },
    // Similarly there are shortcuts for accessing context variables
    width: reglInstance.context('viewportWidth'),
    height: reglInstance.context('viewportHeight'),
    uImage: reglInstance.prop('image')
    //
    // which is the same as writing:
    //
    // width: function (context) {
    //    return context.viewportWidth
    // }
    //
  },

  count: 6
})

function loadImageTexture(src) {
  return new Promise((resolve, reject) => {
    var image = new Image()
    image.src = src
    image.onload = function () {
      var imageTexture = reglInstance.texture(image)
      resolve(imageTexture);
    }
  })
}

let imageTexture;

async function main() {
  imageTexture = await loadImageTexture('/library5.jpg');

  function animate() {
    drawTextureImage({
      scale: 0.5 * Math.sin(new Date().getTime() / 1000),
      speed: 2,
      image: imageTexture
    });

    requestAnimationFrame(animate);
  }

  animate();
}

main();
