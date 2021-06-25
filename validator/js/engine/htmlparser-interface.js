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

goog.module('amp.htmlparser.interface');

/**
 * @param {string} str The string to lower case.
 * @return {string} The str in lower case format.
 */
const toLowerCase = function(str) {
  // htmlparser heavily relies on the length of the strings, and
  // unfortunately some characters change their length when
  // lowercased; for instance, the Turkish İ has a length of 1, but
  // when lower-cased, it has a length of 2. So, as a workaround we
  // check that the length be the same as before lower-casing, and if
  // not, we only lower-case the letters A-Z.
  const lowerCased = str.toLowerCase();
  if (lowerCased.length == str.length) {
    return lowerCased;
  }
  return str.replace(/[A-Z]/g, function(ch) {
    return String.fromCharCode(ch.charCodeAt(0) | 32);
  });
};
exports.toLowerCase = toLowerCase;

/**
 * @param {string} str The string to upper case.
 * @return {string} The str in upper case format.
 */
const toUpperCase = function(str) {
  // htmlparser heavily relies on the length of the strings, and
  // unfortunately some characters change their length when
  // lowercased; for instance, the Turkish İ has a length of 1, but
  // when lower-cased, it has a length of 2. So, as a workaround we
  // check that the length be the same as before upper-casing, and if
  // not, we only upper-case the letters A-Z.
  const upperCased = str.toUpperCase();
  if (upperCased.length == str.length) {
    return upperCased;
  }
  return str.replace(/[a-z]/g, function(ch) {
    return String.fromCharCode(ch.charCodeAt(0) & 223);
  });
};
exports.toUpperCase = toUpperCase;

/**
 * Name/Value pair representing an HTML Tag attribute.
 */
const ParsedAttr = class {
  constructor() {
    /** @type {string} */
    this.name = '';
    /** @type {string} */
    this.value = '';
  }
};
exports.ParsedAttr = ParsedAttr;

// If any script in the page uses a specific release version, then all scripts
// must use that specific release version. This is used to record the first
// seen script tag and ensure all following script tags follow the convention
// set by it.
/** @enum {string} */
const ScriptReleaseVersion = {
  UNKNOWN: 'unknown',
  STANDARD: 'standard',
  LTS: 'LTS',
  MODULE_NOMODULE: 'module/nomodule',
  MODULE_NOMODULE_LTS: 'module/nomodule LTS',
};
exports.ScriptReleaseVersion = ScriptReleaseVersion;

// AMP domain
const /** string */ ampProjectDomain = 'https://cdn.ampproject.org/';

// LTS JavaScript:
// lts/v0.js
// lts/v0/amp-ad-0.1.js
const /** !RegExp */ ltsScriptPathRegex =
    new RegExp('lts/(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\\.js$', 'i');

// Module JavaScript:
// v0.mjs
// amp-ad-0.1.mjs
const /** !RegExp */ moduleScriptPathRegex =
    new RegExp('(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\\.mjs$', 'i');

// Nomodule JavaScript:
// v0.js
// v0/amp-ad-0.1.js
const /** !RegExp */ nomoduleScriptPathRegex =
    new RegExp('(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\\.js$', 'i');

// Module LTS JavaScript:
// lts/v0.mjs
// lts/v0/amp-ad-0.1.mjs
const /** !RegExp */ moduleLtsScriptPathRegex =
    new RegExp('lts/(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\\.mjs$', 'i');

// Nomodule LTS JavaScript:
// lts/v0.js
// lts/v0/amp-ad-0.1.js
const /** !RegExp */ nomoduleLtsScriptPathRegex =
    new RegExp('lts/(v0|v0/amp-[a-z0-9-]*-[a-z0-9.]*)\\.js$', 'i');

// Runtime JavaScript:
// v0.js
// v0.mjs
// v0.mjs?f=sxg
// lts/v0.js
// lts/v0.js?f=sxg
// lts/v0.mjs
const /** !RegExp */ runtimeScriptPathRegex =
    new RegExp('(lts/)?v0\\.m?js(\\?f=sxg)?', 'i');

/**
 * Represents the state of a script tag.
 */
const ScriptTag = class {
  /**
   * @param {string} tagName
   * @param {!Array<!ParsedAttr>} attrs Array of attributes.
   */
  constructor(tagName, attrs) {
    /** @type {boolean} */
    this.is_amp_domain = false;
    /** @type {boolean} */
    this.is_extension = false;
    /** @type {boolean} */
    this.is_runtime = false;
    /** @type {!ScriptReleaseVersion} */
    this.release_version = ScriptReleaseVersion.UNKNOWN;

    /** @type {boolean} */
    let is_async = false;
    /** @type {boolean} */
    let is_module = false;
    /** @type {boolean} */
    let is_nomodule = false;
    /** @type {string} */
    let path = '';
    /** @type {string} */
    let src = '';

    if (tagName !== 'SCRIPT') {
      return;
    }

    for (const attr of attrs) {
      if (attr.name === 'async') {
        is_async = true;
      } else if (
          (attr.name === 'custom-element') ||
          (attr.name === 'custom-template') || (attr.name === 'host-service')) {
        this.is_extension = true;
      } else if (attr.name === 'nomodule') {
        is_nomodule = true;
      } else if (attr.name === 'src') {
        src = attr.value;
      } else if ((attr.name === 'type') && (attr.value === 'module')) {
        is_module = true;
      }
    }

    // Determine if this has a valid AMP domain and separate the path from the
    // attribute 'src'.
    if (src.startsWith(ampProjectDomain)) {
      this.is_amp_domain = true;
      path = src.substr(ampProjectDomain.length);

      // Only look at script tags that have attribute 'async'.
      if (is_async) {
        // Determine if this is the AMP Runtime.
        if (!this.is_extension && runtimeScriptPathRegex.test(path)) {
          this.is_runtime = true;
        }

        // Determine the release version (LTS, module, standard, etc).
        if ((is_module && moduleLtsScriptPathRegex.test(path)) ||
            (is_nomodule && nomoduleLtsScriptPathRegex.test(path))) {
          this.release_version = ScriptReleaseVersion.MODULE_NOMODULE_LTS;
        } else if (
            (is_module && moduleScriptPathRegex.test(path)) ||
            (is_nomodule && nomoduleScriptPathRegex.test(path))) {
          this.release_version = ScriptReleaseVersion.MODULE_NOMODULE;
        } else if (ltsScriptPathRegex.test(path)) {
          this.release_version = ScriptReleaseVersion.LTS;
        } else {
          this.release_version = ScriptReleaseVersion.STANDARD;
        }
      }
    }
  }
};
exports.ScriptTag = ScriptTag;


/**
 * An Html parser makes method calls with ParsedHtmlTags as arguments.
 */
const ParsedHtmlTag = class {
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
    this.tagName_ = toUpperCase(tagName);
    /** @private @type {!Array<!ParsedAttr>} */
    this.attrs_ = [];
    // Convert attribute names to lower case, not values, which are
    // case-sensitive.
    for (let i = 0; i < attrs.length; i += 2) {
      const attr = new ParsedAttr();
      attr.name = toLowerCase(attrs[i]);
      attr.value = attrs[i + 1];
      // Our html parser repeats the key as the value if there is no value. We
      // replace the value with an empty string instead in this case.
      if (attr.name === attr.value) {
        attr.value = '';
      }
      this.attrs_.push(attr);
    }
    // Sort the attribute array by (lower case) name.
    this.attrs_.sort(function(a, b) {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      // No need to sub-sort by attr values, just names will do.
      return 0;
    });

    // Lazily allocated map from attribute name to value.
    /** @private @type {?Object<string, string>} */
    this.attrsByKey_ = null;

    /** @private @type {?ScriptTag} */
    this.scriptTag_ = new ScriptTag(this.tagName_, this.attrs_);
  }

  /**
   * Lower-case tag name
   * @return {string}
   */
  lowerName() {
    return toLowerCase(this.tagName_);
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
   * @return {!Array<!ParsedAttr>}
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
      for (const attr of this.attrs()) {
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
    for (const attr of this.attrs()) {
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
    const newAttrs = [];
    /** @type {string} */
    let lastAttrName = '';
    for (const attr of this.attrs_) {
      if (lastAttrName !== attr.name) {
        newAttrs.push(attr);
      }
      lastAttrName = attr.name;
    }
    this.attrs_ = newAttrs;
  }

  /**
   * Returns the value of a given attribute name. If it does not exist then
   * returns null.
   * @param {string} name
   * @return {?string}
   * @private
   */
  getAttrValueOrNull_(name) {
    return this.attrsByKey()[name] || null;
  }

  /**
   * Returns the script release version, otherwise ScriptReleaseVersion.UNKNOWN.
   * @return {!ScriptReleaseVersion}
   */
  getScriptReleaseVersion() {
    return this.scriptTag_.release_version;
  }

  /**
   * Tests if this tag is a script with a src of an AMP domain.
   * @return {boolean}
   */
  isAmpDomain() {
    return this.scriptTag_.is_amp_domain;
  }

  /**
   * Tests if this is the AMP runtime script tag.
   * @return {boolean}
   */
  isAmpRuntimeScript() {
    return this.scriptTag_.is_runtime;
  }

  /**
   * Tests if this is an extension script tag.
   * @return {boolean}
   */
  isExtensionScript() {
    return this.scriptTag_.is_extension;
  }
};
exports.ParsedHtmlTag = ParsedHtmlTag;


/**
 * An interface to the `htmlparser.HtmlParser` visitor, that gets
 * called while the HTML is being parsed.
 */
const HtmlSaxHandler = class {
  /**
   * Handler called when the parser found a new tag.
   * @param {!ParsedHtmlTag} tag
   */
  startTag(tag) {}

  /**
   * Handler called when the parser found a closing tag.
   * @param {!ParsedHtmlTag} tag
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
exports.HtmlSaxHandler = HtmlSaxHandler;


/**
 * An interface for determining the line/column information for SAX events that
 * are being received by a `HtmlSaxHandler`. Please see
 * the `HtmlSaxHandler#setDocLocator` method.
 */
const DocLocator = class {
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

  /**
   * The size of the document in bytes.
   * @return {number}.
   */
  getDocByteSize() {}
};
exports.DocLocator = DocLocator;


/**
 * Handler with a setDocLocator method in addition to the parser callbacks.
 * @extends {HtmlSaxHandler}
 */
const HtmlSaxHandlerWithLocation = class extends HtmlSaxHandler {
  constructor() {
    super();
  }

  /**
   * Called prior to parsing a document, that is, before `startTag`.
   * @param {!DocLocator} locator A locator instance which
   *   provides access to the line/column information while SAX events
   *   are being received by the handler.
   */
  setDocLocator(locator) {}
};
exports.HtmlSaxHandlerWithLocation = HtmlSaxHandlerWithLocation;
