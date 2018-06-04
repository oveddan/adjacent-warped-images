# Images Warper for Adjacent

This includes a script to warp images at the position of the cursor.  On mobile, the warp position will be the center of the image.

## To add to a page:

See the [example index.html](index.html)

Add the script from [/dist/app.bundle.js](https://raw.githubusercontent.com/oveddan/adjacent-warped-images/master/dist/app.bundle.js) to the page.

For each image to warp, add the following type of canvas the page:

```html
<canvas class='warped' style='cursor:none' data-image='/src/library5.jpg'></canvas>
```

Change `data-image` to the path to the image element to load.  The script will load the image into the canvas and warp it at the position of the cursor using webgl.

## To develop

Install dependencies:

```bash
yarn
```

Start dev server:

```bash
yarn watch
```