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

import {Layout, getLengthNumeral, getLengthUnits, parseLength} from
    '../../src/layout';
import {applyLayout_} from '../../src/custom-element';


describe('Layout', () => {
  var div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('parseLength', () => {
    expect(parseLength(10)).to.equal('10px');
    expect(parseLength('10')).to.equal('10px');
    expect(parseLength('10px')).to.equal('10px');
    expect(parseLength('10em')).to.equal('10em');
    expect(parseLength('10vmin')).to.equal('10vmin');
    expect(parseLength(undefined)).to.equal(undefined);
    expect(parseLength(null)).to.equal(undefined);
    expect(parseLength('')).to.equal(undefined);
  });

  it('getLengthUnits', () => {
    expect(getLengthUnits('10px')).to.equal('px');
    expect(getLengthUnits('10em')).to.equal('em');
    expect(getLengthUnits('10vmin')).to.equal('vmin');
  });

  it('getLengthNumeral', () => {
    expect(getLengthNumeral('10')).to.equal(10);
    expect(getLengthNumeral('10px')).to.equal(10);
    expect(getLengthNumeral('10em')).to.equal(10);
    expect(getLengthNumeral('10vmin')).to.equal(10);
  });

  it('layout=nodisplay', () => {
    div.setAttribute('layout', 'nodisplay');
    expect(applyLayout_(div)).to.equal(Layout.NODISPLAY);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div.style.display).to.equal('none');
    expect(div.classList.contains('-amp-element')).to.equal(true);
    expect(div.classList.contains('-amp-layout-nodisplay')).to.equal(true);
    expect(div.classList.contains('-amp-layout-size-defined')).to.equal(false);
    expect(div.children.length).to.equal(0);
  });

  it('layout=fixed', () => {
    div.setAttribute('layout', 'fixed');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyLayout_(div)).to.equal(Layout.FIXED);
    expect(div.style.width).to.equal('100px');
    expect(div.style.height).to.equal('200px');
    expect(div.classList.contains('-amp-element')).to.equal(true);
    expect(div.classList.contains('-amp-layout-fixed')).to.equal(true);
    expect(div.classList.contains('-amp-layout-size-defined')).to.equal(true);
    expect(div.children.length).to.equal(0);
  });

  it('layout=fixed - default with width/height', () => {
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyLayout_(div)).to.equal(Layout.FIXED);
    expect(div.style.width).to.equal('100px');
    expect(div.style.height).to.equal('200px');
  });

  it('layout=fixed - requires width/height', () => {
    div.setAttribute('layout', 'fixed');
    expect(() => applyLayout_(div)).to.throw(
        /to be available and be an integer/);
  });

  it('layout=responsive', () => {
    div.setAttribute('layout', 'responsive');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyLayout_(div)).to.equal(Layout.RESPONSIVE);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div.classList.contains('-amp-element')).to.equal(true);
    expect(div.classList.contains('-amp-layout-responsive')).to.equal(true);
    expect(div.classList.contains('-amp-layout-size-defined')).to.equal(true);
    expect(div.children.length).to.equal(1);
    expect(div.children[0].tagName.toLowerCase()).to.equal('i-amp-sizer');
    expect(div.children[0].style.paddingTop).to.equal('200%');
  });

  it('layout=fill', () => {
    div.setAttribute('layout', 'fill');
    expect(applyLayout_(div)).to.equal(Layout.FILL);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div.classList.contains('-amp-element')).to.equal(true);
    expect(div.classList.contains('-amp-layout-fill')).to.equal(true);
    expect(div.classList.contains('-amp-layout-size-defined')).to.equal(true);
    expect(div.children.length).to.equal(0);
  });

  it('layout=container', () => {
    div.setAttribute('layout', 'container');
    expect(applyLayout_(div)).to.equal(Layout.CONTAINER);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div.classList.contains('-amp-element')).to.equal(true);
    expect(div.classList.contains('-amp-layout-container')).to.equal(true);
    expect(div.classList.contains('-amp-layout-size-defined')).to.equal(false);
    expect(div.children.length).to.equal(0);
  });

  it('layout=unknown', () => {
    div.setAttribute('layout', 'foo');
    expect(function() {
      applyLayout_(div);
    }).to.throw(/Unknown layout: foo/);
  });

});
