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

import {getDataParamsFromAttributes} from '../../../src/dom';

const VARIABLE_DATA_ATTRIBUTE_KEY = /^vars(.+)/;
const EMPTY_FUNC = function() {};
const PROP = '__AMP_AN_ROOT';


/**
 */
export class VisibilityTracker extends Tracker {
  /**
   */
  constructor(root, eventType) {
    super(root, eventType);

    dev().assert(eventType == AnalyticsEventType.VISIBLE ||
        eventType == AnalyticsEventType.HIDDEN,
        'visibility tracker should be called with visible or hidden ' +
        'eventType, instead got %s', eventType);
  }

  /** @override */
  dispose() {
  }

  /** @override*/
  add(context, eventType, config, listener) {
    if (!isVisibilitySpecValid(config)) {
      return EMPTY_FUNC;
    }

    const eventType = this.eventType;
    const shouldBeVisible = eventType == AnalyticsEventType.VISIBLE;
    const listenOnceFunc = this.visibilityV2Enabled_
        ? this.visibility_.listenOnceV2.bind(this.visibility_)
        : this.visibility_.listenOnce.bind(this.visibility_);
    const host = this.root.getHost();
    const spec = /** @type {!Object} */ (config['visibilitySpec']);
    const selector = spec && spec['selector']; // QQQ: support root selectors directly?
    let element;
    if (selector && !isRootSelector(selector)) {
      const selectionMethod = spec['selectionMethod'] || null;
      element = this.root.getElement(context, selector, selectionMethod);
    } else if (host) {
      // An embed of some sort?
      // TODO(dvoytenko, #6794): Remove old `-amp-element` form after the new
      // form is in PROD for 1-2 weeks.
      element = closestBySelector(host, '.-amp-element,.i-amphtml-element');
    } else {
      // QQQ: element = this.root.getRoot();
    }
    if (element && element != this.ampdoc.getRootNode()) {
      // QQQ: check that visibility API considers viewer visibility as well.
      listenOnceFunc(element, spec || {}, vars => {  // QQQ: add `element` to visibility listenOnce APIs.
        const attr = getDataParamsFromAttributes(
            element,
            /* computeParamNameFunc */ undefined,
            VARIABLE_DATA_ATTRIBUTE_KEY);
        for (const key in attr) {
          vars[key] = attr[key];
        }
        listener(new AnalyticsEvent(eventType, vars));
      }, shouldBeVisible, context);  // QQQ: remove context/analyticsElement from visibilty APIs.
    } else {
      // QQQ: root + visibility params?
      const viewer = viewerForDoc(this.ampdoc); //QQQ: where does this.ampdoc come from?
      if (viewer.isVisible() == shouldBeVisible) {
        listener(new AnalyticsEvent(eventType));
        config['called'] = true;
      } else {
        viewer.onVisibilityChanged(() => {
          if (!config['called'] &&
              viewer.isVisible() == shouldBeVisible) {
            listener(new AnalyticsEvent(eventType));
            config['called'] = true;
          }
        });
      }
    }
    // QQQ: return unlisten();
  }
}
