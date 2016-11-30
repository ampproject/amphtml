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
import {isArray, isObject} from '../../../../src/types';


describes.sandboxed('MeasureScanner', {}, () => {
  let target1, target2;

  beforeEach(() => {
    target1 = document.createElement('div');
    target2 = document.createElement('div');
    document.body.appendChild(target1);
    document.body.appendChild(target2);
  });

  afterEach(() => {
    document.body.removeChild(target1);
    document.body.removeChild(target2);
  });

  function scan(spec) {
    const targets = {target1, target2};
    const scanner = new MeasureScanner(window, {
      resolveTarget: name => targets[name] || null,
    }, true);
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
    expect(scanTiming({duration: Infinity}).duration).to.equal(Infinity);
    expect(scanTiming({duration: 'Infinity'}).duration).to.equal(Infinity);
    expect(() => scanTiming({duration: 'a'})).to.throw(/"duration" is invalid/);
    expect(() => scanTiming({duration: -1})).to.throw(/"duration" is invalid/);
  });

  it('should parse/validate timing delay', () => {
    expect(scanTiming({}).delay).to.equal(0);
    expect(scanTiming({delay: 0}).delay).to.equal(0);
    expect(scanTiming({delay: 10}).delay).to.equal(10);
    expect(() => scanTiming({delay: 'a'})).to.throw(/"delay" is invalid/);
    expect(() => scanTiming({delay: -1})).to.throw(/"delay" is invalid/);

    expect(scanTiming({}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 0}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 10}).endDelay).to.equal(10);
    expect(() => scanTiming({endDelay: 'a'})).to.throw(/"endDelay" is invalid/);
    expect(() => scanTiming({endDelay: -1})).to.throw(/"endDelay" is invalid/);
  });

  it('should parse/validate timing iterations', () => {
    expect(scanTiming({}).iterations).to.equal(1);
    expect(scanTiming({iterations: 0}).iterations).to.equal(0);
    expect(scanTiming({iterations: 10}).iterations).to.equal(10);
    expect(() => scanTiming({iterations: 'a'}))
        .to.throw(/"iterations" is invalid/);
    expect(() => scanTiming({iterations: -1}))
        .to.throw(/"iterations" is invalid/);

    expect(scanTiming({}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 0}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 10}).iterationStart).to.equal(10);
    expect(() => scanTiming({iterationStart: 'a'}))
        .to.throw(/"iterationStart" is invalid/);
    expect(() => scanTiming({iterationStart: -1}))
        .to.throw(/"iterationStart" is invalid/);
  });

  it('should parse/validate timing easing', () => {
    expect(scanTiming({}).easing).to.equal('linear');
    expect(scanTiming({easing: 'ease-in'}).easing).to.equal('ease-in');
  });

  it('should parse/validate timing direction', () => {
    expect(scanTiming({}).direction).to.equal('normal');
    expect(scanTiming({direction: 'reverse'}).direction).to.equal('reverse');
    expect(() => scanTiming({direction: 'invalid'}))
        .to.throw(/Unknown direction value/);
  });

  it('should parse/validate timing fill', () => {
    expect(scanTiming({}).fill).to.equal('none');
    expect(scanTiming({fill: 'both'}).fill).to.equal('both');
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
    expect(keyframes.opacity).to.deep.equal([0, 1]);
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


  describes.fakeWin('createRunner', {amp: 1}, env => {
    let resources;
    let amp1, amp2;

    beforeEach(() => {
      resources = env.win.services.resources.obj;
      amp1 = env.createAmpElement();
      amp2 = env.createAmpElement();
      resources.add(amp1);
      resources.add(amp2);
    });

    function waitForNextMicrotask() {
      return Promise.resolve().then(() => Promise.resolve());
    }

    function createRunner(spec) {
      const targets = {target1, target2, amp1, amp2};
      const scanner = new MeasureScanner(window, {
        resolveTarget: name => targets[name] || null,
      }, true);
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
      let runner;
      createRunner([
        {target: amp1, keyframes: {}},
        {target: amp2, keyframes: {}},
      ]).then(res => {
        runner = res;
      });
      return waitForNextMicrotask().then(() => {
        expect(runner).to.be.undefined;
        resources.getResourceForElement(amp1).loadPromiseResolve_();
        return waitForNextMicrotask();
      }).then(() => {
        expect(runner).to.be.undefined;
        resources.getResourceForElement(amp2).loadPromiseResolve_();
        return waitForNextMicrotask();
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

  beforeEach(() => {
    target1 = {animate: () => {}};
    target1Mock = sandbox.mock(target1);
    target2 = {animate: () => {}};
    target2Mock = sandbox.mock(target2);
  });

  afterEach(() => {
    target1Mock.verify();
    target2Mock.verify();
  });

  it('should call start on all animatons', () => {
    const keyframes1 = {};
    const keyframes2 = {};
    const timing1 = {};
    const timing2 = {};
    const anim1 = {};
    const anim2 = {};
    target1Mock.expects('animate')
        .withExactArgs(keyframes1, timing1)
        .returns(anim1)
        .once();
    target2Mock.expects('animate')
        .withExactArgs(keyframes2, timing2)
        .returns(anim2)
        .once();
    const runner = new WebAnimationRunner([
      {target: target1, keyframes: keyframes1, timing: timing1},
      {target: target2, keyframes: keyframes2, timing: timing2},
    ]);
    runner.play();
    expect(runner.players_).to.have.length(2);
    expect(runner.players_[0]).equal(anim1);
    expect(runner.players_[1]).equal(anim2);
  });
});
