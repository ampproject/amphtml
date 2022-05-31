import {sanitizeHtml, sanitizeTagsForTripleMustache} from '../../src/sanitizer';

let sanitize;
let html;
let documentEl;

describes.sandboxed('Caja-based', {}, () => {
  beforeEach(() => {
    html = document.createElement('html');
    documentEl = {documentElement: html};
    sanitize = (html) => sanitizeHtml(html, documentEl);
  });

  runSanitizerTests();

  describe('Caja-specific sanitization', () => {
    // DOMPurify doesn't perform HTML4-specific sanitizations.
    it('should apply html4/caja restrictions', () => {
      expect(sanitize('a<dialog>b</dialog>c')).to.be.equal('ac');
      expect(sanitize('a<dialog>b<img>d</dialog>c')).to.be.equal('ac');
      expect(sanitize('<div class="c" src="d">b</div>')).to.be.equal(
        '<div class="c" src="">b</div>'
      );
    });

    // DOMPurify doesn't do special whitespace handling in attribute values.
    it('should catch attribute value whitespace variations', () => {
      allowConsoleError(() => {
        expect(
          sanitize('a<a href=" j\na\tv\ra s&#00;cript:alert">b</a>')
        ).to.be.equal('a<a target="_top">b</a>');
      });
    });

    // DOMPurify URL encodes attr chars e.g. `<` -> %3C`.
    it('should ignore invalid characters in attributes', () => {
      allowConsoleError(() => {
        expect(sanitize('a<a href="<script">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href="</script">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a [onclick]="alert">b</a>')).to.be.equal(
          'a<a>b</a>'
        );
      });
    });
  });

  describe('for <amp-bind>', () => {
    it('should output [text] and [class] attributes', () => {
      expect(sanitize('<p [text]="foo" [class]="bar"></p>')).to.be.equal(
        '<p [text]="foo" [class]="bar" i-amphtml-binding=""></p>'
      );
    });

    it('should add "i-amphtml-binding" for data-amp-bind-*', () => {
      expect(sanitize('<p data-amp-bind-text="foo"></p>')).to.be.equal(
        '<p data-amp-bind-text="foo" i-amphtml-binding=""></p>'
      );
    });

    it('should NOT rewrite values of binding attributes', () => {
      // Should not change "foo.bar". Adding `target` attribute is not necessary
      // (but harmless) since <amp-bind> will use rewriteAttributesForElement().
      expect(sanitize('<a [href]="foo.bar">link</a>')).to.equal(
        '<a [href]="foo.bar" target="_top" i-amphtml-binding="">link</a>'
      );
    });
  });
});

function runSanitizerTests() {
  describe('sanitizeHtml', () => {
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
      expect(sanitize('abc')).to.be.equal('abc');
    });

    it('should output valid markup', () => {
      expect(sanitize('<h1>abc</h1>')).to.be.equal('<h1>abc</h1>');
      expect(sanitize('<h1>a<i>b</i>c</h1>')).to.be.equal(
        '<h1>a<i>b</i>c</h1>'
      );
      expect(sanitize('<h1>a<i>b</i><br>c</h1>')).to.be.equal(
        '<h1>a<i>b</i><br>c</h1>'
      );
      expect(
        sanitize(
          '<h1>a<i>b</i>c' +
            '<amp-img src="http://example.com/1.png"></amp-img></h1>'
        )
      ).to.be.equal(
        '<h1>a<i>b</i>c' +
          '<amp-img src="http://example.com/1.png"></amp-img></h1>'
      );
    });

    it('should NOT output security-sensitive markup', () => {
      expect(sanitize('a<script>b</script>c')).to.be.equal('ac');
      expect(sanitize('a<script>b<img>d</script>c')).to.be.equal('ac');
      expect(sanitize('a<img>c')).to.be.equal('ac');
      expect(sanitize('a<iframe></iframe>c')).to.be.equal('ac');
      expect(sanitize('a<frame></frame>c')).to.be.equal('ac');
      expect(sanitize('a<video></video>c')).to.be.equal('ac');
      expect(sanitize('a<audio></audio>c')).to.be.equal('ac');
      expect(sanitize('a<applet></applet>c')).to.be.equal('ac');
      expect(sanitize('a<link>c')).to.be.equal('ac');
      expect(sanitize('a<meta>c')).to.be.equal('ac');
    });

    it('should NOT output security-sensitive markup when nested', () => {
      expect(sanitize('a<script><style>b</style></script>c')).to.be.equal('ac');
      expect(sanitize('a<style><iframe>b</iframe></style>c')).to.be.equal('ac');
      expect(sanitize('a<script><img></script>c')).to.be.equal('ac');
    });

    it('should NOT output security-sensitive markup when broken', () => {
      expect(sanitize('a<script>bc')).to.be.equal('a');
      expect(sanitize('a<SCRIPT>bc')).to.be.equal('a');
    });

    it('should output "on" attribute', () => {
      expect(sanitize('a<a on="tap:AMP.print">b</a>')).to.be.equal(
        'a<a on="tap:AMP.print">b</a>'
      );
    });

    it('should output "data-, aria-, and role" attributes', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        sanitize('<a aria-label="bar" data-foo="bar" role="button">b</a>')
      );
      const expected = serialize(
        '<a aria-label="bar" data-foo="bar" role="button">b</a>'
      );
      expectEqualNodeLists(actual, expected);
    });

    it('should output "href" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(sanitize('a<a href="http://acme.com/">b</a>'));
      const expected = serialize(
        'a<a target="_top" href="http://acme.com/">b</a>'
      );
      expectEqualNodeLists(actual, expected);
    });

    it('should output "rel" attribute', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        sanitize('a<a href="http://acme.com/" rel="amphtml">b</a>')
      );
      const expected = serialize(
        'a<a href="http://acme.com/" rel="amphtml" target="_top">b</a>'
      );
      expectEqualNodeLists(actual, expected);
    });

    it('should output "layout" attribute', () => {
      const img = '<amp-img layout="responsive"></amp-img>';
      expect(sanitize(img)).to.equal(img);
    });

    it('should output "media" attribute', () => {
      const img = '<amp-img media="(min-width: 650px)"></amp-img>';
      expect(sanitize(img)).to.equal(img);
    });

    it('should output "sizes" attribute', () => {
      const img = '<amp-img sizes="(min-width: 650px) 50vw, 100vw"></amp-img>';
      expect(sanitize(img)).to.equal(img);
    });

    it('should output "heights" attribute', () => {
      const img = '<amp-img heights="(min-width:500px) 200px, 80%"></amp-img>';
      expect(sanitize(img)).to.equal(img);
    });

    it('should default target to _top with href', () => {
      // Can't use string equality since DOMPurify will reorder attributes.
      const actual = serialize(
        sanitize('<a href="">a</a><a href="" target="">c</a>')
      );
      const expected = serialize(
        '<a href="" target="_top">a</a><a href="" target="_top">c</a>'
      );
      expectEqualNodeLists(actual, expected);
    });

    it('should NOT default target to _top w/o href', () => {
      expect(sanitize('<a>b</a><a target="">d</a>')).to.equal(
        '<a>b</a><a target="_top">d</a>'
      );
    });

    it('should output a valid target', () => {
      expect(
        sanitize('<a target="_top">a</a><a target="_blank">b</a>')
      ).to.equal('<a target="_top">a</a><a target="_blank">b</a>');
    });

    it('should output a valid target in different case', () => {
      expect(
        sanitize('<a target="_TOP">a</a><a target="_BLANK">b</a>')
      ).to.equal('<a target="_top">a</a><a target="_blank">b</a>');
    });

    it('should override a unallowed target', () => {
      expect(
        sanitize(
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
    });

    it('should NOT output security-sensitive attributes', () => {
      allowConsoleError(() => {
        expect(sanitize('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
        expect(sanitize('a<a href="javascript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href=" JAVASCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href="vbscript:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href=" VBSCRIPT:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href="data:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href=" DATA:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href="blob:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(sanitize('a<a href=" BLOB:alert">b</a>')).to.be.equal(
          'a<a target="_top">b</a>'
        );
        expect(
          sanitize('a<a href="?__amp_source_origin=foo">b</a>')
        ).to.be.equal('a<a target="_top">b</a>');
      });
    });

    it('should NOT output denylisted values for class attributes', () => {
      allowConsoleError(() => {
        expect(sanitize('<p class="i-amphtml-">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
        expect(sanitize('<p class="i-amphtml-class">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
        expect(sanitize('<p class="foo-i-amphtml-bar">hello</p>')).to.be.equal(
          '<p>hello</p>'
        );
      });
    });

    it('should allow amp-subscriptions attributes', () => {
      expect(sanitize('<div subscriptions-action="login">link</div>')).to.equal(
        '<div subscriptions-action="login">link</div>'
      );
      expect(
        sanitize('<div subscriptions-section="actions">link</div>')
      ).to.equal('<div subscriptions-section="actions">link</div>');
      expect(sanitize('<div subscriptions-actions="">link</div>')).to.equal(
        '<div subscriptions-actions="">link</div>'
      );
      expect(sanitize('<div subscriptions-display="">link</div>')).to.equal(
        '<div subscriptions-display="">link</div>'
      );
      expect(sanitize('<div subscriptions-dialog="">link</div>')).to.equal(
        '<div subscriptions-dialog="">link</div>'
      );
    });

    it('should allow source::src with valid protocol', () => {
      expect(sanitize('<source src="https://www.foo.com/">')).to.equal(
        '<source src="https://www.foo.com/">'
      );
    });

    it('should not allow source::src with invalid protocol', () => {
      expect(sanitize('<source src="http://www.foo.com">')).to.equal(
        '<source src="">'
      );
      expect(sanitize('<source src="<script>bad()</script>">')).to.equal(
        '<source src="">'
      );
    });

    it('should allow div::template', () => {
      expect(sanitize('<div template="my-template-id"></div>')).to.equal(
        '<div template="my-template-id"></div>'
      );
    });

    it('should allow form::action-xhr', () => {
      expect(
        sanitize('<form action-xhr="https://foo.com/bar"></form>')
      ).to.equal('<form action-xhr="https://foo.com/bar"></form>');
    });

    it('should allow <amp-form>-related attributes', () => {
      expect(sanitize('<div submitting></div>')).to.equal(
        '<div submitting=""></div>'
      );
      expect(sanitize('<div submit-success></div>')).to.equal(
        '<div submit-success=""></div>'
      );
      expect(sanitize('<div submit-error></div>')).to.equal(
        '<div submit-error=""></div>'
      );
      expect(sanitize('<div verify-error></div>')).to.equal(
        '<div verify-error=""></div>'
      );
      expect(
        sanitize('<span visible-when-invalid="valueMissing"></span>')
      ).to.equal('<span visible-when-invalid="valueMissing"></span>');
      expect(sanitize('<span validation-for="form1"></span>')).to.equal(
        '<span validation-for="form1"></span>'
      );
    });

    it('should allow <amp-lightbox> attributes', () => {
      expect(sanitize('<amp-lightbox scrollable></amp-lightbox>')).to.equal(
        '<amp-lightbox scrollable=""></amp-lightbox>'
      );
    });

    it('should sanitize invalid attributes', () => {
      allowConsoleError(() => {
        expect(sanitize('<input type="button">')).to.equal('<input>');
        expect(sanitize('<input type="image">')).to.equal('<input>');
      });
    });
  });

  describe('should sanitize based on AMP doc format type', () => {
    afterEach(() => {
      html.removeAttribute('amp4email');
    });

    it('should allow for input type file and password', () => {
      expect(sanitize('<input type="file">')).to.equal('<input type="file">');
      expect(sanitize('<input type="password">')).to.equal(
        '<input type="password">'
      );
    });

    it('should disallow certain attributes on form for AMP4Email', () => {
      html.setAttribute('amp4email', '');
      allowConsoleError(() => {
        expect(sanitize('<input type="password">')).to.equal('<input>');
        expect(sanitize('<input type="file">')).to.equal('<input>');
        expect(sanitize('<form name="form-name"></form>')).to.equal(
          '<form></form>'
        );
        expect(sanitize('<amp-anim controls></amp-anim>')).to.equal(
          '<amp-anim></amp-anim>'
        );
      });
    });

    it('should only allow allowlisted AMP elements in AMP4EMAIL', () => {
      html.setAttribute('amp4email', '');
      expect(sanitize('<amp-analytics>')).to.equal('');
      expect(sanitize('<amp-iframe>')).to.equal('');
      expect(sanitize('<amp-list>')).to.equal('');
      expect(sanitize('<amp-pixel>')).to.equal('');
      expect(sanitize('<amp-twitter>')).to.equal('');
      expect(sanitize('<amp-video>')).to.equal('');
      expect(sanitize('<amp-youtube>')).to.equal('');

      expect(sanitize('<amp-accordion>')).to.equal('<amp-accordion>');
      expect(sanitize('<amp-anim>')).to.equal('<amp-anim>');
      expect(sanitize('<amp-bind-macro>')).to.equal('<amp-bind-macro>');
      expect(sanitize('<amp-carousel>')).to.equal('<amp-carousel>');
      expect(sanitize('<amp-fit-text>')).to.equal('<amp-fit-text>');
      expect(sanitize('<amp-img>')).to.equal('<amp-img>');
      expect(sanitize('<amp-layout>')).to.equal('<amp-layout>');
      expect(sanitize('<amp-selector>')).to.equal('<amp-selector>');
      expect(sanitize('<amp-sidebar>')).to.equal('<amp-sidebar>');
      expect(sanitize('<amp-timeago>')).to.equal('<amp-timeago>');
    });
  });

  describe('sanitizeTagsForTripleMustache', () => {
    it('should output basic text', () => {
      expect(sanitizeTagsForTripleMustache('abc', documentEl)).to.be.equal(
        'abc'
      );
    });

    it('should output valid markup', () => {
      expect(
        sanitizeTagsForTripleMustache('<b>abc</b>', documentEl)
      ).to.be.equal('<b>abc</b>');
      expect(
        sanitizeTagsForTripleMustache('<b>ab<br>c</b>', documentEl)
      ).to.be.equal('<b>ab<br>c</b>');
      expect(
        sanitizeTagsForTripleMustache('<b>a<i>b</i>c</b>', documentEl)
      ).to.be.equal('<b>a<i>b</i>c</b>');
      const markupWithClassAttribute = '<p class="some-class">heading</p>';
      expect(
        sanitizeTagsForTripleMustache(markupWithClassAttribute, documentEl)
      ).to.be.equal(markupWithClassAttribute);
      const markupWithClassesAttribute =
        '<div class="some-class another"><span>heading</span></div>';
      expect(
        sanitizeTagsForTripleMustache(markupWithClassesAttribute, documentEl)
      ).to.be.equal(markupWithClassesAttribute);
      const markupParagraph = '<p class="valid-class">paragraph</p>';
      expect(
        sanitizeTagsForTripleMustache(markupParagraph, documentEl)
      ).to.be.equal(markupParagraph);
    });

    it('should NOT output non-allowlisted markup', () => {
      expect(
        sanitizeTagsForTripleMustache('a<style>b</style>c', documentEl)
      ).to.be.equal('ac');
      expect(sanitizeTagsForTripleMustache('a<img>c', documentEl)).to.be.equal(
        'ac'
      );
    });

    it('should not allowlist amp-img element for AMP4Email', () => {
      html.setAttribute('amp4email', '');
      expect(
        sanitizeTagsForTripleMustache('a<amp-img></amp-img>c', documentEl)
      ).to.be.equal('ac');
    });

    it('should compensate for broken markup', () => {
      expect(sanitizeTagsForTripleMustache('<b>a<i>b', documentEl)).to.be.equal(
        '<b>a<i>b</i></b>'
      );
    });

    describe('should sanitize `style` attribute', () => {
      it('should allow valid styles', () => {
        expect(sanitize('<div style="color:blue">Test</div>')).to.equal(
          '<div style="color:blue">Test</div>'
        );
      });

      it('should ignore styles containing `!important`', () => {
        allowConsoleError(() => {
          expect(
            sanitize('<div style="color:blue!important">Test</div>')
          ).to.equal('<div>Test</div>');
        });
      });

      it('should ignore styles containing `position:fixed`', () => {
        allowConsoleError(() => {
          expect(sanitize('<div style="position:fixed">Test</div>')).to.equal(
            '<div>Test</div>'
          );
        });
      });

      it('should ignore styles containing `position:sticky`', () => {
        allowConsoleError(() => {
          expect(sanitize('<div style="position:sticky">Test</div>')).to.equal(
            '<div>Test</div>'
          );
        });
      });
    });
  });
}
