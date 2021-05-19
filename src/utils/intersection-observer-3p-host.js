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

import {MessageType} from '../3p-frame-messaging';
import {SubscriptionApi} from '../iframe-helper';
import {dict} from '../core/types/object';
import {layoutRectLtwh, moveLayoutRect, rectIntersection} from '../layout-rect';

/**
 * The structure that defines the rectangle used in intersection observers.
 *
 * @typedef {{
 *   top: number,
 *   bottom: number,
 *   left: number,
 *   right: number,
 *   width: number,
 *   height: number,
 *   x: number,
 *   y: number,
 * }}
 */
export let DOMRect;

export const DEFAULT_THRESHOLD = [
  0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65,
  0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
];

/** @typedef {{
 *    element: !Element,
 *    currentThresholdSlot: number,
 *  }}
 */
let ElementIntersectionStateDef;

/** @const @private */
const INIT_TIME = Date.now();

/**
 * A function to get the element's current IntersectionObserverEntry
 * regardless of the intersetion ratio. Only available when element is not
 * nested in a container iframe.
 * @param {!../layout-rect.LayoutRectDef} element element's rect
 * @param {?../layout-rect.LayoutRectDef} owner element's owner rect
 * @param {!../layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @return {!IntersectionObserverEntry} A change entry.
 */
export function getIntersectionChangeEntry(element, owner, hostViewport) {
  const intersection =
    rectIntersection(element, owner, hostViewport) ||
    layoutRectLtwh(0, 0, 0, 0);
  const ratio = intersectionRatio(intersection, element);
  return calculateChangeEntry(element, hostViewport, intersection, ratio);
}

/**
 * A class to help amp-iframe and amp-ad nested iframe listen to intersection
 * change.
 */
export class IntersectionObserver3pHost {
  /**
   * @param {!AMP.BaseElement} baseElement
   * @param {!Element} iframe
   */
  constructor(baseElement, iframe) {
    /** @private @const {!AMP.BaseElement} */
    this.baseElement_ = baseElement;

    /** @private {?IntersectionObserver} */
    this.intersectionObserver_ = null;

    /** @private {?SubscriptionApi} */
    this.subscriptionApi_ = new SubscriptionApi(
      iframe,
      MessageType.SEND_INTERSECTIONS,
      false, // is3P
      () => {
        this.startSendingIntersection_();
      }
    );

    this.intersectionObserver_ = new IntersectionObserver(
      (entries) => {
        this.subscriptionApi_.send(
          MessageType.INTERSECTION,
          dict({'changes': entries.map(cloneEntryForCrossOrigin)})
        );
      },
      {threshold: DEFAULT_THRESHOLD}
    );
  }

  /**
   * Function to start listening to viewport event. and observer intersection
   * change on the element.
   */
  startSendingIntersection_() {
    this.intersectionObserver_.observe(this.baseElement_.element);
  }

  /**
   * Clean all listenrs
   */
  destroy() {
    this.intersectionObserver_.disconnect();
    this.intersectionObserver_ = null;
    this.subscriptionApi_.destroy();
    this.subscriptionApi_ = null;
  }
}

/**
 * Returns the ratio of the smaller box's area to the larger box's area.
 * @param {!../layout-rect.LayoutRectDef} smaller
 * @param {!../layout-rect.LayoutRectDef} larger
 * @return {number}
 * @visibleForTesting
 */
export function intersectionRatio(smaller, larger) {
  const smallerBoxArea = smaller.width * smaller.height;
  const largerBoxArea = larger.width * larger.height;

  // Check for a divide by zero
  return largerBoxArea === 0 ? 0 : smallerBoxArea / largerBoxArea;
}

/**
 * Helper function to calculate the IntersectionObserver change entry.
 * @param {!../layout-rect.LayoutRectDef} element element's rect
 * @param {?../layout-rect.LayoutRectDef} hostViewport hostViewport's rect
 * @param {!../layout-rect.LayoutRectDef} intersection
 * @param {number} ratio
 * @return {!IntersectionObserverEntry}}
 */
function calculateChangeEntry(element, hostViewport, intersection, ratio) {
  // If element not in an iframe.
  // adjust all LayoutRect to hostViewport Origin.
  let boundingClientRect = element;
  let rootBounds = hostViewport;
  // If no hostViewport is provided, element is inside an non-scrollable iframe.
  // Every Layoutrect has already adjust their origin according to iframe
  // rect origin. LayoutRect position is relative to iframe origin,
  // thus relative to iframe's viewport origin because the viewport is at the
  // iframe origin. No need to adjust position here.

  if (hostViewport) {
    // If element not in an iframe.
    // adjust all LayoutRect to hostViewport Origin.
    rootBounds = /** @type {!../layout-rect.LayoutRectDef} */ (rootBounds);
    intersection = moveLayoutRect(
      intersection,
      -hostViewport.left,
      -hostViewport.top
    );
    // The element is relative to (0, 0), while the viewport moves. So, we must
    // adjust.
    boundingClientRect = moveLayoutRect(
      boundingClientRect,
      -hostViewport.left,
      -hostViewport.top
    );
    // Now, move the viewport to (0, 0)
    rootBounds = moveLayoutRect(
      rootBounds,
      -hostViewport.left,
      -hostViewport.top
    );
  }

  return /** @type {!IntersectionObserverEntry} */ ({
    time:
      typeof performance !== 'undefined' && performance.now
        ? performance.now()
        : Date.now() - INIT_TIME,
    rootBounds,
    boundingClientRect,
    intersectionRect: intersection,
    intersectionRatio: ratio,
  });
}

/**
 * @param {!IntersectionObserverEntry} entry
 * @return {!IntersectionObserverEntry}
 */
function cloneEntryForCrossOrigin(entry) {
  return /** @type {!IntersectionObserverEntry} */ ({
    'time': entry.time,
    'rootBounds': entry.rootBounds,
    'boundingClientRect': entry.boundingClientRect,
    'intersectionRect': entry.intersectionRect,
    'intersectionRatio': entry.intersectionRatio,
  });
}
