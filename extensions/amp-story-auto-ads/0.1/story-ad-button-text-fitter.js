import {px, setStyle, setStyles} from '#core/dom/style';

import {Services} from '#service';

/** @const {number} Fixed button height from design spec. */
const MAX_HEIGHT = 32;

/** @enum {number} From design spec. */
const FontSizes = {
  MIN: 12,
  MAX: 14,
};

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
        const fontSize = calculateFontSize(
          this.measurer_,
          MAX_HEIGHT,
          this.getMaxWidth_(pageElement),
          FontSizes.MIN,
          FontSizes.MAX
        );
        if (fontSize >= FontSizes.MIN) {
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
   * @param {!Element} pageElement
   * @return {number}
   * @private
   */
  getMaxWidth_(pageElement) {
    return pageElement./*OK*/ offsetWidth - 84;
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
