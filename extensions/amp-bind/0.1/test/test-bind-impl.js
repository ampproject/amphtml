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

import {Bind} from '../bind-impl';
import {getMode} from '../../../../src/mode';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';
import {vsyncFor} from '../../../../src/vsync';

describes.realWin('amp-bind', {
  amp: {
    runtimeOn: false,
  }
}, env => {
  let bind;
  let element;
  let vsync;

  beforeEach(() => {
    toggleExperiment(env.win, 'AMP-BIND', true);

    element = createElementWithBinding(env.win);
    bind = new Bind(env.ampdoc);
    vsync = vsyncFor(env.win);
  });

  afterEach(() => {
    toggleExperiment(env.win, 'AMP-BIND', false);
  });

  /**
   * @param {!Window} win
   * @return {!Element}
   */
  function createElementWithBinding(win) {
    const parent = win.document.getElementById('parent');
    const bindings = [
      `[onePlusOne]="1 + 1"`,
      `[boolean]="!false"`,
      `[class]="['a','b']"`,
      '[text]="foo + bar"',
    ];
    parent.innerHTML = '<button ' + bindings.join(' ') + '>Hello World</button>';
    return parent.firstElementChild;
  }

  /**
   * @param {!Function} fn
   * @return {!Promise<!Element>}
   */
  function bodyReady(fn) {
    return env.ampdoc.whenBodyAvailable().then(fn);
  }

  it('should throw error if experiment is not enabled', () => {
    toggleExperiment(env.win, 'AMP-BIND', false);
    expect(() => {
      new Bind(env.ampdoc);
    }).to.throw('Experiment "AMP-BIND" is disabled.');
  });

  it('should scan for bindings when body is available', () => {
    expect(bind.bindings_.length).to.equal(0);
    return bodyReady(unusedBody => {
      expect(bind.bindings_.length).to.equal(4);
    });
  });

  it('should NOT apply expressions on first load', () => {
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return bodyReady(unusedBody => {
      expect(element.getAttribute('onePlusOne')).to.equal(null);
    });
  });

  it('should verify initial values of bindings in dev mode', () => {
    const ampMode = window.AMP_MODE;
    window.AMP_MODE = {development: true};

    const errorStub = env.sandbox.stub(user(), 'error');
    new Bind(env.ampdoc);
    bodyReady(unusedBody => {
      env.flushVsync();
      window.AMP_MODE = ampMode;
      return expect(errorStub.callCount).to.equal(4);
    });
  });

  it('should apply expressions on scope state change', () => {
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return bodyReady(unusedBody => {
      bind.setState({});
      return vsync.mutatePromise(state => {
        expect(element.getAttribute('onePlusOne')).to.equal('2');
      });
    });
  });

  it('should support toggling of boolean attributes', () => {
    expect(element.getAttribute('boolean')).to.equal(null);
    return bodyReady(unusedBody => {
      bind.setState({});
      return vsync.mutatePromise(state => {
        expect(element.getAttribute('boolean')).to.equal('');
      });
    });
  });

  it('should support binding to Node.textContent', () => {
    expect(element.textContent).to.equal('Hello World');
    return bodyReady(unusedBody => {
      bind.setState({foo: 'foo', bar: 'bar'});
      return vsync.mutatePromise(state => {
        expect(element.textContent).to.equal('foobar');
      });
    });
  });
});
