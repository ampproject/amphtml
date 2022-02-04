import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-date-picker-1.0.css';

/** @const {string} */
const TAG = 'amp-date-picker';

/** @extends {PreactBaseElement<BentoDatePickerDef.BentoDatePickerApi} */
class AmpDatePicker extends setSuperClass(BaseElement, AmpPreactBaseElement) {
  /** @override */
  init() {
    this.registerApiAction('clear', (api) => api./*OK*/ clear());
    this.registerApiAction('today', (api, invocation) =>
      api./*OK*/ today(invocation.args && invocation.args['offset'])
    );
    this.registerApiAction('startToday', (api, invocation) =>
      api./*OK*/ startToday(invocation.args && invocation.args['offset'])
    );
    this.registerApiAction('endToday', (api, invocation) =>
      api./*OK*/ endToday(invocation.args && invocation.args['offset'])
    );
    this.registerApiAction('setDate', (api, invocation) =>
      api./*OK*/ setDate(invocation.args && invocation.args['date'])
    );
    this.registerApiAction('setDates', (api, invocation) =>
      api./*OK*/ setDates(
        invocation.args && invocation.args['start'],
        invocation.args && invocation.args['end']
      )
    );
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-date-picker'),
      'expected global "bento" or specific "bento-date-picker" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpDatePicker, CSS);
});
