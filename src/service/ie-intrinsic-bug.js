import {transparentPng} from '#core/dom/img';
import {getLengthNumeral} from '#core/dom/layout';
import {closestAncestorElementBySelector} from '#core/dom/query';

import {Services} from '#service';

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
    '.i-amphtml-intrinsic-sizer[src^="data:image/svg"]'
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
