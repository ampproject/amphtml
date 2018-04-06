/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {ActionTrust} from '../../../src/action-trust';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {createCustomEvent} from '../../../src/event-helper';
import {isFiniteNumber} from '../../../src/types';


/** @private @const {string} */
const TAG = 'amp-video-service';


/**
 * Indicates that the content of an "on" attribute has the timeUpdate event
 * as an action trigger.
 * @private @const {!RegExp}
 */
const TIME_UPDATE_ACTION_RE = /(^|;\s*)timeUpdate:/g;


/** @package */
export class TimeUpdateEvent {
  /**
   * @param {!Element} element
   * @return {boolean}
   */
  static shouldBeTriggeredOn(element) {
    return !!closest(element, el => {
      const onAttr = (el.getAttribute('on') || '');
      return onAttr.match(TIME_UPDATE_ACTION_RE) !== null;
    });
  }

  /**
   * Triggers a LOW-TRUST timeupdate event consumable by AMP actions.
   * Frequency of this event is controlled by VideoService.getTick() and is
   * every second for now.
   */
  static trigger(ampdoc, video) {
    const time = video.getCurrentTime();
    const duration = video.getDuration();

    if (!isFiniteNumber(time) ||
        !isFiniteNumber(duration) ||
        duration <= 0) {
      return;
    }
    const {win} = ampdoc;
    const {element} = video;
    const actions = Services.actionServiceForDoc(ampdoc);
    const name = 'timeUpdate';
    const percent = time / duration;
    const event = createCustomEvent(win, `${TAG}.${name}`, {time, percent});

    actions.trigger(element, name, event, ActionTrust.LOW);
  }
}
