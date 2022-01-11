import {BindValidator} from '../bind-validator';

describes.sandboxed('BindValidator (allowUrlProperties=true)', {}, () => {
  let val;

  beforeEach(() => {
    const allowUrlProperties = true;
    val = new BindValidator(allowUrlProperties);
  });

  describe('canBind()', () => {
    it('should allow binding to "class" for any element', () => {
      expect(val.canBind('DIV', 'class')).to.be.true;
      expect(val.canBind('FAKE-TAG', 'class')).to.be.true;
    });

    it('should allow binding to "text" for any elements', () => {
      expect(val.canBind('P', 'text')).to.be.true;
      expect(val.canBind('FAKE-TAG', 'text')).to.be.true;
    });

    it('should allow binding to ARIA attributes for any element', () => {
      expect(val.canBind('P', 'aria-foo')).to.be.true;
      expect(val.canBind('FAKE-TAG', 'aria-foo')).to.be.true;
    });

    it('should NOT allow binding to "style"', () => {
      expect(val.canBind('DIV', 'style')).to.be.false;
      expect(val.canBind('P', 'style')).to.be.false;
      expect(val.canBind('SPAN', 'style')).to.be.false;
      expect(val.canBind('OL', 'style')).to.be.false;
      expect(val.canBind('BODY', 'style')).to.be.false;
    });

    it('should NOT allow binding to "on" event handlers', () => {
      expect(val.canBind('BODY', 'onafterprint')).to.be.false;
      expect(val.canBind('BODY', 'onbeforeprint')).to.be.false;
      expect(val.canBind('BODY', 'onbeforeunload')).to.be.false;
      expect(val.canBind('BODY', 'onhashchange')).to.be.false;
      expect(val.canBind('BODY', 'onload')).to.be.false;
      expect(val.canBind('BODY', 'onmessage')).to.be.false;
      expect(val.canBind('BODY', 'onoffline')).to.be.false;
      expect(val.canBind('BODY', 'ononline')).to.be.false;
      expect(val.canBind('BODY', 'onpagehide')).to.be.false;
      expect(val.canBind('BODY', 'onpageshow')).to.be.false;
      expect(val.canBind('BODY', 'onpopstate')).to.be.false;
      expect(val.canBind('BODY', 'onresize')).to.be.false;
      expect(val.canBind('BODY', 'onstorage')).to.be.false;
      expect(val.canBind('BODY', 'onunload')).to.be.false;

      expect(val.canBind('FORM', 'onblur')).to.be.false;
      expect(val.canBind('FORM', 'onchange')).to.be.false;
      expect(val.canBind('FORM', 'oncontextmenu')).to.be.false;
      expect(val.canBind('FORM', 'onfocus')).to.be.false;
      expect(val.canBind('FORM', 'oninput')).to.be.false;
      expect(val.canBind('FORM', 'oninvalid')).to.be.false;
      expect(val.canBind('FORM', 'onreset')).to.be.false;
      expect(val.canBind('FORM', 'onsearch')).to.be.false;
      expect(val.canBind('FORM', 'onselect')).to.be.false;
      expect(val.canBind('FORM', 'onsubmit')).to.be.false;

      expect(val.canBind('INPUT', 'onkeydown')).to.be.false;
      expect(val.canBind('INPUT', 'onkeypress')).to.be.false;
      expect(val.canBind('INPUT', 'onkeyup')).to.be.false;

      expect(val.canBind('BUTTON', 'onclick')).to.be.false;
      expect(val.canBind('BUTTON', 'ondblclick')).to.be.false;
      expect(val.canBind('BUTTON', 'onmousedown')).to.be.false;
      expect(val.canBind('BUTTON', 'onmousemove')).to.be.false;
      expect(val.canBind('BUTTON', 'onmouseout')).to.be.false;
      expect(val.canBind('BUTTON', 'onmouseover')).to.be.false;
      expect(val.canBind('BUTTON', 'onmouseup')).to.be.false;
      expect(val.canBind('BUTTON', 'onmousewheel')).to.be.false;
      expect(val.canBind('BUTTON', 'onwheel')).to.be.false;

      expect(val.canBind('DIV', 'ondrag')).to.be.false;
      expect(val.canBind('DIV', 'ondragend')).to.be.false;
      expect(val.canBind('DIV', 'ondragenter')).to.be.false;
      expect(val.canBind('DIV', 'ondragleave')).to.be.false;
      expect(val.canBind('DIV', 'ondragover')).to.be.false;
      expect(val.canBind('DIV', 'ondragstart')).to.be.false;
      expect(val.canBind('DIV', 'ondrop')).to.be.false;
      expect(val.canBind('DIV', 'onscroll')).to.be.false;

      expect(val.canBind('INPUT', 'oncopy')).to.be.false;
      expect(val.canBind('INPUT', 'oncut')).to.be.false;
      expect(val.canBind('INPUT', 'onpaste')).to.be.false;
    });

    it('should NOT allow binding to Object.prototype keys', () => {
      expect(val.canBind('constructor', 'constructor')).to.be.false;
      expect(val.canBind('toString', 'constructor')).to.be.false;
      expect(val.canBind('hasOwnProperty', 'constructor')).to.be.false;
      expect(val.canBind('isPrototypeOf', 'constructor')).to.be.false;
      expect(val.canBind('__defineGetter__', 'constructor')).to.be.false;
      expect(val.canBind('__defineSetter__', 'constructor')).to.be.false;
      expect(val.canBind('__proto__', 'constructor')).to.be.false;

      expect(val.canBind('P', 'constructor')).to.be.false;
      expect(val.canBind('P', 'toString')).to.be.false;
      expect(val.canBind('P', 'hasOwnProperty')).to.be.false;
      expect(val.canBind('P', 'isPrototypeOf')).to.be.false;
      expect(val.canBind('P', '__defineGetter__')).to.be.false;
      expect(val.canBind('P', '__defineSetter__')).to.be.false;
      expect(val.canBind('P', '__proto__')).to.be.false;
    });
  });

  describe('isResultValid()', () => {
    it('should NOT allow invalid "class" attribute values', () => {
      expect(val.isResultValid('DIV', 'class', 'foo')).to.be.true;

      expect(val.isResultValid('DIV', 'class', 'i-amphtml-foo')).to.be.false;
      expect(val.isResultValid('DIV', 'class', 'foo i-amphtml-bar')).to.be
        .false;
    });

    it('should NOT sanitize "text" attribute values', () => {
      expect(val.isResultValid('P', 'text', 'Hello World')).to.be.true;
      expect(val.isResultValid('P', 'text', '')).to.be.true;
      expect(val.isResultValid('P', 'text', null)).to.be.true;
      expect(val.isResultValid('P', 'text', '<script>alert(1);</script>')).to.be
        .true;
    });

    it('should block dangerous attribute URLs in standard elements', () => {
      expect(
        val.isResultValid(
          'A',
          'href',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)'
        )
      ).to.be.false;
      expect(
        val.isResultValid(
          'A',
          'href',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;

      expect(
        val.isResultValid(
          'SOURCE',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)'
        )
      ).to.be.false;
      expect(
        val.isResultValid(
          'SOURCE',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;

      expect(
        val.isResultValid(
          'TRACK',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)'
        )
      ).to.be.false;
      expect(
        val.isResultValid(
          'TRACK',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;
    });

    it('should NOT allow unsupported <input> "type" values', () => {
      expect(val.isResultValid('INPUT', 'type', 'checkbox')).to.be.true;
      expect(val.isResultValid('INPUT', 'type', 'email')).to.be.true;
      expect(val.isResultValid('INPUT', 'type', 'file')).to.be.true;
      expect(val.isResultValid('INPUT', 'type', 'password')).to.be.true;

      expect(val.isResultValid('INPUT', 'type', 'BUTTON')).to.be.false;
      expect(val.isResultValid('INPUT', 'type', 'image')).to.be.false;
    });
  });

  describe('AMP extensions', () => {
    it('should support width/height for all AMP elements', () => {
      expect(val.canBind('AMP-IMG', 'width')).to.be.true;
      expect(val.canBind('AMP-IMG', 'height')).to.be.true;

      expect(val.canBind('AMP-FOO', 'width')).to.be.true;
      expect(val.canBind('AMP-FOO', 'height')).to.be.true;
    });

    it('should support <amp-carousel>', () => {
      expect(val.canBind('AMP-CAROUSEL', 'slide')).to.be.true;
    });

    it('should support <amp-img>', () => {
      expect(val.canBind('AMP-IMG', 'src')).to.be.true;

      expect(val.isResultValid('AMP-IMG', 'src', 'http://foo.com/bar.jpg')).to
        .be.true;
      expect(
        val.isResultValid(
          'AMP-IMG',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;
      expect(val.isResultValid('AMP-IMG', 'src', '?__amp_source_origin=foo')).to
        .be.false;

      expect(
        val.isResultValid(
          'AMP-IMG',
          'srcset',
          'http://a.com/b.jpg 1x, http://c.com/d.jpg 2x'
        )
      ).to.be.true;
      expect(
        val.isResultValid(
          'AMP-IMG',
          'srcset',
          /* eslint no-script-url: 0 */ 'javascript:alert(1);'
        )
      ).to.be.false;
      expect(
        val.isResultValid(
          'AMP-IMG',
          'src',
          'http://a.com/b.jpg 1x, ?__amp_source_origin=foo 2x'
        )
      ).to.be.false;
    });

    it('should support <amp-carousel>', () => {
      expect(val.canBind('AMP-LIGHTBOX', 'open')).to.be.true;
    });

    it('should support <amp-list>', () => {
      expect(val.canBind('AMP-LIST', 'src')).to.be.true;
      expect(val.canBind('AMP-LIST', 'state')).to.be.true;
      expect(val.canBind('AMP-LIST', 'is-layout-container')).to.be.true;
    });

    it('should support <amp-render>', () => {
      expect(val.canBind('AMP-RENDER', 'src')).to.be.true;
    });

    it('should support <amp-selector>', () => {
      expect(val.canBind('AMP-SELECTOR', 'disabled')).to.be.true;
      expect(val.canBind('AMP-SELECTOR', 'selected')).to.be.true;
    });

    it('should support <amp-state>', () => {
      expect(val.canBind('AMP-STATE', 'src')).to.be.true;

      expect(val.isResultValid('AMP-STATE', 'src', 'https://foo.com/bar.json'))
        .to.be.true;
      expect(val.isResultValid('AMP-STATE', 'src', 'http://foo.com/bar.json'))
        .to.be.false;
      expect(val.isResultValid('AMP-STATE', 'src', 'data://foo.com/bar.json'))
        .to.be.false;
    });

    it('should support <amp-video>', () => {
      expect(val.canBind('AMP-VIDEO', 'loop')).to.be.true;
      expect(val.canBind('AMP-VIDEO', 'poster')).to.be.true;
      expect(val.canBind('AMP-VIDEO', 'src')).to.be.true;

      expect(val.isResultValid('AMP-VIDEO', 'src', 'https://foo.com/bar.mp4'))
        .to.be.true;
      expect(val.isResultValid('AMP-VIDEO', 'src', 'http://foo.com/bar.mp4')).to
        .be.false;
      expect(
        val.isResultValid(
          'AMP-VIDEO',
          'src',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;
    });

    it('should support (svg) image', () => {
      expect(val.canBind('IMAGE', 'xlink:href')).to.be.true;
      expect(
        val.isResultValid(
          'IMAGE',
          'xlink:href',
          /* eslint no-script-url: 0 */ 'javascript:alert(1)\n;'
        )
      ).to.be.false;
    });

    it('should support <section> elements (from <amp-accordion>)', () => {
      expect(val.canBind('SECTION', 'data-expand')).to.be.true;
      expect(val.canBind('SECTION', 'expanded')).to.be.true;
    });
  });
});

describes.sandboxed('BindValidator (allowUrlProperties=false)', {}, () => {
  let val;

  beforeEach(() => {
    const allowUrlProperties = false;
    val = new BindValidator(allowUrlProperties);
  });

  it('should disallow URL bindings', () => {
    expect(val.canBind('A', 'href')).to.be.false;
    expect(val.canBind('AMP-IMG', 'src')).to.be.false;
    expect(val.canBind('AMP-IMG', 'srcset')).to.be.false;
    expect(val.canBind('IMAGE', 'xlink:href')).to.be.false;
  });

  it('should not validate results of URL properties', () => {
    expect(val.isResultValid('A', 'href', 'https://google.com')).to.be.false;
    expect(val.isResultValid('AMP-IMG', 'src', 'https://foo.com/bar.jpg')).to.be
      .false;
    expect(
      val.isResultValid(
        'AMP-IMG',
        'srcset',
        'http://a.com/b.jpg 1x, http://c.com/d.jpg 2x'
      )
    ).to.be.false;
    expect(val.isResultValid('IMAGE', 'xlink:href', 'https://foo.com/bar.jpg'))
      .to.be.false;
  });
});
