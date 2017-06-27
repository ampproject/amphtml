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
import {AmpEvents} from '../../../../src/amp-events';
import {Bind} from '../bind-impl';
import {BindEvents} from '../bind-events';
import {chunkInstanceForTesting} from '../../../../src/chunk';
import {toArray} from '../../../../src/types';
import {user} from '../../../../src/log';

/**
 * @param {!Object} env
 * @param {!Element} container
 * @param {string} binding
 * @param {string=} opt_tagName
 * @param {boolean=} opt_amp
 * @return {!Element}
 */
function createElement(env, container, binding, opt_tagName, opt_amp) {
  const tag = opt_tagName || 'p';
  const div = env.win.document.createElement('div');
  div.innerHTML = `<${tag} ${binding}></${tag}>`;
  const newElement = div.firstElementChild;
  if (opt_amp) {
    newElement.className = 'i-amphtml-foo -amp-foo amp-foo';
    newElement.mutatedAttributesCallback = () => {};
  }
  container.appendChild(newElement);
  return newElement;
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @return {!Promise}
 */
function onBindReady(env, bind) {
  return bind.initializePromiseForTesting().then(() => {
    env.flushVsync();
  });
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @param {!Object} state
 * @param {boolean=} opt_isAmpStateMutation
 * @return {!Promise}
 */
function onBindReadyAndSetState(env, bind, state, opt_isAmpStateMutation) {
  return bind.initializePromiseForTesting().then(() => {
    return bind.setState(
        state, /* opt_skipEval */ undefined, opt_isAmpStateMutation);
  }).then(() => {
    env.flushVsync();
    return bind.setStatePromiseForTesting();
  });
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @param {string} expression
 * @param {!Object} scope
 * @return {!Promise}
 */
function onBindReadyAndSetStateWithExpression(env, bind, expression, scope) {
  return bind.setStateWithExpression(expression, scope).then(() => {
    env.flushVsync();
  });
}

/**
 * @param {!Object} env
 * @param {string} name
 * @return {!Promise}
 */
function waitForEvent(env, name) {
  return new Promise(resolve => {
    function callback() {
      resolve();
      env.win.removeEventListener(name, callback);
    };
    env.win.addEventListener(name, callback);
  });
}

describes.realWin('Bind in FIE', {
  amp: {
    ampdoc: 'fie',
    runtimeOn: false,
  },
}, env => {
  let bind;
  let container;

  beforeEach(() => {
    // Make sure we have a chunk instance for testing.
    chunkInstanceForTesting(env.ampdoc);

    bind = new Bind(env.ampdoc, env.win);
    container = env.embed.getBodyElement();
  });

  it('should scan for bindings when ampdoc is ready', () => {
    createElement(env, container, '[text]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady(env, bind).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  describe('with Bind in parent window', () => {
    let parentBind;
    let parentContainer;

    beforeEach(() => {
      parentBind = new Bind(env.ampdoc);
      parentContainer = env.ampdoc.getBody();
    });

    it('should only scan elements in provided window', () => {
      createElement(env, container, '[text]="1+1"');
      createElement(env, parentContainer, '[text]="2+2"');
      return Promise.all([
        onBindReady(env, bind),
        onBindReady(env, parentBind),
      ]).then(() => {
        expect(bind.boundElements_.length).to.equal(1);
        expect(parentBind.boundElements_.length).to.equal(1);
      });
    });

    it('should not be able to access variables from other windows', () => {
      const element =
          createElement(env, container, '[text]="foo + bar"');
      const parentElement =
          createElement(env, parentContainer, '[text]="foo + bar"');
      const promises = [
        onBindReadyAndSetState(env, bind, {foo: '123', bar: '456'}),
        onBindReadyAndSetState(env, parentBind, {foo: 'ABC', bar: 'DEF'}),
      ];
      return Promise.all(promises).then(() => {
        // `element` only sees `foo` and `parentElement` only sees `bar`.
        expect(element.textContent).to.equal('123456');
        expect(parentElement.textContent).to.equal('ABCDEF');
      });
    });
  });
});

describes.realWin('Bind in shadow ampdoc', {
  amp: {
    ampdoc: 'shadow',
    runtimeOn: false,
  },
}, env => {
  let bind;
  let container;

  beforeEach(() => {
    // Make sure we have a chunk instance for testing.
    chunkInstanceForTesting(env.ampdoc);

    bind = new Bind(env.ampdoc);
    container = env.ampdoc.getBody();
  });

  it('should scan for bindings when ampdoc is ready', () => {
    createElement(env, container, '[text]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady(env, bind).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });
});

describes.realWin('Bind in single ampdoc', {
  amp: {
    ampdoc: 'single',
    runtimeOn: false,
  },
}, env => {
  let bind;
  let container;

  beforeEach(() => {
    // Make sure we have a chunk instance for testing.
    chunkInstanceForTesting(env.ampdoc);

    bind = new Bind(env.ampdoc);
    // Connected <div> element created by describes.js.
    container = env.win.document.getElementById('parent');
  });

  it('should scan for bindings when ampdoc is ready', () => {
    createElement(env, container, '[text]="1+1"');
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady(env, bind).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should have same state after removing + re-adding a subtree', () => {
    for (let i = 0; i < 5; i++) {
      createElement(env, container, '[text]="1+1"');
    }
    expect(bind.boundElements_.length).to.equal(0);
    return onBindReady(env, bind).then(() => {
      expect(bind.boundElements_.length).to.equal(5);
      return bind.removeBindingsForNode_(container);
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      return bind.addBindingsForNode_(container);
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(5);
    });
  });

  it('should dynamically detect new bindings under dynamic tags', () => {
    const doc = env.win.document;
    const dynamicTag = doc.createElement('div');
    container.appendChild(dynamicTag);
    return onBindReady(env, bind).then(() => {
      expect(bind.boundElements_.length).to.equal(0);
      const element = createElement(env, container, '[text]="1+1"');
      dynamicTag.appendChild(element);
      dynamicTag.dispatchEvent(
          new Event(AmpEvents.TEMPLATE_RENDERED, {bubbles: true}));
      return waitForEvent(env, BindEvents.RESCAN_TEMPLATE);
    }).then(() => {
      expect(bind.boundElements_.length).to.equal(1);
    });
  });

  it('should NOT apply expressions on first load', () => {
    const element = createElement(env, container, '[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReady(env, bind).then(() => {
      expect(element.textContent).to.equal('');
    });
  });

  it('should verify class bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    createElement(env, container, '[class]="\'foo\'" class="foo"');
    createElement(env, container, '[class]="\'foo\'" class=" foo "');
    createElement(env, container, '[class]="\'\'"');
    createElement(env, container, '[class]="\'bar\'" class="qux"'); // Error
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady(env, bind).then(() => {
      expect(errorSpy).to.be.calledOnce;
      expect(errorSpy).calledWithMatch(/bar/);
    });
  });

  it('should verify string attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    // Only the initial value for [a] binding does not match.
    createElement(env, container, '[text]="\'a\'" [class]="\'b\'" class="b"');
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady(env, bind).then(() => {
      expect(errorSpy).to.be.calledOnce;
    });
  });

  it('should verify boolean attribute bindings in dev mode', () => {
    window.AMP_MODE = {development: true, test: true};
    createElement(env, container, '[disabled]="true" disabled', 'button');
    createElement(env, container, '[disabled]="false"', 'button');
    createElement(env, container, '[disabled]="true"', 'button'); // Mismatch.
    const errorSpy = env.sandbox.spy(user(), 'createError');
    return onBindReady(env, bind).then(() => {
      expect(errorSpy).to.be.calledOnce;
    });
  });

  it('should skip digest if specified in setState()', () => {
    const element = createElement(env, container, '[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReady(env, bind).then(() => {
      bind.setState({}, /* opt_skipDigest */ true);
      env.flushVsync();
      expect(element.textContent).to.equal('');
    });
  });

  it('should support binding to string attributes', () => {
    const element = createElement(env, container, '[text]="1+1"');
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(element.textContent).to.equal('2');
    });
  });

  it('should support binding to boolean attributes', () => {
    const element = createElement(env,
        container,
        '[checked]="true" [disabled]="false" disabled',
        /* opt_tagName */ 'input');
    expect(element.getAttribute('checked')).to.equal(null);
    expect(element.getAttribute('disabled')).to.equal('');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(element.getAttribute('checked')).to.equal('');
      expect(element.getAttribute('disabled')).to.equal(null);
    });
  });

  it('should support binding to Node.textContent', () => {
    const element = createElement(
        env, container, '[text]="\'a\' + \'b\' + \'c\'"');
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(element.textContent).to.equal('abc');
    });
  });

  it('should support binding to CSS classes with strings', () => {
    const element = createElement(env, container, '[class]="[\'abc\']"');
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['abc']);
    });
  });

  it('should support binding to CSS classes with arrays', () => {
    const element = createElement(env, container, '[class]="[\'a\',\'b\']"');
    expect(toArray(element.classList)).to.deep.equal([]);
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(['a', 'b']);
    });
  });

  it('should support parsing exprs in `setStateWithExpression`', () => {
    const element = createElement(env, container, '[text]="onePlusOne"');
    expect(element.textContent).to.equal('');
    const promise = onBindReadyAndSetStateWithExpression(
        env, bind, '{"onePlusOne": one + one}', {one: 1});
    return promise.then(() => {
      expect(element.textContent).to.equal('2');
    });
  });

  it('should ignore <amp-state> updates if specified in `setState`', () => {
    const element = createElement(env, container, '[src]="foo"', 'amp-state');
    expect(element.getAttribute('src')).to.be.null;
    const promise = onBindReadyAndSetState(env, bind,
        {foo: '/foo'}, /* opt_isAmpStateMutation */ true);
    return promise.then(() => {
      // Should _not_ be updated if `opt_isAmpStateMutation` is true.
      expect(element.getAttribute('src')).to.be.null;
    });
  });

  it('should support NOT override internal AMP CSS classes', () => {
    const element = createElement(env, container, '[class]="[\'abc\']"',
        /* opt_tagName */ undefined, /* opt_amp */ true);
    expect(toArray(element.classList)).to.deep.equal(
        ['i-amphtml-foo', '-amp-foo', 'amp-foo']);
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(toArray(element.classList)).to.deep.equal(
          ['i-amphtml-foo', '-amp-foo', 'amp-foo', 'abc']);
    });
  });

  it('should call mutatedAttributesCallback on AMP elements', () => {
    const binding = '[text]="1+1" [value]="\'4\'" value="4" '
        + 'checked [checked]="false" [disabled]="true" [multiple]="false"';
    const element = createElement(env, container, binding,
        /* opt_tagName */ 'input', /* opt_amp */ true);
    const spy = env.sandbox.spy(element, 'mutatedAttributesCallback');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
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
    const binding = '[text]="foo + bar + baz.qux.join(\',\')"';
    const element = createElement(env, container, binding);
    expect(element.textContent).to.equal('');
    return onBindReadyAndSetState(env, bind, {
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
    const binding = '[value]="1+1" [class]="\'abc\'" [text]="\'a\'+\'b\'"';
    const element = createElement(env, container, binding, 'input');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
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
    const element = createElement(env, container, '[invalidBinding]="1+1"');
    return onBindReadyAndSetState(env, bind, {}).then(() => {
      expect(element.getAttribute('invalidbinding')).to.be.null;
    });
  });

  it('should rewrite attribute values regardless of result type', () => {
    const withString = createElement(env, container, '[href]="foo"', 'a');
    const withArray = createElement(env, container, '[href]="bar"', 'a');
    return onBindReadyAndSetState(env, bind, {
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

    const foo = createElement(env, container, '[text]="foo"');
    const bar = createElement(env, container, '[text]="bar" [class]="baz"');
    const qux = createElement(env, container, '[text]="qux"');

    return onBindReadyAndSetState(env, bind, {
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
});
