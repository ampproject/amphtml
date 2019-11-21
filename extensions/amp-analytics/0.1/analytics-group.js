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

import {dev, userAssert} from '../../../src/log';
import {getTrackerKeyName, getTrackerTypesForParentType} from './events';

/**
 * Represents the group of analytics triggers for a single config. All triggers
 * are declared and released at the same time.
 *
 * @implements {../../../src/service.Disposable}
 */
export class AnalyticsGroup {
  /**
   * @param {!./analytics-root.AnalyticsRoot} root
   * @param {!Element} analyticsElement
   */
  constructor(root, analyticsElement) {
    /** @const */
    this.root_ = root;
    /** @const */
    this.analyticsElement_ = analyticsElement;

    /** @private @const {!Array<!UnlistenDef>} */
    this.listeners_ = [];
  }

  /** @override */
  dispose() {
    this.listeners_.forEach(listener => {
      listener();
    });
  }

  /**
   * Adds a trigger with the specified config and listener. The config must
   * contain `on` property specifying the type of the event.
   *
   * Triggers registered on a group are automatically released when the
   * group is disposed.
   *
   * @param {!JsonObject} config
   * @param {function(!./events.AnalyticsEvent)} handler
   */
  addTrigger(config, handler) {
    const eventType = dev().assertString(config['on']);
    const trackerKey = getTrackerKeyName(eventType);
    const trackerWhitelist = getTrackerTypesForParentType(this.root_.getType());

    const tracker = this.root_.getTrackerForWhitelist(
      trackerKey,
      trackerWhitelist
    );
    userAssert(
      !!tracker,
      'Trigger type "%s" is not allowed in the %s',
      eventType,
      this.root_.getType()
    );
    const unlisten = tracker.add(
      this.analyticsElement_,
      eventType,
      config,
      handler
    );
    this.listeners_.push(unlisten);
  }
}
