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

import './polyfills';
import {tryParseJson} from '../src/json';
import {dev, user, initLogConstructor, setReportError} from '../src/log';
import {IFRAME_TRANSPORT_EVENTS_TYPE} from '../src/iframe-transport-common';
import {IframeMessagingClient} from './iframe-messaging-client';

initLogConstructor();
// TODO(alanorozco): Refactor src/error.reportError so it does not contain big
// transitive dependencies and can be included here.
setReportError(() => {});

/** @private @const {string} */
const TAG_ = 'iframe-transport-client';

/**
 * Receives event messages bound for this cross-domain iframe, from all
 * creatives
 */
export class IframeTransportClient {

  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    // Necessary, or else check-types will complain "Property
    // processAmpAnalyticsEvent never defined on Window"
    this.win_.processAmpAnalyticsEvent =
      this.win_.processAmpAnalyticsEvent || null;

    /** @protected {!IframeMessagingClient} */
    this.client_ = new IframeMessagingClient(win);
    this.client_.setHostWindow(this.win_.parent);
    this.client_.setSentinel(dev().assertString(
        tryParseJson(this.win_.name)['sentinel'],
        'Invalid/missing sentinel on iframe name attribute' + this.win_.name));
    this.client_.makeRequest(
        IFRAME_TRANSPORT_EVENTS_TYPE,
        IFRAME_TRANSPORT_EVENTS_TYPE,
        eventData => {
          const events =
              /**
               * @type
               * {!Array<../src/iframe-transport-common.IframeTransportEvent>}
               */
              (eventData['events']);
          user().assert(events,
              'Received malformed events list in ' + this.win_.location.href);
          dev().assert(events.length,
              'Received empty events list in ' + this.win_.location.href);
          user().assert(this.win_.processAmpAnalyticsEvent,
              'Must implement processAmpAnalyticsEvent in ' +
              this.win_.location.href);
          events.forEach(event => {
            try {
              this.win_.processAmpAnalyticsEvent(event.message, event.transportId);
            } catch (e) {
              user().error(TAG_,
                  'Exception in processAmpAnalyticsEvent: ' + e.message);
            }
          });
        });
  }

  /**
   * Gets the IframeMessagingClient
   * @returns {!IframeMessagingClient}
   * @VisibleForTesting
   */
  getClient() {
    return this.client_;
  }
}

if (!window.AMP_TEST) {
  try {
    new IframeTransportClient(window);
  } catch (e) {
    user().error(TAG_, 'Failed to construct IframeTransportClient: ' +
      e.message);
  }
}
