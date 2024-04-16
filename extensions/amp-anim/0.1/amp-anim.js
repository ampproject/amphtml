import {guaranteeSrcForSrcsetUnsupportedBrowsers} from '#core/dom/img';
import {applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {observeIntersections} from '#core/dom/layout/viewport-observer';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import * as st from '#core/dom/style';
import {propagateObjectFitStyles} from '#core/dom/style';

import {dev} from '#utils/log';

const TAG = 'amp-anim';
const BUILD_ATTRIBUTES = [
  'alt',
  'aria-label',
  'aria-describedby',
  'aria-labelledby',
];
const LAYOUT_ATTRIBUTES = ['src', 'srcset'];
/** @visibleForTesting */
export const SRC_PLACEHOLDER =
  'data:image/gif;base64,' +
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

export class AmpAnim extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?UnlistenDef} */
    this.unobserveIntersections_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    this.img_ = new Image();
    this.img_.setAttribute('decoding', 'async');
    propagateAttributes(BUILD_ATTRIBUTES, this.element, this.img_);
    applyFillContent(this.img_, true);
    propagateObjectFitStyles(this.element, this.img_);

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      this.user().error(
        'AMP-ANIM',
        'Setting role=img on amp-anim elements ' +
          'breaks screen readers. Please just set alt or ARIA attributes, ' +
          'they will be correctly propagated for the underlying <img> ' +
          'element.'
      );
    }

    // The image is initially hidden if a placeholder is available.
    st.toggle(dev().assertElement(this.img_), !this.getPlaceholder());

    this.element.appendChild(this.img_);
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    const img = dev().assertElement(this.img_);
    // Remove missing attributes to remove the placeholder srcset if none is
    // specified on the element.
    propagateAttributes(
      LAYOUT_ATTRIBUTES,
      this.element,
      img,
      /* opt_removeMissingAttrs */ true
    );
    guaranteeSrcForSrcsetUnsupportedBrowsers(img);
    return this.loadPromise(img).then(() => {
      this.unobserveIntersections_ = observeIntersections(
        this.element,
        ({isIntersecting}) => this.viewportCallback_(isIntersecting)
      );
    });
  }

  /** @override */
  firstLayoutCompleted() {
    // Keep the placeholder: amp-anim is using it to start/stop playing.
  }

  /** @override */
  unlayoutCallback() {
    this.unobserveIntersections_?.();
    this.unobserveIntersections_ = null;
    this.viewportCallback_(false);
    // Release memory held by the image - animations are typically large.
    this.img_.src = SRC_PLACEHOLDER;
    this.img_.srcset = SRC_PLACEHOLDER;
    return true;
  }

  /**
   * @param {boolean} inViewport
   * @private
   */
  viewportCallback_(inViewport) {
    this.togglePlaceholder(!inViewport);
    st.toggle(dev().assertElement(this.img_), inViewport);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpAnim);
});
