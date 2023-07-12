/**
 * Sets the img src to the first url in the srcset if srcset is defined but
 * src is not for browsers that do not support srcset.
 * @param {Element} img
 */
export function guaranteeSrcForSrcsetUnsupportedBrowsers(img) {
  // The <img> tag does not have a src and does not support srcset
  if (!img.hasAttribute('src') && 'srcset' in img == false) {
    const srcset = img.getAttribute('srcset') || '';
    const matches = /\S+/.exec(srcset);
    if (matches == null) {
      return;
    }
    const srcseturl = matches[0];
    img.setAttribute('src', srcseturl);
  }
}
