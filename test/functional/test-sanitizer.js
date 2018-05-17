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
  resolveUrlAttr,
  rewriteAttributeValue,
  rewriteAttributesForElement,
  sanitizeHtml,
  sanitizeTagsForTripleMustache,
} from '../../src/sanitizer';
import {toggleExperiment} from '../../src/experiments';


describe('sanitizeHtml', () => {

  it('should output basic text', () => {
    expect(sanitizeHtml('abc')).to.be.equal('abc');
  });

  it('should output valid markup', () => {
    expect(sanitizeHtml('<h1>abc</h1>')).to.be.equal('<h1>abc</h1>');
    expect(sanitizeHtml('<h1>a<i>b</i>c</h1>')).to.be.equal(
        '<h1>a<i>b</i>c</h1>');
    expect(sanitizeHtml('<h1>a<i>b</i><br>c</h1>')).to.be.equal(
        '<h1>a<i>b</i><br>c</h1>');
    expect(sanitizeHtml(
        '<h1>a<i>b</i>c' +
        '<amp-img src="http://example.com/1.png"></amp-img></h1>'))
        .to.be.equal(
            '<h1>a<i>b</i>c' +
            '<amp-img src="http://example.com/1.png"></amp-img></h1>');
  });

  it('should NOT output security-sensitive markup', () => {
    expect(sanitizeHtml('a<script>b</script>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<script>b<img>d</script>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<style>b</style>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<img>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<iframe></iframe>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<frame></frame>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<video></video>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<audio></audio>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<applet></applet>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<link>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<meta>c')).to.be.equal('ac');
  });

  it('should NOT output security-sensitive markup when nested', () => {
    expect(sanitizeHtml('a<script><style>b</style></script>c'))
        .to.be.equal('ac');
    expect(sanitizeHtml('a<style><iframe>b</iframe></style>c'))
        .to.be.equal('ac');
    expect(sanitizeHtml('a<script><img></script>c'))
        .to.be.equal('ac');
  });

  it('should NOT output security-sensitive markup when broken', () => {
    expect(sanitizeHtml('a<script>bc')).to.be.equal('a');
    expect(sanitizeHtml('a<SCRIPT>bc')).to.be.equal('a');
  });

  it('should output "on" attribute', () => {
    expect(sanitizeHtml('a<a on="tap">b</a>')).to.be.equal(
        'a<a on="tap">b</a>');
  });

  it('should output "data-, aria-, and role" attributes', () => {
    expect(
        sanitizeHtml('<a data-foo="bar" aria-label="bar" role="button">b</a>'))
        .to.be.equal('<a data-foo="bar" aria-label="bar" role="button">b</a>');
  });

  it('should output "href" attribute', () => {
    expect(sanitizeHtml('a<a href="http://acme.com/">b</a>')).to.be.equal(
        'a<a href="http://acme.com/" target="_top">b</a>');
  });

  it('should output "rel" attribute', () => {
    expect(sanitizeHtml('a<a href="http://acme.com/" rel="amphtml">b</a>')).to.be.equal(
        'a<a href="http://acme.com/" rel="amphtml" target="_top">b</a>');
  });

  it('should default target to _top with href', () => {
    expect(sanitizeHtml(
        '<a href="">a</a>'
        + '<a href="" target="">c</a>'
    )).to.equal(
        '<a href="" target="_top">a</a>'
        + '<a href="" target="_top">c</a>');
  });

  it('should NOT default target to _top w/o href', () => {
    expect(sanitizeHtml(
        '<a>b</a>'
        + '<a target="">d</a>'
    )).to.equal(
        '<a>b</a>'
        + '<a target="_top">d</a>');
  });

  it('should output a valid target', () => {
    expect(sanitizeHtml('<a target="_top">a</a><a target="_blank">b</a>'))
        .to.equal('<a target="_top">a</a><a target="_blank">b</a>');
  });

  it('should output a valid target in different case', () => {
    expect(sanitizeHtml('<a target="_TOP">a</a><a target="_BLANK">b</a>'))
        .to.equal('<a target="_top">a</a><a target="_blank">b</a>');
  });

  it('should override a unallowed target', () => {
    expect(sanitizeHtml(
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
    expect(sanitizeHtml('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
    expect(sanitizeHtml('a<a style="color: red;">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a STYLE="color: red;">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a href="javascript:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="JAVASCRIPT:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="vbscript:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="VBSCRIPT:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="data:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="DATA:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="<script">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a href="</script">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
  });

  it('should catch attribute value whitespace variations', () => {
    expect(sanitizeHtml('a<a href=" j\na\tv\ra s&#00;cript:alert">b</a>'))
        .to.be.equal('a<a target="_top">b</a>');
  });

  it('should NOT output security-sensitive attributes', () => {
    expect(sanitizeHtml('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
    expect(sanitizeHtml('a<a [onclick]="alert">b</a>')).to.be
        .equal('a<a>b</a>');
  });

  it('should apply html4/caja restrictions', () => {
    expect(sanitizeHtml('a<dialog>b</dialog>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<dialog>b<img>d</dialog>c')).to.be.equal('ac');
    expect(sanitizeHtml('<div class="c" src="d">b</div>')).to.be
        .equal('<div class="c" src="">b</div>');
  });

  it('should output [text] and [class] attributes', () => {
    expect(sanitizeHtml('<p [text]="foo" [class]="bar"></p>')).to.be
        .equal('<p [text]="foo" [class]="bar"></p>');
  });

  it('should NOT output blacklisted values for class attributes', () => {
    expect(sanitizeHtml('<p class="i-amphtml-">hello</p>')).to.be
        .equal('<p>hello</p>');
    expect(sanitizeHtml('<p class="i-amphtml-class">hello</p>')).to.be
        .equal('<p>hello</p>');
    expect(sanitizeHtml('<p class="foo-i-amphtml-bar">hello</p>')).to.be
        .equal('<p>hello</p>');
    expect(sanitizeHtml('<p [class]="i-amphtml-">hello</p>')).to.be
        .equal('<p>hello</p>');
    expect(sanitizeHtml('<p [class]="i-amphtml-class">hello</p>')).to.be
        .equal('<p>hello</p>');
    expect(sanitizeHtml('<p [class]="foo-i-amphtml-bar">hello</p>')).to.be
        .equal('<p>hello</p>');
  });

  it('should NOT output security-sensitive binding attributes', () => {
    expect(sanitizeHtml('a<a [onclick]="alert">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a [style]="color: red;">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a [STYLE]="color: red;">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a [href]="javascript:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="JAVASCRIPT:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="vbscript:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="VBSCRIPT:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="data:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="DATA:alert">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="<script">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
    expect(sanitizeHtml('a<a [href]="</script">b</a>')).to.be.equal(
        'a<a target="_top">b</a>');
  });

  it('should NOT rewrite values of binding attributes', () => {
    // Should not change "foo.bar" but should add target="_top".
    expect(sanitizeHtml('<a [href]="foo.bar">link</a>'))
        .to.equal('<a [href]="foo.bar" target="_top">link</a>');
  });

  it('should allow amp-subscriptions attributes', () => {
    expect(sanitizeHtml('<div subscriptions-action="login">link</div>'))
        .to.equal('<div subscriptions-action="login">link</div>');
    expect(sanitizeHtml('<div subscriptions-section="actions">link</div>'))
        .to.equal('<div subscriptions-section="actions">link</div>');
    expect(sanitizeHtml('<div subscriptions-actions="">link</div>'))
        .to.equal('<div subscriptions-actions="">link</div>');
    expect(sanitizeHtml('<div subscriptions-display="">link</div>'))
        .to.equal('<div subscriptions-display="">link</div>');
    expect(sanitizeHtml('<div subscriptions-dialog="">link</div>'))
        .to.equal('<div subscriptions-dialog="">link</div>');
  });

  it('should allow source::src with vaild protocol', () => {
    expect(sanitizeHtml('<source src="https://www.foo.com/">'))
        .to.equal('<source src="https://www.foo.com/">');
  });

  it('should not allow source::src with invaild protocol', () => {
    expect(sanitizeHtml('<source src="http://www.foo.com">'))
        .to.equal('<source src="">');
    expect(sanitizeHtml('<source src="<script>bad()</script>">'))
        .to.equal('<source src="">');
  });
});


describe('rewriteAttributesForElement', () => {
  let location = 'https://pub.com/';

  it('should not modify `target` on publisher origin', () => {
    const element = document.createElement('a');
    element.setAttribute('href', '#hash');

    rewriteAttributesForElement(element, 'href', 'https://not.hash/', location);

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
    allowConsoleError(() => { expect(() => resolveUrlAttr('a', 'href',
        '/doc2?__amp_source_origin=https://google.com',
        'http://acme.org/doc1')).to.throw(/Source origin is not allowed in/); });
  });

  it('should be called by sanitizer', () => {
    expect(sanitizeHtml('<a href="/path"></a>')).to.match(/http/);
    expect(sanitizeHtml('<amp-img src="/path"></amp-img>')).to.match(/http/);
    expect(sanitizeHtml('<amp-img srcset="/path"></amp-img>')).to.match(/http/);
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


describe('sanitizeTagsForTripleMustache', () => {

  it('should output basic text', () => {
    expect(sanitizeTagsForTripleMustache('abc')).to.be.equal('abc');
  });

  it('should output valid markup', () => {
    expect(sanitizeTagsForTripleMustache('<b>abc</b>'))
        .to.be.equal('<b>abc</b>');
    expect(sanitizeTagsForTripleMustache('<b>ab<br>c</b>')).to.be.equal(
        '<b>ab<br>c</b>');
    expect(sanitizeTagsForTripleMustache('<b>a<i>b</i>c</b>')).to.be.equal(
        '<b>a<i>b</i>c</b>');
    const markupWithClassAttribute = '<p class="some-class">heading</p>';
    expect(sanitizeTagsForTripleMustache(markupWithClassAttribute))
        .to.be.equal(markupWithClassAttribute);
    const markupWithClassesAttribute =
        '<div class="some-class another"><span>heading</span></div>';
    expect(sanitizeTagsForTripleMustache(markupWithClassesAttribute))
        .to.be.equal(markupWithClassesAttribute);
    const markupParagraph = '<p class="valid-class">paragraph</p>';
    expect(sanitizeTagsForTripleMustache(markupParagraph))
        .to.be.equal(markupParagraph);
  });

  it('should NOT output non-whitelisted markup', () => {
    expect(sanitizeTagsForTripleMustache('a<style>b</style>c'))
        .to.be.equal('ac');
    expect(sanitizeTagsForTripleMustache('a<img>c'))
        .to.be.equal('ac');
  });

  it('should output style attributes if inline styles enabled', () => {
    toggleExperiment(self, 'inline-styles', true,
        /* opt_transientExperiment */ true);
    expect(sanitizeTagsForTripleMustache(
        '<b style="color: red">abc</b>'))
        .to.be.equal('<b style="color: red">abc</b>');
  });

  it('should compensate for broken markup', () => {
    expect(sanitizeTagsForTripleMustache('<b>a<i>b')).to.be.equal(
        '<b>a<i>b</i></b>');
  });

  describe('should sanitize `style` attribute', () => {
    before(() => {
      toggleExperiment(self, 'inline-styles', true,
          /* opt_transientExperiment */ true);
    });

    after(() => {
      toggleExperiment(self, 'inline-styles', false,
          /* opt_transientExperiment */ true);
    });

    it('should allow valid styles',() => {
      expect(sanitizeHtml('<div style="color:blue">Test</div>'))
          .to.equal('<div style="color:blue">Test</div>');
    });

    it('should ignore styles containing `!important`',() => {
      expect(sanitizeHtml('<div style="color:blue!important">Test</div>'))
          .to.equal('<div>Test</div>');
    });

    it('should ignore styles containing `position:fixed`', () => {
      expect(sanitizeHtml('<div style="position:fixed">Test</div>'))
          .to.equal('<div>Test</div>');
    });

    it('should ignore styles containing `position:sticky`', () => {
      expect(sanitizeHtml('<div style="position:sticky">Test</div>'))
          .to.equal('<div>Test</div>');
    });
  });
});
