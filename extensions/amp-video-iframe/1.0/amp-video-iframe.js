/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {BUBBLE_MESSAGE_EVENTS} from '../amp-video-iframe-api';
import {BaseElement} from './base-element';
import {CSS} from '../../../build/amp-video-iframe-1.0.css';
import {MIN_VISIBILITY_RATIO_FOR_AUTOPLAY} from '../../../src/video-interface';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/core/types/object';
import {isExperimentOn} from '../../../src/experiments';
import {measureIntersection} from '../../../src/utils/intersection';
import {postMessageWhenAvailable} from '../../../src/iframe-video';
import {userAssert} from '../../../src/log';

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

class AmpVideoIframe extends BaseElement {
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
            JSON.stringify(
              dict({
                'id': messageId,
                'intersectionRatio': intersectionRatio,
              })
            )
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
    // VideoEvents.CUSTOM_TICK -> VideoAnalyticsEvents.CUSTOM.
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

AmpVideoIframe['staticProps'] = dict({
  'onMessage': onMessage,
  'makeMethodMessage': makeMethodMessage,
});

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpVideoIframe, CSS);
});
