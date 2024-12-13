import {Purifier} from '#purifier';

import * as urlRewrite from '../../src/url-rewrite';

describes.sandboxed('DOMPurify-based', {}, (env) => {
  let html;
  let purify;
  let purifyTripleMustache;
  let rewriteAttributeValueSpy;

  beforeEach(() => {
    html = document.createElement('html');
    const documentEl = {
      documentElement: html,
      createElement: (tagName) => document.createElement(tagName),
    };

    rewriteAttributeValueSpy = env.sandbox.spy(
      urlRewrite,
      'rewriteAttributeValue'
    );

    const purifier = new Purifier(
      documentEl,
      {},
      urlRewrite.rewriteAttributeValue
    );

    /**
     * Helper that serializes output of purifyHtml() to string.
     * @param {string} html
     * @return {string}
     */
    purify = (html) => purifier.purifyHtml(html).innerHTML;

    /**
     * Helper that calls purifyTagsForTripleMustache().
     * @param {string} html
     * @return {string}
     */
    purifyTripleMustache = (html) => purifier.purifyTagsForTripleMustache(html);
  });

  describe('sanitizer tests', () => {
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
      expect(purify('<h1>a<i>b</i>c</h1>')).to.be.equal('<h1>a<i>b</i>c</h1>');
      expect(purify('<h1>a<i>b</i><br>c</h1>')).to.be.equal(
        '<h1>a<i>b</i><br>c</h1>'
      );
      expect(
        purify(
          '<h1>a<i>b</i>c' +
            '<amp-img src="http://example.com/1.png"></amp-img></h1>'
        )
      ).to.be.equal(
        '<h1>a<i>b</i>c' +
          '<amp-img src="http://example.com/1.png" i-amphtml-ignore=""></amp-img></h1>'
      );
      expect(rewriteAttributeValueSpy).to.be.calledWith(
        'amp-img',
        'src',
        'http://example.com/1.png'
      );
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
      expect(purify('a<script><style>b</style></script>c')).to.be.equal('ac');
      expect(purify('a<style><iframe>b</iframe></style>c')).to.be.equal('ac');
      expect(purify('a<script><img></script>c')).to.be.equal('ac');
    });

    it('should NOT output security-sensitive markup when broken', () => {
      expect(purify('a<script>bc')).to.be.equal('a');
      expect(purify('a<SCRIPT>bc')).to.be.equal('a');
    });

    it('should output "on" attribute', () => {
      expect(purify('a<a on="tap:AMP.print">b</a>')).to.be.equal(
        'a<a on="tap:AMP.print">b</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should output "data-, aria-, and role" attributes', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        purify('<a aria-label="bar" data-foo="bar" role="button">b</a>')
      );
      const expected = serialize(
        '<a aria-label="bar" data-foo="bar" role="button">b</a>'
      );
      expectEqualNodeLists(actual, expected);
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(3);
    });

    it('should output "href" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(purify('a<a href="http://acme.com/">b</a>'));
      const expected = serialize(
        'a<a target="_top" href="http://acme.com/">b</a>'
      );
      expectEqualNodeLists(actual, expected);
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should allow arbitrary protocols', () => {
      expect(purify('<a href="foo://bar">link</a>')).to.be.equal(
        '<a target="_top" href="foo://bar">link</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should output "rel" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        purify('a<a href="http://acme.com/" rel="amphtml">b</a>')
      );
      const expected = serialize(
        'a<a href="http://acme.com/" rel="amphtml" target="_top">b</a>'
      );
      expectEqualNodeLists(actual, expected);
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(3);
    });

    it('should output "layout" attribute', () => {
      expect(purify('<amp-img layout="responsive"></amp-img>')).to.equal(
        '<amp-img layout="responsive" i-amphtml-ignore=""></amp-img>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should output "media" attribute', () => {
      expect(purify('<amp-img media="(min-width: 650px)"></amp-img>')).to.equal(
        '<amp-img media="(min-width: 650px)" i-amphtml-ignore=""></amp-img>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should output "sizes" attribute', () => {
      expect(
        purify('<amp-img sizes="(min-width: 650px) 50vw, 100vw"></amp-img>')
      ).to.equal(
        '<amp-img sizes="(min-width: 650px) 50vw, 100vw" i-amphtml-ignore=""></amp-img>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should output "heights" attribute', () => {
      expect(
        purify('<amp-img heights="(min-width:500px) 200px, 80%"></amp-img>')
      ).to.equal(
        '<amp-img heights="(min-width:500px) 200px, 80%" i-amphtml-ignore=""></amp-img>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should default target to _top with href', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        purify('<a href="">a</a><a href="" target="">c</a>')
      );
      const expected = serialize(
        '<a href="" target="_top">a</a><a href="" target="_top">c</a>'
      );
      expectEqualNodeLists(actual, expected);
    });

    it('should NOT default target to _top w/o href', () => {
      expect(purify('<a>b</a><a target="">d</a>')).to.equal(
        '<a>b</a><a target="_top">d</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should output a valid target', () => {
      expect(purify('<a target="_top">a</a><a target="_blank">b</a>')).to.equal(
        '<a target="_top">a</a><a target="_blank">b</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should output a valid target in different case', () => {
      expect(purify('<a target="_TOP">a</a><a target="_BLANK">b</a>')).to.equal(
        '<a target="_top">a</a><a target="_blank">b</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should override a unallowed target', () => {
      expect(
        purify(
          '<a target="_self">_self</a>' +
            '<a target="_parent">_parent</a>' +
            '<a target="_other">_other</a>' +
            '<a target="_OTHER">_OTHER</a>' +
            '<a target="other">other</a>'
        )
      ).to.equal(
        '<a target="_top">_self</a>' +
          '<a target="_top">_parent</a>' +
          '<a target="_top">_other</a>' +
          '<a target="_top">_OTHER</a>' +
          '<a target="_top">other</a>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(5);
    });

    it('should NOT output security-sensitive attributes', () => {
      allowConsoleError(() => {
        expect(purify('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
        expect(purify('a<a href="javascript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href=" JAVASCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href="vbscript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href=" VBSCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href="data:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href=" DATA:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href="blob:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href=" BLOB:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(purify('a<a href="?__amp_source_origin=foo">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
      });
    });

    it('should NOT output denylisted values for class attributes', () => {
      allowConsoleError(() => {
        expect(purify('<p class="i-amphtml-">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
        expect(purify('<p class="i-amphtml-class">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
        expect(purify('<p class="foo-i-amphtml-bar">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
        expect(rewriteAttributeValueSpy.callCount).to.be.equal(0);
      });
    });

    it('should allow amp-subscriptions attributes', () => {
      expect(purify('<div subscriptions-action="login">link</div>')).to.equal(
        '<div subscriptions-action="login">link</div>'
      );
      expect(
        purify('<div subscriptions-section="actions">link</div>')
      ).to.equal('<div subscriptions-section="actions">link</div>');
      expect(purify('<div subscriptions-actions="">link</div>')).to.equal(
        '<div subscriptions-actions="">link</div>'
      );
      expect(purify('<div subscriptions-display="">link</div>')).to.equal(
        '<div subscriptions-display="">link</div>'
      );
      expect(purify('<div subscriptions-dialog="">link</div>')).to.equal(
        '<div subscriptions-dialog="">link</div>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should allow source::src with valid protocol', () => {
      expect(purify('<source src="https://www.foo.com/">')).to.equal(
        '<source src="https://www.foo.com/">'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    // TODO(choumx): HTTPS-only URI attributes are not enforced consistently
    // in the sanitizer yet. E.g. amp-video requires HTTPS, amp-img does not.
    // Unskip when this is fixed.
    it.skip('should not allow source::src with invalid protocol', () => {
      expect(purify('<source src="http://www.foo.com">')).to.equal(
        '<source src="">'
      );
      expect(purify('<source src="<script>bad()</script>">')).to.equal(
        '<source src="">'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should allow div::template', () => {
      expect(purify('<div template="my-template-id"></div>')).to.equal(
        '<div template="my-template-id"></div>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should allow form::action-xhr', () => {
      expect(purify('<form action-xhr="https://foo.com"></form>')).to.equal(
        '<form action-xhr="https://foo.com"></form>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    it('should allow input::mask-output', () => {
      expect(purify('<input mask-output="alphanumeric">')).to.equal(
        '<input mask-output="alphanumeric">'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(1);
    });

    // Need to test this since DOMPurify doesn't offer a API for tag-specific
    // attribute allowlists. Instead, we hack around it with custom hooks.
    it('should not allow unsupported attributes after a valid one', () => {
      const html =
        '<form action-xhr="https://foo.com"></form>' +
        '<p action-xhr="https://foo.com"></p>';
      expect(purify(html)).to.equal(
        '<form action-xhr="https://foo.com"></form><p></p>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should allow <amp-form>-related attributes', () => {
      expect(purify('<div submitting></div>')).to.equal(
        '<div submitting=""></div>'
      );
      expect(purify('<div submit-success></div>')).to.equal(
        '<div submit-success=""></div>'
      );
      expect(purify('<div submit-error></div>')).to.equal(
        '<div submit-error=""></div>'
      );
      expect(purify('<div verify-error></div>')).to.equal(
        '<div verify-error=""></div>'
      );
      expect(
        purify('<span visible-when-invalid="valueMissing"></span>')
      ).to.equal('<span visible-when-invalid="valueMissing"></span>');
      expect(purify('<span validation-for="form1"></span>')).to.equal(
        '<span validation-for="form1"></span>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should avoid disallowing default-supported attributes', () => {
      // We allowlist all attributes of AMP elements, but make sure we don't
      // remove default-supported attributes from the allowlist afterwards.
      expect(
        purify(
          '<amp-img style="color: red"></amp-img><p style="color: blue"></p>'
        )
      ).to.equal(
        '<amp-img style="color: red" i-amphtml-ignore=""></amp-img><p style="color: blue"></p>'
      );
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should allow <amp-lightbox> attributes', () => {
      expect(purify('<amp-lightbox scrollable></amp-lightbox>')).to.match(
        /<amp-lightbox scrollable="" i-amphtml-key="(\d+)"><\/amp-lightbox>/
      );
    });

    it('should output diff marker attributes for some elements', () => {
      // Elements with bindings should have [i-amphtml-key=<number>].
      expect(purify('<p [x]="y"></p>')).to.match(
        /<p data-amp-bind-x="y" i-amphtml-binding="" i-amphtml-key="(\d+)"><\/p>/
      );
      // AMP elements should have [i-amphtml-key=<number>].
      expect(purify('<amp-pixel></amp-pixel>')).to.match(
        /<amp-pixel i-amphtml-key="(\d+)"><\/amp-pixel>/
      );
      // AMP elements with bindings should have [i-amphtml-key=<number>].
      expect(purify('<amp-pixel [x]="y"></amp-pixel>')).to.match(
        /<amp-pixel data-amp-bind-x="y" i-amphtml-binding="" i-amphtml-key="(\d+)"><\/amp-pixel>/
      );
      // amp-img should have [i-amphtml-ignore].
      expect(purify('<amp-img></amp-img>')).to.equal(
        '<amp-img i-amphtml-ignore=""></amp-img>'
      );
      // Other elements should NOT have [i-amphtml-key].
      expect(purify('<p></p>')).to.equal('<p></p>');
      expect(rewriteAttributeValueSpy.callCount).to.be.equal(2);
    });

    it('should resolve URLs', () => {
      expect(purify('<a href="/path"></a>')).to.match(/http/);
      expect(purify('<amp-img src="/path"></amp-img>')).to.match(/http/);
      expect(purify('<amp-img srcset="/path"></amp-img>')).to.match(/http/);
    });
  });

  describe('purifyTagsForTripleMustache()', () => {
    it('should output basic text', () => {
      expect(purifyTripleMustache('abc')).to.be.equal('abc');
    });

    it('should output HTML entities', () => {
      const entity = '&lt;tag&gt;';
      expect(purifyTripleMustache(entity)).to.be.equal(entity);
      // DOMPurify short-circuits when there are no '<' characters.
      expect(purifyTripleMustache(`<p>${entity}</p>`)).to.be.equal(
        `<p>${entity}</p>`
      );
    });

    it('should output valid markup', () => {
      expect(purifyTripleMustache('<b>abc</b>')).to.be.equal('<b>abc</b>');
      expect(purifyTripleMustache('<b>ab<br>c</b>')).to.be.equal(
        '<b>ab<br>c</b>'
      );
      expect(purifyTripleMustache('<b>a<i>b</i>c</b>')).to.be.equal(
        '<b>a<i>b</i>c</b>'
      );
      const markupWithClassAttribute = '<p class="some-class">heading</p>';
      expect(purifyTripleMustache(markupWithClassAttribute)).to.be.equal(
        markupWithClassAttribute
      );
      const markupWithClassesAttribute =
        '<div class="some-class another"><span>heading</span></div>';
      expect(purifyTripleMustache(markupWithClassesAttribute)).to.be.equal(
        markupWithClassesAttribute
      );
      const markupParagraph = '<p class="valid-class">paragraph</p>';
      expect(purifyTripleMustache(markupParagraph)).to.be.equal(
        markupParagraph
      );
    });

    it('should NOT output non-allowlisted markup', () => {
      expect(purifyTripleMustache('a<style>b</style>c')).to.be.equal('ac');
      expect(purifyTripleMustache('a<img>c')).to.be.equal('ac');
    });

    it('should compensate for broken markup', () => {
      expect(purifyTripleMustache('<b>a<i>b')).to.be.equal('<b>a<i>b</i></b>');
    });

    it('should support list tags', () => {
      const html = '<ol><li></li></ol><ul></ul>';
      expect(purifyTripleMustache(html)).to.be.equal(html);
    });

    ['amp', 'amp4email'].forEach((format) => {
      describe(`with ${format} format`, () => {
        beforeEach(() => {
          html.setAttribute(format, '');
        });

        it('should allowlist formatting related elements', () => {
          const nonAllowlistedTag = '<img>';
          const allowlistedFormattingTags =
            '<b>abc</b><div>def</div>' +
            '<br><code></code><del></del><em></em>' +
            '<i></i><ins></ins><mark></mark><s></s>' +
            '<small></small><strong></strong><sub></sub>' +
            '<sup></sup><time></time><u></u><hr>';
          const html = `${allowlistedFormattingTags}${nonAllowlistedTag}`;
          // Expect the purifier to unescape the allowlisted tags and to
          // sanitize and remove the img tag.
          expect(purifyTripleMustache(html)).to.be.equal(
            allowlistedFormattingTags
          );
        });

        it('should allowlist h1, h2 and h3 elements', () => {
          const html = '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>';
          expect(purifyTripleMustache(html)).to.be.equal(html);
        });

        it('should allowlist table related elements and anchor tags', () => {
          const html =
            '<table class="valid-class">' +
            '<colgroup><col><col></colgroup>' +
            '<caption>caption</caption>' +
            '<thead><tr><th colspan="2">header</th></tr></thead>' +
            '<tbody><tr><td>' +
            '<a href="http://www.google.com">google</a>' +
            '</td></tr></tbody>' +
            '<tfoot><tr>' +
            '<td colspan="2"><span>footer</span></td>' +
            '</tr></tfoot>' +
            '</table>';
          expect(purifyTripleMustache(html)).to.be.equal(html);
        });

        it('should allowlist container elements', () => {
          const html =
            '<article>Article</article>' +
            '<aside></aside>' +
            '<blockquote>A quote</blockquote>' +
            '<details></details>' +
            '<figcaption></figcaption>' +
            '<figure></figure>' +
            '<footer>Footer</footer>' +
            '<header></header>' +
            '<main class="content"></main>' +
            '<nav></nav>' +
            '<pre></pre>' +
            '<section id="sec"></section>' +
            '<summary></summary>';
          expect(purifyTripleMustache(html)).to.be.equal(html);
        });
      });
    });

    it('should allowlist amp-img element', () => {
      html.setAttribute('amp', '');
      const markup = '<amp-img></amp-img>';
      expect(purifyTripleMustache(markup)).to.be.equal(markup);
    });

    it('should not allowlist amp-img element for AMP4Email', () => {
      html.setAttribute('amp4email', '');
      const markup = '<amp-img></amp-img>';
      expect(purifyTripleMustache(markup)).to.be.empty;
    });

    it('should sanitize tags, removing unsafe attributes', () => {
      const html =
        '<a href="javascript:alert(\'XSS\')">test</a>' +
        '<img src="x" onerror="alert(\'XSS\')" />';
      expect(purifyTripleMustache(html)).to.be.equal('<a>test</a>');
    });

    describe('should sanitize `style` attribute', () => {
      it('should allow valid styles', () => {
        expect(purify('<div style="color:blue">Test</div>')).to.equal(
          '<div style="color:blue">Test</div>'
        );
      });

      it('should ignore styles containing `!important`', () => {
        allowConsoleError(() => {
          expect(
            purify('<div style="color:blue!important">Test</div>')
          ).to.equal('<div>Test</div>');
        });
      });

      it('should ignore styles containing `position:fixed`', () => {
        allowConsoleError(() => {
          expect(purify('<div style="position:fixed">Test</div>')).to.equal(
            '<div>Test</div>'
          );
        });
      });

      it('should ignore styles containing `position:sticky`', () => {
        allowConsoleError(() => {
          expect(purify('<div style="position:sticky">Test</div>')).to.equal(
            '<div>Test</div>'
          );
        });
      });
    });
  });

  describe('<script>', () => {
    it('should not allow plain <script> tags', () => {
      expect(purify('<script>alert(1)</script>')).to.equal('');
    });

    it('should not allow script[type="text/javascript"]', () => {
      expect(
        purify('<script type="text/javascript">alert(1)</script>')
      ).to.equal('');
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
      expect(
        purify(
          '<script>alert(1)' +
            '<script type="application/json">{}</script></script>'
        )
      ).to.equal('');
    });
  });

  describe('for <amp-bind>', () => {
    it('should rewrite [text] and [class] attributes', () => {
      expect(purify('<p [text]="foo"></p>')).to.match(
        /<p data-amp-bind-text="foo" i-amphtml-binding="" i-amphtml-key="(\d+)"><\/p>/
      );
      expect(purify('<p [class]="bar"></p>')).to.match(
        /<p data-amp-bind-class="bar" i-amphtml-binding="" i-amphtml-key="(\d+)"><\/p>/
      );
    });

    it('should add "i-amphtml-binding" for data-amp-bind-*', () => {
      expect(purify('<p data-amp-bind-text="foo"></p>')).to.match(
        /<p i-amphtml-binding="" data-amp-bind-text="foo" i-amphtml-key="(\d+)"><\/p>/
      );
    });

    it('should NOT rewrite values of binding attributes', () => {
      // Should not change "foo.bar".
      expect(purify('<a [href]="foo.bar">link</a>')).to.match(
        /<a data-amp-bind-href="foo.bar" i-amphtml-binding="" i-amphtml-key="(\d+)">link<\/a>/
      );
    });
  });

  describe('structured data', () => {
    it('[itemprop] global attribute', () => {
      const h1 = '<h1 itemprop="foo">h1</h1>';
      expect(purify(h1)).to.equal(h1);

      const span = '<span itemprop="bar">span</span>';
      expect(purify(span)).to.equal(span);

      const a = '<a itemprop="baz">a</a>';
      expect(purify(a)).to.equal(a);
    });
  });

  // Select SVG XSS tests from https://html5sec.org/#svg.
  describe('SVG', () => {
    it('should prevent XSS via <G> tag and onload attribute', () => {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<g onload="javascript:alert(1)"></g></svg>';
      expect(purify(svg)).to.equal(
        '<svg xmlns="http://www.w3.org/2000/svg"><g></g></svg>'
      );
    });

    it('should prevent XSS via <SCRIPT> tag', () => {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<script>alert(1)</script></svg>';
      expect(purify(svg)).to.equal(
        '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
      );
    });

    it(
      'should prevent automatic execution of onload attribute without other ' +
        'SVG elements',
      () => {
        const svg =
          '<svg onload="javascript:alert(1)" ' +
          'xmlns="http://www.w3.org/2000/svg"></svg>';
        expect(purify(svg)).to.equal(
          '<svg xmlns="http://www.w3.org/2000/svg"></svg>'
        );
      }
    );

    it('should prevent simple passive XSS via XLink', () => {
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg">' +
        '<a xmlns:xlink="http://www.w3.org/1999/xlink" ' +
        'xlink:href="javascript:alert(1)">' +
        '<rect width="1000" height="1000" fill="white"/></a></svg>';
      expect(purify(svg)).to.equal(
        '<svg xmlns="http://www.w3.org/2000/svg">' +
          '<a xmlns:xlink="http://www.w3.org/1999/xlink">' +
          '<rect fill="white" height="1000" width="1000"></rect></a></svg>'
      );
    });

    it('should prevent XSS via "from" attribute in SVG and inline-SVG', () => {
      const svg =
        '<svg>' +
        '<a xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="?">' +
        '<circle r="400"></circle>' +
        '<animate attributeName="xlink:href" begin="0" ' +
        'from="javascript:alert(1)" to="&" />' +
        '</a></svg>';
      expect(purify(svg)).to.equal(
        '<svg><a xlink:href="?" xmlns:xlink="http://www.w3.org/1999/xlink">' +
          '<circle r="400"></circle></a></svg>'
      );
    });

    it('should output <use> only if href is relative', () => {
      allowConsoleError(() => {
        const href =
          '<svg xmlns="http://www.w3.org/2000/svg"><use href="#foo"></use></svg>';
        expect(purify(href)).to.equal(href);

        const xlink =
          '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="#foo"></use></svg>';
        expect(purify(xlink)).to.equal(xlink);

        expect(
          purify(
            '<svg xmlns="http://www.w3.org/2000/svg"><use href="//evil"></svg>'
          )
        ).to.equal('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
        expect(
          purify(
            '<svg xmlns="http://www.w3.org/2000/svg"><use xlink:href="//evil"></svg>'
          )
        ).to.equal('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
      });
    });
  });
});

describes.sandboxed('DOMPurify-based, custom html', {}, () => {
  let html;
  let purify;

  before(() => {
    html = document.createElement('html');
    const doc = {
      documentElement: html,
      createElement: (tagName) => document.createElement(tagName),
    };

    const purifier = () => new Purifier(doc);

    /**
     * Helper that serializes output of purifyHtml() to string.
     * @param {string} html
     * @return {string}
     */
    purify = (html) => purifier().purifyHtml(html).innerHTML;
  });

  describe('AMP formats', () => {
    it('should denylist input[type="image"] and input[type="button"] in AMP', () => {
      // Given the AMP format type.
      html.setAttribute('amp', '');
      allowConsoleError(() => {
        expect(purify('<input type="image">')).to.equal('<input>');
        expect(purify('<input type="button">')).to.equal('<input>');
      });
    });

    it('should allow input[type="file"] and input[type="password"]', () => {
      // Given that the AMP format does not denylist input types file and
      // password.
      html.setAttribute('amp', '');
      expect(purify('<input type="file">')).to.equal('<input type="file">');
      expect(purify('<input type="password">')).to.equal(
        '<input type="password">'
      );
    });

    it('should sanitize certain tag attributes for AMP4Email', () => {
      html.setAttribute('amp4email', '');
      allowConsoleError(() => {
        expect(purify('<input type="password">')).to.equal('<input>');
        expect(purify('<input type="file">')).to.equal('<input>');
        expect(purify('<form name="form-name"></form>')).to.equal(
          '<form></form>'
        );
        expect(purify('<amp-anim controls></amp-anim>')).to.match(
          /<amp-anim i-amphtml-key="(\d+)"><\/amp-anim>/
        );
      });
    });

    it('should only allow allowlisted AMP elements in AMP4EMAIL', () => {
      html.setAttribute('amp4email', '');
      expect(purify('<amp-analytics>')).to.equal('');
      expect(purify('<amp-iframe>')).to.equal('');
      expect(purify('<amp-list>')).to.equal('');
      expect(purify('<amp-pixel>')).to.equal('');
      expect(purify('<amp-twitter>')).to.equal('');
      expect(purify('<amp-video>')).to.equal('');
      expect(purify('<amp-youtube>')).to.equal('');

      expect(purify('<amp-img>')).to.equal(
        '<amp-img i-amphtml-ignore=""></amp-img>'
      );
      expect(purify('<amp-accordion>')).to.match(
        /<amp-accordion i-amphtml-key="(\d+)"><\/amp-accordion>/
      );
      expect(purify('<amp-anim>')).to.match(
        /<amp-anim i-amphtml-key="(\d+)"><\/amp-anim>/
      );
      expect(purify('<amp-bind-macro>')).to.match(
        /<amp-bind-macro i-amphtml-key="(\d+)"><\/amp-bind-macro>/
      );
      expect(purify('<amp-carousel>')).to.match(
        /<amp-carousel i-amphtml-key="(\d+)"><\/amp-carousel>/
      );
      expect(purify('<amp-fit-text>')).to.match(
        /<amp-fit-text i-amphtml-key="(\d+)"><\/amp-fit-text>/
      );
      expect(purify('<amp-layout>')).to.match(
        /<amp-layout i-amphtml-key="(\d+)"><\/amp-layout>/
      );
      expect(purify('<amp-selector>')).to.match(
        /<amp-selector i-amphtml-key="(\d+)"><\/amp-selector>/
      );
      expect(purify('<amp-sidebar>')).to.match(
        /<amp-sidebar i-amphtml-key="(\d+)"><\/amp-sidebar>/
      );
      expect(purify('<amp-timeago>')).to.match(
        /<amp-timeago i-amphtml-key="(\d+)"><\/amp-timeago>/
      );
    });
  });
});

describes.sandboxed('validateAttributeChange', {}, () => {
  let purifier;
  let vac;

  beforeEach(() => {
    const purify = new Purifier(document);
    purifier = purify.domPurify_;
    purifier.isValidAttribute = () => true;

    vac = (type, attr, value) =>
      purify.validateAttributeChange(document.createElement(type), attr, value);
  });

  it('should validate script[type]', () => {
    expect(vac('script', 'type', 'application/ld+json')).to.be.true;
    expect(vac('script', 'type', 'application/json')).to.be.true;
    expect(vac('script', 'type', '')).to.be.false;
    expect(vac('script', 'type', null)).to.be.false;
    expect(vac('script', 'type', 'text/javascript')).to.be.false;
  });

  it('should validate a[target]', () => {
    expect(vac('a', 'target', '_top')).to.be.true;
    expect(vac('a', 'target', '_blank')).to.be.true;
    expect(vac('a', 'target', '')).to.be.false;
    expect(vac('a', 'target', null)).to.be.false;
    expect(vac('a', 'target', '_self')).to.be.false;
    expect(vac('a', 'target', '_parent')).to.be.false;
  });

  it('should disallow binding attributes', () => {
    expect(vac('p', '[text]', 'foo')).to.be.false;
    expect(vac('p', 'data-amp-bind-text', 'foo')).to.be.false;
  });

  it('should allow allowlisted-by-tag attributes', () => {
    purifier.isValidAttribute = () => false;

    expect(vac('a', 'rel', 'amphtml')).to.be.true;
    expect(vac('div', 'template', 'my-template-id')).to.be.true;
    expect(vac('textarea', 'autoexpand', '')).to.be.true;
  });

  it('should allow AMP element attributes', () => {
    purifier.isValidAttribute = () => false;

    expect(vac('amp-carousel', 'slide', '1')).to.be.true;
    expect(vac('amp-accordion', 'expanded', '')).to.be.true;
    expect(vac('amp-img', 'on', 'tap: AMP.print')).to.be.true;
  });

  it('should perform AMP runtime validations', () => {
    // !important style modifier.
    expect(vac('h1', 'style', 'color: red !important')).to.be.false;
    // i-amphtml-* class names.
    expect(vac('p', 'class', 'i-amphtml-illegal')).to.be.false;
    // __amp_source_origin in URLs.
    expect(vac('amp-img', 'src', '?__amp_source_origin=evil')).to.be.false;
    // DENYLISTED_TAG_SPECIFIC_ATTRS.
    expect(vac('select', 'form', 'foo')).to.be.false;
    // DENYLISTED_TAG_SPECIFIC_ATTR_VALUES.
    expect(vac('input', 'type', 'image')).to.be.false;
  });
});

describes.sandboxed('getAllowedTags', {}, () => {
  let allowedTags;

  beforeEach(() => {
    allowedTags = new Purifier(document).getAllowedTags();
  });

  it('should contain html tags', () => {
    expect(allowedTags).to.have.property('a', true);
    expect(allowedTags).to.have.property('p', true);
  });

  it('should contain svg tags', () => {
    expect(allowedTags).to.have.property('svg', true);
    expect(allowedTags).to.have.property('feblend', true);
  });

  it('should have denylisted tags set to false', () => {
    // Tags allowed in DOMPurify but disallowed in AMP.
    expect(allowedTags).to.have.property('audio', false);
    expect(allowedTags).to.have.property('img', false);
  });
});
