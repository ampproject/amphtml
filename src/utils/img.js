/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
  const canvas = doc.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  // Canvases are fully transparent by default, so we don't actually need to
  // draw anything.

  return canvas.toDataURL();
}
