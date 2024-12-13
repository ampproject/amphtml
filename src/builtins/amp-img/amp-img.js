import {ReadyState_Enum} from '#core/constants/ready-state';
import {isServerRendered, removeElement} from '#core/dom';
import {guaranteeSrcForSrcsetUnsupportedBrowsers} from '#core/dom/img';
import {
  Layout_Enum,
  applyFillContent,
  isLayoutSizeDefined,
} from '#core/dom/layout';
import {propagateAttributes} from '#core/dom/propagate-attributes';
import {scopedQuerySelector} from '#core/dom/query';
import {propagateObjectFitStyles, setImportantStyles} from '#core/dom/style';
import * as mode from '#core/mode';

import {Services} from '#service';
import {registerElement} from '#service/custom-element-registry';

import {listen} from '#utils/event-helper';
import {dev} from '#utils/log';

import {BaseElement} from '../../base-element';

/** @const {string} */
const TAG = 'amp-img';

/**
 * Attributes to propagate to internal image when changed externally.
 * @type {!Array<string>}
 */
export const ATTRIBUTES_TO_PROPAGATE = [
  'alt',
  'aria-describedby',
  'aria-label',
  'aria-labelledby',
  'crossorigin',
  'referrerpolicy',
  'title',
  'importance',
  'sizes',
  'srcset',
  'src',
];

export class AmpImg extends BaseElement {
  /** @override  */
  static R1() {
    return R1_IMG_DEFERRED_BUILD;
  }

  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @override  */
  static usesLoading() {
    return true;
  }

  /** @override  */
  static getPreconnects(element) {
    const src = element.getAttribute('src');
    if (src) {
      return [src];
    }

    // NOTE(@wassgha): since parseSrcset is computationally expensive and can
    // not be inside the `buildCallback`, we went with preconnecting to the
    // `src` url if it exists or the first srcset url.
    const srcset = element.getAttribute('srcset');
    if (srcset) {
      // We try to find the first url in the srcset
      const srcseturl = /\S+/.exec(srcset);
      // Connect to the first url if it exists
      if (srcseturl) {
        return [srcseturl[0]];
      }
    }

    return null;
  }

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {boolean} */
    this.allowImgLoadFallback_ = true;

    /** @private {?Element} */
    this.img_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenLoad_ = null;

    /** @private {?UnlistenDef} */
    this.unlistenError_ = null;

    /**
     * The current width used by the automatically generated sizes attribute
     * @private {number}
     * */
    this.sizesWidth_ = 0;
  }

  /** @override */
  mutatedAttributesCallback(mutations) {
    if (this.img_) {
      const attrs = ATTRIBUTES_TO_PROPAGATE.filter(
        (value) => mutations[value] !== undefined
      );
      // Mutating src should override existing srcset, so remove the latter.
      if (
        mutations['src'] &&
        !mutations['srcset'] &&
        this.element.hasAttribute('srcset')
      ) {
        // propagateAttributes() will remove [srcset] from this.img_.
        this.element.removeAttribute('srcset');
        attrs.push('srcset');

        this.user().warn(
          TAG,
          'Removed [srcset] since [src] was mutated. Recommend adding a ' +
            '[srcset] binding to support responsive images.',
          this.element
        );
      }
      propagateAttributes(
        attrs,
        this.element,
        this.img_,
        /* opt_removeMissingAttrs */ true
      );
      this.propagateDataset(this.img_);

      if (!mode.isEsm()) {
        guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
      }

      if (AmpImg.R1() && !this.img_.complete) {
        this.setReadyState(ReadyState_Enum.LOADING);
      }
    }
  }

  /** @override */
  preconnectCallback(onLayout) {
    // NOTE(@wassgha): since parseSrcset is computationally expensive and can
    // not be inside the `buildCallback`, we went with preconnecting to the
    // `src` url if it exists or the first srcset url.
    const src = this.element.getAttribute('src');
    if (src) {
      Services.preconnectFor(this.win).url(this.getAmpDoc(), src, onLayout);
    } else {
      const srcset = this.element.getAttribute('srcset');
      if (!srcset) {
        return;
      }
      // We try to find the first url in the srcset
      const srcseturl = /\S+/.exec(srcset);
      // Connect to the first url if it exists
      if (srcseturl) {
        Services.preconnectFor(this.win).url(
          this.getAmpDoc(),
          srcseturl[0],
          onLayout
        );
      }
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Create the actual image element and set up instance variables.
   * Called lazily in the first `#layoutCallback`.
   * @return {!Image}
   */
  initialize_() {
    if (this.img_) {
      return this.img_;
    }
    // If this amp-img IS the fallback then don't allow it to have its own
    // fallback to stop from nested fallback abuse.
    this.allowImgLoadFallback_ = !this.element.hasAttribute('fallback');

    // For SSR, image will have been written directly to DOM so no need to recreate.
    const serverRendered = isServerRendered(this.element);
    if (serverRendered) {
      this.img_ = scopedQuerySelector(this.element, '> img:not([placeholder])');
    }
    this.img_ = this.img_ || new Image();
    this.img_.setAttribute('decoding', 'async');
    if (this.element.id) {
      this.img_.setAttribute('amp-img-id', this.element.id);
    }

    // Remove role=img otherwise this breaks screen-readers focus and
    // only read "Graphic" when using only 'alt'.
    if (this.element.getAttribute('role') == 'img') {
      this.element.removeAttribute('role');
      this.user().error(
        TAG,
        'Setting role=img on amp-img elements breaks ' +
          'screen readers please just set alt or ARIA attributes, they will ' +
          'be correctly propagated for the underlying <img> element.'
      );
    }

    // It is important to call this before setting `srcset` attribute.
    this.maybeGenerateSizes_(/* sync setAttribute */ true);
    propagateAttributes(ATTRIBUTES_TO_PROPAGATE, this.element, this.img_);
    this.propagateDataset(this.img_);
    if (!mode.isEsm()) {
      guaranteeSrcForSrcsetUnsupportedBrowsers(this.img_);
    }
    applyFillContent(this.img_, true);
    propagateObjectFitStyles(this.element, this.img_);

    if (!serverRendered) {
      this.element.appendChild(this.img_);
    }
    return this.img_;
  }

  /**
   * This function automatically generates sizes for amp-imgs without
   * the sizes attribute.
   * @param {boolean} sync Whether to immediately make the change or schedule
   *     via mutateElement.
   * @private
   */
  maybeGenerateSizes_(sync) {
    if (R1_IMG_DEFERRED_BUILD) {
      // The `getLayoutSize()` is not available for a R1 element. Skip this
      // codepath. Also: is this feature at all useful? E.g. it doesn't even
      // execute in the `i-amphtml-ssr` mode.
      return;
    }
    if (!this.img_) {
      return;
    }
    // If the image is server rendered, do not generate sizes.
    if (this.element.hasAttribute('i-amphtml-ssr')) {
      return;
    }
    // No need to generate sizes if already present.
    const sizes =
      this.element.hasAttribute('sizes') || this.img_.hasAttribute('sizes');
    if (sizes) {
      return;
    }
    // Sizes is useless without the srcset attribute or if the srcset
    // attribute uses the x descriptor.
    const srcset = this.element.getAttribute('srcset');
    if (!srcset || /[0-9]+x(?:,|$)/.test(srcset)) {
      return;
    }

    const {width} = this.element.getLayoutSize();
    if (!this.shouldSetSizes_(width)) {
      return;
    }

    const viewportWidth = this.getViewport().getWidth();

    const entry = `(max-width: ${viewportWidth}px) ${width}px, `;
    let defaultSize = width + 'px';

    if (this.getLayout() !== Layout_Enum.FIXED) {
      const ratio = Math.round((width * 100) / viewportWidth);
      defaultSize = Math.max(ratio, 100) + 'vw';
    }

    const generatedSizes = entry + defaultSize;

    if (sync) {
      this.img_.setAttribute('sizes', generatedSizes);
    } else {
      this.mutateElement(() => {
        this.img_.setAttribute('sizes', generatedSizes);
      });
    }
    this.sizesWidth_ = width;
  }

  /**
   * @param {number} newWidth
   * @return {boolean}
   * @private
   */
  shouldSetSizes_(newWidth) {
    if (!this.img_.hasAttribute('sizes')) {
      return true;
    }
    return newWidth > this.sizesWidth_;
  }

  /** @override */
  reconstructWhenReparented() {
    return false;
  }

  /** @override */
  mountCallback() {
    const initialized = !!this.img_;
    const img = this.initialize_();
    if (!initialized) {
      listen(img, 'load', () => {
        this.setReadyState(ReadyState_Enum.COMPLETE);
        this.firstLayoutCompleted();
        this.hideFallbackImg_();
      });
      listen(img, 'error', (reason) => {
        this.setReadyState(ReadyState_Enum.ERROR, reason);
        this.onImgLoadingError_();
      });
    }
    if (img.complete) {
      this.setReadyState(ReadyState_Enum.COMPLETE);
      this.firstLayoutCompleted();
      this.hideFallbackImg_();
    } else {
      this.setReadyState(ReadyState_Enum.LOADING);
    }
  }

  /** @override */
  unmountCallback() {
    // Interrupt retrieval of incomplete images to free network resources when
    // navigating pages in a PWA. Opt for tiny dataURI image instead of empty
    // src to prevent the viewer from detecting a load error.
    const img = this.img_;
    if (img && !img.complete) {
      img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
      removeElement(img);
      this.img_ = null;
    }
  }

  /** @override */
  ensureLoaded() {
    const img = dev().assertElement(this.img_);
    img.loading = 'eager';
  }

  /** @override */
  layoutCallback() {
    this.initialize_();
    const img = dev().assertElement(this.img_);
    this.unlistenLoad_ = listen(img, 'load', () => this.hideFallbackImg_());
    this.unlistenError_ = listen(img, 'error', () => this.onImgLoadingError_());
    const {width} = this.element.getLayoutSize();
    if (width <= 0) {
      return Promise.resolve();
    }
    return this.loadPromise(img);
  }

  /** @override */
  unlayoutCallback() {
    if (AmpImg.R1()) {
      // TODO(#31915): Reconsider if this is still desired for R1. This helps
      // with network interruption when a document is inactivated.
      return;
    }

    if (this.unlistenError_) {
      this.unlistenError_();
      this.unlistenError_ = null;
    }
    if (this.unlistenLoad_) {
      this.unlistenLoad_();
      this.unlistenLoad_ = null;
    }

    // Interrupt retrieval of incomplete images to free network resources when
    // navigating pages in a PWA. Opt for tiny dataURI image instead of empty
    // src to prevent the viewer from detecting a load error.
    const img = this.img_;
    if (img && !img.complete) {
      img.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
      removeElement(img);
      this.img_ = null;
    }

    return true;
  }

  /** @override */
  firstLayoutCompleted() {
    const placeholder = this.getPlaceholder();
    if (
      placeholder &&
      placeholder.classList.contains('i-amphtml-blurry-placeholder')
    ) {
      setImportantStyles(placeholder, {'opacity': 0});
    } else {
      this.togglePlaceholder(false);
    }
  }

  /**
   * @private
   */
  hideFallbackImg_() {
    if (
      !this.allowImgLoadFallback_ &&
      this.img_.classList.contains('i-amphtml-ghost')
    ) {
      this.img_.classList.remove('i-amphtml-ghost');
      this.toggleFallback(false);
    }
  }

  /**
   * If the image fails to load, show a fallback or placeholder instead.
   * @private
   */
  onImgLoadingError_() {
    if (this.allowImgLoadFallback_) {
      this.img_.classList.add('i-amphtml-ghost');
      this.toggleFallback(true);
      // Hide placeholders, as browsers that don't support webp
      // Would show the placeholder underneath a transparent fallback
      this.togglePlaceholder(false);
      this.allowImgLoadFallback_ = false;
    }
  }

  /**
   * Utility method to propagate data attributes from this element
   * to the target element. (For use with arbitrary data attributes.)
   * Removes any data attributes that are missing on this element from
   * the target element.
   * AMP Bind attributes are excluded.
   *
   * @param {!Element} targetElement
   */
  propagateDataset(targetElement) {
    for (const key in targetElement.dataset) {
      if (!(key in this.element.dataset)) {
        delete targetElement.dataset[key];
      }
    }

    for (const key in this.element.dataset) {
      if (key.startsWith('ampBind') && key !== 'ampBind') {
        continue;
      }
      if (targetElement.dataset[key] !== this.element.dataset[key]) {
        targetElement.dataset[key] = this.element.dataset[key];
      }
    }
  }
}

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 */
export function installImg(win) {
  registerElement(win, TAG, AmpImg);
}
