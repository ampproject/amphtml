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

import {TempCache} from './utils/temp-cache';
import {devAssert} from './log';
import {
  getAmpdoc,
  getServiceForDoc,
  registerServiceBuilderForDoc,
} from './service';
import {map} from './utils/object';


const FLUSH_CACHE_AFTER_MS = 200;
const SERVICE = 'html';


/** @typedef {function(!Array<string>):!Element} */
export let HtmlLiteralTagDef;


/** @param {!./service/ampdoc-impl.AmpDoc} ampdoc */
export function installHtmlForDoc(ampdoc) {
  registerServiceBuilderForDoc(ampdoc, SERVICE, Html);
}


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Html}
 */
function getHtml(nodeOrDoc) {
  return getServiceForDoc(getAmpdoc(nodeOrDoc), SERVICE);
}


/**
 * Creates the html helper for the doc. This returns a tagged template literal
 * helper to generate static DOM trees.
 * This must be used as a tagged template, ie
 *
 * ```
 * const html = htmlFor(nodeOrDoc);
 * const div = html`<div><span></span></div>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this
 * to render subtree's with dynamic content, it WILL result in an error!
 *
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!HtmlLiteralTagDef}
 */
export function htmlFor(nodeOrDoc) {
  return getHtml(nodeOrDoc).htmlInternal;
}


/**
 * Creates an html helper for the doc that will cache and clone nodes for
 * performance. This returns a tagged template literal helper to generate static
 * DOM trees. This must be used as a tagged template, ie
 *
 * ```
 * const html = cachedHtmlFor(nodeOrDoc);
 * const div = html`<div><span></span></div>`;
 * ```
 *
 * Only the root element and its subtree will be returned. DO NOT use this
 * to render subtree's with dynamic content, it WILL result in an error!
 *
 * This has a base O(2) memory cost, so use it only when it's likely that the
 * same tree will be rendered more than once during a short sequence of
 * animation frames. Otherwise use `htmlFor`.
 *
 * @param {!Document|!Element|!ShadowRoot} nodeOrDoc
 * @return {!HtmlLiteralTagDef}
 */
export function cachedHtmlFor(nodeOrDoc) {
  return getHtml(nodeOrDoc).cachedHtmlInternal;
}


/** @param {!Array<string>} strings */
function devAssertCorrectHtmlTemplateTagUsage({length}) {
  devAssert(length === 1, 'Improper html template tag usage.');
}


/** */
export class Html {

  /** @param {!./service/ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {

    /** @private @const {!Element} */
    this.container_ = ampdoc.getRootNode().createElement('div');

    /** @type {?TempCache<!Element>} */
    this.cache_ = null;

    /**
     * @param {!Array<string>} strings
     * @return {!Element}
     */
    this.cachedHtmlInternal = strings => { // must be arrow func for scope
      devAssertCorrectHtmlTemplateTagUsage(strings);
      const cache = this.cache_;
      this.cache_ = (cache || new TempCache(ampdoc.win, FLUSH_CACHE_AFTER_MS));
      const key = strings[0];
      const seed = cache.has(key) ?
        cache.get(key) :
        cache.put(key, this.htmlInternal(strings));
      return seed.cloneNode(/* deep */ true);
    };

    /**
     * @param {!Array<string>} strings
     * @return {!Element}
     */
    this.htmlInternal = strings => { // must be arrow func for scope
      devAssertCorrectHtmlTemplateTagUsage(strings);
      const container = this.container_;
      container./*OK*/innerHTML = strings[0];

      const el = container.firstElementChild;
      devAssert(el, 'No elements in template');
      devAssert(!el.nextElementSibling, 'Too many root elements in template');

      // Clear to free memory.
      container.removeChild(el);

      return el;
    };
  }
}

/**
 * Queries an element for all elements with a "ref" attribute, removing
 * the attribute afterwards.
 * Returns a named map of all ref elements.
 *
 * @param {!Element} root
 * @return {!Object<string, !Element>}
 */
export function htmlRefs(root) {
  const elements = root.querySelectorAll('[ref]');
  const refs = map();

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const ref = devAssert(element.getAttribute('ref'), 'Empty ref attr');
    element.removeAttribute('ref');
    devAssert(refs[ref] === undefined, 'Duplicate ref');
    refs[ref] = element;
  }

  return refs;
}
