/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-constants';
import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {createCustomEvent} from '../../../src/event-helper';
import {dict} from '../../../src/utils/object';
import {setStyles} from '../../../src/style';
import {triggerAnalyticsEvent} from '../../../src/analytics';

const TAG = 'amp-trinity-test';

const EVENT_TYPE = 'TRINITY_TEST';

const EVENT = {
  PLAY: 'play',
  PAUSE: 'pause',
  AD_STARTED: 'ad-started',
  AD_ENDED: 'ad-ended',
};

const STATE = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
};

const AD_START_TIME = 3;
const AD_END_TIME = 8;

export class AmpTrinityTest extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
    this.state = 'idle';
    this.actionService = Services.actionServiceForDoc(this.element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.FIXED_HEIGHT;
  }

  /** @override */
  layoutCallback() {
    const button = document.createElement('button');
    button.textContent = '>';
    setStyles(button, {
      'width': '75px',
      'height': '75px',
    });

    const counterEl = document.createElement('span');
    let trinityProgress = 0;
    counterEl.innerText = trinityProgress;
    setStyles(counterEl, {
      'width': '75px',
      'height': '75px',
      'font-size': '45px',
    });

    setInterval(() => {
      if (this.state === STATE.PLAYING) {
        trinityProgress += 1;
        counterEl.innerText = trinityProgress;

        if (trinityProgress === AD_START_TIME) {
          this.triggerCustomEvent(
            dict({
              'eventName': EVENT.AD_STARTED,
              'state': STATE.PLAYING,
              'progress': trinityProgress,
            })
          );
        }

        if (trinityProgress === AD_END_TIME) {
          this.triggerCustomEvent(
            dict({
              'eventName': EVENT.AD_ENDED,
              'state': STATE.PLAYING,
              'progress': trinityProgress,
            })
          );
        }
      }
    }, 1000);

    button.addEventListener('click', () => {
      let eventName;
      switch (this.state) {
        case STATE.PLAYING:
          eventName = EVENT.PAUSE;
          this.state = STATE.PAUSED;
          break;
        case STATE.IDLE:
        case STATE.PAUSED:
          eventName = EVENT.PLAY;
          this.state = STATE.PLAYING;
          break;
      }

      button.textContent = this.state === 'playing' ? '||' : '>';

      const eventData = dict({
        'eventName': eventName,
        'state': this.state,
        'progress': trinityProgress,
      });

      this.triggerCustomEvent(eventData);
    });

    this.element.appendChild(button);
    this.element.appendChild(counterEl);
  }

  /**
   *
   * @param {JsonObject} eventData The JsonObject type is just a simple object that is at-dict made like dict({'key': value})
   */
  triggerCustomEvent(eventData) {
    const event = createCustomEvent(
      this.win,
      'amp-trinity-test:message',
      eventData
    );

    console.log(eventData);

    this.actionService.trigger(
      this.element,
      EVENT_TYPE,
      event,
      ActionTrust.HIGH
    );

    triggerAnalyticsEvent(this.element, EVENT_TYPE, eventData);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  AMP.registerElement(TAG, AmpTrinityTest);
});
