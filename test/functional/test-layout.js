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

import {Layout, applyStaticLayout,
  assertLength, assertLengthOrPercent, getLengthNumeral, getLengthUnits,
  parseLayout, parseLength} from '../../src/layout';


describe('Layout', () => {
  let div;

  beforeEach(() => {
    div = document.createElement('div');
  });

  it('parseLayout', () => {
    expect(parseLayout('nodisplay')).to.equal('nodisplay');
    expect(parseLayout('fixed')).to.equal('fixed');
    expect(parseLayout('fixed-height')).to.equal('fixed-height');
    expect(parseLayout('responsive')).to.equal('responsive');
    expect(parseLayout('container')).to.equal('container');
    expect(parseLayout('fill')).to.equal('fill');
    expect(parseLayout('fluid')).to.equal('fluid');
  });

  it('parseLayout - failure', () => {
    expect(parseLayout('abc')).to.be.undefined;
    expect(parseLayout('xyz')).to.be.undefined;
  });

  it('parseLength', () => {
    expect(parseLength(10)).to.equal('10px');
    expect(parseLength('10')).to.equal('10px');
    expect(parseLength('10px')).to.equal('10px');
    expect(parseLength('10em')).to.equal('10em');
    expect(parseLength('10vmin')).to.equal('10vmin');
    expect(parseLength('10cm')).to.equal('10cm');
    expect(parseLength('10mm')).to.equal('10mm');
    expect(parseLength('10in')).to.equal('10in');
    expect(parseLength('10pt')).to.equal('10pt');
    expect(parseLength('10pc')).to.equal('10pc');
    expect(parseLength('10q')).to.equal('10q');

    expect(parseLength(10.1)).to.equal('10.1px');
    expect(parseLength('10.2')).to.equal('10.2px');
    expect(parseLength('10.1px')).to.equal('10.1px');
    expect(parseLength('10.1em')).to.equal('10.1em');
    expect(parseLength('10.1vmin')).to.equal('10.1vmin');

    expect(parseLength(undefined)).to.equal(undefined);
    expect(parseLength(null)).to.equal(undefined);
    expect(parseLength('')).to.equal(undefined);
  });

  it('getLengthUnits', () => {
    expect(getLengthUnits('10px')).to.equal('px');
    expect(getLengthUnits('10em')).to.equal('em');
    expect(getLengthUnits('10vmin')).to.equal('vmin');

    expect(getLengthUnits('10.1px')).to.equal('px');
    expect(getLengthUnits('10.1em')).to.equal('em');
    expect(getLengthUnits('10.1vmin')).to.equal('vmin');
  });

  it('getLengthNumeral', () => {
    expect(getLengthNumeral('10')).to.equal(10);
    expect(getLengthNumeral('10px')).to.equal(10);
    expect(getLengthNumeral('10em')).to.equal(10);
    expect(getLengthNumeral('10vmin')).to.equal(10);

    expect(getLengthNumeral('10.1')).to.equal(10.1);
    expect(getLengthNumeral('10.1px')).to.equal(10.1);
    expect(getLengthNumeral('10.1em')).to.equal(10.1);
    expect(getLengthNumeral('10.1vmin')).to.equal(10.1);

    expect(getLengthNumeral(null)).to.equal(undefined);
    expect(getLengthNumeral('auto')).to.equal(undefined);
  });

  it('assertLength', () => {
    expect(assertLength('10px')).to.equal('10px');
    expect(assertLength('10em')).to.equal('10em');
    expect(assertLength('10vmin')).to.equal('10vmin');
    expect(assertLength('10cm')).to.equal('10cm');
    expect(assertLength('10mm')).to.equal('10mm');
    expect(assertLength('10in')).to.equal('10in');
    expect(assertLength('10pt')).to.equal('10pt');
    expect(assertLength('10pc')).to.equal('10pc');
    expect(assertLength('10q')).to.equal('10q');

    expect(assertLength('10.1px')).to.equal('10.1px');
    expect(assertLength('10.1em')).to.equal('10.1em');
    expect(assertLength('10.1vmin')).to.equal('10.1vmin');

    allowConsoleError(() => { expect(function() {
      assertLength('10%');
    }).to.throw(/Invalid length value/); });
    allowConsoleError(() => { expect(function() {
      assertLength(10);
    }).to.throw(/Invalid length value/); });
    allowConsoleError(() => { expect(function() {
      assertLength('10');
    }).to.throw(/Invalid length value/); });
    allowConsoleError(() => { expect(function() {
      assertLength(undefined);
    }).to.throw(/Invalid length value/); });
    allowConsoleError(() => { expect(function() {
      assertLength(null);
    }).to.throw(/Invalid length value/); });
    allowConsoleError(() => { expect(function() {
      assertLength('');
    }).to.throw(/Invalid length value/); });
  });


  it('assertLengthOrPercent', () => {
    expect(assertLengthOrPercent('10px')).to.equal('10px');
    expect(assertLengthOrPercent('10em')).to.equal('10em');
    expect(assertLengthOrPercent('10vmin')).to.equal('10vmin');

    expect(assertLengthOrPercent('10.1px')).to.equal('10.1px');
    expect(assertLengthOrPercent('10.1em')).to.equal('10.1em');
    expect(assertLengthOrPercent('10.1vmin')).to.equal('10.1vmin');
    expect(assertLengthOrPercent('10.1%')).to.equal('10.1%');

    allowConsoleError(() => { expect(function() {
      assertLengthOrPercent(10);
    }).to.throw(/Invalid length or percent value/); });
    allowConsoleError(() => { expect(function() {
      assertLengthOrPercent('10');
    }).to.throw(/Invalid length or percent value/); });
    allowConsoleError(() => { expect(function() {
      assertLengthOrPercent(undefined);
    }).to.throw(/Invalid length or percent value/); });
    allowConsoleError(() => { expect(function() {
      assertLengthOrPercent(null);
    }).to.throw(/Invalid length or percent value/); });
    allowConsoleError(() => { expect(function() {
      assertLengthOrPercent('');
    }).to.throw(/Invalid length or percent value/); });
  });


  it('layout=nodisplay', () => {
    div.setAttribute('layout', 'nodisplay');
    expect(applyStaticLayout(div)).to.equal(Layout.NODISPLAY);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div.style.display).to.equal('none');
    expect(div).to.have.class('i-amphtml-layout-nodisplay');
    expect(div).to.not.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });


  it('layout=fixed', () => {
    div.setAttribute('layout', 'fixed');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED);
    expect(div.style.width).to.equal('100px');
    expect(div.style.height).to.equal('200px');
    expect(div).to.have.class('i-amphtml-layout-fixed');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=fixed - default with width/height', () => {
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED);
    expect(div.style.width).to.equal('100px');
    expect(div.style.height).to.equal('200px');
  });

  it('layout=fixed - requires width/height', () => {
    div.setAttribute('layout', 'fixed');
    allowConsoleError(() => {
      expect(() => applyStaticLayout(div)).to.throw(
          /Expected height to be available/);
    });
  });


  it('layout=fixed-height', () => {
    div.setAttribute('layout', 'fixed-height');
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED_HEIGHT);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('200px');
    expect(div).to.have.class('i-amphtml-layout-fixed-height');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=fixed-height, with width=auto', () => {
    div.setAttribute('layout', 'fixed-height');
    div.setAttribute('height', 200);
    div.setAttribute('width', 'auto');
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED_HEIGHT);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('200px');
    expect(div).to.have.class('i-amphtml-layout-fixed-height');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=fixed-height, prohibit width!=auto', () => {
    div.setAttribute('layout', 'fixed-height');
    div.setAttribute('height', 200);
    div.setAttribute('width', 300);
    allowConsoleError(() => { expect(function() {
      applyStaticLayout(div);
    }).to.throw(/Expected width to be either absent or equal "auto"/); });
  });

  it('layout=fixed-height - default with height', () => {
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED_HEIGHT);
    expect(div.style.height).to.equal('200px');
    expect(div.style.width).to.equal('');
  });

  it('layout=fixed-height - default with height and width=auto', () => {
    div.setAttribute('height', 200);
    div.setAttribute('width', 'auto');
    expect(applyStaticLayout(div)).to.equal(Layout.FIXED_HEIGHT);
    expect(div.style.height).to.equal('200px');
    expect(div.style.width).to.equal('');
  });

  it('layout=fixed-height - requires height', () => {
    div.setAttribute('layout', 'fixed-height');
    allowConsoleError(() => {
      expect(() => applyStaticLayout(div)).to.throw(
          /Expected height to be available/);
    });
  });


  it('layout=responsive', () => {
    div.setAttribute('layout', 'responsive');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.RESPONSIVE);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-responsive');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(1);
    expect(div.children[0].tagName.toLowerCase()).to.equal('i-amphtml-sizer');
    expect(div.children[0].style.paddingTop).to.equal('200%');
  });

  it('layout=responsive - default with sizes', () => {
    div.setAttribute('sizes', '50vw');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.RESPONSIVE);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-responsive');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(1);
    expect(div.children[0].tagName.toLowerCase()).to.equal('i-amphtml-sizer');
    expect(div.children[0].style.paddingTop).to.equal('200%');
  });


  it('layout=intrinsic', () => {
    div.setAttribute('layout', 'intrinsic');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.INTRINSIC);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-intrinsic');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(1);
    expect(div.children[0].tagName.toLowerCase()).to.equal('i-amphtml-sizer');
    expect(div.children[0].children.length).to.equal(1);
    expect(div.children[0].children[0].tagName.toLowerCase()).to.equal('img');
    expect(div.children[0].children[0].src).to.equal('data:image/svg+xml;charset=utf-8,<svg height="200px" width="100px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>');
  });

  it('layout=intrinsic - default with sizes', () => {
    div.setAttribute('layout', 'intrinsic');
    div.setAttribute('sizes', '50vw');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.INTRINSIC);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-intrinsic');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(1);
    expect(div.children[0].tagName.toLowerCase()).to.equal('i-amphtml-sizer');
    expect(div.children[0].children.length).to.equal(1);
    expect(div.children[0].children[0].tagName.toLowerCase()).to.equal('img');
    expect(div.children[0].children[0].src).to.equal('data:image/svg+xml;charset=utf-8,<svg height="200px" width="100px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"></svg>');
  });

  it('layout=fill', () => {
    div.setAttribute('layout', 'fill');
    expect(applyStaticLayout(div)).to.equal(Layout.FILL);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-fill');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=container', () => {
    div.setAttribute('layout', 'container');
    expect(applyStaticLayout(div)).to.equal(Layout.CONTAINER);
    expect(div.style.width).to.equal('');
    expect(div.style.height).to.equal('');
    expect(div).to.have.class('i-amphtml-layout-container');
    expect(div).to.not.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=flex-item', () => {
    div.setAttribute('layout', 'flex-item');
    div.setAttribute('width', 100);
    div.setAttribute('height', 200);
    expect(applyStaticLayout(div)).to.equal(Layout.FLEX_ITEM);
    expect(div.style.width).to.equal('100px');
    expect(div.style.height).to.equal('200px');
    expect(div).to.have.class('i-amphtml-layout-flex-item');
    expect(div).to.have.class('i-amphtml-layout-size-defined');
    expect(div.children.length).to.equal(0);
  });

  it('layout=fluid - default', () => {
    div.setAttribute('height', 'fluid');
    const parentDiv = document.createElement('div');
    div.parentElement = parentDiv;
    parentDiv.appendChild(div);
    expect(applyStaticLayout(div)).to.equal(Layout.FLUID);
    expect(div).to.have.class('i-amphtml-layout-awaiting-size');
    expect(div.children.length).to.equal(0);
  });

  it('layout=fluid - default with width', () => {
    div.setAttribute('height', 'fluid');
    div.setAttribute('width', 300);
    expect(applyStaticLayout(div)).to.equal(Layout.FLUID);
    expect(div).to.have.class('i-amphtml-layout-awaiting-size');
    expect(div.style.width).to.equal('300px');
    expect(div.children.length).to.equal(0);
  });

  it('layout=unknown', () => {
    div.setAttribute('layout', 'foo');
    allowConsoleError(() => { expect(function() {
      applyStaticLayout(div);
    }).to.throw(/Unknown layout: foo/); });
  });


  it('should configure natural dimensions; default layout', () => {
    const pixel = document.createElement('amp-pixel');
    expect(applyStaticLayout(pixel)).to.equal(Layout.FIXED);
    expect(pixel.style.width).to.equal('0px');
    expect(pixel.style.height).to.equal('0px');
  });

  it('should configure natural dimensions; default layout; with width', () => {
    const pixel = document.createElement('amp-pixel');
    pixel.setAttribute('width', '11');
    expect(applyStaticLayout(pixel)).to.equal(Layout.FIXED);
    expect(pixel.style.width).to.equal('11px');
    expect(pixel.style.height).to.equal('0px');
  });

  it('should configure natural dimensions; default layout; with height', () => {
    const pixel = document.createElement('amp-pixel');
    pixel.setAttribute('height', '11');
    expect(applyStaticLayout(pixel)).to.equal(Layout.FIXED);
    expect(pixel.style.width).to.equal('0px');
    expect(pixel.style.height).to.equal('11px');
  });

  it('should configure natural dimensions; layout=fixed', () => {
    const pixel = document.createElement('amp-pixel');
    pixel.setAttribute('layout', 'fixed');
    expect(applyStaticLayout(pixel)).to.equal(Layout.FIXED);
    expect(pixel.style.width).to.equal('0px');
    expect(pixel.style.height).to.equal('0px');
  });

  it('should configure natural dimensions; layout=fixed-height', () => {
    const pixel = document.createElement('amp-pixel');
    pixel.setAttribute('layout', 'fixed-height');
    expect(applyStaticLayout(pixel)).to.equal(Layout.FIXED_HEIGHT);
    expect(pixel.style.height).to.equal('0px');
    expect(pixel.style.width).to.equal('');
  });

  it('should fail invalid width and height', () => {
    const pixel = document.createElement('amp-pixel');

    // Everything is good.
    pixel.setAttribute('width', '1px');
    pixel.setAttribute('height', '1px');
    expect(() => {
      applyStaticLayout(pixel);
    }).to.not.throw();

    // Width=auto is also correct.
    pixel.setAttribute('width', 'auto');
    expect(() => {
      applyStaticLayout(pixel);
    }).to.not.throw();

    // Width=X is invalid.
    pixel.setAttribute('width', 'X');
    allowConsoleError(() => { expect(() => {
      applyStaticLayout(pixel);
    }).to.throw(/Invalid width value/); });

    // Height=X is invalid.
    pixel.setAttribute('height', 'X');
    pixel.setAttribute('width', '1px');
    allowConsoleError(() => { expect(() => {
      applyStaticLayout(pixel);
    }).to.throw(/Invalid height value/); });
  });

  it('should trust server layout', () => {
    div.setAttribute('i-amphtml-layout', 'flex-item');
    div.setAttribute('layout', 'responsive');
    div.setAttribute('width', 'invalid');
    div.setAttribute('height', 'invalid');
    div.className = 'other';
    div.style.width = '111px';
    div.style.height = '112px';
    expect(applyStaticLayout(div)).to.equal(Layout.FLEX_ITEM);
    // No other attributes are read or changed.
    expect(div.style.width).to.equal('111px');
    expect(div.style.height).to.equal('112px');
    expect(div.className).to.equal('other');
    expect(div.style.display).to.equal('');
    expect(div.children.length).to.equal(0);
  });

  it('should read sizer for responsive layout', () => {
    div.setAttribute('i-amphtml-layout', 'responsive');
    const sizer = document.createElement('i-amphtml-sizer');
    div.appendChild(sizer);
    expect(applyStaticLayout(div)).to.equal(Layout.RESPONSIVE);
    expect(div.sizerElement).to.equal(sizer);
  });

  it('should allow sizer to be missing', () => {
    div.setAttribute('i-amphtml-layout', 'responsive');
    expect(applyStaticLayout(div)).to.equal(Layout.RESPONSIVE);
    expect(div.sizerElement).to.be.undefined;
  });

  it('should allow sizer to be missing even if other children there', () => {
    div.setAttribute('i-amphtml-layout', 'responsive');
    const other = document.createElement('div');
    div.appendChild(other);
    expect(applyStaticLayout(div)).to.equal(Layout.RESPONSIVE);
    expect(div.sizerElement).to.be.undefined;
  });

  it('should fail when server generates invalid layout', () => {
    div.setAttribute('i-amphtml-layout', 'invalid');
    allowConsoleError(() => {
      expect(() => applyStaticLayout(div)).to.throw(/failed/);
    });
  });
});
