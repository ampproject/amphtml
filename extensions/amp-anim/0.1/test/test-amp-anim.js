/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  env => {
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

      impl.layoutCallback();
      expect(img.getAttribute('src')).to.equal('test.jpg');
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
