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


/**
 * Usage notes:
 * Element is initialized with a `hidden` class which needs to be removed
 * for it to be visible, and then the `active` class needs to be added
 * for animation to actually start running.
 * NOTE(erwinm): Possibly create this as its own builtin component.
 * @return {!Element}
 */
export function createLoaderElement() {
  let placeholder = document.createElement('div');
  let loader = document.createElement('div');
  placeholder.appendChild(loader);

  placeholder.classList.add('-amp-hidden');
  placeholder.classList.add('-amp-autoplaceholder');
  loader.classList.add('-amp-loader');

  for (let i = 0; i < 3; i++) {
    let dot = document.createElement('div');
    dot.classList.add('-amp-loader-dot');
    loader.appendChild(dot);
  }
  return placeholder;
}
