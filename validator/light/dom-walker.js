/**
 * @license
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
 * limitations under the license.
 *
 * Credits:
 *   Copyright 2006-2008, The Google Caja project, licensed under the
 *   Apache License (http://code.google.com/p/google-caja/).
 *   Copyright 2009, The Closure Library Authors, licensed under the
 *   Apache License.
 */

/**
 * @fileoverview A Html DOM walker that simulates a SAX parser.
 *
 * See the `goog.string.html.HtmlParser`, this is simulating that
 * interface.
 *
 * TODO(powdercloud): We're not currently using this, but may use it. Ronsider
 * removing it if not used after 2017-04-01.
 */

goog.provide('amp.domwalker');
goog.provide('amp.domwalker.DomWalker');
goog.provide('amp.domwalker.NodeProcessingState_');
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.htmlparser.HtmlSaxHandler');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');
goog.require('amp.htmlparser.ParsedHtmlTag');

/**
 * Stores an Element Node and a position in it's child list.
 * @private
 */
amp.domwalker.NodeProcessingState_ = class {
  /**
   * @param {!Node} node
   */
  constructor(node) {
    /**
     * @type {!Node}
     * @private
     */
    this.node_ = node;

    /**
     * @type {number}
     * @private
     */
    this.numChildren_ = this.node_.children.length;

    /**
     * @type {number}
     * @private
     */
    this.nextChildIdx_ = 0;
  }

  /**
   * @return {!Node}
   */
  node() { return this.node_; }

  /**
   * Returns the next unprocessed child, advancing the internal pointer.
   * If all children have been processed, returns undefined.
   * @return {amp.domwalker.NodeProcessingState_|undefined}
   */
  nextChild() {
    if (this.numChildren_ > this.nextChildIdx_) {
      var thisChild = this.node_.children[this.nextChildIdx_];
      this.nextChildIdx_ += 1;
      return new amp.domwalker.NodeProcessingState_(thisChild);
    }
    return undefined;
  }
};

/**
 * Convert a dom namedNodeMap to an attribute/value list.
 * @param {NamedNodeMap} namedNodeMap
 * @return {Array<string>} attributes as alternating key/value pairs
 */
function attrList(namedNodeMap) {
  var ret = [];
  for (var i = 0; i < namedNodeMap.length; ++i) {
    // The attribute name is always lower cased when returned by the browser.
    ret.push(namedNodeMap[i].name);
    ret.push(namedNodeMap[i].value);
  }
  return ret;
}

/**
 * Set of element names requiring cdata validation.
 * @type {Object<string,number>}
 */
const CdataTagsToValidate = {'SCRIPT': 0, 'STYLE': 0};

/**
 * @enum {number}
 */
amp.domwalker.HandlerCalls = {
  UNKNOWN: 0,
  START_TAG: 1,
  END_TAG: 2,
  CDATA: 3,
};

/**
 * A dom walker: `walktree` takes a DOM Node and calls methods on
 * `amp.htmlparser.HtmlSaxHandler` while it is visiting it.
 */
amp.domwalker.DomWalker = class {
  constructor() {}

  /**
   * Given a SAX-like `amp.htmlparser.HtmlSaxHandler`, enumerates the
   * children of `rootDoc` and lets the `handler` know the
   * structure while visiting the nodes.
   *
   * @param {!amp.htmlparser.HtmlSaxHandler} handler
   * @param {!Document} rootDoc
   */
  walktree(handler, rootDoc) {
    // TODO(gregable): Can we also implement
    // amp.htmlparser.HtmlSaxHandlerWithLocation easily? Not necessary give the
    // use case for this, but it might be nice to have if trivial. If we do, be
    // extra careful of the lower case conversions changing string lengths.
    let locator = null;
    if (handler instanceof amp.htmlparser.HtmlSaxHandlerWithLocation) {
      locator = new amp.htmlparser.HtmlParser.DocLocatorImpl('');
      handler.setDocLocator(locator);
    }

    handler.startDoc();

    // Apparently the !doctype 'tag' is not considered an element in the DOM,
    // so we can't see it naively. Unsure if there is a better approach here.
    if (rootDoc.doctype !== null) {
      handler.startTag(new amp.htmlparser.ParsedHtmlTag(
          '!DOCTYPE', [rootDoc.doctype.name, '']));
    }

    // The approach here is to walk the DOM, generating handler calls which
    // we store but don't actually run. Then we make all of the handler calls
    // later in one go with no DOM accesses. This approach is hopefully cheaper
    // than DOM accesses interleaved with javascript calls.

    // Type of each array element is another array whose first element is a
    // amp.domwalker.HandlerCalls enum and whose later elements are arguments
    // to that Handlercall f'n. TODO(gregable): Make this a well-defined type.
    const calls = [];
    const tagStack = [];
    tagStack.push(new amp.domwalker.NodeProcessingState_(rootDoc));
    while (tagStack.length > 0) {
      const curState = tagStack[tagStack.length - 1];
      const nextChild = curState.nextChild();
      if (nextChild !== undefined) {
        // The browser always returns upper case tag names.
        const tagName = nextChild.node().nodeName;
        calls.push([
          amp.domwalker.HandlerCalls.START_TAG, tagName,
          attrList(nextChild.node().attributes)
        ]);
        if (CdataTagsToValidate.hasOwnProperty(tagName)) {
          calls.push(
              [amp.domwalker.HandlerCalls.CDATA, nextChild.node().textContent]);
        }

        tagStack.push(nextChild);
      } else {
        // Don't 'endTag' on the root element, which is a document fragment.
        if (tagStack.length > 1) {
          calls.push([
            amp.domwalker.HandlerCalls.END_TAG,
            // The browser always returns upper case tag names.
            curState.node().nodeName
          ]);
        }
        tagStack.pop();
      }
    }

    for (let i = 0; i < calls.length; ++i) {
      switch (calls[i][0]) {
        case amp.domwalker.HandlerCalls.START_TAG:
          handler.startTag(
              new amp.htmlparser.ParsedHtmlTag(calls[i][1], calls[i][2]));
          break;
        case amp.domwalker.HandlerCalls.CDATA:
          handler.cdata(calls[i][1]);
          break;
        case amp.domwalker.HandlerCalls.END_TAG:
          handler.endTag(new amp.htmlparser.ParsedHtmlTag(calls[i][1]));
          break;
        default:
          console/*OK*/.error(calls[i][0]);
          break;
      }
    }
    handler.endDoc();
  }
};

/**
 * This function gets eliminated by closure compiler. It's purpose in life
 * is to work around a bug wherein the compiler renames the object keys
 * for objects never accessed using an array ([]) operator. We need the keys
 * to remain unchanged for these objects.
 */
function unusedDomWalker() {
  console./*OK*/log(CdataTagsToValidate['']);
}
