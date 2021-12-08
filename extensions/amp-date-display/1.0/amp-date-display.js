import {dict} from '#core/types/object';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-date-display';

class AmpDateDisplay extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-date-display'),
      'expected global "bento" or specific "bento-date-display" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  checkPropsPostMutations() {
    const template = this.element.hasAttribute('template')
      ? this.element.ownerDocument.getElementById(
          this.element.getAttribute('template')
        )
      : this.element.querySelector('template');
    this.mutateProps(
      dict({
        'render': (data) => {
          let html = template.content.firstElementChild./*REVIEW*/ outerHTML;
          for (const [key, value] of Object.entries(data)) {
            html = html.replaceAll('${' + key + '}', value);
          }
          return dict({'__html': html});
        },
      })
    );
  }

  /** @override */
  isReady(props) {
    if (this.template_ && !('render' in props)) {
      // The template is specified, but not available yet.
      return false;
    }
    return true;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpDateDisplay);
});
