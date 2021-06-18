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

import * as Preact from './';

import {MediaQueryProps} from '#core/dom/media-query-props';
import {collectProps} from './parse-props';

/**
 * @param Ctor
 * @return {function() => void}
 */
export function getBuildDom(Ctor) {
  const fakeWindow = {matchMedia: () => null};
  const mediaQueryProps = new MediaQueryProps(fakeWindow, () => {});

  return function buildDom(doc, element) {
    const props = collectProps(
      Ctor,
      element,
      /* ref */ {current: null},
      /* default props */ {},
      mediaQueryProps
    );

    const vdom = Preact.createElement(Ctor['Component'], props);
    Preact.render(vdom, element);
  };
}
