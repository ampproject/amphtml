import {ActionTrust_Enum} from '#core/constants/action-constants';
import {dict} from '#core/types/object';
import {getWin} from '#core/window';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-selector-1.0.css';

/** @const {string} */
const TAG = 'amp-selector';

class AmpSelector extends BaseElement {
  /** @override */
  init() {
    // Set up API
    this.registerActoin('clear', () => {
      this.api()./*OK*/ clear();
      this.mutateProps(dict({'value': []}));
    });

    this.registerActoin('selectUp', (invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? -args['delta'] : -1;
      this.api()./*OK*/ selectBy(delta);
    });
    this.registerActoin('selectDown', (invocation) => {
      const {args} = invocation;
      const delta = args && args['delta'] !== undefined ? args['delta'] : 1;
      this.api()./*OK*/ selectBy(delta);
    });

    this.registerActoin('toggle', (invocation) => {
      const {args} = invocation;
      const {'index': index, 'value': opt_select} = args;
      userAssert(typeof index === 'number', "'index' must be specified");
      const option = this.optionState[index];
      if (option) {
        this.api()./*OK */ toggle(option, opt_select);
      }
    });

    return super.init();
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      getWin(element),
      `amp-selector.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust_Enum.HIGH
    );

    super.triggerEvent(element, eventName, detail);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-selector'),
      'expected global "bento" or specific "bento-selector" experiment to be enabled'
    );
    return true;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpSelector, CSS);
});
