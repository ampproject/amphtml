import {closestAncestorElementBySelector} from '#core/dom/query';
import {htmlFor, htmlRefs} from '#core/dom/static-template';
import {isArray, isObject} from '#core/types';

import {Services} from '#service';

import {user} from '#utils/log';

import {poll} from '#testing/iframe';

import {NativeWebAnimationRunner} from '../runners/native-web-animation-runner';
import {WebAnimationPlayState} from '../web-animation-types';
import {Builder} from '../web-animations';

describes.realWin('MeasureScanner', {amp: 1}, (env) => {
  let win, doc;
  let vsync;
  let resources;
  let owners;
  let requireLayoutSpy;
  let target1, target2;
  let warnStub;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    env.sandbox.stub(win, 'matchMedia').callsFake((query) => {
      if (query == 'match') {
        return {matches: true};
      }
      if (query == 'not-match') {
        return {matches: false};
      }
      throw new Error('unknown query: ' + query);
    });
    if (!win.CSS) {
      win.CSS = {supports: () => {}};
    }
    env.sandbox.stub(win.CSS, 'supports').callsFake((condition) => {
      if (condition == 'supported: 1') {
        return true;
      }
      if (condition == 'supported: 0') {
        return false;
      }
      throw new Error('unknown condition: ' + condition);
    });
    warnStub = env.sandbox.stub(user(), 'warn');

    vsync = Services.vsyncFor(win);
    env.sandbox.stub(vsync, 'measurePromise').callsFake((callback) => {
      return Promise.resolve(callback());
    });
    resources = Services.resourcesForDoc(env.ampdoc);
    owners = Services.ownersForDoc(env.ampdoc);
    requireLayoutSpy = env.sandbox.spy(owners, 'requireLayout');

    target1 = doc.createElement('div');
    target1.id = 'target1';
    target1.classList.add('target');
    target2 = doc.createElement('div');
    target2.id = 'target2';
    target2.classList.add('target');
    doc.body.appendChild(target1);
    doc.body.appendChild(target2);
  });

  afterEach(() => {
    doc.body.removeChild(target1);
    doc.body.removeChild(target2);
  });

  function scan(spec) {
    const builder = new Builder(
      win,
      doc,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null
    );
    env.sandbox.stub(builder, 'requireLayout');
    const scanner = builder.createScanner_([]);
    const success = scanner.scan(spec);
    if (success) {
      return scanner.requests_;
    }
    expect(scanner.requests_).to.have.length(0);
    return null;
  }

  function scanTiming(spec) {
    const def = {
      target: target1,
      keyframes: {},
    };
    Object.assign(def, spec);
    return scan(def)[0].timing;
  }

  function writeAndWaitForStyleKeyframes(name, css) {
    const style = doc.createElement('style');
    style.setAttribute('amp-custom', '');
    style.textContent =
      `@-ms-keyframes ${name} {${css}}` +
      `@-moz-keyframes ${name} {${css}}` +
      `@-webkit-keyframes ${name} {${css}}` +
      `@keyframes ${name} {${css}}`;
    doc.head.appendChild(style);
    return poll('wait for style', () => {
      for (let i = 0; i < doc.styleSheets.length; i++) {
        if (doc.styleSheets[i].ownerNode == style) {
          return true;
        }
      }
      return false;
    });
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
    allowConsoleError(() => {
      expect(() => scanTiming({duration: 'a'})).to.throw(
        /"duration" is invalid/
      );
      expect(() => scanTiming({duration: -1})).to.throw(
        /"duration" is invalid/
      );
    });
    expect(warnStub).to.not.be.calledWith(
      env.sandbox.match.any,
      env.sandbox.match((arg) => {
        return /fractional/.test(arg);
      })
    );
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
    // Note! The negative "delay" is allowed.
    expect(scanTiming({delay: -1}).delay).to.equal(-1);
    allowConsoleError(() => {
      expect(() => scanTiming({delay: 'a'})).to.throw(/"delay" is invalid/);
    });

    expect(scanTiming({}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 0}).endDelay).to.equal(0);
    expect(scanTiming({endDelay: 10}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: '10'}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: '10s'}).endDelay).to.equal(10000);
    expect(scanTiming({endDelay: '10ms'}).endDelay).to.equal(10);
    expect(scanTiming({endDelay: 'calc(10ms)'}).endDelay).to.equal(10);
    allowConsoleError(() => {
      expect(() => scanTiming({endDelay: 'a'})).to.throw(
        /"endDelay" is invalid/
      );
      expect(() => scanTiming({endDelay: -1})).to.throw(
        /"endDelay" is invalid/
      );
    });
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
    allowConsoleError(() => {
      expect(() => scanTiming({iterations: 'a'})).to.throw(
        /"iterations" is invalid/
      );
      expect(() => scanTiming({iterations: -1})).to.throw(
        /"iterations" is invalid/
      );
    });

    expect(scanTiming({}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 0}).iterationStart).to.equal(0);
    expect(scanTiming({iterationStart: 10}).iterationStart).to.equal(10);
    expect(scanTiming({iterationStart: 'calc(10)'}).iterationStart).to.equal(
      10
    );
    allowConsoleError(() => {
      expect(() => scanTiming({iterationStart: 'a'})).to.throw(
        /"iterationStart" is invalid/
      );
      expect(() => scanTiming({iterationStart: -1})).to.throw(
        /"iterationStart" is invalid/
      );
    });
  });

  it('should warn if timing is fractional', () => {
    // Fractional values are allowed, but warning is shown.
    expect(scanTiming({duration: 1}).duration).to.equal(1);
    expect(scanTiming({duration: 1.1}).duration).to.equal(1.1);
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
    expect(scanTiming({easing: 'var(--unk, ease-out)'}).easing).to.equal(
      'ease-out'
    );
  });

  it('should parse/validate timing direction', () => {
    expect(scanTiming({}).direction).to.equal('normal');
    expect(scanTiming({direction: 'reverse'}).direction).to.equal('reverse');
    expect(scanTiming({direction: 'var(--unk, reverse)'}).direction).to.equal(
      'reverse'
    );
    allowConsoleError(() => {
      expect(() => scanTiming({direction: 'invalid'})).to.throw(
        /Unknown direction/
      );
    });
  });

  it('should parse/validate timing fill', () => {
    expect(scanTiming({}).fill).to.equal('none');
    expect(scanTiming({fill: 'both'}).fill).to.equal('both');
    expect(scanTiming({fill: 'var(--unk, backwards)'}).fill).to.equal(
      'backwards'
    );
    allowConsoleError(() => {
      expect(() => scanTiming({fill: 'invalid'})).to.throw(/Unknown fill/);
    });
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

  it('should accept multi-animation array with some disabled elements', () => {
    const requests = scan([
      {media: 'not-match', target: target1, keyframes: {}},
      {media: 'match', target: target2, duration: 300, keyframes: {}},
    ]);
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target2);
    expect(requests[0].timing.duration).to.equal(300);
  });

  it('should accept multi-animation array with all disabled elements', () => {
    const requests = scan([
      {media: 'not-match', target: target1, keyframes: {}},
      {media: 'not-match', target: target2, duration: 300, keyframes: {}},
    ]);
    expect(requests).to.be.null;
  });

  it('should accept switch-animation with first match', () => {
    const requests = scan({
      switch: [
        {media: 'match', target: target1, keyframes: {}},
        {media: 'match', target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
  });

  it('should accept switch-animation with second match', () => {
    const requests = scan({
      switch: [
        {media: 'not-match', target: target1, keyframes: {}},
        {media: 'match', target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target2);
    expect(requests[0].timing.duration).to.equal(300);
  });

  it('should accept switch-animation with no matches', () => {
    const requests = scan({
      switch: [
        {media: 'not-match', target: target1, keyframes: {}},
        {media: 'not-match', target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.have.length(0);
  });

  it('should propagate vars', () => {
    env.sandbox.stub(win, 'getComputedStyle').callsFake((target) => {
      if (target == target2) {
        return {
          getPropertyValue: (prop) => {
            if (prop == '--var4') {
              return '50px';
            }
            return null;
          },
        };
      }
      return null;
    });
    const requests = scan({
      duration: 500,
      '--var1': '10px',
      animations: [
        {target: target1, keyframes: {}, '--var1': '20px', '--var2': '30px'},
        {
          target: target2,
          duration: 300,
          keyframes: {},
          '--var2': '40px',
          '--var3': 'var(--var4)',
        },
      ],
    });
    expect(requests).to.have.length(2);
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(500);
    expect(requests[0].vars).to.deep.equal({
      '--var1': '20px',
      '--var2': '30px',
    });
    expect(requests[1].target).to.equal(target2);
    expect(requests[1].timing.duration).to.equal(300);
    expect(requests[1].vars).to.deep.equal({
      '--var1': '10px',
      '--var2': '40px',
      '--var3': '50px',
    });
  });

  it('should calculate vars based on parent and same context', () => {
    const requests = scan({
      '--parent1': '11px',
      '--parent2': '12px',
      animations: [
        {
          target: target1,
          '--child1': '21px',
          '--parent2': '22px', // Override parent.
          '--child2': 'var(--child1)',
          '--child3': 'var(--parent1)',
          '--child4': 'var(--parent2)',
          '--child5': 'var(--child6)', // Reverse order dependency.
          '--child6': '23px',
          keyframes: {
            transform: 'translate(var(--child3), var(--child4))',
          },
        },
      ],
    });
    expect(requests).to.have.length(1);
    expect(requests[0].vars).to.jsonEqual({
      '--parent1': '11px',
      '--parent2': '22px',
      '--child1': '21px',
      '--child2': '21px',
      '--child3': '11px',
      '--child4': '22px',
      '--child5': '23px',
      '--child6': '23px',
    });
    expect(requests[0].keyframes.transform[1]).to.equal('translate(11px,22px)');
  });

  it('should override vars in subtargets with index', () => {
    const requests = scan({
      '--parent1': '11px',
      '--parent2': '12px',
      animations: [
        {
          selector: '.target',
          '--child1': '21px',
          '--parent2': '22px', // Override parent.
          '--child2': 'var(--child1)',
          '--child3': 'var(--parent1)',
          '--child4': 'var(--parent2)',
          '--child5': 'var(--child6)', // Reverse order dependency.
          '--child6': '23px',
          subtargets: [
            // By index.
            {
              index: 0,
              '--child6': '31px',
            },
            {
              index: 1,
              '--child6': '32px',
            },
            // By selector.
            {
              selector: '#target1',
              '--child1': '33px',
            },
            {
              selector: '#target2',
              '--child1': '34px',
            },
            {
              selector: 'div',
              '--child2': '35px',
            },
          ],
          keyframes: {
            transform: 'translate(var(--child6), var(--child1))',
          },
        },
      ],
    });
    expect(requests).to.have.length(2);

    // `#target1`
    expect(requests[0].vars).to.jsonEqual({
      '--parent1': '11px',
      '--parent2': '22px',
      '--child1': '33px', // Overriden via `#target1`
      '--child2': '35px', // Overriden via `div`
      '--child3': '11px',
      '--child4': '22px',
      '--child5': '31px', // Overriden via `index: 0`
      '--child6': '31px', // Overriden via `index: 0`
    });
    expect(requests[0].keyframes.transform[1]).to.equal('translate(31px,33px)');

    // `#target2`
    expect(requests[1].vars).to.jsonEqual({
      '--parent1': '11px',
      '--parent2': '22px',
      '--child1': '34px', // Overriden via `#target2`
      '--child2': '35px', // Overriden via `div`
      '--child3': '11px',
      '--child4': '22px',
      '--child5': '32px', // Overriden via `index: 1`
      '--child6': '32px', // Overriden via `index: 1`
    });
    expect(requests[1].keyframes.transform[1]).to.equal('translate(32px,34px)');
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
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        opacity: [0, 1],
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object keyframe w/partial offsets', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        opacity: '1',
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object keyframe with parsing', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        opacity: ['0', 'calc(1)'],
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should parse object w/partial keyframe with parsing', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        opacity: ['calc(1)'],
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes.opacity)).to.be.true;
    expect(keyframes.opacity).to.deep.equal(['0', '1']);
  });

  it('should passthrough service props in a partial object keyframe', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        easing: 'ease-in',
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(keyframes.easing).to.equal('ease-in');
  });

  it('should parse array keyframe', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: [{opacity: '0'}, {opacity: '1'}],
    })[0];
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([{opacity: '0'}, {opacity: '1'}]);
  });

  it('should parse array keyframe w/partial offsets', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: [{opacity: '1'}],
    })[0];
    expect(keyframes).to.deep.equal([{opacity: '0'}, {opacity: '1'}]);
  });

  it('should parse array keyframe w/non-zero offset', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: [
        {offset: 0.1, opacity: '0.1'},
        {opacity: '1', easing: 'ease-in'},
      ],
    })[0];
    expect(keyframes).to.deep.equal([
      {opacity: '0'},
      {offset: 0.1, opacity: '0.1'},
      {opacity: '1', easing: 'ease-in'},
    ]);
  });

  it('should propagate partial properties into implicit 0-offset', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: [{easing: 'ease-in'}, {opacity: '1'}],
    })[0];
    expect(keyframes).to.deep.equal([
      {easing: 'ease-in', opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should propagate partial properties into explicit 0-offset', () => {
    target1.style.opacity = 0;
    const {keyframes} = scan({
      target: target1,
      keyframes: [{offset: 0, easing: 'ease-in'}, {opacity: '1'}],
    })[0];
    expect(keyframes).to.deep.equal([
      {offset: 0, easing: 'ease-in', opacity: '0'},
      {opacity: '1'},
    ]);
  });

  it('should parse array keyframe with parsing', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: [{opacity: 'calc(0)'}, {opacity: 'calc(1)'}],
    })[0];
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([{opacity: '0'}, {opacity: '1'}]);
  });

  it('should parse object keyframe with vendor prefixes', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        'clip-path': ['A', 'B'],
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes['clip-path'])).to.be.true;
    expect(keyframes['clip-path']).to.deep.equal(['A', 'B']);
    // WebKit version as well.
    expect(isArray(keyframes['-webkit-clip-path'])).to.be.true;
    expect(keyframes['-webkit-clip-path']).to.deep.equal(['A', 'B']);
  });

  it('should parse object keyframe with vendor prefixes in camel-case', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        'clipPath': ['A', 'B'],
      },
    })[0];
    expect(isObject(keyframes)).to.be.true;
    expect(isArray(keyframes['clipPath'])).to.be.true;
    expect(keyframes['clipPath']).to.deep.equal(['A', 'B']);
    // WebKit version as well.
    expect(isArray(keyframes['-webkit-clip-path'])).to.be.true;
    expect(keyframes['-webkit-clip-path']).to.deep.equal(['A', 'B']);
  });

  it('should parse array keyframe with vendor prefixes', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: [{'clip-path': 'A'}, {'clip-path': 'B'}],
    })[0];
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([
      {'clip-path': 'A', '-webkit-clip-path': 'A'},
      {'clip-path': 'B', '-webkit-clip-path': 'B'},
    ]);
  });

  it('should parse array keyframe with vendor prefixes in camel-case', () => {
    const {keyframes} = scan({
      target: target1,
      keyframes: [{'clipPath': 'A'}, {'clipPath': 'B'}],
    })[0];
    expect(isArray(keyframes)).to.be.true;
    expect(keyframes).to.deep.equal([
      {'clipPath': 'A', '-webkit-clip-path': 'A'},
      {'clipPath': 'B', '-webkit-clip-path': 'B'},
    ]);
  });

  it('should parse width/height functions', () => {
    target2.style.width = '11px';
    target2.style.height = '22px';
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        transform: [
          'translateX(width("#target2"))',
          'translateY(height("#target2"))',
        ],
      },
    })[0];
    expect(keyframes.transform).to.jsonEqual([
      'translatex(11px)',
      'translatey(22px)',
    ]);
  });

  it('should parse rand function', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 0.25);
    const {keyframes} = scan({
      target: target1,
      keyframes: {
        opacity: [0, 'rand(0.5, 0.6)'],
      },
    })[0];
    expect(keyframes.opacity).to.jsonEqual(['0', '0.525']);
  });

  it('should parse num function', () => {
    target2.style.width = '110px';
    const request = scan({
      target: target2,
      duration: 'calc(1s * num(width()) / 10)',
      delay: 'calc(1ms * num(width()) / 10)',
      keyframes: {
        transform: ['none', 'rotateX(calc(1rad * num(width()) / 20))'],
      },
    })[0];
    expect(request.timing.duration).to.equal(11000);
    expect(request.timing.delay).to.equal(11);
    expect(request.keyframes.transform[1]).to.equal('rotatex(5.5rad)');
  });

  it('should fail when cannot discover style keyframes', () => {
    allowConsoleError(() => {
      expect(() => scan({target: target1, keyframes: 'keyframes1'})).to.throw(
        /Keyframes not found/
      );
    });
  });

  it('should discover style keyframes', () => {
    const name = 'keyframes1';
    const css = 'from{opacity: 0} to{opacity: 1}';
    return writeAndWaitForStyleKeyframes(name, css).then(() => {
      const {keyframes} = scan({target: target1, keyframes: name})[0];
      expect(keyframes).to.jsonEqual([
        {offset: 0, opacity: '0'},
        {offset: 1, opacity: '1'},
      ]);
    });
  });

  it('should polyfill partial style keyframes', () => {
    const name = 'keyframes2';
    const css = 'to{opacity: 0}';
    return writeAndWaitForStyleKeyframes(name, css).then(() => {
      const {keyframes} = scan({target: target1, keyframes: name})[0];
      expect(keyframes).to.jsonEqual([
        {opacity: '1'},
        {offset: 1, opacity: '0'},
      ]);
    });
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
    expect(requests).to.be.null;
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

  it('should check supports in top animation', () => {
    const requests = scan({
      duration: 500,
      supports: 'supported: 0',
      animations: [
        {target: target1, keyframes: {}},
        {target: target2, duration: 300, keyframes: {}},
      ],
    });
    expect(requests).to.be.null;
  });

  it('should check supports in sub-animations', () => {
    const requests = scan({
      duration: 500,
      animations: [
        {supports: 'supported: 0', target: target1, keyframes: {}},
        {
          supports: 'supported: 1',
          target: target2,
          duration: 300,
          keyframes: {},
        },
      ],
    });
    expect(requests).to.have.length(1);
    expect(requests[0].target).to.equal(target2);
  });

  it('should interprete absent CSS/supports as false', () => {
    const builder = new Builder(
      win,
      doc,
      'https://acme.org/',
      vsync,
      /* owners */ null
    );
    const cssContext = builder.css_;
    expect(cssContext.supports('supported: 0')).to.be.false;
    expect(cssContext.supports('supported: 1')).to.be.true;
    // Override CSS availability.
    cssContext.win_ = {CSS: {supports: () => true}};
    expect(cssContext.supports('supported: 1')).to.be.true;
    delete cssContext.win_.CSS.supports;
    expect(cssContext.supports('supported: 1')).to.be.false;
    delete cssContext.win_.CSS;
    expect(cssContext.supports('supported: 1')).to.be.false;
  });

  it('should check media AND supports', () => {
    // Both true -> true.
    expect(
      scan({
        media: 'match',
        supports: 'supported: 1',
        target: target1,
        keyframes: {},
      })
    ).to.have.length(1);
    // One false -> false.
    expect(
      scan({
        media: 'not-match',
        supports: 'supported: 1',
        target: target1,
        keyframes: {},
      })
    ).to.be.null;
    expect(
      scan({
        media: 'match',
        supports: 'supported: 0',
        target: target1,
        keyframes: {},
      })
    ).to.be.null;
    expect(
      scan({
        media: 'not-match',
        supports: 'supported: 0',
        target: target1,
        keyframes: {},
      })
    ).to.be.null;
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
    const requests = scan([{selector: '#target1.target', keyframes: {}}]);
    expect(requests).to.have.length(1);
    // `#target1.target`
    expect(requests[0].target).to.equal(target1);
    expect(requests[0].timing.duration).to.equal(0);
  });

  it('should find target by ID', () => {
    const requests = scan([{target: 'target1', keyframes: {}}]);
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
    allowConsoleError(() => {
      expect(() => {
        scan([{duration: 400, keyframes: {}}]);
      }).to.throw(/No target specified/);
    });
  });

  it('should not allow both selector and target spec', () => {
    allowConsoleError(() => {
      expect(() => {
        scan([
          {
            selector: '#target1',
            target: 'target1',
            duration: 400,
            keyframes: {},
          },
        ]);
      }).to.throw(/Both/);
    });
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
    expect(request1.keyframes.transform).to.deep.equal([
      'translateY(0px)',
      'translateY(100px)',
    ]);
    // `#target2`
    expect(request2.target).to.equal(target2);
    expect(request2.timing.duration).to.equal(100);
    expect(request2.timing.delay).to.equal(10);
    expect(request2.keyframes.opacity).to.deep.equal(['0.1', '1']);
    expect(request2.keyframes.transform).to.deep.equal([
      'translateY(0px)',
      'translateY(100px)',
    ]);
  });

  it('should resolve index() for multiple targets', () => {
    const requests = scan({
      selector: '.target',
      delay: 'calc(100ms * index())',
      keyframes: {},
    });
    expect(requests).to.have.length(2);
    expect(requests[0].timing.delay).to.equal(0);
    expect(requests[1].timing.delay).to.equal(100);
  });

  it('should resolve length() correctly', () => {
    const requests = scan({
      selector: '.target',
      delay: 'calc(100ms * length())',
      keyframes: {},
    });
    expect(requests).to.have.length(2);
    expect(requests[1].timing.delay).to.equal(200);
  });

  it('should be able to resolve animation with args', () => {
    const builder = new Builder(
      win,
      doc,
      'https://acme.org/',
      vsync,
      /* owners */ null
    );
    env.sandbox.stub(builder, 'requireLayout');
    const spec = {target: target1, delay: 101, keyframes: {}};
    const args = {
      'duration': 1001,
      '--var1': '10px',
      '--var2': '20px',
    };
    return builder.resolveRequests([], spec, args).then((requests) => {
      expect(requests).to.have.length(1);
      const request = requests[0];
      expect(request.target).to.equal(target1);
      expect(request.vars).to.deep.equal({
        '--var1': '10px',
        '--var2': '20px',
      });
      expect(request.timing.duration).to.equal(1001);
      expect(request.timing.delay).to.equal(101);
    });
  });

  describe('composite animations', () => {
    let builder, scanner;
    let animation2;
    let animation2Spec;

    beforeEach(() => {
      animation2Spec = {};
      animation2 = env.createAmpElement('amp-animation');
      env.sandbox.stub(animation2, 'getImpl').resolves({
        getAnimationSpec: () => animation2Spec,
      });
      animation2.id = 'animation2';
      doc.body.appendChild(animation2);

      builder = new Builder(win, doc, 'https://acme.org/', vsync, owners);
      env.sandbox.stub(builder, 'requireLayout');
      scanner = builder.createScanner_([]);
    });

    it('should fail when animation cannot be found', () => {
      allowConsoleError(() => {
        expect(() => {
          scanner.resolveRequests({animation: 'animation3'});
        }).to.throw(/Animation not found/);
      });
    });

    it('should fail when animation reference is not an amp-animation', () => {
      const animation3 = env.createAmpElement('amp-other');
      animation3.id = 'animation3';
      doc.body.appendChild(animation3);
      allowConsoleError(() => {
        expect(() => {
          scanner.resolveRequests({animation: 'animation3'});
        }).to.throw(/Element is not an animation/);
      });
    });

    it('should fail the recursive animation', () => {
      animation2Spec = {animation: 'animation2'};
      return scanner.resolveRequests({animation: 'animation2'}).then(
        () => {
          throw new Error('must have failed');
        },
        (reason) => {
          expect(reason.message).to.match(/Recursive animations/);
        }
      );
    });

    it('should resolve animation w/o target', () => {
      animation2Spec = {
        target: target1,
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests({
          animation: 'animation2',
          delay: 100,
        })
        .then((requests) => {
          expect(requests).to.have.length(1);
          expect(requests[0].target).to.equal(target1);
          expect(requests[0].timing.duration).to.equal(2000);
          expect(requests[0].timing.delay).to.equal(100);
          expect(requests[0].vars).to.deep.equal({});
        });
    });

    it('should combine animations', () => {
      animation2Spec = {
        target: target1,
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests([
          {
            target: target2,
            delay: 100,
            keyframes: {},
          },
          {
            animation: 'animation2',
            delay: 200,
          },
        ])
        .then((requests) => {
          expect(requests).to.have.length(2);
          expect(requests[0].target).to.equal(target2);
          expect(requests[0].timing.delay).to.equal(100);
          expect(requests[1].target).to.equal(target1);
          expect(requests[1].timing.delay).to.equal(200);
        });
    });

    it('should NOT override the target', () => {
      animation2Spec = {
        target: target1,
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests({
          target: target2,
          animation: 'animation2',
          delay: 100,
        })
        .then((requests) => {
          expect(requests).to.have.length(1);
          expect(requests[0].target).to.equal(target1);
          expect(requests[0].timing.duration).to.equal(2000);
          expect(requests[0].timing.delay).to.equal(100);
          expect(requests[0].vars).to.deep.equal({});
        });
    });

    it('should NOT override the target in nested animations', () => {
      animation2Spec = {
        animations: [
          {
            // No target here: the provided target will be used.
            duration: 2000,
            keyframes: {},
          },
          {
            // Target here: will not be overridden.
            target: target1,
            duration: 2500,
            delay: 400,
            keyframes: {},
          },
        ],
      };
      return scanner
        .resolveRequests({
          target: target2,
          animation: 'animation2',
          delay: 100,
        })
        .then((requests) => {
          expect(requests).to.have.length(2);
          expect(requests[0].target).to.equal(target2);
          expect(requests[0].timing.duration).to.equal(2000);
          expect(requests[0].timing.delay).to.equal(100);
          expect(requests[0].vars).to.deep.equal({});
          expect(requests[1].target).to.equal(target1);
          expect(requests[1].timing.duration).to.equal(2500);
          expect(requests[1].timing.delay).to.equal(400);
          expect(requests[1].vars).to.deep.equal({});
        });
    });

    it('should multiply animations by selector', () => {
      animation2Spec = {
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests({
          selector: '.target',
          animation: 'animation2',
          delay: 100,
        })
        .then((requests) => {
          expect(requests).to.have.length(2);
          expect(requests[0].target).to.equal(target1);
          expect(requests[0].timing.duration).to.equal(2000);
          expect(requests[0].timing.delay).to.equal(100);
          expect(requests[0].vars).to.deep.equal({});
          expect(requests[1].target).to.equal(target2);
          expect(requests[1].timing.duration).to.equal(2000);
          expect(requests[1].timing.delay).to.equal(100);
          expect(requests[1].vars).to.deep.equal({});
        });
    });

    it('should propagate vars', () => {
      animation2Spec = {
        target: target1,
        duration: 'var(--duration)',
        '--y': '200px',
        keyframes: {transform: 'translate(var(--x), var(--y))'},
      };
      return scanner
        .resolveRequests({
          animation: 'animation2',
          '--duration': 1500,
          '--x': '100px',
        })
        .then((requests) => {
          expect(requests).to.have.length(1);
          expect(requests[0].timing.duration).to.equal(1500);
          expect(requests[0].keyframes.transform[1]).to.equal(
            'translate(100px,200px)'
          );
          expect(requests[0].vars).to.deep.equal({
            '--duration': '1500',
            '--x': '100px',
            '--y': '200px',
          });
        });
    });

    it('should propagate vars and index by selector from parent', () => {
      animation2Spec = {
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests({
          selector: '.target',
          animation: 'animation2',
          delay: 'calc((index() + 1) * 1s)',
          subtargets: [
            {index: 0, '--y': '11px'},
            {index: 1, '--y': '12px'},
          ],
        })
        .then((requests) => {
          expect(requests).to.have.length(2);
          expect(requests[0].timing.delay).to.equal(1000);
          expect(requests[0].vars).to.deep.equal({'--y': '11px'});
          expect(requests[1].timing.delay).to.equal(2000);
          expect(requests[1].vars).to.deep.equal({'--y': '12px'});
        });
    });

    it('should propagate vars and index by selector from child', () => {
      animation2Spec = {
        delay: 'calc((index() + 1) * 1s)',
        subtargets: [
          {index: 0, '--y': '11px'},
          {index: 1, '--y': '12px'},
        ],
        duration: 2000,
        keyframes: {},
      };
      return scanner
        .resolveRequests({
          selector: '.target',
          animation: 'animation2',
          delay: 100,
        })
        .then((requests) => {
          expect(requests).to.have.length(2);
          expect(requests[0].timing.delay).to.equal(1000);
          expect(requests[0].vars).to.deep.equal({'--y': '11px'});
          expect(requests[1].timing.delay).to.equal(2000);
          expect(requests[1].vars).to.deep.equal({'--y': '12px'});
        });
    });
  });

  describe('CSS evaluations', () => {
    let css;
    let parseSpy;

    beforeEach(() => {
      const builder = new Builder(
        win,
        doc,
        'https://acme.org/',
        /* vsync */ null,
        /* owners */ null
      );
      css = builder.css_;
      parseSpy = env.sandbox.spy(css, 'resolveAsNode_');
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
      const spy = env.sandbox.spy(win, 'getComputedStyle');

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
      expect(css.resolveCss('')).to.equal('');
      expect(css.resolveCss(null)).to.equal('');
      expect(css.resolveCss(0)).to.equal('0');
      expect(css.resolveCss(10)).to.equal('10');
      expect(css.resolveCss(-1)).to.equal('-1');
      expect(css.resolveCss(Infinity)).to.equal('Infinity');
      expect(css.resolveCss('10px')).to.equal('10px');
      expect(css.resolveCss('translateY(10px)')).to.equal('translateY(10px)');
      expect(css.resolveCss('rgb(0,0,0)')).to.equal('rgb(0,0,0)');
      expect(parseSpy).to.not.be.called;
    });

    it('should evaluate CSS for non-normalized values', () => {
      target1.style.fontSize = '10px';
      target1.style.width = '110px';
      css.withTarget(target1, 0, () => {
        expect(css.resolveCss('10em')).to.equal('100px');
        expect(css.resolveCss('translateX(10em)')).to.equal(
          'translatex(100px)'
        );
        expect(css.resolveCss('translateX(10%)')).to.equal('translatex(11px)');
      });
      expect(css.resolveCss('10vh')).to.equal('15px');
      expect(css.resolveCss('translateY(10vh)')).to.equal('translatey(15px)');
      expect(parseSpy).to.be.called;
    });

    it('should evaluate CSS for complex values', () => {
      expect(css.resolveCss('calc(10px)')).to.equal('10px');
      expect(parseSpy).to.be.calledOnce;
    });

    it('should require target for CSS that need element context', () => {
      allowConsoleError(() => {
        expect(() => css.resolveCss('calc(10em + 10px)')).to.throw(
          /target is specified/
        );
      });
      target1.style.fontSize = '10px';
      expect(
        css.withTarget(target1, 0, () => css.resolveCss('calc(10em + 10px)'))
      ).to.equal('110px');
    });

    it('should resolve simple time CSS w/o evaluation', () => {
      expect(css.resolveMillis(null, 1)).to.equal(1);
      expect(css.resolveMillis('', 1)).to.equal(1);
      expect(css.resolveMillis(2, 1)).to.equal(2);
      expect(parseSpy).to.not.be.called;
    });

    it('should resolve time CSS with evaluation', () => {
      expect(css.resolveMillis('10s', 1)).to.equal(10000);
      expect(css.resolveMillis('10ms', 1)).to.equal(10);
      expect(css.resolveMillis('10', 1)).to.equal(10);
      expect(css.resolveMillis('calc(10ms)', 1)).to.equal(10);
      expect(parseSpy).to.be.called;
    });

    it('should resolve invalid time CSS to null', () => {
      expect(css.resolveMillis('abc', 1)).to.be.undefined;
      expect(css.resolveMillis('Infinity', 1)).to.be.undefined;
      expect(css.resolveMillis('infinite', 1)).to.be.undefined;
      expect(parseSpy).to.be.called;
    });

    it('should resolve simple number CSS w/o evaluation', () => {
      expect(css.resolveNumber(null, 1)).to.equal(1);
      expect(css.resolveNumber('', 1)).to.equal(1);
      expect(css.resolveNumber(2, 1)).to.equal(2);
      expect(css.resolveNumber(Infinity, 1)).to.equal(Infinity);
      expect(parseSpy).to.not.be.called;
    });

    it('should resolve number CSS with evaluation', () => {
      expect(css.resolveNumber('10', 1)).to.equal(10);
      expect(css.resolveNumber('10.5', 1)).to.equal(10.5);
      expect(css.resolveNumber('calc(10)', 1)).to.equal(10);
      expect(css.resolveNumber('Infinity', 1)).to.equal(Infinity);
      expect(css.resolveNumber('infinite', 1)).to.equal(Infinity);
      expect(parseSpy).to.be.called;
    });

    it('should resolve invalid number CSS to null', () => {
      expect(css.resolveNumber('abc', 1)).to.be.undefined;
      expect(parseSpy).to.be.called;
    });

    // TODO(dvoytenko, #12476): Make this test work with sinon 4.0.
    it.skip('should read a var', () => {
      const stub = env.sandbox.stub(css, 'measure').callsFake(() => '10px');
      expect(css.getVar('--var1')).to.be.null;
      expect(warnStub).to.have.callCount(1);
      expect(warnStub.args[0][1]).to.match(/Variable not found/);

      // With element.
      warnStub.reset();
      stub.reset();
      expect(
        css.withTarget(target1, 0, () => css.getVar('--var1')).num_
      ).to.equal(10);
      expect(stub).to.be.calledWith(target1, '--var1');
      expect(warnStub).to.have.callCount(0);

      // With predefined vars.
      warnStub.reset();
      stub.reset();
      css.withVars({'--var1': 11}, () => {
        // No element, but predefined vars.
        expect(css.getVar('--var1').num_).to.equal(11);
        // Predefined vars override the element.
        expect(
          css.withTarget(target1, 0, () => css.getVar('--var1')).num_
        ).to.equal(11);

        expect(stub).to.not.be.called;
        expect(warnStub).to.have.callCount(0);
      });
    });

    it('should disallow recursive vars', () => {
      css.withVars(
        {
          '--var1': '11',
          '--var2': 'var(--var1)',
          '--rec1': 'var(--rec2)',
          '--rec2': 'var(--rec1)',
          '--rec3': 'var(--rec4)',
          '--rec4': 'var(--rec1)',
        },
        () => {
          expect(css.getVar('--var1').num_).to.equal(11);
          expect(css.getVar('--var2').num_).to.equal(11);
          allowConsoleError(() => {
            expect(() => css.getVar('--rec1')).to.throw(/Recursive/);
            expect(() => css.getVar('--rec2')).to.throw(/Recursive/);
            expect(() => css.getVar('--rec3')).to.throw(/Recursive/);
            expect(() => css.getVar('--rec4')).to.throw(/Recursive/);
          });
        }
      );
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
      expect(size.width).to.equal(win.innerWidth);
      expect(size.height).to.equal(win.innerHeight);
      expect(css.getViewportSize()).to.equal(size);
    });

    it('should resolve current index', () => {
      allowConsoleError(() => {
        expect(() => css.getCurrentIndex()).to.throw(/target is specified/);
      });
      expect(css.withTarget(target1, 0, () => css.getCurrentIndex())).to.equal(
        0
      );
      expect(css.withTarget(target1, 11, () => css.getCurrentIndex())).to.equal(
        11
      );
    });

    it('should resolve current and root font size', () => {
      doc.documentElement.style.fontSize = '12px';
      expect(css.getRootFontSize()).to.equal(12);

      target1.style.fontSize = '16px';
      allowConsoleError(() => {
        expect(() => css.getCurrentFontSize()).to.throw(/target is specified/);
      });
      expect(
        css.withTarget(target1, 0, () => css.getCurrentFontSize())
      ).to.equal(16);
      expect(
        css.withTarget(target2, 0, () => css.getCurrentFontSize())
      ).to.equal(12);
    });

    it('should resolve current element size', () => {
      target1.style.width = '11px';
      target1.style.height = '12px';
      allowConsoleError(() => {
        expect(() => css.getCurrentElementRect()).to.throw(
          /target is specified/
        );
      });
      expect(
        css.withTarget(target1, 0, () => css.getCurrentElementRect())
      ).to.include({width: 11, height: 12});
    });

    it('should resolve the selected element size', () => {
      target1.style.width = '11px';
      target1.style.height = '12px';
      target1.classList.add('parent');
      const child = target1.ownerDocument.createElement('div');
      target1.appendChild(child);

      // Normal selectors search whole DOM and don't need context.
      expect(css.getElementRect('#target1', null)).to.include({
        width: 11,
        height: 12,
      });
      expect(
        css.withTarget(target2, 0, () => css.getElementRect('#target1', null))
      ).to.include({width: 11, height: 12});

      // Closest selectors always need a context node.
      allowConsoleError(() => {
        expect(() => css.getElementRect('#target1', 'closest')).to.throw(
          /target is specified/
        );
      });
      expect(
        css.withTarget(child, 0, () => css.getElementRect('.parent', 'closest'))
      ).to.include({width: 11, height: 12});
    });

    it("should resolve current element's position", () => {
      target1.style.position = 'absolute';
      target1.style.left = '11px';
      target1.style.top = '12px';
      allowConsoleError(() => {
        expect(() => css.getCurrentElementRect()).to.throw(
          /target is specified/
        );
      });
      expect(
        css.withTarget(target1, 0, () => css.getCurrentElementRect())
      ).to.include({x: 11, y: 12});
    });

    it("should resolve the selected element's position", () => {
      target1.style.position = 'absolute';
      target1.style.left = '11px';
      target1.style.top = '12px';
      target1.classList.add('parent');
      const child = target1.ownerDocument.createElement('div');
      target1.appendChild(child);

      // Normal selectors search whole DOM and don't need context.
      expect(css.getElementRect('#target1', null)).to.include({
        x: 11,
        y: 12,
      });
      expect(
        css.withTarget(target2, 0, () => css.getElementRect('#target1', null))
      ).to.include({x: 11, y: 12});

      // Closest selectors always need a context node.
      allowConsoleError(() => {
        expect(() => css.getElementRect('#target1', 'closest')).to.throw(
          /target is specified/
        );
      });
      expect(
        css.withTarget(child, 0, () => css.getElementRect('.parent', 'closest'))
      ).to.include({x: 11, y: 12});
    });

    it('should resolve a valid URL', () => {
      expect(css.resolveUrl('/path')).to.equal('https://acme.org/path');
      expect(css.resolveUrl('//example.org/path')).to.equal(
        'https://example.org/path'
      );
    });

    it('should NOT resolve an invalid URL', () => {
      allowConsoleError(() => {
        expect(() => css.resolveUrl('http://acme.org/path')).to.throw(/https/);
      });
    });
  });

  describe('createRunner', () => {
    let amp1, amp2;

    beforeEach(() => {
      amp1 = env.createAmpElement();
      amp2 = env.createAmpElement();
      env.sandbox.stub(amp1, 'isUpgraded').callsFake(() => true);
      env.sandbox.stub(amp2, 'isUpgraded').callsFake(() => true);
      env.sandbox.stub(amp1, 'isBuilt').callsFake(() => true);
      env.sandbox.stub(amp2, 'isBuilt').callsFake(() => true);
      env.sandbox.stub(amp1, 'whenBuilt').callsFake(() => Promise.resolve());
      env.sandbox.stub(amp2, 'whenBuilt').callsFake(() => Promise.resolve());
      resources.add(amp1);
      resources.add(amp2);
    });

    function waitForNextMicrotask() {
      return vsync
        .measurePromise(() => {})
        .then(() => Promise.resolve())
        .then(() => Promise.all([Promise.resolve()]));
    }

    function createRunner(spec) {
      const builder = new Builder(win, doc, 'https://acme.org/', vsync, owners);
      return builder.createRunner(spec);
    }

    it('should unblock non-AMP elements immediately', () => {
      return createRunner([
        {target: target1, keyframes: {}},
        {target: target2, keyframes: {}},
      ]).then((runner) => {
        expect(runner.requests_).to.have.length(2);
        expect(runner.requests_[0].target).to.equal(target1);
        expect(runner.requests_[1].target).to.equal(target2);
        expect(requireLayoutSpy).to.have.callCount(2);
        expect(requireLayoutSpy).to.be.calledWith(target1);
        expect(requireLayoutSpy).to.be.calledWith(target2);
      });
    });

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip('should block AMP elements', () => {
      const r1 = resources.getResourceForElement(amp1);
      const r2 = resources.getResourceForElement(amp2);
      env.sandbox.stub(r1, 'whenBuilt').callsFake(() => Promise.resolve());
      env.sandbox.stub(r2, 'whenBuilt').callsFake(() => Promise.resolve());
      env.sandbox.stub(r1, 'isDisplayed').callsFake(() => true);
      env.sandbox.stub(r2, 'isDisplayed').callsFake(() => true);
      let runner;
      createRunner([
        {target: amp1, keyframes: {}},
        {target: amp2, keyframes: {}},
      ]).then((res) => {
        runner = res;
      });
      return waitForNextMicrotask()
        .then(() => {
          expect(runner).to.be.undefined;
          r1.loadPromiseResolve_();
          return waitForNextMicrotask();
        })
        .then(() => {
          expect(runner).to.be.undefined;
          r2.loadPromiseResolve_();
          return Promise.all([r1.loadedOnce(), r2.loadedOnce()]).then(() =>
            waitForNextMicrotask()
          );
        })
        .then(() => {
          expect(runner).to.be.ok;
          expect(runner.requests_).to.have.length(2);
          expect(runner.requests_[0].target).to.equal(amp1);
          expect(runner.requests_[1].target).to.equal(amp2);
          expect(requireLayoutSpy).to.have.callCount(2);
          expect(requireLayoutSpy).to.be.calledWith(amp1);
          expect(requireLayoutSpy).to.be.calledWith(amp2);
        });
    });
  });
});

describes.realWin('MeasureScanner (scoped)', {amp: 1}, (env) => {
  function scan(spec, builderOptions) {
    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      builderOptions
    );
    env.sandbox.stub(builder, 'requireLayout');
    const scanner = builder.createScanner_([]);
    const success = scanner.scan(spec);
    if (success) {
      return scanner.requests_;
    }
    expect(scanner.requests_).to.have.length(0);
    return null;
  }

  let html;

  beforeEach(() => {
    html = htmlFor(env.win.document);
  });

  it('should scope selector', () => {
    const tree = html`
      <div>
        <div class="target"></div>
        <div id="target"></div>
        <div id="scope" ref="scope">
          <div class="target"></div>
          <div id="target"></div>
        </div>
      </div>
    `;

    const {scope} = htmlRefs(tree);

    env.win.document.body.appendChild(tree);

    const requests = scan(
      [
        {selector: '#target', duration: 200, keyframes: {}},
        {selector: '.target', duration: 300, keyframes: {}},
      ],
      {scope}
    );

    expect(requests).to.have.length(2);

    // #target
    expect(requests[0].target.id).to.equal('target');
    expect(closestAncestorElementBySelector(requests[0].target, '#scope')).to
      .not.be.null;

    // .target
    expect(requests[1].target.className).to.deep.equal('target');
    expect(closestAncestorElementBySelector(requests[1].target, '#scope')).to
      .not.be.null;
  });

  it('should not scope selector if no scope is provided', () => {
    const tree = html`
      <div>
        <div class="target"></div>
        <div id="target"></div>
        <div>
          <div class="target"></div>
          <div id="target"></div>
        </div>
      </div>
    `;

    env.win.document.body.appendChild(tree);

    const requests = scan(
      [
        {selector: '#target', duration: 200, keyframes: {}},
        {selector: '.target', duration: 300, keyframes: {}},
      ],
      {}
    );

    expect(requests).to.have.length(4);

    // #target
    expect(requests[0].target.id).to.equal('target');
    expect(requests[1].target.id).to.equal('target');

    // .target
    expect(requests[2].target.className).to.deep.equal('target');
    expect(requests[3].target.className).to.deep.equal('target');
  });

  it('should resolve the closest element inside scope', () => {
    const tree = html`
      <div class="parent">
        <div id="scope" ref="scope">
          <div class="parent">
            <div id="target1" ref="target1"></div>
          </div>
          <div id="target2" ref="target2"></div>
        </div>
      </div>
    `;

    const {scope, target1, target2} = htmlRefs(tree);

    env.win.document.body.appendChild(tree);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope}
    );

    const css = builder.css_;

    expect(() =>
      css.withTarget(target1, 0, () => css.getElementRect('.parent', 'closest'))
    ).to.not.throw();

    allowConsoleError(() => {
      expect(() =>
        css.withTarget(target2, 0, () =>
          css.getElementRect('.parent', 'closest')
        )
      ).to.throw(/Element not found/);
    });
  });

  it("should not resolve viewport size as scope element's size", () => {
    const scope = html`<div></div>`;

    scope.style.width = '200px';
    scope.style.height = '300px';

    env.win.document.body.appendChild(scope);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope, scaleByScope: false}
    );

    const css = builder.css_;

    const size = css.getViewportSize();
    expect(size.width).to.equal(env.win.innerWidth);
    expect(size.height).to.equal(env.win.innerHeight);

    // cached:
    expect(css.getViewportSize()).to.equal(size);
  });

  it("should resolve viewport size as scope element's size", () => {
    const scope = html`<div></div>`;

    scope.style.width = '200px';
    scope.style.height = '300px';

    env.win.document.body.appendChild(scope);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope, scaleByScope: true}
    );

    const css = builder.css_;

    const size = css.getViewportSize();
    expect(size.width).to.equal(200);
    expect(size.height).to.equal(300);

    // cached:
    expect(css.getViewportSize()).to.equal(size);
  });

  it('should resolve x and y relative to scope', () => {
    const scope = html`<div>
      <div id="target1" ref="target1"></div>
      <div id="target2" ref="target2"></div>
    </div>`;

    const {target1, target2} = htmlRefs(scope);

    scope.style.position = 'absolute';
    scope.style.left = '10px';
    scope.style.top = '20px';

    scope.style.width = '1000px';
    scope.style.height = '1000px';

    target1.style.position = 'absolute';
    target1.style.left = '40px';
    target1.style.top = '30px';

    target2.style.position = 'absolute';
    target2.style.left = '30px';
    target2.style.top = '20px';

    env.win.document.body.appendChild(scope);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope, scaleByScope: true}
    );

    const css = builder.css_;

    const pos1 = css.getElementRect('#target1', null);
    expect(pos1.x).to.equal(40);
    expect(pos1.y).to.equal(30);

    const pos2 = css.getElementRect('#target2', null);
    expect(pos2.x).to.equal(30);
    expect(pos2.y).to.equal(20);
  });

  it('should resolve dimensions and size rescaled relative to scope', () => {
    const scope = html`<div>
      <div id="target1" ref="target1"></div>
      <div id="target2" ref="target2"></div>
    </div>`;

    const {target1, target2} = htmlRefs(scope);

    scope.style.position = 'absolute';
    scope.style.top = '20px';
    scope.style.left = '10px';

    scope.style.width = '1000px';
    scope.style.height = '1000px';

    scope.style.transform = 'scale(0.5)';

    target1.style.position = 'absolute';
    target1.style.left = '40px';
    target1.style.top = '30px';
    target1.style.width = '200px';
    target1.style.height = '100px';

    target2.style.position = 'absolute';
    target2.style.left = '30px';
    target2.style.top = '20px';
    target2.style.width = '300px';
    target2.style.height = '200px';

    env.win.document.body.appendChild(scope);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope, scaleByScope: true}
    );

    const css = builder.css_;

    const pos1 = css.getElementRect('#target1', null);
    expect(pos1.x).to.equal(40);
    expect(pos1.y).to.equal(30);

    const size1 = css.getElementRect('#target1', null);
    expect(size1.width).to.equal(200);
    expect(size1.height).to.equal(100);

    const pos2 = css.getElementRect('#target2', null);
    expect(pos2.x).to.equal(30);
    expect(pos2.y).to.equal(20);

    const size2 = css.getElementRect('#target2', null);
    expect(size2.width).to.equal(300);
    expect(size2.height).to.equal(200);
  });

  it('should resolve dimensions and size not rescaled relative to scope', () => {
    const scope = html`<div>
      <div id="target1" ref="target1"></div>
      <div id="target2" ref="target2"></div>
    </div>`;

    const {target1, target2} = htmlRefs(scope);

    scope.style.position = 'absolute';
    scope.style.top = '20px';
    scope.style.left = '10px';

    scope.style.width = '1000px';
    scope.style.height = '1000px';

    scope.style.transform = 'scale(0.5)';

    target1.style.position = 'absolute';
    target1.style.left = '40px';
    target1.style.top = '30px';
    target1.style.width = '200px';
    target1.style.height = '100px';

    target2.style.position = 'absolute';
    target2.style.left = '30px';
    target2.style.top = '20px';
    target2.style.width = '300px';
    target2.style.height = '200px';

    env.win.document.body.appendChild(scope);

    const builder = new Builder(
      env.win,
      env.win.document,
      'https://acme.org/',
      /* vsync */ null,
      /* owners */ null,
      {scope, scaleByScope: false}
    );

    const css = builder.css_;

    const pos1 = css.getElementRect('#target1', null);
    const rect1 = target1.getBoundingClientRect();
    expect(pos1.x).to.equal(rect1.x);
    expect(pos1.y).to.equal(rect1.y);

    const size1 = css.getElementRect('#target1', null);
    expect(size1.width).to.equal(200 * 0.5);
    expect(size1.height).to.equal(100 * 0.5);

    const pos2 = css.getElementRect('#target2', null);
    const rect2 = target2.getBoundingClientRect();
    expect(pos2.x).to.equal(rect2.x);
    expect(pos2.y).to.equal(rect2.y);

    const size2 = css.getElementRect('#target2', null);
    expect(size2.width).to.equal(300 * 0.5);
    expect(size2.height).to.equal(200 * 0.5);
  });
});

describes.sandboxed('NativeWebAnimationRunner', {}, (env) => {
  let target1, target2;
  let target1Mock, target2Mock;
  let keyframes1, keyframes2;
  let timing1, timing2;
  let anim1, anim2;
  let anim1Mock, anim2Mock;
  let playStateSpy;
  let runner;

  class WebAnimationStub {
    constructor() {
      this.playState = WebAnimationPlayState.IDLE;
    }

    play() {
      this.playState = WebAnimationPlayState.RUNNING;
      return;
    }
    pause() {
      this.playState = WebAnimationPlayState.PAUSED;
      return;
    }
    reverse() {
      throw new Error('not implemented');
    }
    finish() {
      this.playState = WebAnimationPlayState.FINISHED;
      this.onfinish();
      return;
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
    anim1Mock = env.sandbox.mock(anim1);
    anim2Mock = env.sandbox.mock(anim2);

    target1 = {style: createStyle(), animate: () => anim1};
    target1Mock = env.sandbox.mock(target1);
    target2 = {style: createStyle(), animate: () => anim2};
    target2Mock = env.sandbox.mock(target2);

    runner = new NativeWebAnimationRunner([
      {target: target1, keyframes: keyframes1, timing: timing1},
      {target: target2, keyframes: keyframes2, timing: timing2},
    ]);

    playStateSpy = env.sandbox.spy();
    runner.onPlayStateChanged(playStateSpy);
  });

  afterEach(() => {
    target1Mock.verify();
    target2Mock.verify();
    anim1Mock.verify();
    anim2Mock.verify();
  });

  function createStyle() {
    const style = {};
    style.setProperty = (k, v) => {
      style[k] = v;
    };
    return style;
  }

  it('should call init on all animations and stay in IDLE state', () => {
    target1Mock
      .expects('animate')
      .withExactArgs(keyframes1, timing1)
      .returns(anim1)
      .once();
    target2Mock
      .expects('animate')
      .withExactArgs(keyframes2, timing2)
      .returns(anim2)
      .once();

    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
    runner.init();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.IDLE);
    expect(runner.players_).to.have.length(2);
    expect(runner.players_[0]).equal(anim1);
    expect(runner.players_[1]).equal(anim2);
    expect(playStateSpy).not.to.be.called;
  });

  it('should call start on all animations', () => {
    target1Mock
      .expects('animate')
      .withExactArgs(keyframes1, timing1)
      .returns(anim1)
      .once();
    target2Mock
      .expects('animate')
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

  it('should fail to init twice', () => {
    runner.init();
    allowConsoleError(() => {
      expect(() => {
        runner.init();
      }).to.throw();
    });
  });

  it('should set vars on start', () => {
    const vars = {
      '--var1': '1px',
      '--var2': '2s',
    };
    runner = new NativeWebAnimationRunner([
      {vars, target: target1, keyframes: keyframes1, timing: timing1},
    ]);
    target1Mock
      .expects('animate')
      .withExactArgs(keyframes1, timing1)
      .returns(anim1)
      .once();

    runner.start();
    expect(target1.style['--var1']).to.equal('1px');
    expect(target1.style['--var2']).to.equal('2s');
  });

  it('should complete all animations are complete', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim2.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.FINISHED);

    expect(playStateSpy).to.be.calledTwice;
    expect(playStateSpy.args[0][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[1][0]).to.equal(WebAnimationPlayState.FINISHED);
  });

  it('should pause all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').callThrough().once();
    anim2Mock.expects('pause').callThrough().once();
    runner.pause();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);
  });

  it('should only allow pause when started', () => {
    allowConsoleError(() => {
      expect(() => {
        runner.pause();
      }).to.throw();
    });
  });

  it('should resume all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').callThrough().once();
    anim2Mock.expects('pause').callThrough().once();
    runner.pause();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);

    anim1Mock.expects('play').callThrough().once();
    anim2Mock.expects('play').callThrough().once();
    runner.resume();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim2.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.FINISHED);

    expect(playStateSpy.callCount).to.equal(4);
    expect(playStateSpy.args[0][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[1][0]).to.equal(WebAnimationPlayState.PAUSED);
    expect(playStateSpy.args[2][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[3][0]).to.equal(WebAnimationPlayState.FINISHED);
  });

  it('should not resume partially finished animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').callThrough().never();
    anim2Mock.expects('pause').callThrough().once();
    runner.pause();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);

    anim1Mock.expects('play').callThrough().never();
    anim2Mock.expects('play').callThrough().once();
    runner.resume();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim2.finish();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.FINISHED);

    expect(playStateSpy.callCount).to.equal(4);
    expect(playStateSpy.args[0][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[1][0]).to.equal(WebAnimationPlayState.PAUSED);
    expect(playStateSpy.args[2][0]).to.equal(WebAnimationPlayState.RUNNING);
    expect(playStateSpy.args[3][0]).to.equal(WebAnimationPlayState.FINISHED);
  });

  it('should only allow resume when started', () => {
    allowConsoleError(() => {
      expect(() => {
        runner.resume();
      }).to.throw();
    });
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
    allowConsoleError(() => {
      expect(() => {
        runner.reverse();
      }).to.throw();
    });
  });

  it('should finish all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('finish').callThrough().once();
    anim2Mock.expects('finish').callThrough().once();
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

  it('should seek all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    anim1Mock.expects('pause').callThrough().once();
    anim2Mock.expects('pause').callThrough().once();
    runner.seekTo(101);
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);
    expect(anim1.currentTime).to.equal(101);
    expect(anim2.currentTime).to.equal(101);
  });

  it('should seek percent all animations', () => {
    runner.start();
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.RUNNING);

    env.sandbox.stub(runner, 'getTotalDuration_').returns(500);
    anim1Mock.expects('pause').callThrough().once();
    anim2Mock.expects('pause').callThrough().once();
    runner.seekToPercent(0.5);
    expect(runner.getPlayState()).to.equal(WebAnimationPlayState.PAUSED);
    expect(anim1.currentTime).to.equal(250);
    expect(anim2.currentTime).to.equal(250);
  });

  describe('total duration', () => {
    it('single request, 0 total', () => {
      const timing = {
        duration: 0,
        delay: 0,
        endDelay: 0,
        iterations: 1,
        iterationStart: 0,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);
      expect(runner.getTotalDuration_()).to.equal(0);
    });

    it('single request, 0 iteration', () => {
      const timing = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 0,
        iterationStart: 0,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);

      // 200 for delays
      expect(runner.getTotalDuration_()).to.equal(200);
    });

    it('single request, 1 iteration', () => {
      const timing = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 1,
        iterationStart: 0,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);
      expect(runner.getTotalDuration_()).to.equal(300);
    });

    it('single request, multiple iterations', () => {
      const timing = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 3,
        iterationStart: 0,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);
      expect(runner.getTotalDuration_()).to.equal(500); // 3*100 + 100 + 100
    });

    it('single request, multiple iterations with iterationStart', () => {
      const timing = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 3,
        iterationStart: 2.5,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);
      // iterationStart is 2.5, the first 2.5 out of 3 iterations are ignored.
      expect(runner.getTotalDuration_()).to.equal(250); // 0.5*100 + 100 + 100
    });

    it('single request, infinite iteration', () => {
      const timing = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 'infinity',
        iterationStart: 0,
      };
      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing},
      ]);
      allowConsoleError(() => {
        expect(() => runner.getTotalDuration_()).to.throw(/has infinite/);
      });
    });

    it('multiple requests - 0 total', () => {
      // 0 because iteration is 0
      const timing1 = {
        duration: 100,
        delay: 0,
        endDelay: 0,
        iterations: 0,
        iterationStart: 0,
      };

      // 0 because duration is 0
      const timing2 = {
        duration: 0,
        delay: 0,
        endDelay: 0,
        iterations: 1,
        iterationStart: 0,
      };

      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing: timing1},
        {target: target1, keyframes: keyframes1, timing: timing2},
      ]);

      expect(runner.getTotalDuration_()).to.equal(0);
    });

    it('multiple requests - bigger by duration', () => {
      // 300
      const timing1 = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 1,
        iterationStart: 0,
      };

      // 500 - bigger
      const timing2 = {
        duration: 300,
        delay: 100,
        endDelay: 100,
        iterations: 1,
        iterationStart: 0,
      };

      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing: timing1},
        {target: target1, keyframes: keyframes1, timing: timing2},
      ]);

      expect(runner.getTotalDuration_()).to.equal(500);
    });

    it('multiple requests - bigger by iteration', () => {
      // 800 - bigger
      const timing1 = {
        duration: 200,
        delay: 100,
        endDelay: 100,
        iterations: 3,
        iterationStart: 0,
      };

      // 500
      const timing2 = {
        duration: 300,
        delay: 100,
        endDelay: 100,
        iterations: 1,
        iterationStart: 0,
      };

      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing: timing1},
        {target: target1, keyframes: keyframes1, timing: timing2},
      ]);

      expect(runner.getTotalDuration_()).to.equal(800);
    });

    it('multiple request, infinite iteration', () => {
      const timing1 = {
        duration: 100,
        delay: 100,
        endDelay: 100,
        iterations: 'infinity',
        iterationStart: 0,
      };

      // 500
      const timing2 = {
        duration: 300,
        delay: 100,
        endDelay: 100,
        iterations: 1,
        iterationStart: 0,
      };

      const runner = new NativeWebAnimationRunner([
        {target: target1, keyframes: keyframes1, timing: timing1},
        {target: target1, keyframes: keyframes1, timing: timing2},
      ]);

      allowConsoleError(() => {
        expect(() => runner.getTotalDuration_()).to.throw(/has infinite/);
      });
    });
  });
});
