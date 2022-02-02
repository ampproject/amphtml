import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-list-1.0.css';
import {FetchJsonUtil} from '../../amp-render/1.0/shared/amp-fetch-utils';

/** @const {string} */
const TAG = 'amp-list';

/** @extends {PreactBaseElement<BentoListDef.BentoListApi>} */
class AmpList extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/template-impl.Templates} */
    this.templates_ = null;

    /** @private {?Element} */
    this.template_ = null;
  }

  /** @override */
  init() {
    this.registerApiAction('refresh', (api) => api./*OK*/ refresh());

    const initialSrc = this.element.getAttribute('src');
    const fetchUtil = new FetchJsonUtil(TAG, this.element, initialSrc);
    const fetchJson = fetchUtil.getFetchJsonCallback();

    return {
      'fetchJson': fetchJson,
    };
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-list'),
      'expected global "bento" or specific "bento-list" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
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
      templates.getTemplateRenderer(template).then((renderer) => {
        if (template !== this.template_) {
          // A new template has been set while the old one was initializing.
          return;
        }
        const renderAsString = (data) => {
          const html = renderer.renderAsString(data);
          return {'__html': html};
        };
        this.mutateProps({'template': renderAsString});
      });
    } else {
      this.mutateProps({'template': null});
    }
  }

  /** @override */
  isReady(props) {
    if (this.template_ && !('template' in props)) {
      // The template is specified, but not available yet.
      return false;
    }
    return true;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpList, CSS);
});
