/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {FakeWindow} from '../../../../../testing/fake-dom';
import {SanitizerImpl} from '../../amp-script';

describe('SanitizerImpl', () => {
  let el;
  let s;
  let win;

  beforeEach(() => {
    win = new FakeWindow();
    s = new SanitizerImpl(win, []);
    el = win.document.createElement('div');
  });

  describe('changeAttribute', () => {
    it('should remove attributes when value is null', () => {
      el.setAttribute('class', 'foo');
      s.changeAttribute(el, 'class', null);
      expect(el.hasAttribute('class')).to.be.false;
    });

    it('should set attributes when value is non-null', () => {
      s.changeAttribute(el, 'class', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should be case-insensitive to attribute name', () => {
      s.changeAttribute(el, 'CLASS', 'foo');
      expect(el.getAttribute('class')).to.equal('foo');
    });

    it('should set a[target] if [href] exists', () => {
      const a = win.document.createElement('a');
      s.changeAttribute(a, 'href', '/foo.html');
      expect(a.getAttribute('target')).to.equal('_top');
    });

    it('should not allow changes to invalid tags', () => {
      const base = win.document.createElement('base');
      // 'href' attribute is allowed but 'base' tag isn't.
      s.changeAttribute(base, 'href', '/foo.html');
      expect(base.getAttribute('href')).to.be.null;
    });

    it('should allow changes to built-in AMP tags except amp-pixel', () => {
      const img = win.document.createElement('amp-img');
      s.changeAttribute(img, 'src', 'foo.jpg');
      expect(img.getAttribute('src')).to.include('foo.jpg');

      const layout = win.document.createElement('amp-layout');
      s.changeAttribute(layout, 'width', '10');
      expect(layout.getAttribute('width')).to.equal('10');

      const pixel = win.document.createElement('amp-pixel');
      s.changeAttribute(pixel, 'src', '/foo/track');
      expect(pixel.getAttribute('src')).to.be.null;
    });

    it('should not allow changes to other AMP tags', () => {
      const analytics = win.document.createElement('amp-analytics');
      s.changeAttribute(analytics, 'data-credentials', 'include');
      expect(analytics.getAttribute('data-credentials')).to.be.null;
    });

    it('should not allow changes to form elements', () => {
      const form = win.document.createElement('form');
      s.changeAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.be.null;

      const input = win.document.createElement('input');
      s.changeAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.be.null;
    });

    it('should allow changes to form elements if sandbox=allow-forms', () => {
      s = new SanitizerImpl(win, ['allow-forms']);

      const form = win.document.createElement('form');
      s.changeAttribute(form, 'action-xhr', 'https://example.com/post');
      expect(form.getAttribute('action-xhr')).to.equal(
        'https://example.com/post'
      );

      const input = win.document.createElement('input');
      s.changeAttribute(input, 'value', 'foo');
      expect(input.getAttribute('value')).to.equal('foo');
    });
  });

  describe('storage', () => {
    it('getStorage()', () => {
      it('should be initially empty', () => {
        expect(s.getStorage('local')).to.deep.equal({});
        expect(s.getStorage('session')).to.deep.equal({});
      });

      it('should return localStorage data', () => {
        win.localStorage.setItem('foo', 'bar');
        expect(s.getStorage('local')).to.deep.equal({foo: 'bar'});
        expect(s.getStorage('session')).to.deep.equal({});
      });

      it('should return sessionStorage data', () => {
        win.sessionStorage.setItem('abc', '123');
        expect(s.getStorage('local')).to.deep.equal({});
        expect(s.getStorage('session')).to.deep.equal({abc: '123'});
      });

      it('should filter amp-* keys', () => {
        win.localStorage.setItem('amp-foo', 'bar');
        win.sessionStorage.setItem('amp-baz', 'qux');
        expect(s.getStorage('local')).to.deep.equal({foo: 'bar'});
        expect(s.getStorage('session')).to.deep.equal({});
      });
    });

    describe('changeStorage()', () => {
      it('should set items', () => {
        s.changeStorage('local', 'x', '1');
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');

        s.changeStorage('session', 'y', '2');
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('y')).to.equal('2');
      });

      it('should not set items with amp-* keys', () => {
        allowConsoleError(() => {
          s.changeStorage('local', 'amp-x', '1');
        });
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('amp-x')).to.be.null;

        allowConsoleError(() => {
          s.changeStorage('session', 'amp-y', '2');
        });
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('amp-y')).to.be.null;
      });

      it('should remove items', () => {
        win.localStorage.setItem('x', '1');
        s.changeStorage('local', 'x', null);
        expect(win.localStorage.length).to.equal(0);
        expect(win.localStorage.getItem('x')).to.be.null;

        win.sessionStorage.setItem('y', '2');
        s.changeStorage('session', 'y', null);
        expect(win.sessionStorage.length).to.equal(0);
        expect(win.sessionStorage.getItem('y')).to.be.null;
      });

      it('should not remove items with amp-* keys', () => {
        win.localStorage.setItem('amp-x', '1');
        allowConsoleError(() => {
          s.changeStorage('local', 'amp-x', null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('amp-x')).to.equal('1');

        win.sessionStorage.setItem('amp-y', '2');
        allowConsoleError(() => {
          s.changeStorage('session', 'amp-y', null);
        });
        expect(win.sessionStorage.length).to.equal(1);
        expect(win.sessionStorage.getItem('amp-y')).to.equal('2');
      });

      it('should not support Storage.clear()', () => {
        win.localStorage.setItem('x', '1');
        allowConsoleError(() => {
          s.changeStorage('local', null, null);
        });
        expect(win.localStorage.length).to.equal(1);
        expect(win.localStorage.getItem('x')).to.equal('1');
      });
    });
  });
});
