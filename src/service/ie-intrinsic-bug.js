/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../services';
import {closestAncestorElementBySelector} from '../dom';
import {getLengthNumeral} from '../layout';
import {transparentPng} from '../utils/img';

/**
 * IE can't handle auto-scaling SVG images used for intrinsic layout. Generate
 * a transparent PNG for SSR rendered sizers instead.
 * @param {!Window} win
 * @param {!../service/platform-impl.Platform=} opt_platform
 * @package
 */
export function ieIntrinsicCheckAndFix(win, opt_platform) {
  const platform = opt_platform || Services.platformFor(win);
  if (!platform.isIe()) {
    return;
  }

  const {document} = win;
  const intrinsics = document.querySelectorAll(
    '.i-amphtml-intrinsic-sizer[src^=data:image/svg]'
  );
  for (let i = 0; i < intrinsics.length; i++) {
    const intrinsic = intrinsics[i];
    const element = closestAncestorElementBySelector(
      intrinsic,
      '.i-amphtml-element'
    );
    if (!element) {
      continue;
    }
    const width = getLengthNumeral(element.getAttribute('width'));
    const height = getLengthNumeral(element.getAttribute('height'));
    if (width && height) {
      intrinsic.src = transparentPng(document, width, height);
    }
  }
}
