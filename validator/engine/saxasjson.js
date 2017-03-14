/**
 * @license
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
 * limitations under the license.
 */
goog.provide('amp.htmlparser.dumpSaxAsJson');
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.htmlparser.HtmlSaxHandler');

/** @private  */
class JsonOutHandler extends amp.htmlparser.HtmlSaxHandler {
  /**
   * @param {!Array<!Array<string>>} out
   */
  constructor(out) {
    super();
    /** @type {!Array<!Array<string>>} */
    this.out = out;
  }

  /** @override */
  startDoc() {
    this.out.push(['startDoc']);
  }

  /** @override */
  cdata(text) {
    this.out.push(['cdata', text]);
  }

  /** @override */
  pcdata(text) {
    this.out.push(['pcdata', text]);
  }

  /** @override */
  rcdata(text) {
    this.out.push(['rcdata', text]);
  }

  /** @override */
  endDoc() {
    this.out.push(['endDoc']);
  }

  /** @override */
  markManufacturedBody() {
    this.out.push(['markManufacturedBody']);
  }

  /** @override */
  startTag(tagName, attrs) {
    this.out.push(['startTag', tagName].concat(attrs));
  }

  /** @override */
  endTag(tagName) {
    this.out.push(['endTag', tagName]);
  }
}

/**
 * Returns the SAX events that htmlparser.js generates as JSON.
 * EXPERIMENTAL: Do not rely on this API, it may change and/or go away
 * without notice.
 * @param {string} htmlText
 * @return {!Array<!Array<string>>}
 * @export
 */
amp.htmlparser.dumpSaxAsJson = function(htmlText) {
  const jsonArray = [];
  const handler = new JsonOutHandler(jsonArray);
  const parser = new amp.htmlparser.HtmlParser();
  parser.parse(handler, htmlText);
  return jsonArray;
};
