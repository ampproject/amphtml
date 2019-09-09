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

import {Services} from '../../../src/services';
import {sendEngagement} from './eventService';

export class BrowsiEngagementService {
  /**
   * Engagement Service Constructor
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /**
     * Max running time in seconds
     * @const {number}
     */
    this.runTime = 120;
    /**
     * Sample time in seconds
     * @const {number}
     */
    this.sampleTime = 1;
    /**
     * Min engagement event amount to send
     * @const {number}
     */
    this.minBatchLength = 5;
    /**
     * @private {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
     */
    this.ampdoc_ = ampdoc;

    /**
     * @private @const {!../../../src/service/viewport/viewport-interface.ViewportInterface}
     */
    this.viewport_ = Services.viewportForDoc(this.ampdoc_);

    /**
     * @private {Array}
     */
    this.engagementBatch_ = [];

    /**
     * @private {number}
     */
    this.startTime_ = Date.now();

    /**
     * @private {number}
     */
    this.lastScrollTop_ = 1;

    /**
     * @private {number}
     */
    this.lastEngagementReportTime_ = this.startTime_;
  }

  /**
   * Samples engagement metrics for the current time
   * @return {Object} An object that includes Engagement data for the current time
   */
  buildEngagementData() {
    const screenHeight = window.screen.availHeight;
    const bodyHeight = this.ampdoc_.getBody()./*OK*/ clientHeight;
    const scrollTop = this.viewport_.getScrollTop();
    const pixelsDiff = scrollTop - this.lastScrollTop_;
    const now = Date.now();
    const timeDelta = (now - this.lastEngagementReportTime_) / 1000;

    return {
      scrollTop,
      timeOnPage: (now - this.startTime_) / 1000,
      screenHeight,
      now,
      scrollDistance: scrollTop + screenHeight,
      scrollDepth: (scrollTop / bodyHeight) * 100,
      pageHeight: bodyHeight,
      timeDelta,
      pixelDelta: pixelsDiff,
      velocity: Math.round(Math.abs(pixelsDiff / timeDelta)),
    };
  }

  /**
   * Initiates the Engagement reports:
   * - Every 1 second, engagement data is sampled
   * - The data is batched and each time 5 engagement samples are collected, 5 matching engagement events are sent.
   * - This behavior is defined to work for 2 minutes (120 seconds)
   */
  assignEngagementReports() {
    const interval = setInterval(() => {
      const engagementEvent = this.buildEngagementData();
      this.lastScrollTop_ = engagementEvent./*OK*/ scrollTop;
      this.lastEngagementReportTime_ = engagementEvent.now;

      this.engagementBatch_.push(engagementEvent);
      if (this.engagementBatch_.length >= this.minBatchLength) {
        this.sendAndEmptyEngagementBatch();
      }
    }, this.sampleTime * 1000);

    setTimeout(() => {
      clearInterval(interval);
    }, this.runTime * 1000);
  }

  /**
   * Sends engagement events, that match the engagement data objects that were collected.
   */
  sendAndEmptyEngagementBatch() {
    sendEngagement(this.engagementBatch_);
    this.engagementBatch_ = [];
  }
  /**
   * Checks if the lastEngagement date was reset, indicates that we sent the engagement at least once.
   * @return {boolean}
   */
  isSentAtLeastOnce() {
    return this.startTime_ !== this.lastEngagementReportTime_;
  }
}
