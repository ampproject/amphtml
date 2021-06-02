/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
