import {ActionTrust_Enum} from '#core/constants/action-constants';

import {CSS} from '../../../build/amp-base-carousel-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '#utils/event-helper';
import {isExperimentOn} from '#experiments';
import {getWin} from '#core/window';
import {userAssert} from '#utils/log';
import {
  Component,
  elementInit,
  layoutSizeDefined,
  mutationObserverCallback,
  props,
  shadowCss,
  useContexts,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @const {string} */
const TAG = 'amp-base-carousel';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
class AmpBaseCarousel extends AmpPreactBaseElement {
  /** @override */
  constructor(element) {
    super(element);

    /** @private {?number} */
    this.slide_ = null;
  }

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

    const {props, slide} = elementInit(
      this.element,
      this.triggerEvent.bind(this)
    );
    this.slide_ = slide;
    return props;
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
      getWin(element),
      `amp-base-carousel.${eventName}`,
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
  mutationObserverCallback() {
    this.slide_ = mutationObserverCallback(
      this.element,
      this.slide_,
      this.api().goToSlide.bind(this)
    );
  }
}

/** @override */
AmpBaseCarousel['Component'] = Component;

/** @override */
AmpBaseCarousel['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpBaseCarousel['props'] = props;

/** @override */
AmpBaseCarousel['usesShadowDom'] = usesShadowDom;

/** @override */
AmpBaseCarousel['shadowCss'] = shadowCss;

/** @override */
AmpBaseCarousel['useContexts'] = useContexts;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpBaseCarousel, CSS);
});
