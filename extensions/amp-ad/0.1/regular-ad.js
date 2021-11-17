import {AdFormatInterface} from './ad-format-interface';

export class RegularAd {
  /**
   * @param {!AMP.BaseElement} unusedBaseInstance
   */
  constructor(unusedBaseInstance) {}

  /** @override */
  validate() {}

  /** @override */
  shouldForceLayout() {
    return false;
  }

  /** @override */
  getScrollPromise() {
    return null;
  }

  /** @override */
  onAdPromiseResolved() {}

  /** @override */
  shouldAllowResizing(unusedNewWidth, unusedNewHeight) {
    return true;
  }

  /** @override */
  onResize() {}

  /** @override */
  onRenderStart(unusedInfo) {}

  /** @override */
  cleanUp() {}
}
