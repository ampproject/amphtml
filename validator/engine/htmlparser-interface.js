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

goog.provide('amp.htmlparser.DocLocator');
goog.provide('amp.htmlparser.HtmlSaxHandler');
goog.provide('amp.htmlparser.HtmlSaxHandlerWithLocation');


/**
 * An interface to the {@code amp.htmlparser.HtmlParser} visitor, that gets
 * called while the HTML is being parsed.
 */
amp.htmlparser.HtmlSaxHandler = class {
  /**
   * Handler called when the parser found a new tag.
   * @param {string} name The name of the tag that is starting.
   * @param {Array<string>} attributes The attributes of the tag.
   */
  startTag(name, attributes) {}

  /**
   * Handler called when the parser found a closing tag.
   * @param {string} name The name of the tag that is ending.
   */
  endTag(name) {}

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
