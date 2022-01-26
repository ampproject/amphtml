import {ActionTrust_Enum} from '#core/constants/action-constants';
import {getWin} from '#core/window';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {BaseElement} from './base-element';

import {CSS} from '../../../build/amp-stream-gallery-1.0.css';

/** @const {string} */
const TAG = 'amp-stream-gallery';

class AmpStreamGallery extends setSuperClass(
  BaseElement,
  AmpPreactBaseElement
) {
  /** @override */
  init() {
    this.registerApiAction('prev', (api) => api.prev(), ActionTrust_Enum.LOW);
    this.registerApiAction('next', (api) => api.next(), ActionTrust_Enum.LOW);
    this.registerApiAction(
      'goToSlide',
      (api, invocation) => {
        const {args} = invocation;
        api.goToSlide(args['index'] || -1);
      },
      ActionTrust_Enum.LOW
    );

    return super.init();
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      getWin(element),
      `amp-stream-gallery.${eventName}`,
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
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery, CSS);
});
