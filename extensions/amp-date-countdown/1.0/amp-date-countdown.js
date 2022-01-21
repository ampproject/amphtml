import {isLayoutSizeDefined} from '#core/dom/layout';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {BaseElement} from './base-element';

/** @const {string} */
const TAG = 'amp-date-countdown';

class AmpDateCountdown extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
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
        isExperimentOn(this.win, 'bento-date-countdown'),
      'expected global "bento" or specific "bento-date-countdown" experiment to be enabled'
    );
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  checkPropsPostMutations() {
    const templates =
      this.templates_ ||
      (this.templates_ = Services.templatesForDoc(this.element));
    const template = templates.maybeFindTemplate(this.element);
    if (template === this.template_) {
      return;
    }
    this.template_ = template;
    if (template) {
      // Only overwrite `render` when template is ready to minimize FOUC.
      templates.whenReady(template).then(() => {
        if (template != this.template_) {
          // A new template has been set while the old one was initializing.
          return;
        }
        this.mutateProps({
          'render': (data) => {
            return templates
              .renderTemplateAsString(dev().assertElement(template), data)
              .then((html) => ({
                '__html': html,
              }));
          },
        });
      });
    } else {
      this.mutateProps({'render': null});
    }
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
  AMP.registerElement(TAG, AmpDateCountdown);
});
