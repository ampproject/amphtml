/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

/** @enum {string} */
export const AMP_ANALYTICS_3P_MESSAGE_TYPE = {
  READY: 'Ready',
  CREATIVES: 'Creatives',
  CREATIVE: 'Creative', /* Can't be sent standalone, only within CREATIVES */
  EVENTS: 'Events',
  EVENT: 'Event', /* Can't be sent standalone, only within EVENTS */
  RESPONSE: 'Response',
};

/** @typedef {{
 *    sentinel: (string|undefined),
 *    type: !string
 *  }} */
export let AmpAnalytics3pReadyMessage;
// Example:
// {
//   "sentinel":"20354662305315974",
//   "type":"
// Ready"
// }
// The sentinel value will be present when received but the sender doesn't
// need to add it, this is done by iframe-messaging-client.

/** @typedef {{
 *    sentinel: (string|undefined),
 *    type: !string,
 *    Creatives: Array<AmpAnalytics3pEvent>
 *  }} */
export let AmpAnalytics3pNewCreatives;
// Example:
// {
//   "sentinel":"20354662305315974",
//   "type":"Creatives",
//   "Creatives":[
//     ...
//   ]
// }

/** @typedef {{
 *    senderId: !string,
 *    type: !string,
 *    Creative: !string
 *  }} */
export let AmpAnalytics3pNewCreative;
// Example:
// {
//   "senderId":"8117602251459417",
//   "type":"Creative",
//   "Creative":"ThisIsExtraData"
// }

/** @typedef {{
 *    sentinel: (string|undefined),
 *    type: !string,
 *    Events: Array<AmpAnalytics3pEvent>
 *  }} */
export let AmpAnalytics3pEvents;
// Example: {
//   "sentinel":"20354662305315974",
//   "type":"Events",
//   "Events":[
//     ...
//   ]
// }
// The sentinel value will be present when received but the sender doesn't
// need to add it, this is done by iframe-messaging-client.

/** @typedef {{
 *    senderId: !string,
 *    type: !string,
 *    Event: !string
 *  }} */
export let AmpAnalytics3pEvent;
// Example:
// {
//   "senderId":"8117602251459417",
//   "type":"Event",
//   "Event":"viewed=true&...etc."
// }

/** @typedef {{
 *    sentinel: (string|undefined),
 *    destination: !string,
 *    pResponse: ?Object
 *  }} */
export let AmpAnalytics3pResponse;
// Example:
// {
//   "sentinel":"20354662305315974",
//   "destination":"8117602251459417",
//   "Response":{"status":"received","somethingElse":"42"}
// }
// The sentinel value will be present when received but the sender doesn't
// need to add it, this is done by iframe-messaging-client.

/**
 * A class for holding AMP Analytics third-party vendors responses to frames.
 */
export class ResponseMap {
  /**
   * Gets the backing data structure
   * TODO(jonkeller): Is there a better place in the runtime object hierarchy to
   * hang this?
   * @returns {Object}
   * @private
   */
  static getMap_() {
    return AMP.responseMap_ || (AMP.responseMap_ = {});
  }

  /**
   * Add a response
   * @param {!string} frameType The identifier for the third-party frame that
   * responded
   * @param {!string} creativeUrl The URL of the creative being responded to
   * @param {Object} response What the response was
   */
  static add(frameType, creativeUrl, response) {
    ResponseMap.getMap_()[frameType] = ResponseMap.getMap_()[frameType] || {};
    ResponseMap.getMap_()[frameType][creativeUrl] = response;
  }

  /**
   * Remove a response, for instance if a third-party frame is being destroyed
   * @param {!string} frameType The identifier for the third-party frame
   * whose responses are to be removed
   */
  static remove(frameType) {
    delete ResponseMap.getMap_()[frameType];
  }

  /**
   * Gets the most recent response given by a certain frame to a certain
   * creative
   * @param {!string} frameType The identifier for the third-party frame
   * whose response is sought
   * @param {!string} creativeUrl The URL of the creative that the sought
   * response was about
   * @returns {?Object}
   */
  static get(frameType, creativeUrl) {
    if (ResponseMap.getMap_()[frameType] &&
      ResponseMap.getMap_()[frameType][creativeUrl]) {
      return ResponseMap.getMap_()[frameType][creativeUrl];
    }
    return {};
  }
}
