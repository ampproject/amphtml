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

import * as sinon from 'sinon';
import {Bind} from '../bind-impl';
import {BindExpression} from '../bind-expression';
import {BindValidator} from '../bind-validator';
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {installTimerService} from '../../../../src/service/timer-impl';
import {toArray} from '../../../../src/types';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';

describes.realWin('Bind', {
  amp: {
    runtimeOn: false,
  },
}, env => {
  let bind;

  // BindValidator method stubs.
  let canBindStub;

  beforeEach(() => {
    installTimerService(env.win);
    toggleExperiment(env.win, 'amp-bind', true);

    // Stub validator methods to return true for ease of testing.
    canBindStub = env.sandbox.stub(
        BindValidator.prototype, 'canBind').returns(true);
    env.sandbox.stub(
        BindValidator.prototype, 'isResultValid').returns(true);

    // Make sure we have a chunk instance for testing.
    chunkInstanceForTesting(env.ampdoc);

    bind = new Bind(env.ampdoc);
  });

  afterEach(() => {
    toggleExperiment(env.win, 'amp-bind', false);
  });

  /**
   * @param {string} binding
   * @param {string=} opt_tagName
   * @return {!Element}
   */
  function createElementWithBinding(binding, opt_tagName) {
    const tag = opt_tagName || 'p';
    const div = env.win.document.createElement('div');
    div.innerHTML = `<${tag} ${binding}></${tag}>`;
    const newElement = div.firstElementChild;
    const parent = env.win.document.getElementById('parent');
    parent.appendChild(newElement);
    return newElement;
  }

  /**
   * @param {!string} binding
   * @return {!Element}
   */
  function createAmpElementWithBinding(binding) {
    const parent = env.win.document.getElementById('parent');
    const ampCss = 'i-amphtml-foo -amp-foo amp-foo';
    parent.innerHTML = `<p class="${ampCss}" ${binding}></p>`;
    const fakeAmpElement = parent.firstElementChild;
    fakeAmpElement.mutatedAttributesCallback = () => {};
    return fakeAmpElement;
  }

  /**
   * Resolves when Bind service is fully initialized.
   * @return {!Promise}
   */
  function onBindReady() {
    return bind.initializePromiseForTesting().then(() => {
      env.flushVsync();
    });
  }

  /**
   * Calls `callback` when digest that updates bind state to `state` completes.
   * @param {!Object} state
   * @param {boolean=} opt_fromAmpState
   * @return {!Promise}
   */
  function onBindReadyAndSetState(state, opt_fromAmpState) {
    return bind.initializePromiseForTesting().then(() => {
      return bind.setState(state, opt_fromAmpState);
    }).then(() => {
      env.flushVsync();
      return bind.setStatePromiseForTesting();
    });
  }

  /**
   * Calls `callback` when digest that updates bind state to `state` completes.
   * @param {!Object} state
   * @param {!Function} callback
   * @return {!Promise}
   */
  function onBindReadyAndSetStateWithExpression(expression, scope) {
    return bind.setStateWithExpression(expression, scope).then(() => {
      env.flushVsync();
    });
  }

  /**
   * @param {string} name
   * @return {!Promise}
   */
  function waitForEvent(name) {
    return new Promise(resolve => {
      function callback() {
        resolve();
        env.win.removeEventListener(callback);
      };
      env.win.addEventListener(name, callback);
    });
  }

  it('should throw error if experiment is not enabled', () => {
    toggleExperiment(env.win, 'amp-bind', false);
    // Experiment check is bypassed on test mode -- make sure it isn't.
    window.AMP_MODE = {test: false};
    expect(() => {
      new Bind(env.ampdoc);
    }).to.throw('Experiment "amp-bind" is disabled.');
  });

  it('should scan for bindings when ampdoc is ready', () => {
    createElementWithBinding('[onePlusOne]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should have same state after removing + re-adding a subtree', () => {
    const doc = env.win.document;
    for (let i = 0; i < 5; i++) {
      createElementWithBinding('[onePlusOne]="1+1"');
    }
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(5);
      return bind.removeBindingsForNode_(doc.getElementById('parent'));
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      return bind.addBindingsForNode_(doc.getElementById('parent'));
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(5);
    });
  });

  it('should dynamically detect new bindings under dynamic tags', () => {
    const doc = env.win.document;
    const parent = doc.getElementById('parent');
    const dynamicTag = doc.createElement('div');
    parent.appendChild(dynamicTag);
    parent.getDynamicElementContainers = () => {
      return [dynamicTag];
    };
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      const elementWithBinding = createElementWithBinding('[onePlusOne]="1+1"');
      dynamicTag.appendChild(elementWithBinding);
      return waitForEvent('amp:bind:mutated');
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should NOT apply expressions on first load', () => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReady().then(() => {
      expect(element.getAttribute('onePlusOne')).to.equal(null);
    });
  });

  it('should verify class bindings in dev mode', () => {
    window.AMP_MODE = {development: true};
    createElementWithBinding(`[class]="'foo'" class="foo"`);
    createElementWithBinding(`[class]="'foo'" class=" foo "`);
    createElementWithBinding(`[class]="''"`);
    createElementWithBinding(`[class]="'bar'" class="qux"`); // Error.
    const errorStub = env.sandbox.stub(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorStub).to.be.calledOnce;
      expect(errorStub).calledWithMatch(/bar/);
    });
  });

  it('should verify string attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true};
    // Only the initial value for [a] binding does not match.
    createElementWithBinding('[a]="a" [b]="b" b="b"');
    const errorStub = env.sandbox.stub(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorStub).to.be.calledOnce;
    });
  });

  it('should verify boolean attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true};
    // Only the initial value for [c] binding does not match.
    createElementWithBinding(`a [a]="true" [b]="false" c="false" [c]="false"`);
    const errorStub = env.sandbox.stub(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorStub).to.be.calledOnce;
    });
  });

  it('should skip digest if specified in setState()', () => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReady().then(() => {
      bind.setState({}, /* opt_skipDigest */ true);
      env.flushVsync();
      expect(element.getAttribute('onePlusOne')).to.equal(null);
    });
  });

  it('should support binding to string attributes', () => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('onePlusOne')).to.equal('2');
    });
  });

  it('should support binding to boolean attributes', () => {
    const element =
        createElementWithBinding('[true]="true" [false]="false" false');
    expect(element.getAttribute('true')).to.equal(null);
    expect(element.getAttribute('false')).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('true')).to.equal('');
      expect(element.getAttribute('false')).to.equal(null);
    });
  });

  it('should support binding to Node.textContent', () => {
    const element = createElementWithBinding(`[text]="'a' + 'b' + 'c'"`);
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.textContent).to.equal('abc');
    });
  });

  it('should support binding to CSS classes with strings', () => {
    const element = createElementWithBinding(`[class]="['abc']"`);
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['abc']);
    });
  });

  it('should support binding to CSS classes with arrays', () => {
    const element = createElementWithBinding(`[class]="['a','b']"`);
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['a', 'b']);
    });
  });

  it('should support parsing exprs in `setStateWithExpression`', () => {
    const element = createElementWithBinding(`[text]="onePlusOne"`);
    expect(element.textContent).to.equal('');
    const promise = onBindReadyAndSetStateWithExpression(
        '{"onePlusOne": one + one}', {one: 1});
    return promise.then(() => {
      expect(element.textContent).to.equal('2');
    });
  });

  it('should ignore <amp-state> updates if specified in `setState`', () => {
    const element = createElementWithBinding(`[src]="foo"`, 'amp-state');
    expect(element.getAttribute('src')).to.be.null;
    const promise = onBindReadyAndSetState(
        {foo: '/foo'}, /* opt_isAmpStateMutation */ true);
    return promise.then(() => {
      // Should _not_ be updated if `opt_isAmpStateMutation` is true.
      expect(element.getAttribute('src')).to.be.null;
    });
  });

  it('should support NOT override internal AMP CSS classes', () => {
    const element = createAmpElementWithBinding(`[class]="['abc']"`);
    expect(toArray(element.classList)).to.deep.equal(
        ['i-amphtml-foo', '-amp-foo', 'amp-foo']);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(
          ['i-amphtml-foo', '-amp-foo', 'amp-foo', 'abc']);
    });
  });

  it('should call mutatedAttributesCallback on AMP elements', () => {
    const binding = '[onePlusOne]="1+1" [twoPlusTwo]="2+2" twoPlusTwo="4"'
        + '[add]="true" alreadyAdded [alreadyAdded]="true"'
        + 'remove [remove]="false" [nothingToRemove]="false"';
    const element = createAmpElementWithBinding(binding);
    const spy = env.sandbox.spy(element, 'mutatedAttributesCallback');
    return onBindReadyAndSetState({}).then(() => {
      // Attribute names are automatically lower-cased.
      expect(spy).calledWithMatch({
        oneplusone: 2,
        add: true,
        remove: false,
      });
      // Callback shouldn't include attributes whose values haven't changed.
      expect(spy.neverCalledWithMatch({
        twoplustwo: 4,
        alreadyadded: true,
        nothingtoremove: false,
      })).to.be.true; // sinon-chai doesn't support "never" API.
    });
  });

  it('should support scope variable references', () => {
    const binding = `[text]="foo + bar + baz.qux.join(',')"`;
    const element = createElementWithBinding(binding);
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState({
      foo: 'abc',
      bar: 123,
      baz: {
        qux: ['x', 'y', 'z'],
      },
    }).then(() => {
      expect(element.textContent).to.equal('abc123x,y,z');
    });
  });

  it('should NOT mutate elements if expression result is unchanged', () => {
    const binding = `[onePlusOne]="1+1" [class]="'abc'" [text]="'a'+'b'"`;
    const element = createElementWithBinding(binding);
    return onBindReadyAndSetState({}).then(() => {
      expect(element.textContent.length).to.not.equal(0);
      expect(element.classList.length).to.not.equal(0);
      expect(element.attributes.length).to.not.equal(0);

      element.textContent = '';
      element.className = '';
      while (element.attributes.length > 0) {
        element.removeAttribute(element.attributes[0].name);
      }

      bind.setState({});
      env.flushVsync();

      expect(element.textContent).to.equal('');
      expect(element.className).to.equal('');
      expect(element.attributes.length).to.equal(0);
    });
  });

  it('should only evaluate duplicate expressions once', () => {
    createElementWithBinding(`[a]="1+1" [b]="1+1"`);
    const stub = env.sandbox.stub(BindExpression.prototype, 'evaluate');
    stub.returns('stubbed');
    return onBindReadyAndSetState({}).then(() => {
      expect(stub.calledOnce).to.be.true;
    });
  });

  it('should NOT evaluate expression if binding is NOT allowed', () => {
    canBindStub.returns(false);
    const element = createElementWithBinding(`[onePlusOne]="1+1"`);
    return onBindReadyAndSetState({}).then(() => {
      expect(canBindStub.calledOnce).to.be.true;
      expect(element.getAttribute('oneplusone')).to.be.null;
    });
  });

  it('should rewrite attribute values regardless of result type', () => {
    const withString = createElementWithBinding(`[href]="foo"`, 'a');
    const withArray = createElementWithBinding(`[href]="bar"`, 'a');
    return onBindReadyAndSetState({
      foo: '?__amp_source_origin',
      bar: ['?__amp_source_origin'],
    }).then(() => {
      expect(withString.getAttribute('href')).to.equal(null);
      expect(withArray.getAttribute('href')).to.equal(null);
    });
  });

  it('should stop scanning once maximum number of bindings is reached', () => {
    bind.setMaxNumberOfBindingsForTesting(2);
    const errorStub = env.sandbox.stub(user(), 'error');

    const foo = createElementWithBinding(`[foo]="foo"`);
    const bar = createElementWithBinding(`[bar]="bar" [baz]="baz"`);
    const qux = createElementWithBinding(`[qux]="qux"`);

    return onBindReadyAndSetState({foo: 1, bar: 2, baz: 3, qux: 4}).then(() => {
      expect(foo.getAttribute('foo')).to.equal('1');
      expect(bar.getAttribute('bar')).to.equal('2');
      // Max number of bindings exceeded with [baz].
      expect(bar.getAttribute('baz')).to.be.null;
      expect(qux.getAttribute('qux')).to.be.null;

      expect(errorStub).to.have.been.calledWith('amp-bind',
          sinon.match(/Maximum number of bindings reached/));
    });
  });
});
