import {getLengthNumeral, isLayoutSizeDefined} from '#core/dom/layout';
import {px, setImportantStyles, setStyle, setStyles} from '#core/dom/style';
import {throttle} from '#core/types/function';

import {buildDom, mirrorNode} from './build-dom';

import {CSS} from '../../../build/amp-fit-text-0.1.css';

const TAG = 'amp-fit-text';
const LINE_HEIGHT_EM_ = 1.15; // WARNING: when updating this ensure you also update the css values for line-height.
const RESIZE_THROTTLE_MS = 100;
export class AmpFitText extends AMP.BaseElement {
  /** @override  */
  static prerenderAllowed() {
    return true;
  }

  /** @param {AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.content_ = null;

    /** @private {?Element} */
    this.contentWrapper_ = null;

    /** @private {?Element} */
    this.measurer_ = null;

    /** @private {number} */
    this.minFontSize_ = -1;

    /** @private {number} */
    this.maxFontSize_ = -1;

    /** @private {?UnlistenDef} */
    this.resizeObserverUnlistener_ = null;

    /**
     * Synchronously stores updated textContent, but only after it has been
     * updated.
     * @private {string}
     */
    this.textContent_ = '';
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    const {element} = this;

    const {content, contentWrapper, measurer} = buildDom(element);
    this.content_ = content;
    this.contentWrapper_ = contentWrapper;
    this.measurer_ = measurer;

    this.minFontSize_ =
      getLengthNumeral(element.getAttribute('min-font-size')) || 6;

    this.maxFontSize_ =
      getLengthNumeral(element.getAttribute('max-font-size')) || 72;

    // Make it so that updates to the textContent of the amp-fit-text element
    // actually update the text of the content element.
    Object.defineProperty(this.element, 'textContent', {
      set: (v) => {
        this.textContent_ = v;
        this.mutateElement(() => {
          this.contentWrapper_.textContent = v;
          this.updateMeasurerContent_();
          this.updateFontSize_();
        });
      },
      get: () => {
        return this.textContent_ || this.contentWrapper_.textContent;
      },
    });
  }

  /** @override */
  isRelayoutNeeded() {
    return true;
  }

  /** @override */
  layoutCallback() {
    if (this.win.ResizeObserver && this.resizeObserverUnlistener_ === null) {
      const observer = new this.win.ResizeObserver(
        throttle(
          this.win,
          () =>
            this.mutateElement(() => {
              this.updateMeasurerContent_();
              this.updateFontSize_();
            }),
          RESIZE_THROTTLE_MS
        )
      );

      observer.observe(this.content_);
      observer.observe(this.measurer_);
      this.resizeObserverUnlistener_ = function () {
        observer.disconnect();
      };
    }
    return this.mutateElement(() => {
      this.updateFontSize_();
      setImportantStyles(this.content_, {visibility: 'visible'});
    });
  }

  /** @override */
  unlayoutCallback() {
    if (this.resizeObserverUnlistener_ !== null) {
      this.resizeObserverUnlistener_();
      this.resizeObserverUnlistener_ = null;
    }
  }

  /**
   * Copies text from the displayed content to the measurer element.
   */
  updateMeasurerContent_() {
    mirrorNode(this.contentWrapper_, this.measurer_);
  }

  /** @private */
  updateFontSize_() {
    const maxHeight = this.content_./*OK*/ offsetHeight;
    const maxWidth = this.content_./*OK*/ offsetWidth;
    const fontSize = calculateFontSize_(
      this.measurer_,
      maxHeight,
      maxWidth,
      this.minFontSize_,
      this.maxFontSize_
    );
    setStyle(this.contentWrapper_, 'fontSize', px(fontSize));
    updateOverflow_(this.contentWrapper_, this.measurer_, maxHeight, fontSize);
  }
}

/**
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 * @private  Visible for testing only
 */
export function calculateFontSize_(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  maxFontSize++;
  // Binomial search for the best font size.
  while (maxFontSize - minFontSize > 1) {
    const mid = Math.floor((minFontSize + maxFontSize) / 2);
    setStyle(measurer, 'fontSize', px(mid));
    const height = measurer./*OK*/ offsetHeight;
    const width = measurer./*OK*/ offsetWidth;
    if (height > expectedHeight || width > expectedWidth) {
      maxFontSize = mid;
    } else {
      minFontSize = mid;
    }
  }

  return minFontSize;
}

/**
 * @param {Element} content
 * @param {Element} measurer
 * @param {number} maxHeight
 * @param {number} fontSize
 * @private  Visible for testing only
 */
export function updateOverflow_(content, measurer, maxHeight, fontSize) {
  setStyle(measurer, 'fontSize', px(fontSize));
  const overflown = measurer./*OK*/ offsetHeight > maxHeight;
  const lineHeight = fontSize * LINE_HEIGHT_EM_;
  const numberOfLines = Math.floor(maxHeight / lineHeight);
  content.classList.toggle('i-amphtml-fit-text-content-overflown', overflown);
  setStyles(content, {
    lineClamp: overflown ? numberOfLines : '',
    maxHeight: overflown ? px(lineHeight * numberOfLines) : '',
  });
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpFitText, CSS);
});
