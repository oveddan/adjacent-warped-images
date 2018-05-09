import regl from 'regl'
import { resolve } from 'url';
const mouse = require('mouse-change')()

// const warpFrag = require('./warp.frag');
// const warpVert = require('./warp.vert');
const canvas = document.getElementById('canvas');
const reglInstance = regl(canvas);

const vertexShader = require('./warp.vert');
const fragmentShader = require('./warp.frag');


const drawTextureImage = reglInstance({
  frag: fragmentShader,
  vert: vertexShader,

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

      return [mouseX / drawingBufferWidth, mouseY / drawingBufferHeight]
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
  imageTexture = await loadImageTexture('/src/library5.jpg');

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
