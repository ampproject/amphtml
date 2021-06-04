/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {escapeCssSelectorIdent} from '../../../src/core/dom/css-selectors';
import {useEffect, useState} from '../../../src/preact';

/**
 * @param {{current: (Element|null)}} ref
 * @param {string|undefined} mediaQueryProp
 * @param {string|undefined} toolbarTargetProp
 */
export function useToolbarHook(ref, mediaQueryProp, toolbarTargetProp) {
  const [mediaQuery, setMediaQuery] = useState(null);
  const [toolbarTarget, setToolbarTarget] = useState(null);
  const [targetEl, setTargetEl] = useState(null);

  useEffect(() => {
    const doc = ref.current?.ownerDocument;
    if (!doc) {
      return;
    }

    const sanitizedToolbarTarget = escapeCssSelectorIdent(toolbarTargetProp);
    setToolbarTarget(sanitizedToolbarTarget);
    setTargetEl(doc.getElementById(sanitizedToolbarTarget));
  }, [toolbarTargetProp, ref]);

  useEffect(() => {
    const win = ref.current?.ownerDocument?.defaultView;
    if (!win) {
      return;
    }

    setMediaQuery(sanitizeMediaQuery(win, mediaQueryProp));
  }, [mediaQueryProp, ref]);

  useEffect(() => {
    const element = ref.current;
    const doc = ref.current?.ownerDocument;
    if (!doc || !targetEl || mediaQuery == null) {
      return;
    }

    const clone = element.cloneNode(true);
    const style = doc.createElement('style');
    style./*OK*/ textContent =
      `#${toolbarTarget}{display: none;}` +
      `@media ${mediaQuery}{#${toolbarTarget}{display: initial;}}`;

    targetEl.appendChild(clone);
    targetEl.appendChild(style);
    return () => {
      targetEl.removeChild(clone);
      targetEl.removeChild(style);
    };
  }, [mediaQuery, toolbarTarget, targetEl, ref]);
}

/**
 * @param {!Window} win
 * @param {string|undefined} query
 * @return {string}
 */
function sanitizeMediaQuery(win, query) {
  return win.matchMedia(query).media;
}
