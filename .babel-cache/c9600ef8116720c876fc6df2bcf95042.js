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

import { transparentPng } from "../core/dom/img";
import { getLengthNumeral } from "../core/dom/layout";
import { closestAncestorElementBySelector } from "../core/dom/query";

import { Services } from "./";

/**
 * IE can't handle auto-scaling SVG images used for intrinsic layout. Generate
 * a transparent PNG for SSR rendered sizers instead.
 * @param {!Window} win
 * @param {!../service/platform-impl.Platform=} opt_platform
 * @package
 */
export function ieIntrinsicCheckAndFix(win, opt_platform) {
  var platform = opt_platform || Services.platformFor(win);
  if (!platform.isIe()) {
    return;
  }

  var document = win.document;
  var intrinsics = document.querySelectorAll(
  '.i-amphtml-intrinsic-sizer[src^="data:image/svg"]');

  for (var i = 0; i < intrinsics.length; i++) {
    var intrinsic = intrinsics[i];
    var element = closestAncestorElementBySelector(
    intrinsic,
    '.i-amphtml-element');

    if (!element) {
      continue;
    }
    var width = getLengthNumeral(element.getAttribute('width'));
    var height = getLengthNumeral(element.getAttribute('height'));
    if (width && height) {
      intrinsic.src = transparentPng(document, width, height);
    }
  }
}
// /Users/mszylkowski/src/amphtml/src/service/ie-intrinsic-bug.js