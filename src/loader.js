/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {isExperimentOn} from './experiments';

/** @private @const */
const LINE_LOADER_ELEMENTS = {
  'AMP-AD': true,
};

/**
 * Creates a default "loading indicator" element. This element accepts
 * `amp-active` class in which case it may choose to run an animation.
 * @param {!Document} doc
 * @param {!string} elementName
 * @return {!Element}
 */
export function createLoaderElement(doc, elementName) {
  const loader = doc.createElement('div');
  if (LINE_LOADER_ELEMENTS[elementName.toUpperCase()]) {
    loader.classList.add('i-amphtml-loader-line');
    const line = doc.createElement('div');
    line.classList.add('i-amphtml-loader-moving-line');
    // Experiment with new loader design
    const win = doc.defaultView;
    if (isExperimentOn(win, 'ad-loader-v1')
        || isExperimentOn(win, 'ad-loader-v2')) {
      line.setAttribute('experiment', '');
    };
    loader.appendChild(line);
  } else {
    loader.classList.add('i-amphtml-loader');
    for (let i = 0; i < 3; i++) {
      const dot = doc.createElement('div');
      dot.classList.add('i-amphtml-loader-dot');
      loader.appendChild(dot);
    }
  }
  return loader;
}
