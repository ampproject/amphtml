import {px, setStyle, setStyles} from '#core/dom/style';

import {Services} from '#service';

/** @const {number} Fixed button height from design spec. */
const MAX_HEIGHT = 32;

/** @enum {number} From design spec. */
const FontSizes = {
  MIN: 12,
  MAX: 14,
  // High-resolution display font sizes
  HIGH_RES_MIN: 18,
  HIGH_RES_MAX: 21,
};

/** @const {number} Breakpoint for high-resolution displays (4K) */
const HIGH_RES_BREAKPOINT = 2560;

export class ButtonTextFitter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const @private {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(ampdoc);

    /** @private {!Document} */
    this.doc_ = ampdoc.win.document;

    /** @private {!Element} */
    this.measurer_ = this.doc_.createElement('div');

    this.mutator_.mutateElement(this.measurer_, () => {
      this.doc_.body.appendChild(this.measurer_);
      setStyles(this.measurer_, {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
        visibility: 'hidden',
        'font-weight': 'bold',
        'letter-spacing': '0.2px',
      });
    });
  }

  /**
   * @param {!Element} pageElement
   * @param {!Element} container
   * @param {string} content
   * @return {Promise<boolean>}
   */
  fit(pageElement, container, content) {
    let success = false;
    return this.mutator_
      .mutateElement(container, () => {
        this.measurer_.textContent = content;

        // Check if we're on a high-resolution display
        const isHighRes = this.doc_.defaultView.innerWidth >= HIGH_RES_BREAKPOINT;

        // Use appropriate font size range based on screen resolution
        const minFontSize = isHighRes ? FontSizes.HIGH_RES_MIN : FontSizes.MIN;
        const maxFontSize = isHighRes ? FontSizes.HIGH_RES_MAX : FontSizes.MAX;

        // For high-res displays, we scale the MAX_HEIGHT proportionally
        const buttonHeight = isHighRes ? MAX_HEIGHT * 1.5 : MAX_HEIGHT;

        const fontSize = calculateFontSize(
          this.measurer_,
          buttonHeight,
          this.getMaxWidth_(pageElement),
          minFontSize,
          maxFontSize
        );

        if (fontSize >= minFontSize) {
          this.updateFontSize_(container, fontSize);
          success = true;
        }
      })
      .then(() => {
        return success;
      });
  }

  /**
   * Called on each button creation, in case of window resize.
   * Page width - (2 x 32px of padding on each side) + (2 x 10px padding on button).
   * For high-resolution displays, we scale the padding proportionally.
   * @param {!Element} pageElement
   * @return {number}
   * @private
   */
  getMaxWidth_(pageElement) {
    const isHighRes = this.doc_.defaultView.innerWidth >= HIGH_RES_BREAKPOINT;
    // For high-res displays, we use a larger padding to maintain proportions
    const padding = isHighRes ? 126 : 84; // 84 * 1.5 = 126
    return pageElement./*OK*/ offsetWidth - padding;
  }

  /**
   * @param {!Element} container
   * @param {number} fontSize
   */
  updateFontSize_(container, fontSize) {
    setStyle(container, 'fontSize', px(fontSize));
  }
}

/**
 * This used to be binary search, but since range is so small just try the 3
 * values. If range gets larger, reevaluate.
 * @param {Element} measurer
 * @param {number} expectedHeight
 * @param {number} expectedWidth
 * @param {number} minFontSize
 * @param {number} maxFontSize
 * @return {number}
 */
function calculateFontSize(
  measurer,
  expectedHeight,
  expectedWidth,
  minFontSize,
  maxFontSize
) {
  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize--) {
    setStyle(measurer, 'fontSize', px(fontSize));
    const height = measurer./*OK*/ offsetHeight;
    const width = measurer./*OK*/ offsetWidth;
    if (height < expectedHeight && width < expectedWidth) {
      return fontSize;
    }
  }
  // Did not fit within design spec.
  return minFontSize - 1;
}
