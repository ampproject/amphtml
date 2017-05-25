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

import {
  MeasureScanner,
  WebAnimationRunner,
} from '../web-animations';
import {
  WebAnimationPlayState,
} from '../web-animation-types';
import {isArray, isObject} from '../../../../src/types';
import {user} from '../../../../src/log';


describes.sandboxed('MeasureScanner', {}, () => {
  let target1, target2;
  let warnStub;

  beforeEach(() => {
    target1 = document.createElement('div');
    target1.id = 'target1';
    target1.classList.add('target');
    target2 = document.createElement('div');
    target2.id = 'target2';
    target2.classList.add('target');
    document.body.appendChild(target1);
    document.body.appendChild(target2);
    sandbox.stub(window, 'matchMedia', query => {
      if (query == 'match') {
        return {matches: true};
      }
      if (query == 'not-match') {
        return {matches: false};
      }
      throw new Error('unknown query: ' + query);
    });
    warnStub = sandbox.stub(user(), 'warn');
  });

  afterEach(() => {
    document.body.removeChild(target1);
    document.body.removeChild(target2);
  });

  function scan(spec) {
    const scanner = new MeasureScanner(
        window, document, 'https://acme.org/', true);
    scanner.scan(spec);
    return scanner.requests_;
  }

  function scanTiming(spec) {
    const def = {
      target: target1,
      keyframes: {},
    };
    Object.assign(def, spec);
    return scan(def)[0].timing;
  }

  it('should parse/validate timing duration', () => {
    expect(scanTiming({}).duration).to.equal(0);
    expect(scanTiming({duration: 0}).duration).to.equal(0);
    expect(scanTiming({duration: 10}).duration).to.equal(10);
    expect(scanTiming({duration: '10'}).duration).to.equal(10);
    expect(scanTiming({duration: '10s'}).duration).to.equal(10000);
    expect(scanTiming({duration: '10ms'}).duration).to.equal(10);
    expect(scanTiming({duration: 'calc(10ms)'}).duration).to.equal(10);
    expect(scanTiming({duration: 'var(--unk)'}).duration).to.equal(0);
    expect(scanTiming({duration: 'var(--unk, 11ms)'}).duration).to.equal(11);
    expect(() => scanTiming({duration: 'a'})).to.throw(/"duration" is invalid/);
    expect(() => scanTiming({duration: -1})).to.throw(/"duration" is invalid/);
    expect(warnStub).to.not.be.called;
  });

  it('should parse/validate timing delay', () => {
    expect(scanTiming({}).delay).to.equal(0);
    expect(scanTiming({delay: 0}).delay).to.equal(0);
    expect(scanTiming({delay: 10}).delay).to.equal(10);
    expect(scanTiming({delay: '10'}).delay).to.equal(10);
    expect(scanTiming({delay: '10s'}).delay).to.equal(10000);
    expect(scanTiming({delay: '10ms'}).delay).to.equal(10);
    expect(scanTiming({delay: 'calc(10ms)'}).delay).to.equal(10);
    expect(scanTiming({delay: 'var(--unk)'}).delay).to.equal(0);
    expect(scanTiming({delay: 'var(--unk, 11ms)'}).delay).to.equal(11);
    expect(() => scanTiming({delay: 'a'})).to.throw(/"delay" is invalid/);
    expect(() => scanTiming({delay: -1})).to.throw(/"delay" is invalid/);
    expect(warnStub).to.not.be.called;

    expect(scanTiming({}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 0}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 10}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: '10'}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: '10s'}).endDelay).to.equal(10000);
    expect(scanTiming({endDelay: '10ms'}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: 'calc(10ms)'}).endDelay).to.equal(10);
    expect(() => scanTiming({endDelay: 'a'})).to.throw(/"endDelay" is invalid/);
    expect(() => scanTiming({endDelay: -1})).to.throw(/"endDelay" is invalid/);
    expect(warnStub).to.not.be.called;
  });

  it('should parse/validate timing iterations', () => {
    expect(scanTiming({}).iterations).to.equal(1);
    expect(scanTiming({iterations: 0}).iterations).to.equal(0);
    expect(scanTiming({iterations: 10}).iterations).to.equal(10);
    expect(scanTiming({iterations: '10'}).iterations).to.equal(10);
    expect(scanTiming({iterations: 'calc(10)'}).iterations).to.equal(10);
    expect(scanTiming({iterations: Infinity}).iterations).to.equal(Infinity);
    expect(scanTiming({iterations: 'Infinity'}).iterations).to.equal(Infinity);
    expect(scanTiming({iterations: 'infinite'}).iterations).to.equal(Infinity);
    expect(scanTiming({iterations: 'INFINITE'}).iterations).to.equal(Infinity);
    expect(() => scanTiming({iterations: 'a'}))
        .to.throw(/"iterations" is invalid/);
    expect(() => scanTiming({iterations: -1}))
        .to.throw(/"iterations" is invalid/);

    expect(scanTiming({}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 0}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 10}).iterationStart).to.equal(10);
    expect(scanTiming({iterationStart: 'calc(10)'}).iterationStart)
        .to.equal(10);
    expect(() => scanTiming({iterationStart: 'a'}))
        .to.throw(/"iterationStart" is invalid/);
    expect(() => scanTiming({iterationStart: -1}))
        .to.throw(/"iterationStart" is invalid/);
  });

  it('should warn if timing is fractional', () => {
    // Fractional values are allowed, but warning is shown.
    expect(scanTiming({duration: 0.1}).duration).to.equal(0.1);
    expect(scanTiming({delay: 0.1}).delay).to.equal(0.1);
    expect(scanTiming({endDelay: 0.1}).endDelay).to.equal(0.1);
    expect(warnStub).to.have.callCount(3);
    expect(warnStub.args[0][1]).to.match(/"duration" is fractional/);
    expect(warnStub.args[1][1]).to.match(/"delay" is fractional/);
    expect(warnStub.args[2][1]).to.match(/"endDelay" is fractional/);
  });

  it('should parse/validate timing easing', () => {
    expect(scanTiming({}).easing).to.equal('linear');
    expect(scanTiming({easing: 'ease-in'}).easing).to.equal('ease-in');
    expect(scanTiming({easing: 'var(--unk, ease-out)'}).easing)
        .to.equal('ease-out');
  });

  it('should parse/validate timing direction', () => {
    expect(scanTiming({}).direction).to.equal('normal');
    expect(scanTiming({direction: 'reverse'}).direction).to.equal('reverse');
    expect(scanTiming({direction: 'var(--unk, reverse)'}).direction)
        .to.equal('reverse');
    expect(() => scanTiming({direction: 'invalid'}))
        .to.throw(/Unknown direction value/);
  });

  it('should parse/validate timing fill', () => {
    expect(scanTiming({}).fill).to.equal('none');
    expect(scanTiming({fill: 'both'}).fill).to.equal('both');
    expect(scanTiming({fill: 'var(--unk, backwards)'}).fill)
        .to.equal('backwards');
    expect(() => scanTiming({fill: 'invalid'}))
        .to.throw(/Unknown fill value/);
  });

  it('should merge timing', () => {
    const timing = scanTiming({
      animations: [
        {
          target: target1,
          keyframes: {},
          duration: 100,
          delay: 50,
          endDelay: 10,
          iterations: 2,
          iterationStart: 0.1,
          easing: 'ease-in',
          direction: 'reverse',
          fill: 'auto',
          ticker: 'time',
        },
      ],
    });
    expect(timing).to.deep.equal({
      duration: 100,
      delay: 50,
      endDelay: 10,
      iterations: 2,
      iterationStart: 0.1,
      easing: 'ease-in',
      direction: 'reverse',
      fill: 'auto',
      ticker: 'time',
    });
  });

  it('should accept multi-animation object', () => {
    const requests = scan({
      duration: 500,
      animations: [
        {target: target1, keyframes: {}},
        {target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(2);
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(500);
    expect(requests[1].target).to.equal(target2);
    expect(requests[1].timing.duration).to.equal(300);
  });

  it('should accept multi-animation array', () => {
    const requests = scan([
      {target: target1, keyframes: {}},
      {target: target2, duration: 300, keyframes: {}},
    ]);
    expect(requests).to.have.length(2);
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
    expect(requests[1].target).to.equal(target2);
    expect(requests[1].timing.duration).to.equal(300);
  });

  it('should accept keyframe animation', () => {
    const requests = scan({
      target: target1,
      duration: 300,
      keyframes: {},
    });
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(300);
  });

  it('should parse object keyframe', () => {
    const keyframes = scan({
      target: target1,
      keyframes: {
        opacity: [0, 1],
      },
    })[0].keyframes;
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object keyframe w/partial offsets', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: {
        opacity: '1',
      },
    })[0].keyframes;
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object keyframe with parsing', () => {
    const keyframes = scan({
      target: target1,
      keyframes: {
        opacity: ['0', 'calc(1)'],
      },
    })[0].keyframes;
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object w/partial keyframe with parsing', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: {
        opacity: ['calc(1)'],
      },
    })[0].keyframes;
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should passthrough service props in a partial object keyframe', () => {
    const keyframes = scan({
      target: target1,
      keyframes: {
        easing: 'ease-in',
      },
    })[0].keyframes;
    expect(isObject(keyframes)).to.be.true;
    expect(keyframes.easing).to.equal('ease-in');
  });

  it('should parse array keyframe', () => {
    const keyframes = scan({
      target: target1,
      keyframes: [
        {opacity: '0'},
        {opacity: '1'},
      ],
    })[0].keyframes;
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([
      {opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should parse array keyframe w/partial offsets', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: [
        {opacity: '1'},
      ],
    })[0].keyframes;
    expect(keyframes).to.deep.equal([
      {opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should parse array keyframe w/non-zero offset', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: [
        {offset: 0.1, opacity: '0.1'},
        {opacity: '1', easing: 'ease-in'},
      ],
    })[0].keyframes;
    expect(keyframes).to.deep.equal([
      {opacity: '0'},
      {offset: 0.1, opacity: '0.1'},
      {opacity: '1', easing: 'ease-in'},
    ]);
  });

  it('should propagate partial properties into implicit 0-offset', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: [
        {easing: 'ease-in'},
        {opacity: '1'},
      ],
    })[0].keyframes;
    expect(keyframes).to.deep.equal([
      {easing: 'ease-in', opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should propagate partial properties into explicit 0-offset', () => {
    target1.style.opacity = 0;
    const keyframes = scan({
      target: target1,
      keyframes: [
        {offset: 0, easing: 'ease-in'},
        {opacity: '1'},
      ],
    })[0].keyframes;
    expect(keyframes).to.deep.equal([
      {offset: 0, easing: 'ease-in', opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should parse array keyframe with parsing', () => {
    const keyframes = scan({
      target: target1,
      keyframes: [
        {opacity: 'calc(0)'},
        {opacity: 'calc(1)'},
      ],
    })[0].keyframes;
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([
      {opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should parse width/height functions', () => {
    target2.style.width = '11px';
    target2.style.height = '22px';
    const keyframes = scan({
      target: target1,
      keyframes: {
        transform: [
          'translateX(width("#target2"))',
          'translateY(height("#target2"))',
        ],
      },
    })[0].keyframes;
    expect(keyframes.transform).to.jsonEqual([
      'translatex(11px)',
      'translatey(22px)',
    ]);
  });

  it('should parse rand function', () => {
    sandbox.stub(Math, 'random', () => 0.25);
    const keyframes = scan({
      target: target1,
      keyframes: {
        opacity: [
          0,
          'rand(0.5, 0.6)',
        ],
      },
    })[0].keyframes;
    expect(keyframes.opacity).to.jsonEqual(['0', '0.525']);
  });

  it('should check media in top animation', () => {
    const requests = scan({
      duration: 500,
      media: 'not-match',
      animations: [
        {target: target1, keyframes: {}},
        {target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(0);
  });

  it('should check media in sub-animations', () => {
    const requests = scan({
      duration: 500,
      animations: [
        {media: 'not-match', target: target1, keyframes: {}},
        {media: 'match', target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target2);
  });

  it('should find targets by selector', () => {
    const requests = scan([
      {selector: '#target1', keyframes: {}},
      {selector: '#target2', duration: 300, keyframes: {}},
      {selector: '.target', duration: 400, keyframes: {}},
    ]);
    expect(requests).to.have.length(4);
    // `#target1`
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
    // `#target2`
    expect(requests[1].target).to.equal(target2);
    expect(requests[1].timing.duration).to.equal(300);
    // `.target`
    expect(requests[2].target).to.equal(target1);
    expect(requests[2].timing.duration).to.equal(400);
    expect(requests[3].target).to.equal(target2);
    expect(requests[3].timing.duration).to.equal(400);
  });

  it('should find targets by complex selector', () => {
    const requests = scan([
      {selector: '#target1.target', keyframes: {}},
    ]);
    expect(requests).to.have.length(1);
    // `#target1.target`
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
  });

  it('should find target by ID', () => {
    const requests = scan([
      {target: 'target1', keyframes: {}},
    ]);
    expect(requests).to.have.length(1);
    // `#target1`
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
  });

  it('should allow not-found targets', () => {
    const requests = scan([
      {selector: '.unknown', duration: 400, keyframes: {}},
    ]);
    expect(requests).to.have.length(0);
  });

  it('should require any target spec', () => {
    expect(() => {
      scan([{duration: 400, keyframes: {}}]);
    }).to.throw(/No target specified/);
  });

  it('should not allow both selector and target spec', () => {
    expect(() => {
      scan([{selector: '#target1', target: 'target1',
          duration: 400, keyframes: {}}]);
    }).to.throw(/Both/);
  });

  it('should build keyframe for multiple targets', () => {
    target1.style.opacity = '0';
    target2.style.opacity = '0.1';
    const requests = scan({
      selector: '.target',
      duration: 100,
      delay: 10,
      keyframes: {
        opacity: '1',
        transform: ['translateY(0px)', 'translateY(100px)'],
      },
    });
    expect(requests).to.have.length(2);
    const request1 = requests[0];
    const request2 = requests[1];
    // `#target1`
    expect(request1.target).to.equal(target1);
    expect(request1.timing.duration).to.equal(100);
    expect(request1.timing.delay).to.equal(10);
    expect(request1.keyframes.opacity).to.deep.equal(['0', '1']);
    expect(request1.keyframes.transform)
        .to.deep.equal(['translateY(0px)', 'translateY(100px)']);
    // `#target2`
    expect(request2.target).to.equal(target2);
    expect(request2.timing.duration).to.equal(100);
    expect(request2.timing.delay).to.equal(10);
    expect(request2.keyframes.opacity).to.deep.equal(['0.1', '1']);
    expect(request2.keyframes.transform)
        .to.deep.equal(['translateY(0px)', 'translateY(100px)']);
  });


  describe('CSS evaluations', () => {
    let css;
    let parseSpy;

    beforeEach(() => {
      const scanner = new MeasureScanner(
          window, document, 'https://acme.org/', true);
      css = scanner.css_;
      parseSpy = sandbox.spy(css, 'resolveAsNode_');
    });

    it('should measure styles', () => {
      expect(css.measure(target1, 'display')).to.equal('block');
      expect(css.measure(target1, 'font-size')).to.match(/\d+px/);
    });

    it('should extract vars', () => {
      target1.style.setProperty('--var0', 'A');
      const isCssVarSupported = target1.style.getPropertyValue('--var0') == 'A';
      if (isCssVarSupported) {
        expect(css.measure(target1, '--var0')).to.equal('A');
      }
    });

    it('should use cache', () => {
      const spy = sandbox.spy(window, 'getComputedStyle');

      // First: target1.
      expect(css.measure(target1, 'display')).to.equal('block');
      expect(css.measure(target1, 'font-size')).to.match(/\d+px/);
      css.measure(target1, '--var0');
      expect(spy).to.be.calledOnce;

      // First: target2.
      expect(css.measure(target2, 'display')).to.equal('block');
      expect(css.measure(target2, 'font-size')).to.match(/\d+px/);
      css.measure(target2, '--var0');
      expect(spy).to.be.calledTwice;
    });

    it('should NOT parse CSS for simple values', () => {
      expect(css.resolveCss(target1, '')).to.equal('');
      expect(css.resolveCss(target1, null)).to.equal('');
      expect(css.resolveCss(target1, 0)).to.equal('0');
      expect(css.resolveCss(target1, 10)).to.equal('10');
      expect(css.resolveCss(target1, -1)).to.equal('-1');
      expect(css.resolveCss(target1, Infinity)).to.equal('Infinity');
      expect(css.resolveCss(target1, '10px')).to.equal('10px');
      expect(css.resolveCss(target1, '10vh')).to.equal('10vh');
      expect(css.resolveCss(target1, 'rgb(0,0,0)')).to.equal('rgb(0,0,0)');
      expect(css.resolveCss(target1, 'translateY(10vh)'))
          .to.equal('translateY(10vh)');
      expect(parseSpy).to.not.be.called;
    });

    it('should evaluate CSS for complex values', () => {
      expect(css.resolveCss(target1, 'calc(10px)')).to.equal('10px');
      expect(parseSpy).to.be.calledOnce;
    });

    it('should resolve simple time CSS w/o evaluation', () => {
      expect(css.resolveMillis(target1, null, 1)).to.equal(1);
      expect(css.resolveMillis(target1, '', 1)).to.equal(1);
      expect(css.resolveMillis(target1, 2, 1)).to.equal(2);
      expect(parseSpy).to.not.be.called;
    });

    it('should resolve time CSS with evaluation', () => {
      expect(css.resolveMillis(target1, '10s', 1)).to.equal(10000);
      expect(css.resolveMillis(target1, '10ms', 1)).to.equal(10);
      expect(css.resolveMillis(target1, '10', 1)).to.equal(10);
      expect(css.resolveMillis(target1, 'calc(10ms)', 1)).to.equal(10);
      expect(parseSpy).to.be.called;
    });

    it('should resolve invalid time CSS to null', () => {
      expect(css.resolveMillis(target1, 'abc', 1)).to.be.undefined;
      expect(css.resolveMillis(target1, 'Infinity', 1)).to.be.undefined;
      expect(css.resolveMillis(target1, 'infinite', 1)).to.be.undefined;
      expect(parseSpy).to.be.called;
    });


    it('should resolve simple number CSS w/o evaluation', () => {
      expect(css.resolveNumber(target1, null, 1)).to.equal(1);
      expect(css.resolveNumber(target1, '', 1)).to.equal(1);
      expect(css.resolveNumber(target1, 2, 1)).to.equal(2);
      expect(css.resolveNumber(target1, Infinity, 1)).to.equal(Infinity);
      expect(parseSpy).to.not.be.called;
    });

    it('should resolve number CSS with evaluation', () => {
      expect(css.resolveNumber(target1, '10', 1)).to.equal(10);
      expect(css.resolveNumber(target1, '10.5', 1)).to.equal(10.5);
      expect(css.resolveNumber(target1, 'calc(10)', 1)).to.equal(10);
      expect(css.resolveNumber(target1, 'Infinity', 1)).to.equal(Infinity);
      expect(css.resolveNumber(target1, 'infinite', 1)).to.equal(Infinity);
      expect(parseSpy).to.be.called;
    });

    it('should resolve invalid number CSS to null', () => {
      expect(css.resolveNumber(target1, 'abc', 1)).to.be.undefined;
      expect(parseSpy).to.be.called;
    });

    it('should read a var', () => {
      const stub = sandbox.stub(css, 'measure', () => '10px');
      expect(() => css.getVar('--var1')).to.throw(/target is specified/);
      expect(css.withTarget_(target1, () => css.getVar('--var1')).num_)
          .to.equal(10);
      expect(stub).to.be.calledWith(target1, '--var1');
    });

    it('should propagate dimension', () => {
      expect(css.getDimension()).to.be.null;
      const res = css.withDimension('w', () => {
        expect(css.getDimension()).to.equal('w');
        return 11;
      });
      expect(res).to.equal(11);
      expect(css.getDimension()).to.be.null;
    });

    it('should resolve viewport size, with cache', () => {
      const size = css.getViewportSize();
      expect(size.width).to.equal(window.innerWidth);
      expect(size.height).to.equal(window.innerHeight);
      expect(css.getViewportSize()).to.equal(size);
    });

    it('should resolve current and root font size', () => {
      document.documentElement.style.fontSize = '12px';
      expect(css.getRootFontSize()).to.equal(12);

      target1.style.fontSize = '16px';
      expect(() => css.getCurrentFontSize()).to.throw(/target is specified/);
      expect(css.withTarget_(target1, () => css.getCurrentFontSize()))
          .to.equal(16);
      expect(css.withTarget_(target2, () => css.getCurrentFontSize()))
          .to.equal(12);
    });

    it('should resolve current element size', () => {
      target1.style.width = '11px';
      target1.style.height = '12px';
      expect(() => css.getCurrentElementSize()).to.throw(/target is specified/);
      expect(css.withTarget_(target1, () => css.getCurrentElementSize()))
          .to.deep.equal({width: 11, height: 12});
    });

    it('should resolve the selected element size', () => {
      target1.style.width = '11px';
      target1.style.height = '12px';
      target1.classList.add('parent');
      const child = target1.ownerDocument.createElement('div');
      target1.appendChild(child);

      // Normal selectors search whole DOM and don't need context.
      expect(css.getElementSize('#target1', null))
          .to.deep.equal({width: 11, height: 12});
      expect(css.withTarget_(target2,
          () => css.getElementSize('#target1', null)))
          .to.deep.equal({width: 11, height: 12});

      // Closest selectors always need a context node.
      expect(() => css.getElementSize('#target1', 'closest'))
          .to.throw(/target is specified/);
      expect(css.withTarget_(child,
          () => css.getElementSize('.parent', 'closest')))
          .to.deep.equal({width: 11, height: 12});
    });

    it('should resolve a valid URL', () => {
      expect(css.resolveUrl('/path'))
          .to.equal('https://acme.org/path');
      expect(css.resolveUrl('//example.org/path'))
          .to.equal('https://example.org/path');
    });

    it('should NOT resolve an invalid URL', () => {
      expect(() => css.resolveUrl('http://acme.org/path'))
          .to.throw(/https/);
    });
  });


  describes.fakeWin('createRunner', {amp: 1}, env => {
    let resources;
    let amp1, amp2;

    beforeEach(() => {
      resources = env.win.services.resources.obj;
      amp1 = env.createAmpElement();
      amp2 = env.createAmpElement();
      sandbox.stub(amp1, 'isUpgraded', () => true);
      sandbox.stub(amp2, 'isUpgraded', () => true);
      sandbox.stub(amp1, 'isBuilt', () => true);
      sandbox.stub(amp2, 'isBuilt', () => true);
      sandbox.stub(amp1, 'whenBuilt', () => Promise.resolve());
      sandbox.stub(amp2, 'whenBuilt', () => Promise.resolve());
      resources.add(amp1);
      resources.add(amp2);
    });

    function waitForNextMicrotask() {
      return Promise.resolve()
          .then(() => Promise.resolve())
          .then(() => Promise.all([Promise.resolve()]));
    }

    function createRunner(spec) {
      const scanner = new MeasureScanner(
          window, document, 'https://acme.org/', true);
      scanner.scan(spec);
      return scanner.createRunner(resources);
    }

    it('should unblock non-AMP elements immediately', () => {
      let runner;
      createRunner([
        {target: target1, keyframes: {}},
        {target: target2, keyframes: {}},
      ]).then(res => {
        runner = res;
      });
      return waitForNextMicrotask().then(() => {
        expect(runner).to.be.ok;
        expect(runner.requests_).to.have.length(2);
      });
    });

    it('should block AMP elements', () => {
      const r1 = resources.getResourceForElement(amp1);
      const r2 = resources.getResourceForElement(amp2);
      sandbox.stub(r1, 'isDisplayed', () => true);
      sandbox.stub(r2, 'isDisplayed', () => true);
      let runner;
      createRunner([
        {target: amp1, keyframes: {}},
        {target: amp2, keyframes: {}},
      ]).then(res => {
        runner = res;
      });
      return waitForNextMicrotask().then(() => {
        expect(runner).to.be.undefined;
        r1.loadPromiseResolve_();
        return waitForNextMicrotask();
      }).then(() => {
        expect(runner).to.be.undefined;
        r2.loadPromiseResolve_();
        return Promise.all([r1.loadedOnce(), r2.loadedOnce()])
            .then(() => waitForNextMicrotask());
      }).then(() => {
        expect(runner).to.be.ok;
        expect(runner.requests_).to.have.length(2);
      });
    });
  });
});


describes.sandboxed('WebAnimationRunner', {}, () => {
  let target1, target2;
  let target1Mock, target2Mock;
  let keyframes1, keyframes2;
  let timing1, timing2;
  let anim1, anim2;
  let anim1Mock, anim2Mock;
  let playStateSpy;
  let runner;

  class WebAnimationStub {
    play() {
      throw new Error('not implemented');
    }
    pause() {
      throw new Error('not implemented');
    }
    reverse() {
      throw new Error('not implemented');
    }
    finish() {
      throw new Error('not implemented');
    }
    cancel() {
      throw new Error('not implemented');
    }
  }

  beforeEach(() => {
    keyframes1 = {};
    keyframes2 = {};
    timing1 = {};
    timing2 = {};
    anim1 = new WebAnimationStub();
    anim2 = new WebAnimationStub();
    anim1Mock = sandbox.mock(anim1);
    anim2Mock = sandbox.mock(anim2);

    target1 = {animate: () => anim1};
    target1Mock = sandbox.mock(target1);
    target2 = {animate: () => anim2};
    target2Mock = sandbox.mock(target2);

    runner = new WebAnimationRunner([
      {target: target1, keyframes: keyframes1, timing: timing1},
      {target: target2, keyframes: keyframes2, timing: timing2},
    ]);

    playStateSpy = sandbox.spy();
    runner.onPlayStateChanged(playStateSpy);
  });

  afterEach(() => {
    target1Mock.verify();
    target2Mock.verify();
    anim1Mock.verify();
    anim2Mock.verify();
  });

  it('should call start on all animatons', () => {
    target1Mock.expects('animate')
        .withExactArgs(keyframes1, timing1)
        .returns(anim1)
        .once();
    target2Mock.expects('animate')
        .withExactArgs(keyframes2, timing2)
        .returns(anim2)
        .once();

    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);
    expect(runner.players_).to.have.length(2);
    expect(runner.players_[0]).equal(anim1);
    expect(runner.players_[1]).equal(anim2);
    expect(playStateSpy).to.be.calledOnce;
    expect(playStateSpy.args[0][0]).to.equal(WebAnimationPlayState.RUNNING);
  });

  it('should fail to start twice', () => {
    runner.start();
    expect(() => {
      runner.start();
    }).to.throw();
  });

  it('should complete all animations are complete', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1.onfinish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim2.onfinish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.FINISHED);

    expect(playStateSpy).to.be.calledTwice;
    expect(playStateSpy.args[0][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[1][0]).to.equal(WebAnimationPlayState.FINISHED);
  });

  it('should pause all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').once();
    anim2Mock.expects('pause').once();
    runner.pause();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);
  });

  it('should only allow pause when started', () => {
    expect(() => {
      runner.pause();
    }).to.throw();
  });

  it('should resume all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').once();
    anim2Mock.expects('pause').once();
    runner.pause();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);

    anim1Mock.expects('play').once();
    anim2Mock.expects('play').once();
    runner.resume();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);
  });

  it('should only allow resume when started', () => {
    expect(() => {
      runner.resume();
    }).to.throw();
  });

  it('should reverse all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('reverse').once();
    anim2Mock.expects('reverse').once();
    runner.reverse();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);
  });

  it('should only allow reverse when started', () => {
    expect(() => {
      runner.reverse();
    }).to.throw();
  });

  it('should finish all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('finish').once();
    anim2Mock.expects('finish').once();
    runner.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.FINISHED);
  });

  it('should ignore finish when not started', () => {
    runner.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
  });

  it('should cancel all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('cancel').once();
    anim2Mock.expects('cancel').once();
    runner.cancel();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
  });

  it('should ignore cancel when not started', () => {
    runner.cancel();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
  });
});
