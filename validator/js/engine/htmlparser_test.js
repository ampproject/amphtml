/**
 * Credits:
 *   Copyright 2006-2008, The Google Caja project, licensed under the
 *   Apache License (http://code.google.com/p/google-caja/).
 *   Copyright 2009, The Closure Library Authors, licensed under the
 *   Apache License.
 */

goog.module('amp.htmlparser.HtmlParserTest');

const {DocLocator, HtmlSaxHandler, HtmlSaxHandlerWithLocation} = goog.require('amp.htmlparser.interface');
const {HtmlParser} = goog.require('amp.htmlparser');

/**
 * @private
 */
class LoggingHandler extends HtmlSaxHandler {
  constructor() {
    super();
    this.log = [];
  }

  /** @override */
  startDoc() {
    this.log.push('startDoc()');
  }

  /** @override */
  cdata(text) {
    this.log.push('cdata("' + text + '")');
  }

  /** @override */
  pcdata(text) {
    this.log.push('pcdata("' + text + '")');
  }

  /** @override */
  rcdata(text) {
    this.log.push('rcdata("' + text + '")');
  }

  /** @override */
  endDoc() {
    this.log.push('endDoc()');
  }

  /** @override */
  markManufacturedBody() {
    this.log.push('markManufacturedBody()');
  }

  /** @override */
  startTag(tag) {
    tag.dedupeAttrs();
    this.log.push(
        'startTag(' + tag.upperName() + ',' + this.attrsToString(tag.attrs()) +
        ')');
  }

  /** @override */
  endTag(tag) {
    this.log.push('endTag(' + tag.upperName() + ')');
  }

  /** @override */
  effectiveBodyTag(attrs) {
    this.log.push('effectiveBodyTag(' + this.attrsToString(attrs) + ')');
  }

  /**
   * Converts a list of attributes to a comma separated string.
   * @param {!Array<!Object>} attrs
   * @return {string}
   */
  attrsToString(attrs) {
    let str = '[';
    let first = true;
    for (const attr of attrs) {
      if (first) {
        first = false;
      } else {
        str += ',';
      }
      str += attr.name + ',' + attr.value;
    }
    str += ']';
    return str;
  }
}

describe('HtmlParser', () => {
  it('parses basic text', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, 'hello world');

    expect(handler.log).toEqual([
      'startDoc()',
      'startTag(HTML,[])',
      'startTag(HEAD,[])',
      'endTag(HEAD)',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'pcdata("hello world")',
      'endTag(BODY)',
      'endTag(HTML)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses image tag', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<img src="hello.gif">');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(IMG,[src,hello.gif])',
      'endTag(IMG)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses tags inside tags', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<div><span>hello world</span></div>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(DIV,[])',
      'startTag(SPAN,[])',
      'pcdata("hello world")',
      'endTag(SPAN)',
      'endTag(DIV)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses tag with multiple attrs', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<img src="hello.gif" width="400px">');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(IMG,[src,hello.gif,width,400px])',
      'endTag(IMG)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses tag with duplicate attrs', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<a class=foo class=bar>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(A,[class,foo])',
      'endTag(A)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses tag with boolean attr', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<input type=checkbox checked>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(INPUT,[checked,,type,checkbox])',
      'endTag(INPUT)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses unclosed tag', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<span>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(SPAN,[])',
      'endTag(SPAN)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses style tag', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<span style="background-color: black;"></span>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(SPAN,[style,background-color: black;])',
      'endTag(SPAN)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses cdata', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<script><![CDATA[alert("hey");]]><\/script>');

    expect(handler.log).toEqual([
      'startDoc()',
      'startTag(HEAD,[])',
      'startTag(SCRIPT,[])',
      'cdata("<![CDATA[alert("hey");]]>")',
      'endTag(SCRIPT)',
      'endTag(HEAD)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses several tags on the same level', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<img><p>hello<img><div/></p>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(IMG,[])',
      'endTag(IMG)',
      'startTag(P,[])',
      'pcdata("hello")',
      'startTag(IMG,[])',
      'endTag(IMG)',
      'startTag(DIV,[])',
      'endTag(DIV)',
      'endTag(P)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('will not hold state between two parse calls', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<div/>');
    parser.parse(handler, '<div/>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(DIV,[])',
      'endTag(DIV)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(DIV,[])',
      'endTag(DIV)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('skips over comments', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<div><!-- this is a comment --></div>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(DIV,[])',
      'endTag(DIV)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('processes unknown or custom tags', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(
        handler,
        '<a-tag><more-tags>' +
            '<custom foo="Hello">world.</more-tags></a-tag>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(A-TAG,[])',
      'startTag(MORE-TAGS,[])',
      'startTag(CUSTOM,[foo,Hello])',
      'pcdata("world.")',
      'endTag(CUSTOM)',
      'endTag(MORE-TAGS)',
      'endTag(A-TAG)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('parses oddly formatted attributes', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    // Note the two double quotes at the end of the tag.
    parser.parse(handler, '<a href="foo.html""></a>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(A,[",,href,foo.html])',
      'endTag(A)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  // See https://www.w3.org/TR/html-markup/p.html for the logic.
  it('closes <p> tags with omitted </p> tags implicitly', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    // Note the two double quotes at the end of the tag.
    parser.parse(handler, '<p>I am not closed!<p>I am closed!</p>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(P,[])',
      'pcdata("I am not closed!")',
      'endTag(P)',
      'startTag(P,[])',
      'pcdata("I am closed!")',
      'endTag(P)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  // See https://www.w3.org/TR/html-markup/dd.html for the logic.
  it('closes <dd> and <dt> with omitted </dd> and </dt> implicitly', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    // Note the two double quotes at the end of the tag.
    parser.parse(handler, '<dl><dd><dd><dt><dd></dl>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(DL,[])',
      'startTag(DD,[])',
      'endTag(DD)',
      'startTag(DD,[])',
      'endTag(DD)',
      'startTag(DT,[])',
      'endTag(DT)',
      'startTag(DD,[])',
      'endTag(DD)',
      'endTag(DL)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  // See https://www.w3.org/TR/html-markup/li.html for the logic.
  it('closes <li> tags with omitted </li> tags implicitly', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    // Note the two double quotes at the end of the tag.
    parser.parse(handler, '<ul><li><li></ul>');

    expect(handler.log).toEqual([
      'startDoc()',
      'markManufacturedBody()',
      'startTag(BODY,[])',
      'startTag(UL,[])',
      'startTag(LI,[])',
      'endTag(LI)',
      'startTag(LI,[])',
      'endTag(LI)',
      'endTag(UL)',
      'endTag(BODY)',
      'effectiveBodyTag([])',
      'endDoc()',
    ]);
  });

  it('reports attributes on the effective body tag', () => {
    const handler = new LoggingHandler();
    const parser = new HtmlParser();
    parser.parse(handler, '<body foo=bar><body baz=bang><body foo=poo>');

    expect(handler.log).toEqual([
      'startDoc()',
      'startTag(BODY,[foo,bar])',
      'endTag(BODY)',
      'effectiveBodyTag([foo,bar,baz,bang,foo,poo])',
      'endDoc()',
    ]);
  });
});

/**
 * @private
 */
class LoggingHandlerWithLocation extends HtmlSaxHandlerWithLocation {
  constructor() {
    super();
    /** @type {?DocLocator} */
    this.locator = null;
    /** @type {!Array<string>} */
    this.log = [];
  }

  /** @override */
  setDocLocator(locator) {
    this.locator = locator;
    this.log = [];
  }

  /** @override */
  startDoc() {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': startDoc()');
  }

  /** @override */
  cdata(text) {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': cdata("' + text + '")');
  }

  /** @override */
  pcdata(text) {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': pcdata("' + text + '")');
  }

  /** @override */
  rcdata(text) {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': rcdata("' + text + '")');
  }

  /** @override */
  endDoc() {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': endDoc()');
  }

  /** @override */
  startTag(tag) {
    tag.dedupeAttrs();
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': startTag(' + tag.upperName() + ',' +
        this.attrsToString(tag.attrs()) + ')');
  }

  /** @override */
  endTag(tag) {
    this.log.push(
        ':' + this.locator.getLine() + ':' + this.locator.getCol() +
        ': endTag(' + tag.upperName() + ')');
  }

  /**
   * Converts a list of attributes to a comma separated string.
   * @param {!Array<!Object>} attrs
   * @return {string}
   */
  attrsToString(attrs) {
    let str = '[';
    let first = true;
    for (const attr of attrs) {
      if (first) {
        first = false;
      } else {
        str += ',';
      }
      str += attr.name + ',' + attr.value;
    }
    str += ']';
    return str;
  }
}

describe('HtmlParser with location', () => {
  it('reports line and column', () => {
    const handler = new LoggingHandlerWithLocation();
    const parser = new HtmlParser();
    parser.parse(
        handler,
        '<html>\n' +
            '  <body>\n' +
            '    <div style=foo>Oh hi!</div>\n' +
            '  </body>\n' +
            '</html>');

    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(HTML,[])',
      ':1:6: pcdata("\n  ")',
      ':2:2: startTag(BODY,[])',
      ':2:8: pcdata("\n    ")',
      ':3:4: startTag(DIV,[style,foo])',
      ':3:19: pcdata("Oh hi!")',
      ':3:25: endTag(DIV)',
      ':3:31: pcdata("\n  ")',
      ':4:9: pcdata("\n")',
      ':5:0: endTag(BODY)',
      ':5:0: endTag(HTML)',
      ':5:6: endDoc()',
    ]);
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
    const parser = new HtmlParser();
    parser.parse(
        handler,
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
      ':1:0: startTag(HTML,[])',
      ':1:6: pcdata("\n  ")',
      ':2:2: startTag(BODY,[])',
      ':2:8: pcdata("\n    ")',
      ':3:4: startTag(P,[])',
      ':3:7: pcdata("\n      ")',
      ':4:6: startTag(A-CUSTOM,[])',
      ':4:16: pcdata("\n        ")',
      ':5:8: startTag(DIV,[style,foo])',
      ':5:23: pcdata("Oh hi!")',
      ':5:29: endTag(DIV)',
      ':5:35: pcdata("\n      ")',
      ':6:6: endTag(A-CUSTOM)',
      ':6:17: pcdata("\n    ")',
      ':7:4: endTag(P)',
      ':7:8: pcdata("\n  ")',
      ':8:9: pcdata("\n")',
      ':9:0: endTag(BODY)',
      ':9:0: endTag(HTML)',
      ':9:6: endDoc()',
    ]);
  });

  // This covers a bugfix for http://b/26381818; the key of this test is
  // that the cdata contains newlines etc.
  it('tracks line and column past complex cdata sections', () => {
    const handler = new LoggingHandlerWithLocation();
    const parser = new HtmlParser();
    parser.parse(
        handler,
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
      ':1:0: startTag(HTML,[])',
      ':1:6: pcdata("\n")',
      ':2:0: startTag(BODY,[])',
      ':2:6: pcdata("\n")',
      ':3:0: startTag(SCRIPT,[type,application/json])',
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
      ':14:0: endTag(SCRIPT)',
      ':14:9: pcdata("\n")',
      ':15:0: startTag(AMP-ANALYTICS,[])',
      ':15:15: endTag(AMP-ANALYTICS)',
      ':15:31: pcdata("\n")',
      ':16:7: pcdata("\n")',
      ':17:0: endTag(BODY)',
      ':17:0: endTag(HTML)',
      ':17:6: endDoc()',
    ]);
  });

  it('Supports Turkish UTF8 İ character in body', () => {
    // A Javascript string with this character in it has .length 1, but
    // when .toLowerCase()'d it becomes length 2, which would throw off
    // the bookkeeping in js. Hence, amp.toLowerCase
    // works around the problem.
    const handler = new LoggingHandlerWithLocation();
    const parser = new HtmlParser();
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
      ':1:0: startTag(!DOCTYPE,[html,])',
      ':1:15: pcdata("\n")',
      ':2:0: startTag(HTML,[amp,,lang,tr])',
      ':2:20: pcdata("\n")',
      ':3:0: startTag(HEAD,[])',
      ':3:6: pcdata("\n")',
      ':4:0: startTag(META,[charset,utf-8])',
      ':4:0: endTag(META)',
      ':4:22: pcdata("\n")',
      ':5:0: startTag(TITLE,[])',
      ':5:0: rcdata("")',
      ':5:7: endTag(TITLE)',
      ':5:15: pcdata("\n")',
      ':6:0: startTag(SCRIPT,[async,,src,https://cdn.ampproject.org/v0.js])',
      ':6:0: cdata("")',
      ':6:53: endTag(SCRIPT)',
      ':6:62: pcdata("\n")',
      ':7:0: endTag(HEAD)',
      ':7:7: pcdata("\n")',
      ':8:0: startTag(BODY,[])',
      ':8:6: pcdata("İ")',
      ':8:14: pcdata("\n")',
      ':9:0: endTag(BODY)',
      ':9:0: endTag(HTML)',
      ':9:6: endTag(!DOCTYPE)',
      ':9:6: endDoc()',
    ]);
  });

  it('Supports SVG with self-closed tags', () => {
    const handler = new LoggingHandlerWithLocation();
    const parser = new HtmlParser();
    parser.parse(handler, '<html><body><svg><foo/></svg></body></html>');

    expect(handler.log).toEqual([
      ':1:0: startDoc()',
      ':1:0: startTag(HTML,[])',
      ':1:6: startTag(BODY,[])',
      ':1:12: startTag(SVG,[])',
      ':1:17: startTag(FOO,[])',
      ':1:23: endTag(FOO)',
      ':1:23: endTag(SVG)',
      ':1:36: endTag(BODY)',
      ':1:36: endTag(HTML)',
      ':1:42: endDoc()',
    ]);
  });
});
