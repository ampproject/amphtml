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
goog.require('amp.htmlparser.HtmlParser');
goog.require('amp.htmlparser.HtmlSaxHandler');
goog.require('amp.htmlparser.HtmlSaxHandlerWithLocation');

goog.provide('amp.htmlparser.HtmlParserTest');

/**
 * @private
 */
class LoggingHandler extends amp.htmlparser.HtmlSaxHandler {
  constructor() {
    this.log = [];
  }

  /** @override */
  startDoc() { this.log.push('startDoc()'); }

  /** @override */
  cdata(text) { this.log.push('cdata("' + text + '")'); }

  /** @override */
  pcdata(text) { this.log.push('pcdata("' + text + '")'); }

  /** @override */
  rcdata(text) { this.log.push('rcdata("' + text + '")'); }

  /** @override */
  endDoc() { this.log.push('endDoc()'); }

  /** @override */
  startTag(tagName, attrs) {
    this.log.push('startTag(' + tagName + ',[' + attrs + '])');
  }

  /** @override */
  endTag(tagName) { this.log.push('endTag(' + tagName + ')'); }
}

describe('HtmlParser', () => {
  it('parses basic text', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, 'hello world');
    expect(handler.log).toEqual(
        ['startDoc()', 'pcdata("hello world")', 'endDoc()']);
  });

  it('parses image tag', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<img src="hello.gif">');
    expect(handler.log).toEqual(
        ['startDoc()', 'startTag(img,[src,hello.gif])', 'endDoc()']);
  });

  it('parses tags inside tags', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<div><span>hello world</span></div>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(div,[])', 'startTag(span,[])',
      'pcdata("hello world")', 'endTag(span)', 'endTag(div)', 'endDoc()']);
  });

  it('parses tag with multiple attrs', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<img src="hello.gif" width="400px">');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(img,[src,hello.gif,width,400px])', 'endDoc()']);
  });

  it('parses tag with boolean attr', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<input type=checkbox checked>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(input,[type,checkbox,checked,checked])',
      'endDoc()']);
  });

  it('parses unclosed tag', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<span>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(span,[])', 'endDoc()']);
  });

  it('parses style tag', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<span style="background-color: black;"></span>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(span,[style,background-color: black;])',
      'endTag(span)', 'endDoc()']);
  });

  it('parses cdata', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<script><![CDATA[alert("hey");]]><\/script>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(script,[])', 'cdata("<![CDATA[alert("hey");]]>")',
      'endTag(script)', 'endDoc()']);
  });

  it('parses several tags on the same level', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<img><p>hello<img><div/></p>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(img,[])', 'startTag(p,[])', 'pcdata("hello")',
      'startTag(img,[])', 'startTag(div,[])', 'endTag(p)', 'endDoc()']);
  });

  it('will not hold state between two parse calls', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<div/>');
    parser.parse(handler, '<div/>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(div,[])', 'endDoc()',
      'startDoc()', 'startTag(div,[])', 'endDoc()']);
  });

  it('skips over comments', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler, '<div><!-- this is a comment --></div>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(div,[])', 'endTag(div)', 'endDoc()' ]);
  });

  it('processes unknown or custom tags', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler,
                 '<a-tag><more-tags>' +
                     '<custom foo="Hello">world.</more-tags></a-tag>');
    expect(handler.log).toEqual([
      'startDoc()', 'startTag(a-tag,[])', 'startTag(more-tags,[])',
      'startTag(custom,[foo,Hello])', 'pcdata("world.")', 'endTag(more-tags)',
      'endTag(a-tag)', 'endDoc()']);
  });

  it('parses oddly formatted attributes', () => {
    const handler = new LoggingHandler();
    const parser = new amp.htmlparser.HtmlParser();
    // Note the two double quotes at the end of the tag.
    parser.parse(handler, '<a href="foo.html""></a>');
    expect(handler.log).toEqual([
        'startDoc()', 'startTag(a,[href,foo.html,","])',
        'endTag(a)', 'endDoc()' ]);
  });
});

/**
 * @private
 */
class LoggingHandlerWithLocation
extends amp.htmlparser.HtmlSaxHandlerWithLocation {
  constructor() {
    /** @type {amp.htmlparser.DocLocator} */
    this.locator = null;
    /** @type {!Array<!string>} */
    this.log = [];
  }

  /** @override */
  setDocLocator (locator) {
    this.locator = locator;
    this.log = [];
  }

  /** @override */
  startDoc() {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': startDoc()');
  }

  /** @override */
  cdata(text) {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': cdata("' + text + '")');
  }

  /** @override */
  pcdata(text) {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': pcdata("' + text + '")');
  }

  /** @override */
  rcdata(text) {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': rcdata("' + text + '")');
  }

  /** @override */
  endDoc() {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': endDoc()');
  }

  /** @override */
  startTag(tagName, attrs) {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': startTag(' + tagName + ',[' + attrs + '])');
  }

  /** @override */
  endTag(tagName) {
    this.log.push(':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': endTag(' + tagName + ')');
  }
}

describe('HtmlParser with location', () => {

  it('reports line and column', () => {
    const handler = new LoggingHandlerWithLocation();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler,
                 '<html>\n' +
                 '  <body>\n' +
                 '    <div style=foo>Oh hi!</div>\n' +
                 '  </body>\n' +
                 '</html>');
    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(html,[])',
      ':1:5: pcdata("\n  ")',
      ':2:2: startTag(body,[])',
      ':2:7: pcdata("\n    ")',
      ':3:4: startTag(div,[style,foo])',
      ':3:18: pcdata("Oh hi!")',
      ':3:25: endTag(div)',
      ':3:30: pcdata("\n  ")',
      ':4:2: endTag(body)',
      ':4:8: pcdata("\n")',
      ':5:0: endTag(html)',
      ':5:6: endDoc()']);
  });

  it('does not insert closing events as html5 standard would suggest', () => {
    // This test simply records the status quo with regard to HTML5
    // optional tags (http://www.w3.org/TR/html5/syntax.html#optional-tags).
    // We are interested in this behavior because they can be very confusing
    // to users - see https://github.com/ampproject/amphtml/issues/327.
    // So it turns out that unlike Chrome, this parser does not insert closing
    // events like the HTML5 standard would suggest. This is
    // demonstrated in the below example for which Chrome would
    // produce a DOM which has the div outside the custom - because
    // the div closes the p whereas the a-custom remains inside.
    const handler = new LoggingHandlerWithLocation();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler,
                 '<html>\n' +
                 '  <body>\n' +
                 '    <p>\n' +
                 '      <a-custom>\n' +
                 '        <div style=foo>Oh hi!</div>\n' +
                 '      </a-custom>\n' +
                 '    </p>\n' +
                 '  </body>\n' +
                 '</html>');
    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(html,[])',
      ':1:5: pcdata("\n  ")',
      ':2:2: startTag(body,[])',
      ':2:7: pcdata("\n    ")',
      ':3:4: startTag(p,[])',
      ':3:6: pcdata("\n      ")',
      ':4:6: startTag(a-custom,[])',
      ':4:15: pcdata("\n        ")',
      ':5:8: startTag(div,[style,foo])',
      ':5:22: pcdata("Oh hi!")',
      ':5:29: endTag(div)',
      ':5:34: pcdata("\n      ")',
      ':6:6: endTag(a-custom)',
      ':6:16: pcdata("\n    ")',
      ':7:4: endTag(p)',
      ':7:7: pcdata("\n  ")',
      ':8:2: endTag(body)',
      ':8:8: pcdata("\n")',
      ':9:0: endTag(html)',
      ':9:6: endDoc()' ]);
  });

  // This covers a bugfix for http://b/26381818; the key of this test is
  // that the cdata contains newlines etc.
  it('tracks line and column past complex cdata sections', () => {
    const handler = new LoggingHandlerWithLocation();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(handler,
                 '<html>\n' +
                 '<body>\n' +
                 '<script type="application/json">\n' +
                 '{\n' +
                 '"vars": {\n' +
                 '"account": "UA-XXXX-Y"\n' +
                 '},\n' +
                 '"triggers": {\n' +
                 '"default pageview": {\n' +
                 '"on": "visible"\n' +
                 '}\n' +
                 '}\n' +
                 '}\n' +
                 '</script>\n' +
                 '<amp-analytics></amp-analytics>\n' +
                 '</body>\n' +
                 '</html>');
    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(html,[])',
      ':1:5: pcdata("\n")',
      ':2:0: startTag(body,[])',
      ':2:5: pcdata("\n")',
      ':3:0: startTag(script,[type,application/json])',
      ':3:0: cdata("\n' +
          '{\n' +
          '"vars": {\n' +
          '"account": "UA-XXXX-Y"\n' +
          '},\n' +
          '"triggers": {\n' +
          '"default pageview": {\n' +
          '"on": "visible"\n' +
          '}\n' +
          '}\n' +
          '}\n' +
          '")',
      ':14:0: endTag(script)',
      ':14:8: pcdata("\n")',
      ':15:0: startTag(amp-analytics,[])',
      ':15:15: endTag(amp-analytics)',
      ':15:30: pcdata("\n")',
      ':16:0: endTag(body)',
      ':16:6: pcdata("\n")',
      ':17:0: endTag(html)',
      ':17:6: endDoc()']);
  });

  it('Supports Turkish UTF8 İ character in body', () => {
    // A Javascript string with this character in it has .length 1, but
    // when .toLowerCase()'d it becomes length 2, which would throw off
    // the bookkeeping in htmlparser.js. Hence, amp.htmlparser.toLowerCase
    // works around the problem.
    const handler = new LoggingHandlerWithLocation();
    const parser = new amp.htmlparser.HtmlParser();
    parser.parse(
        handler,
        '<!doctype html>\n' +
        '<html amp lang="tr">\n' +
        '<head>\n' +
        '<meta charset="utf-8">\n' +
        '<title></title>\n' +
        '<script async src="https://cdn.ampproject.org/v0.js"></script>\n' +
        '</head>\n' +
        '<body>İ</body>\n' +
        '</html>');
    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(!doctype,[html,html])',
      ':1:14: pcdata("\n")',
      ':2:0: startTag(html,[amp,amp,lang,tr])',
      ':2:19: pcdata("\n")',
      ':3:0: startTag(head,[])',
      ':3:5: pcdata("\n")',
      ':4:0: startTag(meta,[charset,utf-8])',
      ':4:21: pcdata("\n")',
      ':5:0: startTag(title,[])',
      ':5:0: rcdata("")',
      ':5:7: endTag(title)',
      ':5:14: pcdata("\n")',
      ':6:0: startTag(script,[async,async,src,'+
          'https://cdn.ampproject.org/v0.js])',
      ':6:0: cdata("")',
      ':6:53: endTag(script)',
      ':6:61: pcdata("\n")',
      ':7:0: endTag(head)',
      ':7:6: pcdata("\n")',
      ':8:0: startTag(body,[])',
      ':8:5: pcdata("İ")',
      ':8:7: endTag(body)',
      ':8:13: pcdata("\n")',
      ':9:0: endTag(html)',
      ':9:6: endDoc()' ]);
  });
});
