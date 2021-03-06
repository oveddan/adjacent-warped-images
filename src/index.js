import regl from 'regl'
import { resolve } from 'url';
const mouse = require('mouse-change')()

// const warpFrag = require('./warp.frag');
// const warpVert = require('./warp.vert');
const vertexShader = require('./warp.vert');
const fragmentShader = require('./warp.frag');

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isiOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isiOS();
}

function getParameterByName(name) {
  const url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getImagePath() {
  const imagePath = getParameterByName('image') || 'library5.jpg';
  return `/src/${imagePath}`;
}

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
        if (isMobile()) return [0.5, 0.5];

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

        console.log(mouse.x, mouseX, mouse.y, mouseY);

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
      var imageTexture = reglInstance.texture(image);
      resolve(imageTexture);
    }
  })
}

let imageTexture;

const aspect = 1000 / 625;

function setCanvasSizes(canvases) {
  for(let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const { width } = canvas.parentElement.getBoundingClientRect();
    canvas.width = width;
    canvas.height = width / aspect;
  }
}

async function animateCanvases(canvases) {
  for(let i = 0; i < canvases.length; i++) {
    const canvas = canvases[i];
    const reglInstance = regl(canvas);

    const imagePath = getImagePath();

    const imageTexture = await loadImageTexture(reglInstance, imagePath);
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

function main() {
  const canvases = document.getElementsByClassName('warped');

  setCanvasSizes(canvases);
  animateCanvases(canvases);
}

document.addEventListener("DOMContentLoaded", function(event) { 
  main();
});
