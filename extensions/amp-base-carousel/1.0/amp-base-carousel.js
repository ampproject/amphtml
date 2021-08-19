import {ActionTrust} from '#core/constants/action-constants';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-base-carousel-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '../../../src/event-helper';
import {isExperimentOn} from '#experiments';
import {toWin} from '#core/window';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-base-carousel';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
class AmpBaseCarousel extends BaseElement {
  /** @override */
  init() {
    this.registerApiAction('prev', (api) => api.prev(), ActionTrust.LOW);
    this.registerApiAction('next', (api) => api.next(), ActionTrust.LOW);
    this.registerApiAction(
      'goToSlide',
      (api, invocation) => {
        const {args} = invocation;
        api.goToSlide(args['index'] || -1);
      },
      ActionTrust.LOW
    );

    return super.init();
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-carousel'),
      'expected global "bento" or specific "bento-carousel" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /** @override */
  triggerEvent(element, eventName, detail) {
    const event = createCustomEvent(
      toWin(element.ownerDocument.defaultView),
      `amp-base-carousel.${eventName}`,
      detail
    );
    Services.actionServiceForDoc(element).trigger(
      element,
      eventName,
      event,
      ActionTrust.HIGH
    );
    super.triggerEvent(element, eventName, detail);
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel, CSS);
});
