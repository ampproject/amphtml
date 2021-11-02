import {ACTION_TRUST_ENUM} from '#core/constants/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-stream-gallery-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '#utils/event-helper';
import {isExperimentOn} from '#experiments';
import {getWin} from '#core/window';
import {userAssert} from '#utils/log';

/** @const {string} */
const TAG = 'amp-stream-gallery';

class AmpStreamGallery extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction('prev', (api) => api.prev(), ACTION_TRUST_ENUM.LOW);
    this.registerApiAction('next', (api) => api.next(), ACTION_TRUST_ENUM.LOW);
    this.registerApiAction(
      'goToSlide',
      (api, invocation) => {
        const {args} = invocation;
        api.goToSlide(args['index'] || -1);
      },
      ACTION_TRUST_ENUM.LOW
    );

    return super.init();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento-stream-gallery') ||
        isExperimentOn(this.win, 'bento'),
      'expected global "bento" or specific "bento-stream-gallery" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
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
      ACTION_TRUST_ENUM.HIGH
    );

    super.triggerEvent(element, eventName, detail);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery, CSS);
});
