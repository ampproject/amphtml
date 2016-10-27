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

import * as tr from '../../src/transition';
import * as sinon from 'sinon';

describe('Transition', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('all', () => {
    const func1 = sandbox.spy();
    const func2 = sandbox.spy();
    const all = tr.all([func1, func2]);

    expect(func1.callCount).to.equal(0);
    expect(func2.callCount).to.equal(0);

    all(0, false);
    expect(func1.callCount).to.equal(1);
    expect(func1.calledWithExactly(0, false)).to.equal(true);
    expect(func2.callCount).to.equal(1);
    expect(func2.calledWithExactly(0, false)).to.equal(true);

    all(0.5, false);
    expect(func1.callCount).to.equal(2);
    expect(func1.calledWithExactly(0.5, false)).to.equal(true);
    expect(func2.callCount).to.equal(2);
    expect(func2.calledWithExactly(0.5, false)).to.equal(true);

    all(1, true);
    expect(func1.callCount).to.equal(3);
    expect(func1.calledWithExactly(1, true)).to.equal(true);
    expect(func2.callCount).to.equal(3);
    expect(func2.calledWithExactly(1, true)).to.equal(true);
  });

  describe('concat', () => {
    it('should concat two string transitions', () => {
      const t1 = tr.translateX(tr.numeric(0, 10));
      const t2 = tr.scale(tr.numeric(0, 10));
      const concat = tr.concat([t1, t2]);

      expect(concat(0, false)).to.equal('translateX(0px) scale(0)');
      expect(concat(0.5, false)).to.equal('translateX(5px) scale(5)');
      expect(concat(1, true)).to.equal('translateX(10px) scale(10)');
    });

    it('should handle single transitions', () => {
      const t1 = tr.translateX(tr.numeric(0, 10));
      const concat = tr.concat([t1]);

      expect(concat(0, false)).to.equal('translateX(0px)');
      expect(concat(0.5, false)).to.equal('translateX(5px)');
      expect(concat(1, true)).to.equal('translateX(10px)');
    });

    it('should handle empty input', () => {
      const concat = tr.concat([]);

      expect(concat(0, false)).to.equal('');
      expect(concat(0.5, false)).to.equal('');
      expect(concat(1, true)).to.equal('');
    });

    it('should ignore non-string transitions', () => {
      const t1 = tr.translateX(tr.numeric(0, 10));
      const t2 = tr.spring(2, 10, 12, 0.8);
      const concat = tr.concat([t1, t2]);

      expect(concat(0, false)).to.equal('translateX(0px)');
      expect(concat(0.5, false)).to.equal('translateX(5px)');
      expect(concat(1, true)).to.equal('translateX(10px)');
    });

    it('should support other delimeters', () => {
      const t1 = tr.px(tr.numeric(0, 10));
      const t2 = tr.px(tr.numeric(0, 20));
      const concat = tr.concat([t1, t2], ', ');

      expect(concat(0, false)).to.equal('0px, 0px');
      expect(concat(0.5, false)).to.equal('5px, 10px');
      expect(concat(1, true)).to.equal('10px, 20px');
    });
  });

  it('withCurve', () => {
    const func1 = (time, complete) => `${time * 2};${complete}`;
    const curve = unusedTime => 0.2;
    const curved = tr.withCurve(func1, curve);

    expect(curved(0, false)).to.equal('0.4;false');
    expect(curved(0.5, false)).to.equal('0.4;false');
    expect(curved(1, false)).to.equal('0.4;false');
    expect(curved(1, true)).to.equal('2;true');
  });

  it('setStyles', () => {
    const element = document.createElement('div');
    const func = tr.setStyles(element, {
      width: tr.px(function(n) {return n * 100 + 1;}),
      height: tr.px(function(n) {return n * 100 + 2;}),
    });

    func(0);
    expect(element.style.width).to.equal('1px');
    expect(element.style.height).to.equal('2px');

    func(0.2);
    expect(element.style.width).to.equal('21px');
    expect(element.style.height).to.equal('22px');

    func(0.9);
    expect(element.style.width).to.equal('91px');
    expect(element.style.height).to.equal('92px');

    func(1);
    expect(element.style.width).to.equal('101px');
    expect(element.style.height).to.equal('102px');
  });

  it('numeric', () => {
    let func = tr.numeric(2, 10);
    expect(func(0)).to.equal(2);
    expect(func(0.3)).to.be.closeTo(4.4, 1e-3);
    expect(func(0.6)).to.be.closeTo(6.8, 1e-3);
    expect(func(0.9)).to.be.closeTo(9.2, 1e-3);
    expect(func(1)).to.equal(10);

    func = tr.numeric(2, -10);
    expect(func(0)).to.equal(2);
    expect(func(0.3)).to.be.closeTo(-1.6, 1e-3);
    expect(func(0.6)).to.be.closeTo(-5.2, 1e-3);
    expect(func(0.9)).to.be.closeTo(-8.8, 1e-3);
    expect(func(1)).to.equal(-10);
  });

  it('spring', () => {
    let func = tr.spring(2, 10, 12, 0.8);
    expect(func(0)).to.equal(2);
    expect(func(0.3)).to.be.closeTo(5.75, 1e-3);
    expect(func(0.6)).to.be.closeTo(9.5, 1e-3);
    expect(func(0.8)).to.be.closeTo(12, 1e-3);  // Summit.
    expect(func(0.9)).to.be.closeTo(11, 1e-3);
    expect(func(1)).to.equal(10);

    func = tr.spring(-2, -10, -12, 0.8);
    expect(func(0)).to.equal(-2);
    expect(func(0.3)).to.be.closeTo(-5.75, 1e-3);
    expect(func(0.6)).to.be.closeTo(-9.5, 1e-3);
    expect(func(0.8)).to.be.closeTo(-12, 1e-3);  // Summit.
    expect(func(0.9)).to.be.closeTo(-11, 1e-3);
    expect(func(1)).to.equal(-10);
  });

  it('px', () => {
    const func = tr.px(tr.numeric(0, 10));
    expect(func(0)).to.equal('0px');
    expect(func(0.3)).to.equal('3px');
    expect(func(0.6)).to.equal('6px');
    expect(func(0.9)).to.equal('9px');
    expect(func(1)).to.equal('10px');
  });

  it('translateX', () => {
    let func = tr.translateX(tr.numeric(0, 10));
    expect(func(0)).to.equal('translateX(0px)');
    expect(func(0.3)).to.equal('translateX(3px)');
    expect(func(0.6)).to.equal('translateX(6px)');
    expect(func(0.9)).to.equal('translateX(9px)');
    expect(func(1)).to.equal('translateX(10px)');

    func = tr.translateX(() => {return '101vw';});
    expect(func(0)).to.equal('translateX(101vw)');
  });

  it('should translate with X and Y', () => {
    let func = tr.translate(tr.numeric(0, 10), tr.numeric(20, 30));
    expect(func(0)).to.equal('translate(0px,20px)');
    expect(func(0.3)).to.equal('translate(3px,23px)');
    expect(func(0.6)).to.equal('translate(6px,26px)');
    expect(func(0.9)).to.equal('translate(9px,29px)');
    expect(func(1)).to.equal('translate(10px,30px)');

    func = tr.translate(() => {return '101vw';}, () => {return '201em';});
    expect(func(0)).to.equal('translate(101vw,201em)');
  });

  it('should translate with only X', () => {
    let func = tr.translate(tr.numeric(0, 10));
    expect(func(0)).to.equal('translate(0px)');
    expect(func(0.3)).to.equal('translate(3px)');
    expect(func(0.6)).to.equal('translate(6px)');
    expect(func(0.9)).to.equal('translate(9px)');
    expect(func(1)).to.equal('translate(10px)');

    func = tr.translate(() => {return '101vw';});
    expect(func(0)).to.equal('translate(101vw)');
  });
});
