// This file is executed via Puppeteer's page.evaluate on a document to copy the
// current image data of the canvas to an attribute so that it will be passed in the
// snapshots to Percy.

const canvases = document.querySelectorAll('canvas');
canvases.forEach((canvas) => {
  const parentNode = canvas.parentElement;
  const img = document.createElement('img');
  img.style.width = '100%';
  img.style.height = '100%';
  img.setAttribute('src', canvas.toDataURL());
  parentNode.appendChild(img);
  parentNode.removeChild(canvas);
});
