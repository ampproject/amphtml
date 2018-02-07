/**
 * @license DEDUPE_ON_MINIFY
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
 */

goog.provide('amp.htmlparser.DocLocator');
goog.provide('amp.htmlparser.HtmlSaxHandler');
goog.provide('amp.htmlparser.HtmlSaxHandlerWithLocation');
goog.provide('amp.htmlparser.ParsedHtmlTag');
goog.require('goog.array');


/**
 * An Html parser makes method calls with ParsedHtmlTags as arguments.
 */
amp.htmlparser.ParsedHtmlTag = class {
  /**
   * @param {string} tagName
   * @param {Array<string>=} opt_attrs Array of alternating (name, value) pairs.
   */
  constructor(tagName, opt_attrs) {
    // Tag and Attribute names are case-insensitive. For error messages, we
    // would like to use lower-case names as they read a little nicer. However,
    // in validator environments where the parsing is done by the actual
    // browser, the DOM API returns tag names in upper case. We stick with this
    // convention for tag names, for performance, but convert to lower when
    // producing error messages. Error messages aren't produced in latency
    // sensitive contexts.
    /** @type {!Array<string>} */
    const attrs = opt_attrs || [];

    /** @private @type {string} */
    this.tagName_ = amp.htmlparser.toUpperCase(tagName);
    /** @private @type {!Array<!Object>} */
    this.attrs_ = [];
    // Convert attribute names to lower case, not values, which are
    // case-sensitive.
    for (let i = 0; i < attrs.length; i += 2) {
      let attr = Object.create(null);
      attr.name = amp.htmlparser.toLowerCase(attrs[i]);
      attr.value = attrs[i + 1];
      // Our html parser repeats the key as the value if there is no value. We
      // replace the value with an empty string instead in this case.
      if (attr.name === attr.value) attr.value = '';
      this.attrs_.push(attr);
    }
    // Sort the attribute array by (lower case) name.
    goog.array.sort(this.attrs_, function(a, b) {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      // No need to sub-sort by attr values, just names will do.
      return 0;
    });

    // Lazily allocated map from attribute name to value.
    /** @private @type {?Object<string, string>} */
    this.attrsByKey_ = null;
  }

  /**
   * Lower-case tag name
   * @return {string}
   */
  lowerName() {
    return amp.htmlparser.toLowerCase(this.tagName_);
  }

  /**
   * Upper-case tag name
   * @return {string}
   */
  upperName() {
    return this.tagName_;
  }

  /**
   * Returns an array of attributes. Each attribute has two fields: name and
   * value. Name is always lower-case, value is the case from the original
   * document. Values are unescaped.
   * @return {!Array<!Object>}
   */
  attrs() {
    return this.attrs_;
  }

  /**
   * Returns an object mapping attribute name to attribute value. This is
   * populated lazily, as it's not used for most tags.
   * @return {Object<string, string>}
   * */
  attrsByKey() {
    if (this.attrsByKey_ === null) {
      this.attrsByKey_ = Object.create(null);
      for (let attr of this.attrs()) {
        this.attrsByKey_[attr.name] = attr.value;
      }
    }
    return /** @type{Object<string, string>} */ (this.attrsByKey_);
  }

  /**
   * Returns a duplicate attribute name if the tag contains two attributes
   * named the same, but with different attribute values. Same attribute name
   * AND value is OK. Returns null if there are no such duplicate attributes.
   * @return {?string}
   */
  hasDuplicateAttrs() {
    /** @type {string} */
    let lastAttrName = '';
    /** @type {string} */
    let lastAttrValue = '';
    for (let attr of this.attrs()) {
      if (lastAttrName === attr.name && lastAttrValue !== attr.value) {
        return attr.name;
      }
      lastAttrName = attr.name;
      lastAttrValue = attr.value;
    }
    return null;
  }

  /**
   * Removes duplicate attributes from the attribute list. This is consistent
   * with HTML5 parsing error handling rules, only the first attribute with
   * each attribute name is considered, the remainder are ignored.
   */
  dedupeAttrs() {
    /** @type {!Array<!Object>} */
    let newAttrs = [];
    /** @type {string} */
    let lastAttrName = '';
    for (let attr of this.attrs_) {
      if (lastAttrName !== attr.name) {
        newAttrs.push(attr);
      }
      lastAttrName = attr.name;
    }
    this.attrs_ = newAttrs;
  }

  /**
   * @return {boolean}
   */
  isEmpty() {
    return this.tagName_.length === 0;
  }
};


/**
 * An interface to the {@code amp.htmlparser.HtmlParser} visitor, that gets
 * called while the HTML is being parsed.
 */
amp.htmlparser.HtmlSaxHandler = class {
  /**
   * Handler called when the parser found a new tag.
   * @param {!amp.htmlparser.ParsedHtmlTag} tag
   */
  startTag(tag) {}

  /**
   * Handler called when the parser found a closing tag.
   * @param {!amp.htmlparser.ParsedHtmlTag} tag
   */
  endTag(tag) {}

  /**
   * Handler called when PCDATA is found.
   * @param {string} text The PCDATA text found.
   */
  pcdata(text) {}

  /**
   * Handler called when RCDATA is found.
   * @param {string} text The RCDATA text found.
   */
  rcdata(text) {}

  /**
   * Handler called when CDATA is found.
   * @param {string} text The CDATA text found.
   */
  cdata(text) {}

  /**
   * Handler called when the parser is starting to parse the document.
   */
  startDoc() {}

  /**
   * Handler called when the parsing is done.
   */
  endDoc() {}

  /**
   * Callback for informing that the parser is manufacturing a <body> tag not
   * actually found on the page. This will be followed by a startTag() with the
   * actual body tag in question.
   */
  markManufacturedBody() {}

  /**
   * HTML5 defines how parsers treat documents with multiple body tags: they
   * merge the attributes from the later ones into the first one. Therefore,
   * just before the parser sends the endDoc event, it will also send this
   * event which will provide the attributes from the effective body tag
   * to the client (the handler).
   */
  effectiveBodyTag(attributes) {}
};


/**
 * An interface for determining the line/column information for SAX events that
 * are being received by a {@code amp.htmlparser.HtmlSaxHandler}. Please see
 * the {@code amp.htmlparser.HtmlSaxHandler#setDocLocator} method.
 */
amp.htmlparser.DocLocator = class {
  constructor() {}

  /**
   * The current line in the HTML source from which the most recent SAX event
   * was generated. This value is only sensible once an event has been
   * generated, that is, in practice from within the context of the
   * HtmlSaxHandler methods - e.g., startTag, pcdata, etc.
   * @return {number} line The current line.
   */
  getLine() {}

  /**
   * The current column in the HTML source from which the most recent SAX event
   * was generated. This value is only sensible once an event has been
   * generated, that is, in practice from within the context of the
   * HtmlSaxHandler methods - e.g., startTag, pcdata, etc.
   * @return {number} line The current column.
   */
  getCol() {}
};


/**
 * Handler with a setDocLocator method in addition to the parser callbacks.
 * @extends {amp.htmlparser.HtmlSaxHandler}
 */
amp.htmlparser.HtmlSaxHandlerWithLocation =
    class extends amp.htmlparser.HtmlSaxHandler {
  constructor() { super(); }

  /**
   * Called prior to parsing a document, that is, before {@code startTag}.
   * @param {amp.htmlparser.DocLocator} locator A locator instance which
   *   provides access to the line/column information while SAX events
   *   are being received by the handler.
   */
  setDocLocator(locator) {}
};
