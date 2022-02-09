import {BaseElement} from '#bento/components/bento-accordion/1.0/base-element';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {getWin} from '#core/window';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-accordion-1.0.css';

/** @const {string} */
const TAG = 'amp-accordion';

/** @extends {PreactBaseElement<BentoAccordionDef.AccordionApi>} */
class AmpAccordion extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    this.registerApiAction('toggle', (api, invocation) =>
      api./*OK*/ toggle(invocation.args && invocation.args['section'])
    );
    this.registerApiAction('expand', (api, invocation) =>
      api./*OK*/ expand(invocation.args && invocation.args['section'])
    );
    this.registerApiAction('collapse', (api, invocation) =>
      api./*OK*/ collapse(invocation.args && invocation.args['section'])
    );

    return super.init();
  }

  /** @override */
  triggerEvent(section, eventName, detail) {
    const event = createCustomEvent(
      getWin(section),
      `accordionSection.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(section).trigger(
      section,
      eventName,
      event,
      ActionTrust_Enum.HIGH
    );

    super.triggerEvent(section, eventName, detail);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-accordion'),
      'expected global "bento" or specific "bento-accordion" experiment to be enabled'
    );
    return true;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpAccordion, CSS);
});
