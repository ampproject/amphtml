/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to copy the current image data of the canvas to an attribute so that
 * it will be passed in the snapshots to Percy.
 */

const canvases = document.querySelectorAll('canvas');
canvases.forEach((canvas) => {
  const img = document.createElement('img');
  img.style.width = '100%'; // eslint-disable-line local/no-style-property-setting
  img.style.height = '100%'; // eslint-disable-line local/no-style-property-setting
  img.setAttribute('src', canvas.toDataURL());
  canvas.replaceWith(img);
});
