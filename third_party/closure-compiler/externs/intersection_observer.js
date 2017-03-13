// TODO(robadurbin): Once the Intersection Observer spec is adopted by W3C, add
// a w3c_ prefix to this file's name.

/*
 * Copyright 2016 The Closure Compiler Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Externs for Intersection Observer objects.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html
 * @externs
 * @author robadurbin@google.com (Rob Durbin)
 */


/**
 * These contain the information provided from a change event.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#intersectionobserverentry
 * @constructor
 */
function IntersectionObserverEntry() {}

/**
 * The time the change was observed.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserverentry-time
 * @type {number}
 * @const
 */
IntersectionObserverEntry.prototype.time;

/**
 * The rectangle describing the element being observed.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserverentry-boundingclientrect
 * @type {!{top: number, right: number, bottom: number, left: number,
 *     height: number, width: number}}
 * @const
 */
IntersectionObserverEntry.prototype.boundingClientRect;

/**
 * The rectangle describing the intersection between the observed element and
 * the viewport.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserverentry-intersectionrect
 * @type {!{top: number, right: number, bottom: number, left: number,
 *     height: number, width: number}}
 * @const
 */
IntersectionObserverEntry.prototype.intersectionRect;

/**
 * The the ratio of the intersectionRect to the boundingClientRect.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserverentry-intersectionrect
 * @type {number}
 * @const
 */
IntersectionObserverEntry.prototype.intersectionRatio;

/**
 * This is the constructor for Intersection Observer objects.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserver-intersectionobserver
 * @param {function(!Array<!IntersectionObserverEntry>)} handler The callback for the observer.
 * @param {{threshold: Array<number>}} options The object defining the thresholds, etc.
 * @constructor
 */
function IntersectionObserver(handler, options) {};

/**
 * This is used to set which element to observe.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserver-observe
 * @param {!Element} element The element to observe.
 */
IntersectionObserver.prototype.observe = function(element) {};

/**
 * This is used to stop observing a given element.
 * @see http://rawgit.com/WICG/IntersectionObserver/master/index.html#dom-intersectionobserver-unobserve
 * @param {!Element} element The elmenent to stop observing.
 */
IntersectionObserver.prototype.unobserve = function(element) {};
