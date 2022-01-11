import {removeElement} from '#core/dom';
import {setStyles} from '#core/dom/style';

import {Services} from '#service';

/**
 * @typedef {{
 *  fontStyle: string,
 *  variant: string,
 *  weight: string,
 *  size: string,
 *  family: string
 * }}
 */
let FontConfigDef;

const DEFAULT_FONTS_ = ['sans-serif', 'serif'];

const TEST_STRING_ = 'MAxmTYklsjo190QW';

const TOLERANCE_ = 2;

export class FontLoader {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private @const */
    this.ampdoc_ = ampdoc;

    /** @private @const */
    this.document_ = ampdoc.win.document;

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?FontConfigDef} */
    this.fontConfig_ = null;

    /** @private */
    this.fontLoadResolved_ = false;

    /** @private */
    this.fontLoadRejected_ = false;
  }

  /**
   * Triggers the font load. Returns promise that will complete when loading
   * is considered to be complete.
   * @param {!FontConfigDef} fontConfig Config that describes the font to be
   *    loaded.
   * @param {number} timeout number of milliseconds after which the font load
   *    attempt would be stopped.
   * @return {!Promise}
   */
  load(fontConfig, timeout) {
    this.fontConfig_ = fontConfig;
    return Services.timerFor(this.ampdoc_.win)
      .timeoutPromise(timeout, this.load_())
      .then(
        () => {
          this.fontLoadResolved_ = true;
          this.dispose_();
        },
        (reason) => {
          this.fontLoadRejected_ = true;
          this.dispose_();
          throw reason;
        }
      );
  }

  /**
   * Triggers the font load. Returns promise that will complete when loading
   * is considered to be complete.
   * @return {!Promise}
   * @private
   */
  load_() {
    return new Promise((resolve, reject) => {
      /* style | variant | weight | size/line-height | family */
      /* font: italic small-caps bolder 16px/3 cursive; */
      const fontString =
        this.fontConfig_.fontStyle +
        ' ' +
        this.fontConfig_.variant +
        ' ' +
        this.fontConfig_.weight +
        ' ' +
        this.fontConfig_.size +
        " '" +
        this.fontConfig_.family +
        "'";

      if (this.canUseNativeApis_()) {
        // Check if font already exists.
        if (this.document_.fonts.check(fontString)) {
          resolve();
        } else {
          // Load font with native api if supported.
          this.document_.fonts
            .load(fontString)
            .then(() => {
              // Workaround for chrome bug
              // https://bugs.chromium.org/p/chromium/issues/detail?id=347460
              return this.document_.fonts.load(fontString);
            })
            .then(() => {
              if (this.document_.fonts.check(fontString)) {
                resolve();
              } else {
                reject(
                  new Error(
                    'Font could not be loaded,' +
                      ' probably due to incorrect @font-face.'
                  )
                );
              }
            })
            .catch(reject);
        }
      } else {
        // Load font with polyfill if native api is not supported.
        this.loadWithPolyfill_().then(resolve, reject);
      }
    });
  }

  /**
   * @return {boolean} True when native font api is supported by the browser.
   * @private
   */
  canUseNativeApis_() {
    return 'fonts' in this.document_;
  }

  /**
   * Make the browsers that don't support font loading events to download the
   * custom font by creating an element (with text) not visible on the viewport.
   * Font download is detected by comparing the elements height and width with
   * measurements between default fonts and custom font.
   * @private
   * @return {*} TODO(#23582): Specify return type
   */
  loadWithPolyfill_() {
    return new Promise((resolve, reject) => {
      const vsync = Services.vsyncFor(this.ampdoc_.win);
      // Create font comparators
      const comparators = this.createFontComparators_();
      // Measure until timeout (or font load).
      const vsyncTask = vsync.createTask({
        measure: () => {
          if (this.fontLoadResolved_) {
            resolve();
          } else if (this.fontLoadRejected_) {
            reject(new Error('Font loading timed out.'));
          } else if (comparators.some((comparator) => comparator.compare())) {
            resolve();
          } else {
            vsyncTask();
          }
        },
      });
      vsyncTask();
    });
  }

  /**
   * Create hidden divs and measure dimensions for fonts.
   * @return {!Array<!FontComparator>} An array of comparators, one for each
   *     default font to compare against the font specified in fontConfig.
   * @private
   */
  createFontComparators_() {
    const containerElement = (this.container_ =
      this.document_.createElement('div'));
    setStyles(containerElement, {
      // Use larger font-size to better detect font load.
      fontSize: '40px',
      fontVariant: this.fontConfig_.variant,
      fontWeight: this.fontConfig_.weight,
      fontStyle: this.fontConfig_.fontStyle,
      left: '-999px',
      lineHeight: 'normal',
      margin: 0,
      padding: 0,
      position: 'absolute',
      top: '-999px',
      visibility: 'hidden',
    });

    const comparators = DEFAULT_FONTS_.map(
      (defaultFont) =>
        new FontComparator(
          containerElement,
          this.fontConfig_.family,
          defaultFont
        )
    );
    this.ampdoc_.getBody().appendChild(containerElement);
    return comparators;
  }

  /**
   * @private
   */
  dispose_() {
    if (this.container_) {
      removeElement(this.container_);
    }
    this.container_ = null;
  }
}

class FontComparator {
  /**
   * Create two elements to compare fonts and insert them into a container.
   * @param {!Element} container Contains the backing font comparison elements
   * @param {string} customFont A font name to detect if a font has loaded
   * @param {string} defaultFont A fallback font family, like sans-serif
   */
  constructor(container, customFont, defaultFont) {
    const doc = container.ownerDocument;
    const testFontFamily = `${customFont},${defaultFont}`;

    /** @private {!Element} */
    this.defaultFontElement_ = this.getFontElement_(doc, defaultFont);

    /** @private {!Element} */
    this.testFontElement_ = this.getFontElement_(doc, testFontFamily);

    container.appendChild(this.defaultFontElement_);
    container.appendChild(this.testFontElement_);
  }

  /**
   * Create and style a DOM element to use to compare two fonts.
   * @param {?Document} doc
   * @param {string} fontFamily
   * @return {!Element}
   * @private
   */
  getFontElement_(doc, fontFamily) {
    const element = doc.createElement('div');
    element.textContent = TEST_STRING_;
    setStyles(element, {
      float: 'left',
      fontFamily,
      margin: 0,
      padding: 0,
      whiteSpace: 'nowrap',
    });
    return element;
  }

  /**
   * Compare dimensions between elements styled with default and custom fonts.
   * If the divs are identical, the custom font has not loaded.
   * @return {boolean} Returns true if the dimensions are noticeably different.
   */
  compare() {
    const hasWidthChanged =
      Math.abs(
        this.defaultFontElement_./*OK*/ offsetWidth -
          this.testFontElement_./*OK*/ offsetWidth
      ) > TOLERANCE_;
    const hasHeightChanged =
      Math.abs(
        this.defaultFontElement_./*OK*/ offsetHeight -
          this.testFontElement_./*OK*/ offsetHeight
      ) > TOLERANCE_;
    return hasWidthChanged || hasHeightChanged;
  }
}
