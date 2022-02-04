import {AmpAnim, SRC_PLACEHOLDER} from '../amp-anim';

const EXAMPLE_SRCSET = `https://media.giphy.com/media/yFQ0ywscgobJK/giphy.gif 1282w,
https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif 1923w`;

describes.realWin(
  'amp-anim',
  {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-anim'],
    },
  },
  (env) => {
    it('should propagate ARIA attributes', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('srcset', EXAMPLE_SRCSET);
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);
      el.setAttribute('aria-label', 'Hello');
      el.setAttribute('aria-labelledby', 'id2');
      el.setAttribute('aria-describedby', 'id3');

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.getAttribute('aria-label')).to.equal('Hello');
      expect(img.getAttribute('aria-labelledby')).to.equal('id2');
      expect(img.getAttribute('aria-describedby')).to.equal('id3');
      expect(img.getAttribute('decoding')).to.equal('async');
    });

    it('should propagate src and srcset', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('srcset', EXAMPLE_SRCSET);
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.getAttribute('src')).to.equal('test.jpg');
      expect(img.getAttribute('srcset')).to.equal(EXAMPLE_SRCSET);
    });

    it('should set src to placeholder on unlayout and reset on layout', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('srcset', EXAMPLE_SRCSET);
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.getAttribute('src')).to.equal('test.jpg');
      expect(img.getAttribute('srcset')).to.equal(EXAMPLE_SRCSET);

      impl.unlayoutCallback();
      expect(img.getAttribute('src')).to.equal(SRC_PLACEHOLDER);
      expect(img.getAttribute('srcset')).to.equal(SRC_PLACEHOLDER);

      impl.layoutCallback();
      expect(img.getAttribute('src')).to.equal('test.jpg');
      expect(img.getAttribute('srcset')).to.equal(EXAMPLE_SRCSET);
    });

    it('should clear srcset if missing on relayout', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('width', 100);
      el.setAttribute('height', 100);

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.getAttribute('src')).to.equal('test.jpg');

      impl.unlayoutCallback();
      expect(img.getAttribute('src')).to.equal(SRC_PLACEHOLDER);
      expect(img.getAttribute('srcset')).to.equal(SRC_PLACEHOLDER);

      impl.layoutCallback();
      expect(img.getAttribute('src')).to.equal('test.jpg');
      expect(img.getAttribute('srcset')).to.equal(null);
    });

    it('should propagate the object-fit attribute', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('object-fit', 'cover');

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.style.objectFit).to.equal('cover');
    });

    it('should not propagate the object-fit attribute if invalid', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('object-fit', 'foo 80%');

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.style.objectFit).to.be.empty;
    });

    it('should propagate the object-position attribute', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('object-position', '20% 80%');

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.style.objectPosition).to.equal('20% 80%');
    });

    it('should not propagate the object-position attribute if invalid', () => {
      const el = env.win.document.createElement('amp-anim');
      el.setAttribute('src', 'test.jpg');
      el.setAttribute('object-position', 'url:("example.com")');

      const impl = new AmpAnim(el);
      impl.buildCallback();
      impl.layoutCallback();
      const img = el.querySelector('img');
      expect(img.style.objectPosition).to.be.empty;
    });
  }
);
