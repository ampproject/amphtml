/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {EXPERIMENT_ATTRIBUTE} from './traffic-experiments';
import {user} from '../../../src/log';

/** @private */
const PINGBACK_ADDRESS = 'https://csi.gstatic.com';

export class AmpAdLifecycleReporter {

  /**
   * @param {!Window} win  Parent Element window object.
   * @param {!string} namespace  Namespace for page-level info.  (E.g.,
   *   'amp' vs 'a4a'.)
   */
  constructor (win, namespace) {
    this.win_ = win;
    this.namespace_ = namespace;
    this.win_.ampAdSlotId = this.win_.ampAdSlotId || 0;
    this.win_.ampAdPageCorrelator = this.win_.ampAdPageCorrelator ||
        Math.floor(Number.MAX_SAFE_INTEGER * Math.random());
    this.slotId_ = this.win_.ampAdSlotId++;
    this.qqid_ = null;
    this.initTime_ = Date.now();
  }

  /**
   * @param {!string} qqid
   */
  setQQId(qqid) {
    this.qqid_ = qqid;
  }

  /**
   * @param {!Element} element
   * @param {!string} name
   * @param {!string} stageId
   */
  sendPing(element, name, stageId) {
    this.emitPing_(element, this.buildPingAddress_(name, stageId));
  }

  /**
   *
   * @param {!string} name  Metric name to send.
   * @param {!number} stageId  Index of lifecycle stage at which ping is sent.
   * @returns {!string}  URL to send metrics to.
   * @private
   */
  buildPingAddress_(name, stageId) {
    const slotName = this.namespace_ + '.' + this.slotId_;
    const delta = Date.now() - this.initTime_;
    const qqidParam = this.qqid_ ?
        `&qqid.${slotName}=${this.qqid_}` : '';
    const eid = element.getAttribute(EXPERIMENT_ATTRIBUTE);
    const eidParam = eid ? `&e=${eid}` : '';
    const pingUrl = `${PINGBACK_ADDRESS}?s=a4a&v=2&it=name.${delta}` +
        `&rt=stage.${stageId}` +
        `&c=${this.win_.ampAdPageCorrelator}` +
        '&rls=$internalRuntimeVersion$' +
        `${eidParam}${qqidParam}` +
        `&it.${slotName}=name.${delta}` +
        `&rt.${slotName}=stage.${stageId}` +
        `&met.${slotName}=stage_${stageId}.${delta}`;
    return pingUrl;
  }

  /**
   * Send ping by creating an img element and attaching to the DOM.
   * Separate function so that it can be stubbed out for testing.
   *
   * @param {!Element} element  Location to insert ping img in DOM.
   *   (Inserted before this element.)
   * @param {!string} url Address to ping.
   * @private
   */
  emitPing_(element, url) {
    // const pingElement = element.ownerDocument.createElement('img');
    // pingElement.setAttribute('src', pingUrl);
    // pingElement.setAttribute('aria-hidden', 'true');
    // element.parentNode.insertBefore(pingElement, element);
    user().info('PING', url);
    console.log('PING! ' + url);
  }
}
