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

import {closestByTag, closestNode, closestBySelector, escapeCssSelectorIdent, matches} from '../../../src/dom';

const TAG = 'amp-analytics';


/**
 * TODO(dvoytenko): consider moving this concept into core as AmpRoot.
 * @abstract
 */
export class AnalyticsRoot {

  /**
   * @return {!Document|!ShadowRoot|!Element}
   * @abstract
   */
  getRoot() {}

  /**
   * @return {?Element}
   * @abstract
   */
  getHost() {}

  /**
   * @param {!Node} node
   * @return {boolean}
   */
  constains(node) {
    return this.getRoot().contains(node);
  }

  /**
   * @param {string} id
   * @return {?Element}
   * @abstract
   */
  getElementById(id) {}

  /**
   * Returns the element that matches the selector. If the selector is an
   * id, the element with that id is returned. If the selector is a tag name, an
   * ancestor of the analytics element with that tag name is returned.
   *
   * @param {!Element} context
   * @param {string} selector
   * @param {?string=} selectionMethod
   * @return {?Element} Element corresponding to the selector if found.
   */
  getElement(context, selector, selectionMethod = null) {
    // Special case for root selector.
    if (selector == ':host' || selector == ':root') {
      /* QQQ: notice that this is NOT necessarily an AMP element. It has to be further looked up:
          closestBySelector(iframe, '.-amp-element,.i-amphtml-element');
      */
      return this.getHost() || this.getRoot();
    }

    let foundEl;
    if (selectionMethod == 'scope') {
      foundEl = (context.parentElement || context).querySelector(selector);
    } else if (selectionMethod == 'closest') {
      foundEl = closestBySelector(context, selector);
    } else if (selector[0] == '#') {
      foundEl = this.getElementById(selector.slice(1));
    } else {
      foundEl = this.getRoot().querySelector(selector);
    }
    if (foundEl && this.contains(foundEl)) {
      // QQQ: do we need to check that FieAnalyticsRoot is actually contained in the AmpdocAnalayticsRoot?
      return foundEl;
    }
    return null;
  }

  /**
   * @param {function(!Element, !Event)} listener
   * @param {!Element} context
   * @param {string} selector
   * @param {?string=} selectionMethod
   * @return {function(!Event)}
   */
  createSelectiveListener(
      listener, context, selector, selectionMethod = null) {
    return e => {
      const target = e.target;
      if (!this.getRoot().contains(target)) {
        return;
      }
      if (selectionMethod == 'scope' && !context.contains(target)) {
        // `:scope` context must contain the target.
        return;
      }
      if (selectionMethod == 'closest' && !target.contains(context)) {
        // `closest()` target must contain the conext.
        return;
      }
      try {
        // First do the cheap lookups.
        if (selector == '*' || matches(target, selector)) {
          listener(target, e);
        } else {
          // More expensive search.
          let el = target;
          while (el.parentElement != null &&
              el.parentElement.tagName != 'BODY') {
            el = el.parentElement;
            if (matches(el, selector)) {
              listener(el, e);
              // Don't fire the event multiple times even if the more than one
              // ancestor matches the selector.
              return;
            }
          }
        }
      } catch (selectorError) {
        user().error(TAG, 'Bad query selector.', selector, selectorError);
      }
    };
  }

  /**
   * @return {!Promise}
   * @abstract
   */
  whenRenderStarted() {}
}


/**
 */
export class AmpdocAnalyticsRoot extends AnalyticsRoot {

  /**
   * @param {!Ampdoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;
  }

  /** @override */
  getRoot() {
    return this.ampdoc.getRootNode();
  }

  /** @override */
  getHost() {
    return null;
  }

  /** @override */
  getElementById(id) {
    return this.ampdoc.getElementById(id);
  }

  /** @override */
  whenRenderStarted() {
    const resources = resourcesForDoc(this.ampdoc);
    return resources.whenRenderStarted();
  }
}


/**
 */
export class FieAnalyticsRoot extends AnalyticsRoot {

  /**
   * @param {!FriendlyIframeEmbed} embed
   */
  constructor(embed) {
    /** @const */
    this.embed = embed;
  }

  /** @override */
  getRoot() {
    return this.embed.win.document;
  }

  /** @override */
  getHost() {
    return this.embed.iframe;
  }

  /** @override */
  getElementById(id) {
    return this.embed.win.document.getElementById(id);
  }

  /** @override */
  whenRenderStarted() {
    return this.embed.whenRenderStarted();
  }
}


/**
 */
export class ScopedAnalyticsRoot extends AnalyticsRoot {

  /**
   * @param {!AmpElement} ampElement
   */
  constructor(embed) {
    /** @const */
    this.ampElement = ampElement; //QQQ: naming
  }

  /** @override */
  getRoot() {
    return this.ampElement;
  }

  /** @override */
  getHost() {
    return this.ampElement;
  }

  /** @override */
  getElementById(id) {
    const win = this.ampElement.ownerDocument.defaultView;
    const escapedId = escapeCssSelectorIdent(win, id);
    return /** @type {?Element} */ (
        this.ampElement.querySelector(`#${escapedId}`));
  }
}
