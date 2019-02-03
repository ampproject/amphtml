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

const assert = require('assert');

const {FileList} = require('../file-list');
const {getBoundAttr, parseHtmlChunk} = require('./helpers');


describe('devdash', () => {

  describe('FileList', () => {

    it('wraps', () => {
      const root = parseHtmlChunk(FileList({
        basepath: 'basepath',
        fileSet: [],
        selectModePrefix: '/',
      }));

      assert.strictEqual(root.className, 'file-list-container');

      const {firstElementChild} = root;

      assert.strictEqual(firstElementChild.className, 'wrap');
    });

    it('creates amp-list', () => {
      const root = parseHtmlChunk(FileList({
        basepath: 'basepath',
        fileSet: [],
        selectModePrefix: '/',
      }));

      const els = root.getElementsByTagName('amp-list');

      assert.strictEqual(els.length, 1);
    });

    it('creates placeholder inside amp-list with rendered data', () => {
      const fileSet = ['foo.bar', 'tacos.al.pastor'];

      const root = parseHtmlChunk(FileList({
        fileSet,
        basepath: 'basepath',
        selectModePrefix: '/',
      }));

      const els = root.querySelectorAll('amp-list > [placeholder]');

      assert.strictEqual(els.length, 1);

      const [placeholder] = els;
      const {firstElementChild} = placeholder;

      assert.strictEqual(firstElementChild.getAttribute('role'), 'list');

      const items = firstElementChild.querySelectorAll('.file-link-container');

      assert.strictEqual(items.length, fileSet.length);
    });

    it('binds /examples hrefs', () => {
      const fileSet = ['asada.html', 'adobada.html', 'pastor.html'];
      const basepath = '/examples/';

      const root = parseHtmlChunk(FileList({
        fileSet,
        basepath,
        selectModePrefix: '/',
      }));

      const els = root.querySelectorAll('amp-list [role=listitem] > a[href]');

      assert.strictEqual(els.length, fileSet.length);

      Array.from(els).forEach((el, i) => {
        assert(getBoundAttr(el, 'href'));
        assert.strictEqual(el.getAttribute('href'), basepath + fileSet[i]);
      });
    });

    it('does not bind non-/examples hrefs', () => {
      const fileSet = ['asada.html', 'adobada.html', 'pastor.html'];
      const basepath = '/potato/';

      const root = parseHtmlChunk(FileList({
        fileSet,
        basepath,
        selectModePrefix: '/',
      }));

      const els = root.querySelectorAll('amp-list [role=listitem] > a[href]');

      assert.strictEqual(els.length, fileSet.length);

      Array.from(els).forEach((el, i) => {
        assert(!getBoundAttr(el, 'href'));
        assert.strictEqual(el.getAttribute('href'), basepath + fileSet[i]);
      });
    });

    it('binds/does not bind mixed', () => {
      const bound = ['asada.html', 'adobada.html', 'pastor.html'];
      const notBound = ['chabbuddy.g', 'dj.beats', 'mc.grindah'];
      const basepath = '/examples/';

      const root = parseHtmlChunk(FileList({
        fileSet: [...bound, ...notBound],
        basepath,
        selectModePrefix: '/',
      }));

      const els = root.querySelectorAll('amp-list [role=listitem] > a[href]');

      assert.strictEqual(els.length, bound.length + notBound.length);

      bound.forEach((expectedHref, i) => {
        const el = els[i];
        assert(getBoundAttr(el, 'href'));
        assert.strictEqual(el.getAttribute('href'), basepath + expectedHref);
      });

      notBound.forEach((expectedHref, i) => {
        const el = els[bound.length + i];
        assert(!getBoundAttr(el, 'href'));
        assert.strictEqual(el.getAttribute('href'), basepath + expectedHref);
      });
    });

  });

});
