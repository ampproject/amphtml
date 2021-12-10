import {ActionTrust_Enum} from '#core/constants/action-constants';
import {CSS} from '../../../build/amp-stream-gallery-1.0.css';
import {Services} from '#service';
import {createCustomEvent} from '#utils/event-helper';
import {isExperimentOn} from '#experiments';
import {getWin} from '#core/window';
import {userAssert} from '#utils/log';
import {
  Component,
  elementInit,
  layoutSizeDefined,
  props,
  shadowCss,
  usesShadowDom,
} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';

/** @const {string} */
const TAG = 'amp-stream-gallery';

class AmpStreamGallery extends AmpPreactBaseElement {
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

    return elementInit(this.element, this.triggerEvent.bind(this));
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
      ActionTrust_Enum.HIGH
    );

    super.triggerEvent(element, eventName, detail);
  }
}

/** @override */
AmpStreamGallery['Component'] = Component;

/** @override */
AmpStreamGallery['layoutSizeDefined'] = layoutSizeDefined;

/** @override */
AmpStreamGallery['props'] = props;

/** @override */
AmpStreamGallery['usesShadowDom'] = usesShadowDom;

/** @override */
AmpStreamGallery['shadowCss'] = shadowCss;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpStreamGallery, CSS);
});
