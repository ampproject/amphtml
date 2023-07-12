import {removeElement} from '#core/dom';
import {Layout_Enum, applyFillContent} from '#core/dom/layout';
import {setStyles} from '#core/dom/style';

import {Services} from '#service';

import {CSS} from '../../../build/amp-mathml-0.1.css';
import {getIframe} from '../../../src/3p-frame';
import {listenFor} from '../../../src/iframe-helper';

export class AmpMathml extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?HTMLIFrameElement} */
    this.iframe_ = null;
  }

  /**
   * Adds a preconnect
   *
   */
  preconnectCallback() {
    Services.preconnectFor(this.win).url(
      this.getAmpDoc(),
      'https://cdnjs.cloudflare.com'
    );
  }

  /**
   * Adds a callback to mutateElement.
   */
  buildCallback() {
    // Make the element minimally displayed to make sure that `layoutCallback`
    // is called.
    let sizingWidth;
    if (this.element.hasAttribute('inline')) {
      sizingWidth = '1px';
    }
    this.mutateElement(() => {
      setStyles(this.element, {
        width: sizingWidth,
        height: '1rem',
      });
    });
  }

  /**
   * Adds a layout callback for mathml iframe.
   *
   * @return {!Promise}
   */
  layoutCallback() {
    const iframe = getIframe(this.win, this.element, 'mathml');
    iframe.title = this.element.title || 'MathML formula';
    applyFillContent(iframe);
    // Triggered by context.updateDimensions() inside the iframe.
    listenFor(
      iframe,
      'embed-size',
      (data) => {
        if (!this.element.hasAttribute('inline')) {
          // Don't change the width if not inlined.
          data['width'] = undefined;
        }
        Services.mutatorForDoc(this.getAmpDoc()).forceChangeSize(
          this.element,
          data['height'],
          data['width']
        );
      },
      /* opt_is3P */ true
    );
    this.element.appendChild(iframe);
    this.iframe_ = iframe;
    return this.loadPromise(iframe);
  }

  /**
   * Removes mathml iframe.
   *
   * @return {boolean}
   */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout_Enum.CONTAINER;
  }
}

AMP.extension('amp-mathml', '0.1', (AMP) => {
  AMP.registerElement('amp-mathml', AmpMathml, CSS);
});
