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
} from '../web-animations';


describes.sandboxed('MeasureScanner', {}, () => {
  let target1, target2;

  beforeEach(() => {
    target1 = document.createElement('div');
    target2 = document.createElement('div');
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
      ],
    });
    expect(requests).to.have.length(1);
  });
});
