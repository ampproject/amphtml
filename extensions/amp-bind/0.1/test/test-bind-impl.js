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
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {installTimerService} from '../../../../src/service/timer-impl';
import {toArray} from '../../../../src/types';
import {toggleExperiment} from '../../../../src/experiments';
import {user} from '../../../../src/log';

////////////////////////////////////////////////////////////////////////////////
// Curried test helpers
////////////////////////////////////////////////////////////////////////////////

function createElementWithBinding_(parent, env) {
  /**
   * @param {string} binding
   * @param {string=} opt_tagName
   * @param {boolean=} opt_isAmpElement
   * @return {!Element}
   */
  return function(binding, opt_tagName, opt_isAmpElement) {
    const tag = opt_tagName || 'p';
    const div = env.win.document.createElement('div');
    div.innerHTML = `<${tag} ${binding}></${tag}>`;
    const newElement = div.firstElementChild;
    if (opt_isAmpElement) {
      newElement.className = 'i-amphtml-foo -amp-foo amp-foo';
      newElement.mutatedAttributesCallback = () => {};
    }
    parent.appendChild(newElement);
    return newElement;
  };
}

function onBindReady_(bind, env) {
  /**
   * @return {!Promise}
   */
  return function() {
    return bind.initializePromiseForTesting().then(() => {
      env.flushVsync();
    });
  };
}

function onBindReadyAndSetState_(bind, env) {
  /**
   * @param {!Object} state
   * @param {boolean=} opt_isAmpStateMutation
   * @return {!Promise}
   */
  return function(state, opt_isAmpStateMutation) {
    return bind.initializePromiseForTesting().then(() => {
      return bind.setState(
          state, /* opt_skipEval */ undefined, opt_isAmpStateMutation);
    }).then(() => {
      env.flushVsync();
      return bind.setStatePromiseForTesting();
    });
  };
}

function onBindReadyAndSetStateWithExpression_(bind, env) {
  /**
   * @param {string} expression
   * @param {!Object} scope
   * @return {!Promise}
   */
  return function(expression, scope) {
    return bind.setStateWithExpression(expression, scope).then(() => {
      env.flushVsync();
    });
  };
}

function waitForEvent_(bind, env) {
  /**
   * @param {string} name
   * @return {!Promise}
   */
  return function(name) {
    return new Promise(resolve => {
      function callback() {
        resolve();
        env.win.removeEventListener(name, callback);
      };
      env.win.addEventListener(name, callback);
    });
  };
}

////////////////////////////////////////////////////////////////////////////////
// Unit tests
////////////////////////////////////////////////////////////////////////////////

describes.realWin('Bind', {
  amp: {
    runtimeOn: false,
  },
}, env => {
  let bind;
  let parent; // A connected <div> created by describes.

  let createElementWithBinding;
  let onBindReady;
  let onBindReadyAndSetState;
  let onBindReadyAndSetStateWithExpression;
  let waitForEvent;

  beforeEach(() => {
    installTimerService(env.win);
    toggleExperiment(env.win, 'amp-bind', true);

    // Make sure we have a chunk instance for testing.
    chunkInstanceForTesting(env.ampdoc);

    bind = new Bind(env.ampdoc);
    parent = env.win.document.getElementById('parent');

    // TODO(choumx): Use better names in a follow-up PR.
    createElementWithBinding = createElementWithBinding_(parent, env);
    onBindReady = onBindReady_(bind, env);
    onBindReadyAndSetState = onBindReadyAndSetState_(bind, env);
    onBindReadyAndSetStateWithExpression =
        onBindReadyAndSetStateWithExpression_(bind, env);
    waitForEvent = waitForEvent_(bind, env);
  });

  afterEach(() => {
    toggleExperiment(env.win, 'amp-bind', false);
  });

  it('should throw error if experiment is not enabled', () => {
    toggleExperiment(env.win, 'amp-bind', false);
    // Experiment check is bypassed on test mode -- make sure it isn't.
    window.AMP_MODE = {test: false};
    expect(() => {
      new Bind(env.ampdoc);
    }).to.throw('Experiment "amp-bind" is disabled.');
  });

  it('should scan for bindings when ampdoc is ready', () => {
    createElementWithBinding('[text]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should have same state after removing + re-adding a subtree', () => {
    for (let i = 0; i < 5; i++) {
      createElementWithBinding('[text]="1+1"');
    }
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(5);
      return bind.removeBindingsForNode_(parent);
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      return bind.addBindingsForNode_(parent);
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(5);
    });
  });

  it('should dynamically detect new bindings under dynamic tags', () => {
    const doc = env.win.document;
    const dynamicTag = doc.createElement('div');
    parent.appendChild(dynamicTag);
    parent.getDynamicElementContainers = () => {
      return [dynamicTag];
    };
    return onBindReady().then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      const elementWithBinding = createElementWithBinding('[text]="1+1"');
      dynamicTag.appendChild(elementWithBinding);
      return waitForEvent('amp:bind:mutated');
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should NOT apply expressions on first load', () => {
    const element = createElementWithBinding('[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReady().then(() => {
      expect(element.textContent).to.equal('');
    });
  });

  it('should verify class bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    createElementWithBinding(`[class]="'foo'" class="foo"`);
    createElementWithBinding(`[class]="'foo'" class=" foo "`);
    createElementWithBinding(`[class]="''"`);
    createElementWithBinding(`[class]="'bar'" class="qux"`); // Error.
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorSpy).to.be.calledOnce;
      expect(errorSpy).calledWithMatch(/bar/);
    });
  });

  it('should verify string attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    // Only the initial value for [a] binding does not match.
    createElementWithBinding(`[text]="'a'" [class]="'b'" class="b"`);
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorSpy).to.be.calledOnce;
    });
  });

  it('should verify boolean attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    createElementWithBinding('[disabled]="true" disabled', 'button');
    createElementWithBinding('[disabled]="false"', 'button');
    createElementWithBinding('[disabled]="true"', 'button'); // Mismatch.
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady().then(() => {
      expect(errorSpy).to.be.calledOnce;
    });
  });

  it('should skip digest if specified in setState()', () => {
    const element = createElementWithBinding('[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReady().then(() => {
      bind.setState({}, /* opt_skipDigest */ true);
      env.flushVsync();
      expect(element.textContent).to.equal('');
    });
  });

  it('should support binding to string attributes', () => {
    const element = createElementWithBinding('[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.textContent).to.equal('2');
    });
  });

  it('should support binding to boolean attributes', () => {
    const element = createElementWithBinding(
        '[checked]="true" [disabled]="false" disabled',
        /* opt_tagName */ 'input');
    expect(element.getAttribute('checked')).to.equal(null);
    expect(element.getAttribute('disabled')).to.equal('');
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('checked')).to.equal('');
      expect(element.getAttribute('disabled')).to.equal(null);
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
    const element = createElementWithBinding(`[class]="['abc']"`,
        /* opt_tagName */ undefined, /* opt_isAmpElement */ true);
    expect(toArray(element.classList)).to.deep.equal(
        ['i-amphtml-foo', '-amp-foo', 'amp-foo']);
    return onBindReadyAndSetState({}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(
          ['i-amphtml-foo', '-amp-foo', 'amp-foo', 'abc']);
    });
  });

  it('should call mutatedAttributesCallback on AMP elements', () => {
    const binding = `[text]="1+1" [value]="'4'" value="4" `
        + `checked [checked]="false" [disabled]="true" [multiple]="false"`;
    const element = createElementWithBinding(binding,
        /* opt_tagName */ 'input', /* opt_isAmpElement */ true);
    const spy = env.sandbox.spy(element, 'mutatedAttributesCallback');
    return onBindReadyAndSetState({}).then(() => {
      expect(spy).calledWithMatch({
        checked: false,
        disabled: true,
      });
      // Callback shouldn't include global attributes (text, class) or those
      // whose values haven't changed.
      expect(spy.neverCalledWithMatch({
        text: 2,
        value: 4,
        multiple: false,
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
    const binding = `[value]="1+1" [class]="'abc'" [text]="'a'+'b'"`;
    const element = createElementWithBinding(binding, 'input');
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

  it('should NOT evaluate expression if binding is NOT allowed', () => {
    const element = createElementWithBinding(`[invalidBinding]="1+1"`);
    return onBindReadyAndSetState({}).then(() => {
      expect(element.getAttribute('invalidbinding')).to.be.null;
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

  it('should stop scanning once max number of bindings is reached', () => {
    bind.setMaxNumberOfBindingsForTesting(2);
    const errorStub = env.sandbox.stub(user(), 'error');

    const foo = createElementWithBinding(`[text]="foo"`);
    const bar = createElementWithBinding(`[text]="bar" [class]="baz"`);
    const qux = createElementWithBinding(`[text]="qux"`);

    return onBindReadyAndSetState({
      foo: 1, bar: 2, baz: 3, qux: 4,
    }).then(() => {
      expect(foo.textContent).to.equal('1');
      expect(bar.textContent).to.equal('2');
      // Max number of bindings exceeded with [baz].
      expect(bar.className).to.be.equal('');
      expect(qux.textContent).to.be.equal('');

      expect(errorStub).to.have.been.calledWith('amp-bind',
          sinon.match(/Maximum number of bindings reached/));
    });
  });

  describes.realWin('in embedded window', {
    amp: {
      runtimeOn: false,
    },
  }, otherEnv => {
    let otherBind;
    let otherParent;

    let otherElementWithBinding;
    let onOtherBindReady;
    let onOtherBindReadyAndSetState;

    beforeEach(() => {
      // `otherBind` mimics an adopted embed window of `bind` -- it shares an
      // ampdoc service instance but has a different root node and var scope.
      // @see Bind#adoptEmbedWindow
      otherBind = new Bind(env.ampdoc, otherEnv.win);
      otherParent = otherEnv.win.document.getElementById('parent');

      // TODO(choumx): Better names in a follow-up PR.
      otherElementWithBinding =
          createElementWithBinding_(otherParent, otherEnv);
      onOtherBindReady = onBindReady_(otherBind, otherEnv);
      onOtherBindReadyAndSetState =
          onBindReadyAndSetState_(otherBind, otherEnv);
    });

    it('should scan the elements in the provided window', () => {
      createElementWithBinding('[text]="1+1"');
      otherElementWithBinding('[text]="2+2"');

      expect(otherBind.boundElements_.length).to.equal(0);
      return onOtherBindReady().then(() => {
        // `otherBind` shouldn't detect the "1+1" binding.
        expect(otherBind.boundElements_.length).to.equal(1);
      });
    });

    it('should not be able to access variables from other windows', () => {
      const element = createElementWithBinding('[text]="foo + bar"');
      const otherElement =
          otherElementWithBinding('[text]="foo + bar"');

      const promises = [
        onBindReadyAndSetState({foo: '123'}),
        onOtherBindReadyAndSetState({bar: '456'}),
      ];

      return Promise.all(promises).then(() => {
        // `element` only sees `foo` and `otherElement` only sees `bar`.
        expect(element.textContent).to.equal('123null');
        expect(otherElement.textContent).to.equal('null456');
      });
    });
  });
});
