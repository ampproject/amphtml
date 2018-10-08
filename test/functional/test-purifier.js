/**
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
 * limitations under the License.
 */

import {
  purifyHtml,
  purifyTagsForTripleMustache,
  resolveUrlAttr,
  rewriteAttributeValue,
  rewriteAttributesForElement,
} from '../../src/purifier';

/**
 * Helper that serializes output of purifyHtml() to string.
 * @param {string} html
 * @param {boolean=} diffing
 * @return {string}
 */
function purify(html, diffing = false) {
  const body = purifyHtml(html, diffing);
  return body.innerHTML;
}

describe('DOMPurify-based', () => {
  runSanitizerTests();

  describe('<script>', () => {
    it('should not allow plain <script> tags', () => {
      expect(purify('<script>alert(1)</script>')).to.equal('');
    });

    it('should not allow script[type="text/javascript"]', () => {
      expect(purify('<script type="text/javascript">alert(1)</script>'))
          .to.equal('');
    });

    it('should not allow script[type="application/javascript"]', () => {
      const html = '<script type="application/javascript">alert(1)</script>';
      expect(purify(html)).to.equal('');
    });

    it('should allow script[type="application/json"]', () => {
      const html = '<script type="application/json">{}</script>';
      expect(purify(html)).to.equal(html);
    });

    it('should allow script[type="application/ld+json"]', () => {
      const html = '<script type="application/ld+json">{}</script>';
      expect(purify(html)).to.equal(html);
    });

    it('should not allow insecure <script> tags around secure ones', () => {
      const html = '<script type="application/json">{}</script>';
      // Should not allow an insecure tag following a secure one.
      expect(purify(html + '<script>alert(1)</script>')).to.equal(html);
      // Should not allow an insecure tag preceding a secure one.
      expect(purify('<script>alert(1)</script>' + html)).to.equal(html);
      // Should not allow an insecure tag containing a secure one.
      expect(purify('<script>alert(1)' +
          '<script type="application/json">{}</script></script>')).to.equal('');
    });
  });

  describe('for <amp-bind>', () => {
    it('should rewrite [text] and [class] attributes', () => {
      expect(purify('<p [text]="foo"></p>')).to.be
          .equal('<p data-amp-bind-text="foo" i-amphtml-binding=""></p>');
      expect(purify('<p [class]="bar"></p>')).to.be
          .equal('<p data-amp-bind-class="bar" i-amphtml-binding=""></p>');
    });

    it('should NOT rewrite values of binding attributes', () => {
      // Should not change "foo.bar".
      expect(purify('<a [href]="foo.bar">link</a>')).to.equal(
          '<a data-amp-bind-href="foo.bar" i-amphtml-binding="">link</a>');
    });
  });

  // Select SVG XSS tests from https://html5sec.org/#svg.
  describe('SVG', () => {
    it('should prevent XSS via <G> tag and onload attribute', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg">'
          + '<g onload="javascript:alert(1)"></g></svg>';
      expect(purify(svg)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg"><g></g></svg>');
    });

    it('should prevent XSS via <SCRIPT> tag', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg">'
          + '<script>alert(1)</script></svg>';
      expect(purify(svg)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    });

    it('should prevent automatic execution of onload attribute without other '
        + 'SVG elements', () => {
      const svg = '<svg onload="javascript:alert(1)" '
          + 'xmlns="http://www.w3.org/2000/svg"></svg>';
      expect(purify(svg)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    });

    it('should prevent simple passive XSS via XLink', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg">'
          + '<a xmlns:xlink="http://www.w3.org/1999/xlink" '
          + 'xlink:href="javascript:alert(1)">'
          + '<rect width="1000" height="1000" fill="white"/></a></svg>';
      expect(purify(svg)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg">'
          + '<a xmlns:xlink="http://www.w3.org/1999/xlink">' +
          '<rect fill="white" height="1000" width="1000"></rect></a></svg>');
    });

    it('should prevent XSS via "from" attribute in SVG and inline-SVG', () => {
      const svg = '<svg>'
          + '<a xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="?">'
          + '<circle r="400"></circle>'
          + '<animate attributeName="xlink:href" begin="0" '
          + 'from="javascript:alert(1)" to="&" />'
          + '</a></svg>';
      expect(purify(svg)).to.equal(
          '<svg><a xlink:href="?" xmlns:xlink="http://www.w3.org/1999/xlink">'
          + '<circle r="400"></circle></a></svg>');
    });
  });
});

function runSanitizerTests() {
  describe('purifyHtml', () => {
    /**
     * @param {string} html
     * @return {!NodeList}
     */
    function serialize(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.childNodes;
    }

    /**
     * @param {!NodeList} a
     * @param {!NodeList} b
     */
    function expectEqualNodeLists(a, b) {
      expect(a.length).to.equal(b.length);
      for (let i = 0; i < a.length; i++) {
        expect(a[i].isEqualNode(b[i])).to.be.true;
      }
    }

    it('should output basic text', () => {
      expect(purify('abc')).to.be.equal('abc');
    });

    it('should output valid markup', () => {
      expect(purify('<h1>abc</h1>')).to.be.equal('<h1>abc</h1>');
      expect(purify('<h1>a<i>b</i>c</h1>')).to.be.equal(
          '<h1>a<i>b</i>c</h1>');
      expect(purify('<h1>a<i>b</i><br>c</h1>')).to.be.equal(
          '<h1>a<i>b</i><br>c</h1>');
      expect(purify(
          '<h1>a<i>b</i>c' +
          '<amp-img src="http://example.com/1.png"></amp-img></h1>'))
          .to.be.equal(
              '<h1>a<i>b</i>c' +
              '<amp-img src="http://example.com/1.png"></amp-img></h1>');
    });

    it('should NOT output security-sensitive markup', () => {
      expect(purify('a<script>b</script>c')).to.be.equal('ac');
      expect(purify('a<script>b<img>d</script>c')).to.be.equal('ac');
      expect(purify('a<img>c')).to.be.equal('ac');
      expect(purify('a<iframe></iframe>c')).to.be.equal('ac');
      expect(purify('a<frame></frame>c')).to.be.equal('ac');
      expect(purify('a<video></video>c')).to.be.equal('ac');
      expect(purify('a<audio></audio>c')).to.be.equal('ac');
      expect(purify('a<applet></applet>c')).to.be.equal('ac');
      expect(purify('a<link>c')).to.be.equal('ac');
      expect(purify('a<meta>c')).to.be.equal('ac');
    });

    it('should NOT output security-sensitive markup when nested', () => {
      expect(purify('a<script><style>b</style></script>c'))
          .to.be.equal('ac');
      expect(purify('a<style><iframe>b</iframe></style>c'))
          .to.be.equal('ac');
      expect(purify('a<script><img></script>c'))
          .to.be.equal('ac');
    });

    it('should NOT output security-sensitive markup when broken', () => {
      expect(purify('a<script>bc')).to.be.equal('a');
      expect(purify('a<SCRIPT>bc')).to.be.equal('a');
    });

    it('should output "on" attribute', () => {
      expect(purify('a<a on="tap:AMP.print">b</a>')).to.be.equal(
          'a<a on="tap:AMP.print">b</a>');
    });

    it('should output "data-, aria-, and role" attributes', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
          purify('<a aria-label="bar" data-foo="bar" role="button">b</a>')
      );
      const expected = serialize(
          '<a aria-label="bar" data-foo="bar" role="button">b</a>');
      expectEqualNodeLists(actual, expected);
    });

    it('should output "href" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
          purify('a<a href="http://acme.com/">b</a>')
      );
      const expected = serialize(
          'a<a target="_top" href="http://acme.com/">b</a>');
      expectEqualNodeLists(actual, expected);
    });

    it('should output "rel" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
          purify('a<a href="http://acme.com/" rel="amphtml">b</a>')
      );
      const expected = serialize(
          'a<a href="http://acme.com/" rel="amphtml" target="_top">b</a>');
      expectEqualNodeLists(actual, expected);
    });

    it('should output "layout" attribute', () => {
      const img = '<amp-img layout="responsive"></amp-img>';
      expect(purify(img)).to.equal(img);
    });

    it('should output "media" attribute', () => {
      const img = '<amp-img media="(min-width: 650px)"></amp-img>';
      expect(purify(img)).to.equal(img);
    });

    it('should output "sizes" attribute', () => {
      const img = '<amp-img sizes="(min-width: 650px) 50vw, 100vw"></amp-img>';
      expect(purify(img)).to.equal(img);
    });

    it('should output "heights" attribute', () => {
      const img = '<amp-img heights="(min-width:500px) 200px, 80%"></amp-img>';
      expect(purify(img)).to.equal(img);
    });

    it('should default target to _top with href', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
          purify('<a href="">a</a><a href="" target="">c</a>')
      );
      const expected = serialize(
          '<a href="" target="_top">a</a><a href="" target="_top">c</a>');
      expectEqualNodeLists(actual, expected);
    });

    it('should NOT default target to _top w/o href', () => {
      expect(purify(
          '<a>b</a>'
          + '<a target="">d</a>'
      )).to.equal(
          '<a>b</a>'
          + '<a target="_top">d</a>');
    });

    it('should output a valid target', () => {
      expect(purify('<a target="_top">a</a><a target="_blank">b</a>'))
          .to.equal('<a target="_top">a</a><a target="_blank">b</a>');
    });

    it('should output a valid target in different case', () => {
      expect(purify('<a target="_TOP">a</a><a target="_BLANK">b</a>'))
          .to.equal('<a target="_top">a</a><a target="_blank">b</a>');
    });

    it('should override a unallowed target', () => {
      expect(purify(
          '<a target="_self">_self</a>'
          + '<a target="_parent">_parent</a>'
          + '<a target="_other">_other</a>'
          + '<a target="_OTHER">_OTHER</a>'
          + '<a target="other">other</a>'
      )).to.equal(
          '<a target="_top">_self</a>'
          + '<a target="_top">_parent</a>'
          + '<a target="_top">_other</a>'
          + '<a target="_top">_OTHER</a>'
          + '<a target="_top">other</a>');
    });

    it('should NOT output security-sensitive attributes', () => {
      expect(purify('a<a onclick="alert">b</a>')).to.be.equal(
          'a<a>b</a>');
      expect(purify('a<a href="javascript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
      expect(purify('a<a href="JAVASCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
      expect(purify('a<a href="vbscript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
      expect(purify('a<a href="VBSCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
      expect(purify('a<a href="data:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
      expect(purify('a<a href="DATA:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>');
    });

    it('should NOT output blacklisted values for class attributes', () => {
      allowConsoleError(() => {
        expect(purify('<p class="i-amphtml-">hello</p>')).to.be
            .equal('<p>hello</p>');
        expect(purify('<p class="i-amphtml-class">hello</p>')).to.be
            .equal('<p>hello</p>');
        expect(purify('<p class="foo-i-amphtml-bar">hello</p>')).to.be
            .equal('<p>hello</p>');
      });
    });

    it('should allow amp-subscriptions attributes', () => {
      expect(purify('<div subscriptions-action="login">link</div>'))
          .to.equal('<div subscriptions-action="login">link</div>');
      expect(purify('<div subscriptions-section="actions">link</div>'))
          .to.equal('<div subscriptions-section="actions">link</div>');
      expect(purify('<div subscriptions-actions="">link</div>'))
          .to.equal('<div subscriptions-actions="">link</div>');
      expect(purify('<div subscriptions-display="">link</div>'))
          .to.equal('<div subscriptions-display="">link</div>');
      expect(purify('<div subscriptions-dialog="">link</div>'))
          .to.equal('<div subscriptions-dialog="">link</div>');
    });

    it('should allow source::src with valid protocol', () => {
      expect(purify('<source src="https://www.foo.com/">'))
          .to.equal('<source src="https://www.foo.com/">');
    });

    // TODO(choumx): HTTPS-only URI attributes are not enforced consistently
    // in the sanitizer yet. E.g. amp-video requires HTTPS, amp-img does not.
    // Unskip when this is fixed.
    it.skip('should not allow source::src with invalid protocol', () => {
      expect(purify('<source src="http://www.foo.com">'))
          .to.equal('<source src="">');
      expect(purify('<source src="<script>bad()</script>">'))
          .to.equal('<source src="">');
    });

    it('should allow div::template', () => {
      expect(purify('<div template="my-template-id"></div>'))
          .to.equal('<div template="my-template-id"></div>');
    });

    it('should allow form::action-xhr', () => {
      expect(purify('<form action-xhr="https://foo.com"></form>'))
          .to.equal('<form action-xhr="https://foo.com"></form>');
    });

    // Need to test this since DOMPurify doesn't offer a API for tag-specific
    // attribute whitelists. Instead, we hack around it with custom hooks.
    it('should not allow unsupported attributes after a valid one', () => {
      const html = '<form action-xhr="https://foo.com"></form>' +
            '<p action-xhr="https://foo.com"></p>';
      expect(purify(html))
          .to.equal('<form action-xhr="https://foo.com"></form><p></p>');
    });

    it('should allow <amp-form>-related attributes', () => {
      expect(purify('<div submitting></div>'))
          .to.equal('<div submitting=""></div>');
      expect(purify('<div submit-success></div>'))
          .to.equal('<div submit-success=""></div>');
      expect(purify('<div submit-error></div>'))
          .to.equal('<div submit-error=""></div>');
      expect(purify('<div verify-error></div>'))
          .to.equal('<div verify-error=""></div>');
      expect(purify('<span visible-when-invalid="valueMissing"></span>'))
          .to.equal('<span visible-when-invalid="valueMissing"></span>');
      expect(purify('<span validation-for="form1"></span>'))
          .to.equal('<span validation-for="form1"></span>');
    });

    it('should avoid disallowing default-supported attributes', () => {
      // We whitelist all attributes of AMP elements, but make sure we don't
      // remove default-supported attributes from the whitelist afterwards.
      const html =
          '<amp-img style="color: red"></amp-img><p style="color: blue"></p>';
      expect(purify(html)).to.equal(html);
    });

    it('should allow <amp-lightbox> attributes', () => {
      expect(purify('<amp-lightbox scrollable></amp-lightbox>'))
          .to.equal('<amp-lightbox scrollable=""></amp-lightbox>');
    });

    it('should output "i-amphtml-key" attribute if diffing is enabled', () => {
      // Elements with bindings should have i-amphtml-key="<number>".
      expect(purify('<p [x]="y"></p>', true)).to.match(
          /<p data-amp-bind-x="y" i-amphtml-binding="" i-amphtml-key="(\d+)"><\/p>/);
      // AMP elements should have i-amphtml-key="<number>".
      expect(purify('<amp-img></amp-img>', true)).to.match(
          /<amp-img i-amphtml-key="(\d+)"><\/amp-img>/);
      // AMP elements with bindings should have i-amphtml-key="<number>".
      expect(purify('<amp-img [x]="y"></amp-img>', true)).to.match(
          /<amp-img i-amphtml-key="(\d+)" data-amp-bind-x="y" i-amphtml-binding=""><\/amp-img>/);
      // Other elements should NOT have i-amphtml-key-set.
      expect(purify('<p></p>')).to.equal('<p></p>');
    });
  });

  describe('purifyTagsForTripleMustache', () => {
    it('should output basic text', () => {
      expect(purifyTagsForTripleMustache('abc')).to.be.equal('abc');
    });

    it('should output HTML entities', () => {
      const entity = '&lt;tag&gt;';
      expect(purifyTagsForTripleMustache(entity)).to.be.equal(entity);
      // DOMPurify short-circuits when there are no '<' characters.
      expect(purifyTagsForTripleMustache(`<p>${entity}</p>`))
          .to.be.equal(`<p>${entity}</p>`);
    });

    it('should output valid markup', () => {
      expect(purifyTagsForTripleMustache('<b>abc</b>'))
          .to.be.equal('<b>abc</b>');
      expect(purifyTagsForTripleMustache('<b>ab<br>c</b>')).to.be.equal(
          '<b>ab<br>c</b>');
      expect(purifyTagsForTripleMustache('<b>a<i>b</i>c</b>')).to.be.equal(
          '<b>a<i>b</i>c</b>');
      const markupWithClassAttribute = '<p class="some-class">heading</p>';
      expect(purifyTagsForTripleMustache(markupWithClassAttribute))
          .to.be.equal(markupWithClassAttribute);
      const markupWithClassesAttribute =
          '<div class="some-class another"><span>heading</span></div>';
      expect(purifyTagsForTripleMustache(markupWithClassesAttribute))
          .to.be.equal(markupWithClassesAttribute);
      const markupParagraph = '<p class="valid-class">paragraph</p>';
      expect(purifyTagsForTripleMustache(markupParagraph))
          .to.be.equal(markupParagraph);
    });

    it('should NOT output non-whitelisted markup', () => {
      expect(purifyTagsForTripleMustache('a<style>b</style>c'))
          .to.be.equal('ac');
      expect(purifyTagsForTripleMustache('a<img>c'))
          .to.be.equal('ac');
    });

    it('should compensate for broken markup', () => {
      expect(purifyTagsForTripleMustache('<b>a<i>b')).to.be.equal(
          '<b>a<i>b</i></b>');
    });

    it('should support list tags', () => {
      const html = '<ol><li></li></ol><ul></ul>';
      expect(purifyTagsForTripleMustache(html)).to.be.equal(html);
    });

    describe('should sanitize `style` attribute', () => {
      it('should allow valid styles',() => {
        expect(purify('<div style="color:blue">Test</div>'))
            .to.equal('<div style="color:blue">Test</div>');
      });

      it('should ignore styles containing `!important`',() => {
        allowConsoleError(() => {
          expect(purify('<div style="color:blue!important">Test</div>'))
              .to.equal('<div>Test</div>');
        });
      });

      it('should ignore styles containing `position:fixed`', () => {
        allowConsoleError(() => {
          expect(purify('<div style="position:fixed">Test</div>'))
              .to.equal('<div>Test</div>');
        });
      });

      it('should ignore styles containing `position:sticky`', () => {
        allowConsoleError(() => {
          expect(purify('<div style="position:sticky">Test</div>'))
              .to.equal('<div>Test</div>');
        });
      });
    });
  });
}

describe('rewriteAttributesForElement', () => {
  let location = 'https://pub.com/';
  it('should not modify `target` on publisher origin', () => {
    const element = document.createElement('a');
    element.setAttribute('href', '#hash');

    rewriteAttributesForElement(element, 'href', 'https://not.hash/',
        location);

    expect(element.getAttribute('href')).to.equal('https://not.hash/');
    expect(element.hasAttribute('target')).to.equal(false);
  });

  describe('on CDN origin', () => {
    beforeEach(() => {
      location = 'https://cdn.ampproject.org';
    });

    it('should set `target` when rewrite <a> from hash to non-hash', () => {
      const element = document.createElement('a');
      element.setAttribute('href', '#hash');

      rewriteAttributesForElement(
          element, 'href', 'https://not.hash/', location);

      expect(element.getAttribute('href')).to.equal('https://not.hash/');
      expect(element.getAttribute('target')).to.equal('_top');
    });

    it('should remove `target` when rewrite <a> from non-hash to hash', () => {
      const element = document.createElement('a');
      element.setAttribute('href', 'https://not.hash/');

      rewriteAttributesForElement(element, 'href', '#hash', location);

      expect(element.getAttribute('href')).to.equal('#hash');
      expect(element.hasAttribute('target')).to.equal(false);
    });
  });
});

describe('rewriteAttributeValue', () => {
  it('should be case-insensitive to tag and attribute name', () => {
    expect(rewriteAttributeValue('a', 'href', '/doc2'))
        .to.equal(rewriteAttributeValue('A', 'HREF', '/doc2'));
    expect(rewriteAttributeValue('amp-img', 'src', '/jpeg1'))
        .to.equal(rewriteAttributeValue('AMP-IMG', 'SRC', '/jpeg1'));
    expect(rewriteAttributeValue('amp-img', 'srcset', '/jpeg2 2x, /jpeg1 1x'))
        .to.equal(rewriteAttributeValue(
            'AMP-IMG', 'SRCSET', '/jpeg2 2x, /jpeg1 1x'));
  });
});

describe('resolveUrlAttr', () => {
  it('should throw if __amp_source_origin is set', () => {
    allowConsoleError(() => {
      expect(() => resolveUrlAttr('a', 'href',
          '/doc2?__amp_source_origin=https://google.com',
          'http://acme.org/doc1')).to.throw(/Source origin is not allowed/);
    });
  });

  it('should be called by sanitizer', () => {
    expect(purify('<a href="/path"></a>')).to.match(/http/);
    expect(purify('<amp-img src="/path"></amp-img>')).to.match(/http/);
    expect(purify('<amp-img srcset="/path"></amp-img>'))
        .to.match(/http/);
  });

  it('should resolve non-hash href', () => {
    expect(resolveUrlAttr('a', 'href',
        '/doc2',
        'http://acme.org/doc1'))
        .to.equal('http://acme.org/doc2');
    expect(resolveUrlAttr('a', 'href',
        '/doc2',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('http://acme.org/doc2');
    expect(resolveUrlAttr('a', 'href',
        'http://non-acme.org/doc2',
        'http://acme.org/doc1'))
        .to.equal('http://non-acme.org/doc2');
  });

  it('should ignore hash URLs', () => {
    expect(resolveUrlAttr('a', 'href',
        '#hash1',
        'http://acme.org/doc1'))
        .to.equal('#hash1');
  });

  it('should resolve src', () => {
    expect(resolveUrlAttr('amp-video', 'src',
        '/video1',
        'http://acme.org/doc1'))
        .to.equal('http://acme.org/video1');
    expect(resolveUrlAttr('amp-video', 'src',
        '/video1',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('http://acme.org/video1');
    expect(resolveUrlAttr('amp-video', 'src',
        'http://non-acme.org/video1',
        'http://acme.org/doc1'))
        .to.equal('http://non-acme.org/video1');
  });

  it('should rewrite image http(s) src', () => {
    expect(resolveUrlAttr('amp-img', 'src',
        '/image1?a=b#h1',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('https://cdn.ampproject.org/i/acme.org/image1?a=b#h1');
    expect(resolveUrlAttr('amp-img', 'src',
        'https://acme.org/image1?a=b#h1',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('https://cdn.ampproject.org/i/s/acme.org/image1?a=b#h1');
  });

  it('should rewrite image http(s) srcset', () => {
    expect(resolveUrlAttr('amp-img', 'srcset',
        '/image2?a=b#h1 2x, /image1?a=b#h1 1x',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('https://cdn.ampproject.org/i/acme.org/image1?a=b#h1 1x, ' +
            'https://cdn.ampproject.org/i/acme.org/image2?a=b#h1 2x');
    expect(resolveUrlAttr('amp-img', 'srcset',
        'https://acme.org/image2?a=b#h1 2x, /image1?a=b#h1 1x',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('https://cdn.ampproject.org/i/acme.org/image1?a=b#h1 1x, ' +
            'https://cdn.ampproject.org/i/s/acme.org/image2?a=b#h1 2x');
  });

  it('should NOT rewrite image http(s) src when not on proxy', () => {
    expect(resolveUrlAttr('amp-img', 'src',
        '/image1',
        'http://acme.org/doc1'))
        .to.equal('http://acme.org/image1');
  });

  it('should NOT rewrite image data src', () => {
    expect(resolveUrlAttr('amp-img', 'src',
        'data:12345',
        'https://cdn.ampproject.org/c/acme.org/doc1'))
        .to.equal('data:12345');
  });
});
