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

const {expect} = require('chai');
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

      expect(root.className).to.equal('file-list-container');

      const {firstElementChild} = root;

      expect(firstElementChild.className).to.equal('wrap');
    });

    it('creates amp-list', () => {
      const root = parseHtmlChunk(FileList({
        basepath: 'basepath',
        fileSet: [],
        selectModePrefix: '/',
      }));

      const {length} = root.getElementsByTagName('amp-list');
      expect(length).to.equal(1);
    });

    it('creates placeholder inside amp-list with rendered data', () => {
      const fileSet = ['foo.bar', 'tacos.al.pastor'];

      const root = parseHtmlChunk(FileList({
        fileSet,
        basepath: 'basepath',
        selectModePrefix: '/',
      }));

      const els = root.querySelectorAll('amp-list > [placeholder]');

      expect(els).to.have.length(1);

      const [placeholder] = els;
      const {firstElementChild} = placeholder;

      expect(firstElementChild.getAttribute('role')).to.equal('list');

      const items = firstElementChild.querySelectorAll('.file-link-container');

      expect(items).to.have.length(fileSet.length);
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

      expect(els).to.have.length(fileSet.length);

      Array.from(els).forEach((el, i) => {
        expect(getBoundAttr(el, 'href')).to.be.ok;
        expect(el.getAttribute('href')).to.equal(basepath + fileSet[i]);
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

      expect(els).to.have.length(fileSet.length);

      Array.from(els).forEach((el, i) => {
        expect(getBoundAttr(el, 'href')).to.be.undefined;
        expect(el.getAttribute('href')).to.equal(basepath + fileSet[i]);
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

      expect(els).to.have.length(bound.length + notBound.length);

      bound.forEach((expectedHref, i) => {
        const el = els[i];
        expect(getBoundAttr(el, 'href')).to.be.ok;
        expect(el.getAttribute('href')).to.equal(basepath + expectedHref);
      });

      notBound.forEach((expectedHref, i) => {
        const el = els[bound.length + i];
        expect(getBoundAttr(el, 'href')).to.be.undefined;
        expect(el.getAttribute('href')).to.equal(basepath + expectedHref);
      });
    });

  });

});
