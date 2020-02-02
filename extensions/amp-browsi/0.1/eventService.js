/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {BrowsiUtils} from './BrowsiUtils';
import {EventTopic, EventType} from './enums';
import {getMode} from '../../../src/mode';

const serverUrl = 'https://amp.browsiprod.com/events';
const pvid = BrowsiUtils.getPvid();

/**
 * @param {string} topic
 * @param {string} type
 * @param {Array} events
 */
function send(topic, type, events) {
  if (!getMode().test) {
    const xhr = new XMLHttpRequest();

    xhr.open('POST', `${serverUrl}?p=${pvid}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(events));
  }
  if (getMode().localDev) {
    console /*OK*/
      .log(
        `%c ${topic}/${type}`,
        'background: #AAFF7F; color: black; font-weight: bold; text-decoration:underline; font-size: 18px;',
        events
      );
  }
}
/**
 * @param {Array} events
 * */
export function sendEngagement(events) {
  const allEvents = events.map(event => ({
    ...event,
    et: EventType.ENGAGEMENT,
  }));
  send(EventTopic.AMP, EventType.ENGAGEMENT, allEvents);
}

/**
 * @param {Object | null} ad
 * */
export function sendPublisherAdViewed(ad) {
  const publisherAdViewed = getPublisherAdViewedEvent(ad);
  send(EventTopic.AMP, EventType.PUBLISHER_AD_VIEWED, [publisherAdViewed]);
}

/**
 * @param {Array} ads
 * @return {Array}
 * */
export function sendPublisherAdFound(ads) {
  const publisherAdsFound = ads.map(ad => {
    return {...getPublisherAdFoundEvent(ad)};
  });
  send(EventTopic.AMP, EventType.PUBLISHER_AD_FOUND, publisherAdsFound);
  return publisherAdsFound;
}

/**
 * @param {!Object} ad
 * @return {Object}
 * */
function getPublisherAdFoundEvent(ad) {
  return {
    ...ad,
    et: EventType.PUBLISHER_AD_FOUND,
  };
}

/**
 * @param {Object | null} ad
 * @return {Object}
 * */
function getPublisherAdViewedEvent(ad) {
  return {
    ...ad,
    et: EventType.PUBLISHER_AD_VIEWED,
    amp: 'amp',
  };
}
