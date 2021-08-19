/**
 * Sets the img src to the first url in the srcset if srcset is defined but
 * src is not for browsers that do not support srcset.
 * @param {!Element} img
 */
export function guaranteeSrcForSrcsetUnsupportedBrowsers(img) {
  // The <img> tag does not have a src and does not support srcset
  if (!img.hasAttribute('src') && 'srcset' in img == false) {
    const srcset = img.getAttribute('srcset');
    const matches = /\S+/.exec(srcset);
    if (matches == null) {
      return;
    }
    const srcseturl = matches[0];
    img.setAttribute('src', srcseturl);
  }
}

/**
 * Generates a transparent PNG of a given width/height.
 *
 * @param {!Document} doc
 * @param {number} width
 * @param {number} height
 * @return {string}
 */
export function transparentPng(doc, width, height) {
  const canvas = /** @type {!HTMLCanvasElement} */ (
    doc.createElement('canvas')
  );
  canvas.width = width;
  canvas.height = height;

  // Canvases are fully transparent by default, so we don't actually need to
  // draw anything.

  return canvas.toDataURL();
}
