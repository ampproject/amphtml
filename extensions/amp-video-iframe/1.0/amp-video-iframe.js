import {BUBBLE_MESSAGE_EVENTS} from '#bento/apis/video-iframe-api';
import {AmpVideoBaseElement} from '#bento/components/bento-video/1.0/video-base-element';
import {BaseElement} from '#bento/components/bento-video-iframe/1.0/base-element';

import {measureIntersection} from '#core/dom/layout/intersection';

import {isExperimentOn} from '#experiments';

import {setSuperClass} from '#preact/amp-base-element';

import {createCustomEvent} from '#utils/event-helper';
import {userAssert} from '#utils/log';

import {CSS} from '../../../build/amp-video-iframe-1.0.css';
import {postMessageWhenAvailable} from '../../../src/iframe-video';
import {MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} from '../../../src/video-interface';

/** @const {string} */
const TAG = 'amp-video-iframe';

/**
 * @param {!Element} element
 * @return {!Promise<number>}
 */
function getIntersectionRatioMinAutoplay(element) {
  return measureIntersection(element).then(({intersectionRatio}) =>
    // Only post ratio > 0 when in autoplay range to prevent internal
    // autoplay implementations that differ from ours.
    intersectionRatio < MIN_VISIBILITY_RATIO_FOR_AUTOPLAY
      ? 0
      : intersectionRatio
  );
}

class AmpVideoIframe extends setSuperClass(BaseElement, AmpVideoBaseElement) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-video-iframe'),
      'expected global "bento" or specific "bento-video-iframe" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }
}

/**
 * @param {!MessageEvent} e
 */
function onMessage(e) {
  const {currentTarget} = e;
  const method = e.data?.['method'];
  const messageId = e.data?.['id'];
  if (method) {
    if (method == 'getIntersection') {
      // TODO(alanorozco): Throttle
      getIntersectionRatioMinAutoplay(currentTarget).then(
        (intersectionRatio) => {
          postMessageWhenAvailable(
            currentTarget,
            JSON.stringify({
              'id': messageId,
              'intersectionRatio': intersectionRatio,
            })
          );
        }
      );
      return;
    }
    throw new Error(`Unknown method ${method}`);
  }
  const event = e.data?.['event'];
  if (!event) {
    return;
  }
  if (event === 'analytics') {
    // TODO(alanorozco): In classic AMP, this is an indirect chain of:
    // VideoEvents.CUSTOM_TICK -> VideoAnalyticsEvents_Enum.CUSTOM.
    // VideoManager "massages" the data for this event, adding a prefix.
    // Whatever the VideoManager does, needs to be refactored.
    return;
  }
  if (
    event === 'error' ||
    event === 'canplay' ||
    BUBBLE_MESSAGE_EVENTS.indexOf(event) > -1
  ) {
    currentTarget.dispatchEvent(
      createCustomEvent(window, event, /* detail */ null, {
        bubbles: true,
        cancelable: true,
      })
    );
    return;
  }
}

/**
 * @param {string} method
 * @return {string}
 */
const makeMethodMessage = (method) =>
  JSON.stringify({
    'event': 'method',
    'method': method.toLowerCase(),
  });

AmpVideoIframe['staticProps'] = {
  'onMessage': onMessage,
  'makeMethodMessage': makeMethodMessage,
};

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideoIframe, CSS);
});
