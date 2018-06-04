import regl from 'regl'
import { resolve } from 'url';
const mouse = require('mouse-change')()

// const warpFrag = require('./warp.frag');
// const warpVert = require('./warp.vert');
const vertexShader = require('./warp.vert');
const fragmentShader = require('./warp.frag');


function createWarper(reglInstance, canvas) {
  return reglInstance({
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
          mouseX = -Infinity;
        } else if (mouse.x > boundingRect.right) {
          mouseX = Infinity;
        } else {
          mouseX = mouse.x - boundingRect.left
        }

        let mouseY
        if (mouse.y >= boundingRect.bottom) {
          mouseY = Infinity;
        } else if (mouse.y < boundingRect.top) {
          mouseY = -Infinity; 
        } else {
          mouseY = drawingBufferHeight - (mouse.y - boundingRect.top)
        }

        return [mouseX / drawingBufferWidth, mouseY / drawingBufferHeight]
      },
      // Similarly there are shortcuts for accessing context variables
      width: reglInstance.context('viewportWidth'),
      height: reglInstance.context('viewportHeight'),
      uImage: reglInstance.prop('image')
    },

    count: 6
  })
}

function loadImageTexture(reglInstance, src) {
  return new Promise((resolve, reject) => {
    var image = new Image()
    image.src = src
    image.onload = function () {
      var imageTexture = reglInstance.texture(image, {
        wrapS: true,
        wrapT: true
      })
      resolve(imageTexture);
    }
  })
}

let imageTexture;

const aspect = 1000 / 625;

async function main() {
  const canvases = document.getElementsByClassName('warped');

  for(let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const { width } = canvas.parentElement.getBoundingClientRect();
    canvas.width = width;
    canvas.height = width / aspect;
    const reglInstance = regl(canvas);

    const imageTexture = await loadImageTexture(reglInstance, canvas.dataset.image);
    const warper = createWarper(reglInstance, canvas);

    reglInstance.frame(context => {
      warper({
        scale: 0.5 * Math.sin(new Date().getTime() / 1000),
        speed: 2,
        image: imageTexture
      });
    })
  }
}

main();
