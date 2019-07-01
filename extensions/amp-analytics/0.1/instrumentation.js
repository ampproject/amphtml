/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {AmpdocAnalyticsRoot, EmbedAnalyticsRoot} from './analytics-root';
import {AnalyticsEvent, CustomEventTracker} from './events';
import {AnalyticsGroup} from './analytics-group';
import {getFriendlyIframeEmbedOptional} from '../../../src/friendly-iframe-embed';
import {
  getParentWindowFrameElement,
  getServiceForDoc,
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service';

const PROP = '__AMP_AN_ROOT';

/**
 * @implements {../../../src/service.Disposable}
 * @private
 * @visibleForTesting
 */
export class InstrumentationService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.ampdocRoot_ = new AmpdocAnalyticsRoot(this.ampdoc);
  }

  /** @override */
  dispose() {
    this.ampdocRoot_.dispose();
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getAnalyticsRoot(context) {
    return this.findRoot_(context);
  }

  /**
   * @param {!Element} analyticsElement
   * @return {!AnalyticsGroup}
   */
  createAnalyticsGroup(analyticsElement) {
    const root = this.findRoot_(analyticsElement);
    return new AnalyticsGroup(root, analyticsElement);
  }

  /**
   * Triggers the analytics event with the specified type.
   *
   * @param {!Element} target
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
   */
  triggerEventForTarget(target, eventType, opt_vars) {
    // TODO(dvoytenko): rename to `triggerEvent`.
    const event = new AnalyticsEvent(target, eventType, opt_vars);
    const root = this.findRoot_(target);
    const tracker = /** @type {!CustomEventTracker} */ (root.getTracker(
      'custom',
      CustomEventTracker
    ));
    tracker.trigger(event);
  }

  /**
   * @param {!Node} context
   * @return {!./analytics-root.AnalyticsRoot}
   */
  findRoot_(context) {
    // FIE
    const frame = getParentWindowFrameElement(context, this.ampdoc.win);
    if (frame) {
      const embed = getFriendlyIframeEmbedOptional(frame);
      if (embed) {
        const embedNotNull = embed;
        return this.getOrCreateRoot_(embed, () => {
          return new EmbedAnalyticsRoot(
            this.ampdoc,
            embedNotNull,
            this.ampdocRoot_
          );
        });
      }
    }

    // Ampdoc root
    return this.ampdocRoot_;
  }

  /**
   * @param {!Object} holder
   * @param {function():!./analytics-root.AnalyticsRoot} factory
   * @return {!./analytics-root.AnalyticsRoot}
   */
  getOrCreateRoot_(holder, factory) {
    let root = /** @type {?./analytics-root.AnalyticsRoot} */ (holder[PROP]);
    if (!root) {
      root = factory();
      holder[PROP] = root;
    }
    return root;
  }
}

/**
 * It's important to resolve instrumentation asynchronously in elements that
 * depends on it in multi-doc scope. Otherwise an element life-cycle could
 * resolve way before we have the service available.
 *
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<InstrumentationService>}
 */
export function instrumentationServicePromiseForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<InstrumentationService>} */ (getServicePromiseForDoc(
    elementOrAmpDoc,
    'amp-analytics-instrumentation'
  ));
}

/**
 * @param {!Element|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!InstrumentationService}
 */
export function instrumentationServiceForDocForTesting(elementOrAmpDoc) {
  registerServiceBuilderForDoc(
    elementOrAmpDoc,
    'amp-analytics-instrumentation',
    InstrumentationService
  );
  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-instrumentation');
}
