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
 * @fileoverview A Html SAX parser.
 *
 * Examples of usage of the {@code goog.string.html.HtmlParser}:
 * <pre>
 *   const handler = new MyCustomHtmlVisitorHandlerThatExtendsHtmlSaxHandler();
 *   const parser = new goog.string.html.HtmlParser();
 *   parser.parse(handler, '<html><a href="google.com">link found!</a></html>');
 * </pre>
 */

goog.provide('amp.htmlparser.HtmlParser');
goog.provide('amp.htmlparser.HtmlParser.EFlags');
goog.provide('amp.htmlparser.HtmlParser.Elements');
goog.provide('amp.htmlparser.HtmlParser.Entities');
goog.require('amp.htmlparser.DocLocator');
goog.require('amp.htmlparser.HtmlSaxHandler');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');


/**
 * Some tags have no end tags as per HTML5 spec. These were extracted
 * from the single page spec by looking for "no end tag" with CTRL+F.
 * @type {Object<string, ?>}
 * @private
 */
const ElementsWithNoEndElements = {
  'BASE': 0,
  'LINK': 0,
  'META': 0,
  'HR': 0,
  'BR': 0,
  'WBR': 0,
  'IMG': 0,
  'EMBED': 0,
  'PARAM': 0,
  'SOURCE': 0,
  'TRACK': 0,
  'AREA': 0,
  'COL': 0,
  'INPUT': 0,
  'KEYGEN': 0,
};

/**
 * Set of HTML tags which should never trigger an implied open of a <head>
 * or <body> element.
 * @type {Object<string,?>}
 * @private
 */
const HtmlStructureElements = {
  // See https://www.w3.org/TR/html5/document-metadata.html
  '!DOCTYPE': 0,
  'HTML': 0,
  'HEAD': 0,
  'BODY': 0,
};

/**
 * The set of HTML tags which are legal in the HTML document <head> and
 * the 'HEAD' tag itself.
 * @type {Object<string,?>}
 * @private
 */
const HeadElements = {
  'HEAD': 0,
  // See https://www.w3.org/TR/html5/document-metadata.html
  'TITLE': 0,
  'BASE': 0,
  'LINK': 0,
  'META': 0,
  'STYLE': 0,
  // Also legal in the document <head>, though not per spec.
  'NOSCRIPT': 0,
  'SCRIPT': 0,
};

/**
 * The set of HTML tags whose presence will implicitly close a <p> element.
 * For example '<p>foo<h1>bar</h1>' should parse the same as
 * '<p>foo</p><h1>bar</h1>'. See https://www.w3.org/TR/html-markup/p.html
 * @type {Object<string,?>}
 * @private
 */
const ElementsWhichClosePTag = {
  'ADDRESS': 0,
  'ARTICLE': 0,
  'ASIDE': 0,
  'BLOCKQUOTE': 0,
  'DIR': 0,
  'DL': 0,
  'FIELDSET': 0,
  'FOOTER': 0,
  'FORM': 0,
  'H1': 0,
  'H2': 0,
  'H3': 0,
  'H4': 0,
  'H5': 0,
  'H6': 0,
  'HEADER': 0,
  'HR': 0,
  'MENU': 0,
  'NAV': 0,
  'OL': 0,
  'P': 0,
  'PRE': 0,
  'SECTION': 0,
  'TABLE': 0,
  'UL': 0,
};

/**
 * @enum {number}
 */
const TagRegion = {
  PRE_HEAD: 0,
  IN_HEAD: 1,
  PRE_BODY: 2,  // After closing head tag, but before open body tag.
  IN_BODY: 3,
  // We don't track the region after the closing body tag.
};

/**
 * This abstraction keeps track of which tags have been opened / closed as we
 * traverse the tags in the document. Closing tags is tricky:
 * - Some tags have no end tag per spec. For example, there is no </img> tag per
 *   spec. Since we are making startTag/endTag calls, we manufacture endTag
 *   calls for these immediately after the startTag.
 * - We assume all end tags are optional and we pop tags off our stack as we
 *   encounter parent closing tags. This part differs slightly from the behavior
 *   per spec: instead of closing an <option> tag when a following <option> tag
 *   is seen, we close it when the parent closing tag (in practice <select>) is
 *   encountered
 * @private
 */
class TagNameStack {
  /** Creates an empty instance.
   * @param {amp.htmlparser.HtmlSaxHandler|
   *     amp.htmlparser.HtmlSaxHandlerWithLocation} handler The
   *         HtmlSaxHandler that will receive the events.
   */
  constructor(handler) {
    /**
     * The current tag name and its parents.
     * @type {!Array<string>}
     * @private
     */
    this.stack_ = [];

    /**
     * The current tag name and its parents.
     * @type {amp.htmlparser.HtmlSaxHandler|
     *     amp.htmlparser.HtmlSaxHandlerWithLocation} handler The
     *         HtmlSaxHandler that will receive the events.
     * @private
     */
    this.handler_ = handler;

    /**
     * @type {number}
     * @private
     */
    this.region_ = TagRegion.PRE_HEAD;

    /**
     * Tracks when the start <head> tag has been encountered or manufactured.
     * @type {boolean}
     * @private
     */
    this.isHeadStarted_ = false;

    /**
     * Tracks when the start <body> tag has been encountered or manufactured.
     * @type {boolean}
     * @private
     */
    this.isBodyStarted_ = false;
  }

  /**
   * Enter a tag, opening a scope for child tags. Entering a tag can close the
   * previous tag or enter other tags (such as opening a <body> tag when
   * encountering a tag not allowed outside the body.
   * @param {!string} tagName
   * @param {!Array<string>} encounteredAttrs Alternating key/value pairs.
   */
  startTag(tagName, encounteredAttrs) {
    // This section deals with manufacturing <head>, </head>, and <body> tags
    // if the document has left them out or placed them in the wrong location.
    switch (this.region_) {
      case TagRegion.PRE_HEAD:
        if (tagName === 'HEAD') {
          this.region_ = TagRegion.IN_HEAD;
        } else if (tagName === 'BODY') {
          this.region_ = TagRegion.IN_BODY;
        } else if (!HtmlStructureElements.hasOwnProperty(tagName)) {
          if (HeadElements.hasOwnProperty(tagName)) {
            this.startTag('HEAD', []);
          } else {
            if (this.handler_.markManufacturedBody)
              this.handler_.markManufacturedBody();
            this.startTag('BODY', []);
          }
        }
        break;
      case TagRegion.IN_HEAD:
        if (!HeadElements.hasOwnProperty(tagName)) {
          this.endTag('HEAD');
          if (tagName !== 'BODY') {
            if (this.handler_.markManufacturedBody)
              this.handler_.markManufacturedBody();
            this.startTag('BODY', []);
          }
        }
        break;
      case TagRegion.PRE_BODY:
        if (tagName !== 'BODY') {
          if (this.handler_.markManufacturedBody)
            this.handler_.markManufacturedBody();
          this.startTag('BODY', []);
        } else {
          this.region_ = TagRegion.IN_BODY;
        }
        break;
      case TagRegion.IN_BODY:
        if (tagName === 'BODY') {
          // If we've manufactured a body, then ignore the later body.
          return;
        }
        // Check implicit tag closing due to opening tags.
        if (this.stack_.length > 0) {
          const parentTagName = this.stack_[this.stack_.length - 1];
          // <p> tags can be implicitly closed by certain other start tags.
          // See https://www.w3.org/TR/html-markup/p.html
          if (parentTagName === 'P' &&
              ElementsWhichClosePTag.hasOwnProperty(tagName)) {
            this.endTag('P');
          // <dd> and <dt> tags can be implicitly closed by other <dd> and <dt>
          // tags. See https://www.w3.org/TR/html-markup/dd.html
          } else if ((tagName == 'DD' || tagName == 'DT') &&
                     (parentTagName == 'DD' || parentTagName == 'DT')) {
            this.endTag(parentTagName);
          // <li> tags can be implicitly closed by other <li> tags.
          // See https://www.w3.org/TR/html-markup/li.html
          } else if (tagName == 'LI' && parentTagName == 'LI') {
            this.endTag('LI');
          }
        }
        break;
      default:
        break;
    }

    if (this.handler_.startTag) {
      this.handler_.startTag(tagName, encounteredAttrs);
    }
    if (ElementsWithNoEndElements.hasOwnProperty(tagName)) {
      if (this.handler_.endTag) {
        this.handler_.endTag(tagName);
      }
    } else {
      this.stack_.push(tagName);
    }
  }

  /**
   * Callback for pcdata. Some text nodes can trigger the start of the body
   * region.
   * @param {string} text
   */
  pcdata(text) {
    if (!amp.htmlparser.HtmlParser.SPACE_RE_.test(text)) {
      switch (this.region_) {
        case TagRegion.PRE_HEAD:
        case TagRegion.PRE_BODY:
          if (this.handler_.markManufacturedBody)
            this.handler_.markManufacturedBody();
          this.startTag('BODY', []);
          break;
        case TagRegion.IN_HEAD:
          this.endTag('HEAD');
          if (this.handler_.markManufacturedBody)
            this.handler_.markManufacturedBody();
          this.startTag('BODY', []);
          break;
        default:
          break;
      }
    }
    this.handler_.pcdata(text);
  }

  /**
   * Upon exiting a tag, validation for the current matcher is triggered,
   * e.g. for checking that the tag had some specified number of children.
   * @param {!string} tagName
   */
  endTag(tagName) {
    if (this.region_ == TagRegion.IN_HEAD && tagName === 'HEAD')
      this.region_ = TagRegion.PRE_BODY;

    // We ignore close body tags (</body) and instead insert them when their
    // outer scope is closed (/html). This is closer to how a browser parser
    // works. The idea here is if other tags are found after the <body>,
    // (ex: <div>) which are only allowed in the <body>, we will effectively
    // move them into the body section.
    if (tagName === 'BODY') return;

    // We look for tagName from the end. If we can find it, we pop
    // everything from thereon off the stack. If we can't find it,
    // we don't bother with closing the tag, since it doesn't have
    // a matching open tag, though in practice the HtmlParser class
    // will have already manufactured a start tag.
    for (let idx = this.stack_.length - 1; idx >= 0; idx--) {
      if (this.stack_[idx] === tagName) {
        while (this.stack_.length > idx) {
          if (this.handler_.endTag) {
            this.handler_.endTag(this.stack_.pop());
          }
        }
        return;
      }
    }
  }

  /**
   * This method is called when we're done with the
   * document. Normally, the parser should actually close the tags,
   * but just in case it doesn't this easy-enough method will take care of it.
   */
  exitRemainingTags() {
    while (this.stack_.length > 0) {
      if (this.handler_.endTag) {
        this.handler_.endTag(this.stack_.pop());
      }
    }
  }
}

/**
 * An Html parser: {@code parse} takes a string and calls methods on
 * {@code amp.htmlparser.HtmlSaxHandler} while it is visiting it.
 */
amp.htmlparser.HtmlParser = class {
  constructor() {}

  /**
   * Given a SAX-like {@code amp.htmlparser.HtmlSaxHandler} parses a
   * {@code htmlText} and lets the {@code handler} know the structure while
   * visiting the nodes. If the provided handler is an implementation of
   * {@code amp.htmlparser.HtmlSaxHandlerWithLocation}, then its
   * {@code setDocLocator} method will get called prior to
   * {@code startDoc}, and the {@code getLine} / {@code getCol} methods will
   * reflect the current line / column while a SAX callback (e.g.,
   * {@code startTag}) is active.
   *
   * @param {amp.htmlparser.HtmlSaxHandler|
   *     amp.htmlparser.HtmlSaxHandlerWithLocation} handler The
   *         HtmlSaxHandler that will receive the events.
   * @param {string} htmlText The html text.
   */
  parse(handler, htmlText) {
    let htmlUpper = null;
    let inTag = false;   // True iff we're currently processing a tag.
    const attribs = [];  // Accumulates attribute names and values.
    let tagName;         // The name of the tag currently being processed.
    let eflags;          // The element flags for the current tag.
    let openTag;         // True if the current tag is an open tag.
    let tagStack = new TagNameStack(handler);

    // Only provide location information if the handler implements the
    // setDocLocator method.
    let locator = null;
    if (handler instanceof amp.htmlparser.HtmlSaxHandlerWithLocation) {
      locator = new amp.htmlparser.HtmlParser.DocLocatorImpl(htmlText);
      handler.setDocLocator(locator);
    }

    // Lets the handler know that we are starting to parse the document.
    handler.startDoc();

    // Consumes tokens from the htmlText and stops once all tokens are
    // processed.
    while (htmlText) {
      const regex = inTag ? amp.htmlparser.HtmlParser.INSIDE_TAG_TOKEN_ :
                            amp.htmlparser.HtmlParser.OUTSIDE_TAG_TOKEN_;
      // Gets the next token
      const m = htmlText.match(regex);
      if (locator) {
        locator.advancePos(m[0]);
      }
      // And removes it from the string
      htmlText = htmlText.substring(m[0].length);

      // TODO(goto): cleanup this code breaking it into separate methods.
      if (inTag) {
        if (m[1]) {  // Attribute.
          // SetAttribute with uppercase names doesn't work on IE6.
          const attribName = amp.htmlparser.toLowerCase(m[1]);
          // Use empty string as value for valueless attribs, so
          //   <input type=checkbox checked>
          // gets attributes ['type', 'checkbox', 'checked', '']
          let decodedValue = '';
          if (m[2]) {
            let encodedValue = m[3];
            switch (encodedValue.charCodeAt(0)) {  // Strip quotes.
              case 34:                             // double quote "
              case 39:                             // single quote '
                encodedValue =
                    encodedValue.substring(1, encodedValue.length - 1);
                break;
            }
            decodedValue =
                this.unescapeEntities_(this.stripNULs_(encodedValue));
          }
          attribs.push(attribName, decodedValue);
        } else if (m[4]) {
          if (eflags !== void 0) {  // False if not in whitelist.
            if (openTag) {
              tagStack.startTag(/** @type {string} */ (tagName), attribs);
            } else {
              tagStack.endTag(/** @type {string} */ (tagName));
            }
          }

          if (openTag && (eflags & (amp.htmlparser.HtmlParser.EFlags.CDATA |
                                    amp.htmlparser.HtmlParser.EFlags.RCDATA))) {
            if (htmlUpper === null) {
              htmlUpper = amp.htmlparser.toUpperCase(htmlText);
            } else {
              htmlUpper =
                  htmlUpper.substring(htmlUpper.length - htmlText.length);
            }
            let dataEnd = htmlUpper.indexOf('</' + tagName);
            if (dataEnd < 0) {
              dataEnd = htmlText.length;
            }
            if (eflags & amp.htmlparser.HtmlParser.EFlags.CDATA) {
              if (handler.cdata) {
                handler.cdata(htmlText.substring(0, dataEnd));
              }
            } else if (handler.rcdata) {
              handler.rcdata(
                  this.normalizeRCData_(htmlText.substring(0, dataEnd)));
            }
            if (locator) {
              locator.advancePos(htmlText.substring(0, dataEnd));
            }
            htmlText = htmlText.substring(dataEnd);
          }

          tagName = eflags = openTag = void 0;
          attribs.length = 0;
          if (inTag && locator) {
            locator.snapshotPos();
          }
          inTag = false;
        }
      } else {
        if (m[1]) {  // Entity.
          tagStack.pcdata(m[0]);
        } else if (m[3]) {  // Tag.
          openTag = !m[2];
          if (!inTag && locator) {
            locator.snapshotPos();
          }
          inTag = true;
          tagName = amp.htmlparser.toUpperCase(m[3]);
          eflags = amp.htmlparser.HtmlParser.Elements.hasOwnProperty(tagName) ?
              amp.htmlparser.HtmlParser.Elements[tagName] :
              amp.htmlparser.HtmlParser.EFlags.UNKNOWN_OR_CUSTOM;
        } else if (m[4]) {  // Text.
          tagStack.pcdata(m[4]);
        } else if (m[5]) {  // Cruft.
          switch (m[5]) {
            case '<':
              tagStack.pcdata('&lt;');
              break;
            case '>':
              tagStack.pcdata('&gt;');
              break;
            default:
              tagStack.pcdata('&amp;');
              break;
          }
        }
      }
    }

    if (!inTag && locator) {
      locator.snapshotPos();
    }
    // Lets the handler know that we are done parsing the document.
    tagStack.exitRemainingTags();
    handler.endDoc();
  }

  /**
   * Decodes an HTML entity.
   *
   * @param {string} entity The full entity (including the & and the ;).
   * @return {string} A single unicode code-point as a string.
   * @private
   */
  lookupEntity_(entity) {
    // TODO(goto): use {amp.htmlparserDecode} instead ?
    // TODO(goto): &pi; is different from &Pi;
    const name =
        amp.htmlparser.toLowerCase(entity.substring(1, entity.length - 1));
    if (amp.htmlparser.HtmlParser.Entities.hasOwnProperty(name)) {
      return amp.htmlparser.HtmlParser.Entities[name];
    }
    let m = name.match(amp.htmlparser.HtmlParser.DECIMAL_ESCAPE_RE_);
    if (m) {
      return String.fromCharCode(parseInt(m[1], 10));
    } else if (!!(m = name.match(amp.htmlparser.HtmlParser.HEX_ESCAPE_RE_))) {
      return String.fromCharCode(parseInt(m[1], 16));
    }
    // If unable to decode, return the name.
    return name;
  }

  /**
   * Removes null characters on the string.
   * @param {string} s The string to have the null characters removed.
   * @return {string} A string without null characters.
   * @private
   */
  stripNULs_(s) { return s.replace(amp.htmlparser.HtmlParser.NULL_RE_, ''); }

  /**
   * The plain text of a chunk of HTML CDATA which possibly containing.
   *
   * TODO(goto): use {@code goog.string.unescapeEntities} instead ?
   * @param {string} s A chunk of HTML CDATA.  It must not start or end inside
   *   an HTML entity.
   * @return {string} The unescaped entities.
   * @private
   */
  unescapeEntities_(s) {
    return s.replace(
        amp.htmlparser.HtmlParser.ENTITY_RE_,
        goog.bind(this.lookupEntity_, this));
  }

  /**
   * Escape entities in RCDATA that can be escaped without changing the meaning.
   * @param {string} rcdata The RCDATA string we want to normalize.
   * @return {string} A normalized version of RCDATA.
   * @private
   */
  normalizeRCData_(rcdata) {
    return rcdata.replace(amp.htmlparser.HtmlParser.LOOSE_AMP_RE_, '&amp;$1')
        .replace(amp.htmlparser.HtmlParser.LT_RE, '&lt;')
        .replace(amp.htmlparser.HtmlParser.GT_RE, '&gt;');
  }
}


/**
 * HTML entities that are encoded/decoded.
 * TODO(goto): use {@code goog.string.htmlEncode} instead.
 * @type {!Object<string, string>}
 */
amp.htmlparser.HtmlParser.Entities = {
  'colon': ':',
  'lt': '<',
  'gt': '>',
  'amp': '&',
  'nbsp': '\u00a0',
  'quot': '"',
  'apos': '\''
};


/**
 * The html eflags, used internally on the parser.
 * @enum {number}
 */
amp.htmlparser.HtmlParser.EFlags = {
  OPTIONAL_ENDTAG: 1,
  EMPTY: 2,
  CDATA: 4,
  RCDATA: 8,
  UNSAFE: 16,
  FOLDABLE: 32,
  UNKNOWN_OR_CUSTOM: 64
};

/**
 * A map of element to a bitmap of flags it has, used internally on the parser.
 * @type {Object<string,?>}
 */
amp.htmlparser.HtmlParser.Elements = {
  'A': 0,
  'ABBR': 0,
  'ACRONYM': 0,
  'ADDRESS': 0,
  'APPLET': amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'AREA': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'B': 0,
  'BASE': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'BASEFONT': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'BDO': 0,
  'BIG': 0,
  'BLOCKQUOTE': 0,
  'BODY': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.FOLDABLE,
  'BR': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'BUTTON': 0,
  'CANVAS': 0,
  'CAPTION': 0,
  'CENTER': 0,
  'CITE': 0,
  'CODE': 0,
  'COL': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'COLGROUP': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'DD': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'DEL': 0,
  'DFN': 0,
  'DIR': 0,
  'DIV': 0,
  'DL': 0,
  'DT': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'EM': 0,
  'FIELDSET': 0,
  'FONT': 0,
  'FORM': 0,
  'FRAME': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'FRAMESET': amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'H1': 0,
  'H2': 0,
  'H3': 0,
  'H4': 0,
  'H5': 0,
  'H6': 0,
  'HEAD': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.FOLDABLE,
  'HR': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'HTML': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.FOLDABLE,
  'I': 0,
  'IFRAME': amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.CDATA,
  'IMG': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'INPUT': amp.htmlparser.HtmlParser.EFlags.EMPTY,
  'INS': 0,
  'ISINDEX': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'KBD': 0,
  'LABEL': 0,
  'LEGEND': 0,
  'LI': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'LINK': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'MAP': 0,
  'MENU': 0,
  'META': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'NOFRAMES': amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.CDATA,
  // TODO(johannes): This used to read:
  // 'NOSCRIPT': amp.htmlparser.HtmlParser.EFlags.UNSAFE |
  //  amp.htmlparser.HtmlParser.EFlags.CDATA,
  //
  // It appears that the effect of that is that anything inside is
  // then considered cdata, so <noscript><style>foo</noscript></noscript>
  // never sees a style start tag / end tag event. But we must
  // recognize such style tags and they're also allowed by HTML, e.g. see:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/noscript
  // On a broader note this also means we may be missing other start/end
  // tag events inside elements marked as CDATA which our parser
  // should better reject. Yikes.
  'NOSCRIPT': amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'OBJECT': amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'OL': 0,
  'OPTGROUP': 0,
  'OPTION': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'P': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'PARAM': amp.htmlparser.HtmlParser.EFlags.EMPTY |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'PRE': 0,
  'Q': 0,
  'S': 0,
  'SAMP': 0,
  'SCRIPT': amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.CDATA,
  'SELECT': 0,
  'SMALL': 0,
  'SPAN': 0,
  'STRIKE': 0,
  'STRONG': 0,
  'STYLE': amp.htmlparser.HtmlParser.EFlags.UNSAFE |
      amp.htmlparser.HtmlParser.EFlags.CDATA,
  'SUB': 0,
  'SUP': 0,
  'TABLE': 0,
  'TBODY': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'TD': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'TEXTAREA': amp.htmlparser.HtmlParser.EFlags.RCDATA,
  'TFOOT': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'TH': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'THEAD': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'TITLE': amp.htmlparser.HtmlParser.EFlags.RCDATA |
      amp.htmlparser.HtmlParser.EFlags.UNSAFE,
  'TR': amp.htmlparser.HtmlParser.EFlags.OPTIONAL_ENDTAG,
  'TT': 0,
  'U': 0,
  'UL': 0,
  'VAR': 0
};


/**
 * Regular expression that matches &s.
 * @type {RegExp}
 * @package
 */
amp.htmlparser.HtmlParser.AMP_RE = /&/g;


/**
 * Regular expression that matches loose &s.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.LOOSE_AMP_RE_ =
    /&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi;


/**
 * Regular expression that matches <.
 * @type {RegExp}
 * @package
 */
amp.htmlparser.HtmlParser.LT_RE = /</g;


/**
 * Regular expression that matches >.
 * @type {RegExp}
 * @package
 */
amp.htmlparser.HtmlParser.GT_RE = />/g;


/**
 * Regular expression that matches ".
 * @type {RegExp}
 * @package
 */
amp.htmlparser.HtmlParser.QUOTE_RE = /\"/g;


/**
 * Regular expression that matches =.
 * @type {RegExp}
 * @package
 */
amp.htmlparser.HtmlParser.EQUALS_RE = /=/g;


/**
 * Regular expression that matches null characters.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.NULL_RE_ = /\0/g;


/**
 * Regular expression that matches entities.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.ENTITY_RE_ = /&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;

/**
 * Regular expression that matches strings composed of all space characters:
 * https://dev.w3.org/html5/spec-LC/common-microsyntaxes.html#space-character
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.SPACE_RE_ = /^\s*$/;


/**
 * Regular expression that matches decimal numbers.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.DECIMAL_ESCAPE_RE_ = /^#(\d+)$/;


/**
 * Regular expression that matches hexadecimal numbers.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.HEX_ESCAPE_RE_ = /^#x([0-9A-Fa-f]+)$/;


/**
 * Regular expression that matches the next token to be processed.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.INSIDE_TAG_TOKEN_ = new RegExp(
    // Don't capture space.
    '^\\s*(?:' +
        // Capture an attribute name in group 1, and value in group 3.
        // We capture the fact that there was an attribute in group 2, since
        // interpreters are inconsistent in whether a group that matches nothing
        // is null, undefined, or the empty string.
        ('(?:' +
         // Allow attribute names to start with /, avoiding assigning the / in
         // close-tag syntax */>.
         '([^\\t\\r\\n /=>][^\\t\\r\\n =>]*|' +  // e.g. "href"
         '[^\\t\\r\\n =>]+[^ >]|' +              // e.g. "/asdfs/asd"
         '\/+(?!>))' +                           // e.g. "/"
         // Optionally followed by:
         ('(' +
          '\\s*=\\s*' +
          ('(' +
           // A double quoted string.
           '\"[^\"]*\"' +
           // A single quoted string.
           '|\'[^\']*\'' +
           // The positive lookahead is used to make sure that in
           // <foo bar= baz=boo>, the value for bar is blank, not "baz=boo".
           // Note that <foo bar=baz=boo zik=zak>, the value for bar is
           // "baz=boo" and the value for zip is "zak".
           '|(?=[a-z][a-z-]*\\s+=)' +
           // An unquoted value that is not an attribute name.
           // We know it is not an attribute name because the previous
           // zero-width match would've eliminated that possibility.
           '|[^>\\s]*' +
           ')') +
          ')') +
         '?' +
         ')') +
        // End of tag captured in group 3.
        '|(/?>)' +
        // Don't capture cruft
        '|[^a-z\\s>]+)',
    'i');


/**
 * Regular expression that matches the next token to be processed when we are
 * outside a tag.
 * @type {RegExp}
 * @private
 */
amp.htmlparser.HtmlParser.OUTSIDE_TAG_TOKEN_ = new RegExp(
    '^(?:' +
        // Entity captured in group 1.
        '&(\\#[0-9]+|\\#[x][0-9a-f]+|\\w+);' +
        // Comments not captured.
        '|<[!]--[\\s\\S]*?(?:-->|$)' +
        // '/' captured in group 2 for close tags, and name captured in group 3.
        '|<(/)?([a-z!\\?][a-z0-9_:-]*)' +
        // Text captured in group 4.
        '|([^<&>]+)' +
        // Cruft captured in group 5.
        '|([<&>]))',
    'i');


/**
 * An implementation of the {@code amp.htmlparser.DocLocator} interface
 * for use within the {@code amp.htmlparser.HtmlParser}.
 */
amp.htmlparser.HtmlParser.DocLocatorImpl =
    class extends amp.htmlparser.DocLocator {
  /**
   * @param {string} htmlText text of the entire HTML document to be processed.
   */
  constructor(htmlText) {
    super();
    // Precomputes a mapping from positions within htmlText to line /
    // column numbers. TODO(johannes): This uses a fair amount of
    // space and we can probably do better, but it's also quite simple
    // so here we are for now.
    this.lineByPos_ = [];
    this.colByPos_ = [];
    let currentLine = 1;
    let currentCol = 0;
    for (let i = 0; i < htmlText.length; ++i) {
      this.lineByPos_[i] = currentLine;
      this.colByPos_[i] = currentCol;
      if (htmlText.charAt(i) == '\n') {
        ++currentLine;
        currentCol = 0;
      } else {
        ++currentCol;
      }
    }

    // The current position in the htmlText.
    this.pos_ = 0;
    // The previous position in the htmlText - we need this to know where a
    // tag or attribute etc. started.
    this.previousPos_ = 0;

    // This gets computed from the maps above and the previousPos in
    // snapshotPos, and it's what client code of the DocLocator will
    // see.
    this.line_ = 1;
    this.col_ = 0;
  }


  /**
   * Advances the internal position by the characters in {code tokenText}.
   * This method is to be called only from within the parser.
   * @param {string} tokenText The token text which we examine to advance the
   *   line / column location within the doc.
   */
  advancePos(tokenText) {
    this.previousPos_ = this.pos_;
    this.pos_ += tokenText.length;
  }

  /**
   * Snapshots the previous internal position so that getLine / getCol will
   * return it. These snapshots happen as the parser enter / exits a tag.
   * This method is to be called only from within the parser.
   */
  snapshotPos() {
    if (this.previousPos_ < this.lineByPos_.length) {
      this.line_ = this.lineByPos_[this.previousPos_];
      this.col_ = this.colByPos_[this.previousPos_];
    }
  }

  /** @inheritDoc */
  getLine() { return this.line_; }

  /** @inheritDoc */
  getCol() { return this.col_; }
};

/**
 * @param {string} str The string to lower case.
 * @return {string} The str in lower case format.
 */
amp.htmlparser.toLowerCase = function(str) {
  // htmlparser.js heavily relies on the length of the strings, and
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

/**
 * @param {string} str The string to upper case.
 * @return {string} The str in upper case format.
 */
amp.htmlparser.toUpperCase = function(str) {
  // htmlparser.js heavily relies on the length of the strings, and
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

/**
 * This function gets eliminated by closure compiler. It's purpose in life
 * is to work around a bug wherein the compiler renames the object keys
 * for objects never accessed using an array ([]) operator. We need the keys
 * to remain unchanged for these objects.
 */
function unusedHtmlParser() {
  console./*OK*/log(ElementsWithNoEndElements['']);
  console./*OK*/log(HtmlStructureElements['']);
  console./*OK*/log(HeadElements['']);
  console./*OK*/log(ElementsWhichClosePTag['']);
}
