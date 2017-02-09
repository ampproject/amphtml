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
import {BindExpression} from '../bind-expression';
import {BindValidator} from '../bind-validator';
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {toArray} from '../../../../src/types';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';

describes.realWin('amp-bind', {
  amp: {
    runtimeOn: false,
  },
}, env => {
  let bind;

  // BindValidator method stubs.
  let canBindStub;

  beforeEach(() => {
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
   * @param {!string} binding
   * @return {!Element}
   */
  function createElementWithBinding(binding) {
    const div = env.win.document.createElement('div');
    div.innerHTML = '<p ' + binding + '></p>';
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
   * Calls `callback` when Bind's DOM scan and optional verify completes.
   * @return {!Promise}
   */
  function onBindReady() {
    return env.ampdoc.whenReady().then(() => {
      return bind.scanPromise_;
    }).then(() => {
      if (bind.evaluatePromise_) {
        return bind.evaluatePromise_.then(() => {
          env.flushVsync();
        });
      }
    });
  }

  /**
   * Calls `callback` when digest that updates bind state to `state` completes.
   * @param {!Object} state
   * @return {!Promise}
   */
  function onBindReadyAndSetState(state) {
    return env.ampdoc.whenReady().then(() => {
      return bind.scanPromise_;
    }).then(() => {
      bind.setState(state);
      return bind.evaluatePromise_;
    }).then(() => {
      env.flushVsync();
    });
  }

  it('should throw error if experiment is not enabled', () => {
    toggleExperiment(env.win, 'amp-bind', false);
    expect(() => {
      new Bind(env.ampdoc);
    }).to.throw('Experiment "amp-bind" is disabled.');
  });

  it('should scan for bindings when ampdoc is ready', done => {
    createElementWithBinding('[onePlusOne]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(1);
      done();
    });
  });

  it('should have same state after removing + re-adding a subtree', done => {
    for (let i = 0; i < 5; i++) {
      createElementWithBinding('[onePlusOne]="1+1"');
    }
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(5);
      return bind
        .removeBindingsForNode_(env.win.document.getElementById('parent'));
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      return bind
        .addBindingsForNode_(env.win.document.getElementById('parent'));
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(5);
      done();
    });
  });

  it('should NOT apply expressions on first load', done => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReady().then(() => {
      expect(element.getAttribute('onePlusOne')).to.equal(null);
      done();
    });
  });

  it('should verify string attribute bindings in dev mode', done => {
    env.sandbox.stub(window, 'AMP_MODE', {development: true});
    // Only the initial value for [a] binding does not match.
    createElementWithBinding('[a]="a" [b]="b" b="b"');
    const errorStub = env.sandbox.stub(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorStub).to.be.calledOnce;
      done();
    });
  });

  it('should verify boolean attribute bindings in dev mode', done => {
    env.sandbox.stub(window, 'AMP_MODE', {development: true});
    // Only the initial value for [c] binding does not match.
    createElementWithBinding(`a [a]="true" [b]="false" c="false" [c]="false"`);
    const errorStub = env.sandbox.stub(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorStub).to.be.calledOnce;
      done();
    });
  });

  it('should skip digest if specified in setState()', done => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReady().then(() => {
      bind.setState({}, /* opt_skipDigest */ true);
      env.flushVsync();
      expect(element.getAttribute('onePlusOne')).to.equal(null);
      done();
    });
  });

  it('should support binding to string attributes', done => {
    const element = createElementWithBinding('[onePlusOne]="1+1"');
    expect(element.getAttribute('onePlusOne')).to.equal(null);
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('onePlusOne')).to.equal('2');
      done();
    });
  });

  it('should support binding to boolean attributes', done => {
    const element =
        createElementWithBinding('[true]="true" [false]="false" false');
    expect(element.getAttribute('true')).to.equal(null);
    expect(element.getAttribute('false')).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('true')).to.equal('');
      expect(element.getAttribute('false')).to.equal(null);
      done();
    });
  });

  it('should support binding to Node.textContent', done => {
    const element = createElementWithBinding(`[text]="'a' + 'b' + 'c'"`);
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.textContent).to.equal('abc');
      done();
    });
  });

  it('should support binding to CSS classes with strings', done => {
    const element = createElementWithBinding(`[class]="['abc']"`);
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['abc']);
      done();
    });
  });

  it('should support binding to CSS classes with arrays', done => {
    const element = createElementWithBinding(`[class]="['a','b']"`);
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['a', 'b']);
      done();
    });
  });

  it('should support NOT override internal AMP CSS classes', done => {
    const element = createAmpElementWithBinding(`[class]="['abc']"`);
    expect(toArray(element.classList)).to.deep.equal(
        ['i-amphtml-foo', '-amp-foo', 'amp-foo']);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(
          ['i-amphtml-foo', '-amp-foo', 'amp-foo', 'abc']);
      done();
    });
  });

  it('should call mutatedAttributesCallback on AMP elements', done => {
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
      done();
    });
  });

  it('should support scope variable references', done => {
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
      done();
    });
  });

  it('should NOT mutate elements if expression result is unchanged', done => {
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
      done();
    });
  });

  it('should only evaluate duplicate expressions once', done => {
    createElementWithBinding(`[a]="1+1" [b]="1+1"`);
    const stub = env.sandbox.stub(BindExpression.prototype, 'evaluate');
    stub.returns('stubbed');
    return onBindReadyAndSetState({}).then(() => {
      expect(stub.calledOnce).to.be.true;
      done();
    });
  });

  it('should NOT evaluate expression if binding is NOT allowed', done => {
    canBindStub.returns(false);
    const element = createElementWithBinding(`[onePlusOne]="1+1"`);
    return onBindReadyAndSetState({}).then(() => {
      expect(canBindStub.calledOnce).to.be.true;
      expect(element.getAttribute('oneplusone')).to.be.null;
      done();
    });
  });
});
