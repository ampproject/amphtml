/**
 * @fileoverview "Unit" test for bind-impl.js. Runs as an integration test
 * because it requires building web-worker binary.
 */

import * as fakeTimers from '@sinonjs/fake-timers';

import {RAW_OBJECT_ARGS_KEY} from '#core/constants/action-constants';
import {AmpEvents_Enum} from '#core/constants/amp-events';
import {Deferred} from '#core/data-structures/promise';
import {toArray} from '#core/types/array';

import {Services} from '#service';

import {dev, user} from '#utils/log';

import {chunkInstanceForTesting} from '../../../../../src/chunk';
import {BindEvents} from '../../bind-events';
import {Bind} from '../../bind-impl';

/**
 * @param {!Object} env
 * @param {?Element} container
 * @param {string} binding
 * @param {string=} opts.tag Tag name of element (default is <p>).
 * @param {boolean=} opts.amp Is this an AMP element?
 * @param {boolean=} opts.insertInHead Add element to document <head>?
 * @param {boolean=} opts.insertQuerySelectorAttr Add i-amphtml-binding attribute to element?
 * @return {!Element}
 */
function createElement(env, container, binding, opts = {}) {
  const {
    amp = false,
    insertInHead = false,
    insertQuerySelectorAttr = false,
    tag = 'p',
  } = opts;
  const div = env.win.document.createElement('div');
  div.innerHTML = `<${tag} ${binding}></${tag}>`;
  const element = div.firstElementChild;

  if (amp) {
    element.className = 'i-amphtml-foo -amp-foo amp-foo';

    element.mutatedAttributesCallback = () => {};
  }

  if (insertQuerySelectorAttr) {
    element.setAttribute('i-amphtml-binding', '');
  }

  if (insertInHead) {
    env.win.document.head.appendChild(element);
  } else if (container) {
    container.appendChild(element);
  }
  return element;
}

/**
 * @param {!Object} env
 * @param {?Element} container
 * @param {string} id
 * @param {!Promise} valuePromise
 */
function addAmpState(env, container, id, fetchingPromise) {
  const ampState = env.win.document.createElement('amp-state');
  ampState.setAttribute('id', id);

  ampState.createdCallback = () => {};

  ampState.getImpl = () =>
    Promise.resolve({
      getFetchingPromise() {
        return fetchingPromise;
      },
      parseAndUpdate: () => {},
      element: ampState,
    });

  container.appendChild(ampState);
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
 * @param {boolean=} skipAmpState
 * @return {!Promise}
 */
function onBindReadyAndSetState(env, bind, state, skipAmpState) {
  return bind
    .initializePromiseForTesting()
    .then(() => {
      return bind.setState(state, {skipAmpState});
    })
    .then(() => {
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
  return bind
    .initializePromiseForTesting()
    .then(() => {
      return bind.setStateWithExpression(expression, scope);
    })
    .then(() => {
      env.flushVsync();
      return bind.setStatePromiseForTesting();
    });
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @param {!JsonObject} state
 * @return {!Promise}
 */
function onBindReadyAndSetStateWithObject(env, bind, state) {
  return bind
    .initializePromiseForTesting()
    .then(() => {
      return bind.setStateWithObject(state);
    })
    .then(() => {
      env.flushVsync();
      return bind.setStatePromiseForTesting();
    });
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @param {string} name
 * @return {!Promise}
 */
function onBindReadyAndGetState(env, bind, name) {
  return bind.initializePromiseForTesting().then(() => {
    env.flushVsync();
    return bind.getState(name);
  });
}

/**
 * @param {!Object} env
 * @param {!Bind} bind
 * @param {!Array<!Element>} added
 * @param {!Array<!Element>} removed
 * @param {!BindRescanOptions=} options
 * @return {!Promise}
 */
function onBindReadyAndRescan(env, bind, added, removed, options) {
  return bind
    .initializePromiseForTesting()
    .then(() => {
      return bind.rescan(added, removed, options);
    })
    .then(() => {
      env.flushVsync();
    });
}

/**
 * @param {!Object} env
 * @param {string} name
 * @return {!Promise}
 */
function waitForEvent(env, name) {
  return new Promise((resolve) => {
    const callback = () => {
      resolve();
      env.win.removeEventListener(name, callback);
    };

    env.win.addEventListener(name, callback);
  });
}

const FORM_VALUE_CHANGE_EVENT_ARGUMENTS = {
  type: AmpEvents_Enum.FORM_VALUE_CHANGE,
  bubbles: true,
};
const chromed = describes.sandboxed.configure().ifChrome();
chromed.run('Bind', {}, function () {
  describes.repeated(
    'Walker',
    {
      'using TreeWalker': {useQuerySelector: false},
      'using querySelectorAll': {useQuerySelector: true},
    },
    (name, variant) => {
      describe(name, function () {
        testSuite.call(this, variant.useQuerySelector);
      });
    }
  );

  function testSuite(useQuerySelector) {
    // Give more than default 2000ms timeout for local testing.
    const TIMEOUT = Math.max(window.ampTestRuntimeConfig.mochaTimeout, 4000);
    this.timeout(TIMEOUT);

    describes.realWin(
      'in FIE',
      {
        amp: {
          ampdoc: 'fie',
          runtimeOn: false,
        },
        mockFetch: false,
      },
      (env) => {
        let fieBind;
        let fieWindow, fieBody;
        let hostWindow, hostBody;

        beforeEach(() => {
          // Make sure we have a chunk instance for testing.
          chunkInstanceForTesting(env.ampdoc);

          if (useQuerySelector) {
            env.win.document.documentElement.setAttribute(
              'i-amphtml-binding',
              ''
            );
          }

          fieBind = new Bind(env.ampdoc);
          fieWindow = env.ampdoc.win;
          fieBody = env.ampdoc.getBody();

          hostWindow = env.parentWin;
          hostBody = env.parentAmpdoc.getBody();
        });

        it('should scan for bindings when ampdoc is ready', () => {
          createElement(env, fieBody, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(fieBind.numberOfBindings()).to.equal(0);
          return onBindReady(env, fieBind).then(() => {
            expect(fieBind.numberOfBindings()).to.equal(1);
          });
        });

        it('should not update host document title for <title> elements', () => {
          createElement(env, fieBody, '[text]="\'bar\'"', {
            tag: 'title',
            amp: false,
            insertInHead: true,
            insertQuerySelectorAttr: useQuerySelector,
          });
          fieWindow.document.title = 'foo';
          hostWindow.document.title = 'foo';
          return onBindReadyAndSetState(env, fieBind, {}).then(() => {
            // Make sure it does not update the host window's document title.
            expect(fieWindow.document.title).to.equal('bar');
            expect(hostWindow.document.title).to.equal('foo');
          });
        });

        describe('with Bind in host window', () => {
          let hostBind;

          beforeEach(() => {
            hostBind = new Bind(env.parentAmpdoc);
          });

          it('should only scan elements in provided window', () => {
            createElement(env, fieBody, '[text]="1+1"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            createElement(env, hostBody, '[text]="2+2"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            return Promise.all([
              onBindReady(env, fieBind),
              onBindReady(env, hostBind),
            ]).then(() => {
              expect(fieBind.numberOfBindings()).to.equal(1);
              expect(hostBind.numberOfBindings()).to.equal(1);
            });
          });

          it('should not be able to access variables from other windows', () => {
            const element = createElement(env, fieBody, '[text]="foo + bar"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            const parentElement = createElement(
              env,
              hostBody,
              '[text]="foo + bar"',
              {insertQuerySelectorAttr: useQuerySelector}
            );
            const promises = [
              onBindReadyAndSetState(env, fieBind, {foo: '123', bar: '456'}),
              onBindReadyAndSetState(env, hostBind, {foo: 'ABC', bar: 'DEF'}),
            ];
            return Promise.all(promises).then(() => {
              // `element` only sees `foo` and `parentElement` only sees `bar`.
              expect(element.textContent).to.equal('123456');
              expect(parentElement.textContent).to.equal('ABCDEF');
            });
          });
        });
      }
    );

    describes.realWin(
      'in shadow ampdoc',
      {
        amp: {
          ampdoc: 'shadow',
          runtimeOn: false,
        },
        mockFetch: false,
      },
      (env) => {
        let bind;
        let container;

        beforeEach(() => {
          // Make sure we have a chunk instance for testing.
          chunkInstanceForTesting(env.ampdoc);

          if (useQuerySelector) {
            env.win.document.documentElement.setAttribute(
              'i-amphtml-binding',
              ''
            );
          }

          bind = new Bind(env.ampdoc);
          container = env.ampdoc.getBody();
        });

        it('should scan for bindings when ampdoc is ready', () => {
          createElement(env, container, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(bind.numberOfBindings()).to.equal(0);
          return onBindReady(env, bind).then(() => {
            expect(bind.numberOfBindings()).to.equal(1);
          });
        });

        it('should not update document title for <title> elements', () => {
          createElement(env, container, '[text]="\'bar\'"', {
            tag: 'title',
            amp: false,
            insertInHead: true,
            insertQuerySelectorAttr: useQuerySelector,
          });
          env.win.document.title = 'foo';
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            // Make sure does not update the host window's document title.
            expect(env.win.document.title).to.equal('foo');
          });
        });
      }
    );

    describes.realWin(
      'in single ampdoc',
      {
        amp: {
          ampdoc: 'single',
          runtimeOn: false,
        },
        mockFetch: false,
      },
      (env) => {
        let bind;
        let clock;
        let container;
        let history;
        let viewer;

        beforeEach(() => {
          const {ampdoc, win} = env;

          // Make sure we have a chunk instance for testing.
          chunkInstanceForTesting(ampdoc);
          viewer = Services.viewerForDoc(ampdoc);
          env.sandbox.stub(viewer, 'sendMessage');

          if (useQuerySelector) {
            env.win.document.documentElement.setAttribute(
              'i-amphtml-binding',
              ''
            );
          }

          bind = new Bind(ampdoc);
          // Connected <div> element created by describes.js.
          container = win.document.getElementById('parent');

          history = bind.historyForTesting();

          clock = fakeTimers.withGlobal(win).install({
            toFake: ['Date', 'setTimeout'],
          });
        });

        afterEach(() => {
          clock.uninstall();
        });

        it('should send "bindReady" to viewer on init', () => {
          expect(viewer.sendMessage).to.not.be.called;

          return onBindReady(env, bind).then(() => {
            expect(viewer.sendMessage).to.be.calledOnce;
            expect(viewer.sendMessage).to.be.calledWith('bindReady');
          });
        });

        it('should not send "bindReady" until all <amp-state> are built', () => {
          const element = createElement(env, container, '', {
            tag: 'amp-state',
            amp: true,
            insertQuerySelectorAttr: useQuerySelector,
          });

          // Makes whenUpgradedToCustomElement() resolve immediately.
          element.createdCallback = () => {};

          const parseAndUpdate = env.sandbox.spy();

          element.getImpl = () => {
            expect(viewer.sendMessage).to.not.be.called;
            return Promise.resolve({parseAndUpdate});
          };

          return onBindReady(env, bind).then(() => {
            expect(parseAndUpdate).to.be.calledOnce;
            expect(viewer.sendMessage).to.be.calledOnce;
            expect(viewer.sendMessage).to.be.calledWith('bindReady');
          });
        });

        it('should scan for bindings when ampdoc is ready', () => {
          createElement(env, container, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(bind.numberOfBindings()).to.equal(0);
          return onBindReady(env, bind).then(() => {
            expect(bind.numberOfBindings()).to.equal(1);
          });
        });

        it('should skip amp-list children during scan', () => {
          // <div>
          //   <amp-list [foo]="1+1">
          //     <h1 [text]="2+2"></h1>
          //   </amp-list>
          // </div>
          // <p>
          //   <span [text]="3+3"></span>
          // </p>
          const parent = document.createElement('div');
          container.appendChild(parent);
          const uncle = document.createElement('p');
          container.appendChild(uncle);

          const list = createElement(env, parent, `[class]="'x'"`, {
            tag: 'amp-list',
            insertQuerySelectorAttr: useQuerySelector,
          });
          const child = createElement(env, list, '[text]="2+2"', {
            tag: 'h1',
            insertQuerySelectorAttr: useQuerySelector,
          });
          const cousin = createElement(env, uncle, '[text]="3+3"', {
            tag: 'span',
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(bind.numberOfBindings()).to.equal(0);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            // Children of amp-list should be skipped.
            expect(child.textContent).to.equal('');

            // But cousins and the amp-list itself shouldn't be skipped.
            expect(list.className).to.equal('x');
            expect(cousin.textContent).to.equal('6');
          });
        });

        it('should not update attribute for non-primitive new values', () => {
          const list = createElement(env, container, `[src]="x"`, {
            tag: 'amp-list',
            insertQuerySelectorAttr: useQuerySelector,
          });
          list.setAttribute('src', 'https://foo.example/data.json');
          return onBindReadyAndSetState(env, bind, {
            x: [1, 2, 3],
          }).then(() => {
            expect(list.getAttribute('src')).to.equal(
              'https://foo.example/data.json'
            );
          });
        });

        it('should scan fixed layer for bindings', () => {
          // Mimic FixedLayer by creating a sibling <body> element.
          const doc = env.win.document;
          const pseudoFixedLayer = doc.body.cloneNode(false);
          doc.documentElement.appendChild(pseudoFixedLayer);

          // Make sure that the sibling <body> is scanned for bindings.
          createElement(env, pseudoFixedLayer, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          return onBindReady(env, bind).then(() => {
            expect(bind.numberOfBindings()).to.equal(1);
          });
        });

        it('should support data-amp-bind-* syntax', () => {
          const element = createElement(
            env,
            container,
            'data-amp-bind-text="1+1"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          expect(bind.numberOfBindings()).to.equal(0);
          expect(element.textContent).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(bind.numberOfBindings()).to.equal(1);
            expect(element.textContent).to.equal('2');
          });
        });

        it('should prefer [foo] over data-amp-bind-foo', () => {
          const element = createElement(
            env,
            container,
            '[text]="1+1" data-amp-bind-text="2+2"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          expect(bind.numberOfBindings()).to.equal(0);
          expect(element.textContent).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(bind.numberOfBindings()).to.equal(1);
            expect(element.textContent).to.equal('2');
          });
        });

        if (!useQuerySelector) {
          it('should call createTreeWalker() with all params', () => {
            const spy = env.sandbox.spy(env.win.document, 'createTreeWalker');
            createElement(env, container, '[text]="1+1"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            return onBindReady(env, bind).then(() => {
              // createTreeWalker() on IE does not support optional arguments.
              expect(spy.callCount).to.equal(1);
              expect(spy.firstCall.args.length).to.equal(4);
            });
          });
        }

        it('should have same state after removing + re-adding a subtree', () => {
          for (let i = 0; i < 5; i++) {
            createElement(env, container, '[text]="1+1"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
          }

          expect(bind.numberOfBindings()).to.equal(0);
          return onBindReady(env, bind)
            .then(() => {
              expect(bind.numberOfBindings()).to.equal(5);
              return bind.removeBindingsForNodes_([container]);
            })
            .then(() => {
              expect(bind.numberOfBindings()).to.equal(0);
              return bind.addBindingsForNodes_([container]);
            })
            .then(() => {
              expect(bind.numberOfBindings()).to.equal(5);
            });
        });

        it('should dynamically detect new bindings under dynamic tags', () => {
          const doc = env.win.document;
          const dynamicTag = doc.createElement('div');
          container.appendChild(dynamicTag);
          return onBindReady(env, bind)
            .then(() => {
              expect(bind.numberOfBindings()).to.equal(0);
              const element = createElement(env, container, '[text]="1+1"', {
                insertQuerySelectorAttr: useQuerySelector,
              });
              dynamicTag.appendChild(element);
              dynamicTag.dispatchEvent(
                new Event(AmpEvents_Enum.DOM_UPDATE, {bubbles: true})
              );
              return waitForEvent(env, BindEvents.RESCAN_TEMPLATE);
            })
            .then(() => {
              expect(bind.numberOfBindings()).to.equal(1);
            });
        });

        it('should NOT apply expressions on first load', () => {
          const element = createElement(env, container, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          return onBindReady(env, bind).then(() => {
            expect(element.textContent).to.equal('');
          });
        });

        it('should verify class bindings in dev mode', () => {
          window.__AMP_MODE = {
            development: true,
            test: true,
          };
          createElement(env, container, '[class]="\'foo\'" class="foo"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          createElement(env, container, '[class]="\'foo\'" class=" foo "', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          createElement(env, container, '[class]="\'\'"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          createElement(env, container, '[class]="\'bar\'" class="qux"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          // Error
          const warnSpy = env.sandbox.spy(user(), 'warn');
          return onBindReady(env, bind).then(() => {
            expect(warnSpy).to.be.calledOnce;
            expect(warnSpy).calledWithMatch('amp-bind', /\[class\]/);
          });
        });

        it('should verify string attribute bindings in dev mode', () => {
          window.__AMP_MODE = {
            development: true,
            test: true,
          };
          // Only the initial value for [a] binding does not match.
          createElement(
            env,
            container,
            '[text]="\'a\'" [class]="\'b\'" class="b"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          const warnSpy = env.sandbox.spy(user(), 'warn');
          return onBindReady(env, bind).then(() => {
            expect(warnSpy).to.be.calledOnce;
            expect(warnSpy).calledWithMatch('amp-bind', /\[text\]/);
          });
        });

        it('should verify boolean attribute bindings in dev mode', () => {
          window.__AMP_MODE = {
            development: true,
            test: true,
          };
          createElement(env, container, '[disabled]="true" disabled', {
            tag: 'button',
            insertQuerySelectorAttr: useQuerySelector,
          });
          createElement(env, container, '[disabled]="false"', {
            tag: 'button',
            insertQuerySelectorAttr: useQuerySelector,
          });
          createElement(env, container, '[disabled]="true"', {
            tag: 'button',
            insertQuerySelectorAttr: useQuerySelector,
          });
          // Mismatch.
          const warnSpy = env.sandbox.spy(user(), 'warn');
          return onBindReady(env, bind).then(() => {
            expect(warnSpy).to.be.calledOnce;
            expect(warnSpy).calledWithMatch('amp-bind', /\[disabled\]/);
          });
        });

        it('should skip digest if specified in setState()', () => {
          const element = createElement(env, container, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          return onBindReady(env, bind).then(() => {
            bind.setState({}, /* opt_skipDigest */ true);
            env.flushVsync();
            expect(element.textContent).to.equal('');
          });
        });

        it('should support binding to string attributes', () => {
          const element = createElement(env, container, '[text]="1+1"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.textContent).to.equal('2');
          });
        });

        it('should support binding to boolean attributes', () => {
          const element = createElement(
            env,
            container,
            '[checked]="true" [disabled]="false" disabled',
            {
              tag: 'input',
              insertQuerySelectorAttr: useQuerySelector,
            }
          );
          expect(element.getAttribute('checked')).to.equal(null);
          expect(element.getAttribute('disabled')).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.getAttribute('checked')).to.equal('');
            expect(element.getAttribute('disabled')).to.equal(null);
          });
        });

        it('should update values first, then attributes', () => {
          const spy = env.sandbox.spy();
          const element = createElement(env, container, '[value]="foo"', {
            tag: 'input',
            insertQuerySelectorAttr: useQuerySelector,
          });
          env.sandbox.stub(element, 'value').set(spy);
          env.sandbox.stub(element, 'setAttribute').callsFake(spy);
          return onBindReadyAndSetState(env, bind, {'foo': '2'}).then(() => {
            // Note: This tests a workaround for a browser bug. There is nothing
            // about the element itself we can verify. Only the order of operations
            // matters.
            expect(spy.firstCall).to.be.calledWithExactly('2');
            expect(spy.secondCall).to.be.calledWithExactly('value', '2');
          });
        });

        it('should update properties for empty strings', function* () {
          const element = createElement(env, container, '[value]="foo"', {
            tag: 'input',
            insertQuerySelectorAttr: useQuerySelector,
          });
          yield onBindReadyAndSetState(env, bind, {'foo': 'bar'});
          expect(element.value).to.equal('bar');
          yield onBindReadyAndSetState(env, bind, {'foo': ''});
          expect(element.value).to.equal('');
        });

        it('should support binding to Node.textContent', () => {
          const element = createElement(env, container, '[text]="\'abc\'"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.textContent).to.equal('abc');
          });
        });

        it('should set value for [text] in <textarea>', () => {
          const element = createElement(env, container, '[text]="\'abc\'"', {
            tag: 'textarea',
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          expect(element.value).to.equal('');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.textContent).to.equal('');
            expect(element.value).to.equal('abc');
          });
        });

        it('should set textContent for [defaultText] in <textarea>', () => {
          const element = createElement(
            env,
            container,
            '[defaultText]="\'abc\'"',
            {
              tag: 'textarea',
              insertQuerySelectorAttr: useQuerySelector,
            }
          );
          expect(element.textContent).to.equal('');
          expect(element.value).to.equal('');
          // Setting `textContent` will also update `value` before interaction.
          element.value = '123';
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.textContent).to.equal('abc');
            expect(element.value).to.equal('123');
          });
        });

        it('should update document title for <title> elements', () => {
          const element = createElement(env, container, '[text]="\'bar\'"', {
            tag: 'title',
            amp: false,
            insertInHead: true,
            insertQuerySelectorAttr: useQuerySelector,
          });
          element.textContent = 'foo';
          env.win.document.title = 'foo';
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.textContent).to.equal('bar');
            expect(env.win.document.title).to.equal('bar');
          });
        });

        it('should not update document title for <title> elements in body', () => {
          // Add a <title> element to <head> because if we don't, setting
          // `textContent` on a <title> element in the <body> will strangely update
          // `document.title`.
          const title = env.win.document.createElement('title');
          title.textContent = 'foo';
          env.win.document.head.appendChild(title);
          // Add <title [text]="'bar'"> to <body>.
          createElement(env, container, '[text]="\'bar\'"', {
            tag: 'title',
            insertQuerySelectorAttr: useQuerySelector,
          });
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(env.win.document.title).to.equal('foo');
          });
        });

        it('should support binding to CSS classes with strings', () => {
          const element = createElement(env, container, '[class]="[\'abc\']"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(toArray(element.classList)).to.deep.equal([]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal(['abc']);
          });
        });

        it('should support binding to CSS classes with arrays', () => {
          const element = createElement(
            env,
            container,
            "[class]=\"['a','b']\"",
            {insertQuerySelectorAttr: useQuerySelector}
          );
          expect(toArray(element.classList)).to.deep.equal([]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal(['a', 'b']);
          });
        });

        it('should support binding to CSS classes with a null value', () => {
          const element = createElement(env, container, '[class]="null"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(toArray(element.classList)).to.deep.equal([]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal([]);
          });
        });

        it('should support binding to CSS classes for svg tags', () => {
          const element = createElement(env, container, '[class]="[\'abc\']"', {
            tag: 'svg',
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(toArray(element.classList)).to.deep.equal([]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal(['abc']);
          });
        });

        it('supports binding to CSS classes for svg tags with a null value', () => {
          const element = createElement(env, container, '[class]="null"', {
            tag: 'svg',
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(toArray(element.classList)).to.deep.equal([]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal([]);
          });
        });

        it('should support handling actions with invoke()', () => {
          env.sandbox.stub(bind, 'setStateWithExpression');
          env.sandbox.stub(bind, 'pushStateWithExpression');

          const invocation = {
            method: 'setState',
            args: {
              [RAW_OBJECT_ARGS_KEY]: '{foo: bar}',
            },
            event: {
              detail: {bar: 123},
            },
            sequenceId: 0,
          };

          bind.invoke(invocation);
          expect(bind.setStateWithExpression).to.be.calledOnce;
          expect(bind.setStateWithExpression).to.be.calledWithExactly(
            '{foo: bar}',
            env.sandbox.match({event: {bar: 123}})
          );

          invocation.method = 'pushState';
          invocation.sequenceId++;
          bind.invoke(invocation);
          expect(bind.pushStateWithExpression).to.be.calledOnce;
          expect(bind.pushStateWithExpression).to.be.calledWithExactly(
            '{foo: bar}',
            env.sandbox.match({event: {bar: 123}})
          );
        });

        // TODO(choumx, #16721): Causes browser crash for some reason.
        it.skip('should only allow one action per event in invoke()', () => {
          env.sandbox.stub(bind, 'setStateWithExpression');
          const userError = env.sandbox.stub(user(), 'error');

          const invocation = {
            method: 'setState',
            args: {
              [RAW_OBJECT_ARGS_KEY]: '{foo: bar}',
            },
            event: {
              detail: {bar: 123},
            },
            sequenceId: 0,
          };

          bind.invoke(invocation);
          expect(bind.setStateWithExpression).to.be.calledOnce;
          expect(bind.setStateWithExpression).to.be.calledWithExactly(
            '{foo: bar}',
            env.sandbox.match({event: {bar: 123}})
          );

          // Second invocation with the same sequenceId should fail.
          bind.invoke(invocation);
          expect(bind.setStateWithExpression).to.be.calledOnce;
          expect(userError).to.be.calledWith(
            'amp-bind',
            'One state action allowed per event.'
          );

          // Invocation with the same sequenceid will be allowed after 5 seconds,
          // which is how long it takes for stored sequenceIds to be purged.
          clock.tick(5000);
          bind.invoke(invocation);
          expect(bind.setStateWithExpression).to.be.calledTwice;
        });

        it('should support parsing exprs in setStateWithExpression()', () => {
          const element = createElement(env, container, '[text]="onePlusOne"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          const promise = onBindReadyAndSetStateWithExpression(
            env,
            bind,
            '{"onePlusOne": one + one}',
            {one: 1}
          );
          return promise.then(() => {
            expect(element.textContent).to.equal('2');
          });
        });

        describe('history', () => {
          beforeEach(() => {
            env.sandbox.spy(history, 'replace');
            env.sandbox.spy(history, 'push');
            env.sandbox.stub(viewer, 'isEmbedded').returns(true);
          });

          describe('with untrusted viewer', () => {
            it('should not replace history on AMP.setState()', () => {
              const promise = onBindReadyAndSetStateWithExpression(
                env,
                bind,
                '{"onePlusOne": one + one}',
                {one: 1}
              );
              return promise.then(() => {
                // Shouldn't call replace() with null `data`.
                expect(history.replace).to.not.be.called;
              });
            });

            it('should push history (no data) on AMP.pushState()', () => {
              const promise = bind.pushStateWithExpression(
                '{"foo": "bar"}',
                {}
              );
              return promise.then(() => {
                expect(history.push).to.be.called;
                // `data` param should be null on untrusted viewers.
                expect(history.push).to.be.calledWith(
                  env.sandbox.match.func,
                  null
                );
              });
            });
          });

          describe('with trusted viewer', () => {
            beforeEach(() => {
              env.sandbox
                .stub(viewer, 'isTrustedViewer')
                .returns(Promise.resolve(true));
            });

            it('should replace history on AMP.setState()', () => {
              const promise = onBindReadyAndSetStateWithExpression(
                env,
                bind,
                '{"onePlusOne": one + one}',
                {one: 1}
              );
              return promise.then(() => {
                expect(history.replace).calledOnce;
                // `data` param should exist on trusted viewers.
                expect(history.replace).calledWith({
                  data: {'amp-bind': {'onePlusOne': 2}},
                  title: '',
                });
              });
            });

            it('should push history on AMP.pushState()', () => {
              const promise = bind.pushStateWithExpression(
                '{"foo": "bar"}',
                {}
              );
              return promise.then(() => {
                expect(history.push).calledOnce;
                // `data` param should exist on trusted viewers.
                expect(history.push).calledWith(env.sandbox.match.func, {
                  data: {'amp-bind': {foo: 'bar'}},
                  title: '',
                });
              });
            });
          });
        });

        it('should support setting object state in setStateWithObject()', () => {
          const element = createElement(
            env,
            container,
            '[text]="mystate.mykey"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          expect(element.textContent).to.equal('');
          const promise = onBindReadyAndSetStateWithObject(env, bind, {
            mystate: {mykey: 'myval'},
          });
          return promise.then(() => {
            expect(element.textContent).to.equal('myval');
          });
        });

        it('should support getting state with getState()', () => {
          const promise = onBindReadyAndSetStateWithObject(env, bind, {
            mystate: {mykey: 'myval'},
          });
          return promise.then(() => {
            return onBindReadyAndGetState(env, bind, 'mystate.mykey').then(
              (result) => {
                expect(result).to.equal('myval');
              }
            );
          });
        });

        describe('getStateAsync', () => {
          it('should reject if there is no associated "amp-state"', async () => {
            await onBindReadyAndSetState(env, bind, {
              mystate: {mykey: 'myval'},
            });

            const state = bind.getStateAsync('mystate.mykey');
            return expect(state).to.eventually.rejectedWith(/#mystate/);
          });

          it('should not wait if the still-loading state is irrelevant', async () => {
            await onBindReadyAndSetState(env, bind, {
              mystate: {myKey: 'myval'},
            });
            addAmpState(env, container, 'mystate', Promise.resolve());
            addAmpState(
              // never resolves
              env,
              container,
              'irrelevant',
              new Promise((unused) => {})
            );

            const state = await bind.getStateAsync('mystate.myKey');
            expect(state).to.equal('myval');
          });

          it('should wait for a relevant key', async () => {
            const {promise, resolve} = new Deferred();
            addAmpState(env, container, 'mystate', promise);

            await onBindReady(env, bind);
            const statePromise = bind.getStateAsync('mystate.mykey');

            await bind.setState({mystate: {mykey: 'myval'}}).then(resolve);
            expect(await statePromise).to.equal('myval');
          });

          it('should stop waiting for a key if its fetch rejects', async () => {
            const {promise, reject} = new Deferred();
            addAmpState(env, container, 'mystate', promise);

            await onBindReady(env, bind);
            const statePromise = bind.getStateAsync('mystate.mykey');
            reject();

            expect(await statePromise).to.equal(undefined);
          });
        });

        it('should support pushStateWithExpression()', () => {
          env.sandbox.spy(history, 'push');

          const element = createElement(env, container, '[text]="foo"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          const promise = bind.pushStateWithExpression('{"foo": "bar"}', {});
          return promise
            .then(() => {
              env.flushVsync();
              expect(element.textContent).to.equal('bar');

              expect(history.push).calledOnce;
              // Pop callback should restore `foo` to original value (null).
              const onPopCallback = history.push.firstCall.args[0];
              return onPopCallback();
            })
            .then(() => {
              expect(element.textContent).to.equal('null');
            });
        });

        it('pushStateWithExpression() should work with nested objects', () => {
          env.sandbox.spy(history, 'push');

          const element = createElement(env, container, '[text]="foo.bar"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(element.textContent).to.equal('');
          return bind
            .pushStateWithExpression('{foo: {bar: 0}}', {})
            .then(() => {
              env.flushVsync();
              expect(element.textContent).to.equal('0');

              return bind.pushStateWithExpression('{foo: {bar: 1}}', {});
            })
            .then(() => {
              env.flushVsync();
              expect(element.textContent).to.equal('1');

              expect(history.push).calledTwice;
              // Pop callback should restore `foo.bar` to second pushed value (0).
              const onPopCallback = history.push.secondCall.args[0];
              return onPopCallback();
            })
            .then(() => {
              expect(element.textContent).to.equal('0');
            });
        });

        it('should ignore <amp-state> updates if specified in setState()', () => {
          const element = createElement(env, container, '[src]="foo"', {
            tag: 'amp-state',
            insertQuerySelectorAttr: useQuerySelector,
          });

          // Makes whenUpgradedToCustomElement() resolve immediately.
          element.createdCallback = () => {};
          element.getImpl = () =>
            Promise.resolve({parseAndUpdate: env.sandbox.spy()});
          expect(element.getAttribute('src')).to.be.null;

          const promise = onBindReadyAndSetState(
            env,
            bind,
            {foo: '/foo'},
            /* opt_isAmpStateMutation */ true
          );
          return promise.then(() => {
            // Should _not_ be updated if `opt_isAmpStateMutation` is true.
            expect(element.getAttribute('src')).to.be.null;
          });
        });

        it('should support NOT override internal AMP CSS classes', () => {
          const element = createElement(env, container, '[class]="[\'abc\']"', {
            amp: true,
            insertQuerySelectorAttr: useQuerySelector,
          });
          expect(toArray(element.classList)).to.deep.equal([
            'i-amphtml-foo',
            '-amp-foo',
            'amp-foo',
          ]);
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(toArray(element.classList)).to.deep.equal([
              'i-amphtml-foo',
              '-amp-foo',
              'amp-foo',
              'abc',
            ]);
          });
        });

        it('should call mutatedAttributesCallback on AMP elements', () => {
          const binding =
            '[text]="1+1" [value]="\'4\'" value="4" ' +
            'checked [checked]="false" [disabled]="true" [multiple]="false"';
          const element = createElement(env, container, binding, {
            tag: 'input',
            amp: true,
            insertQuerySelectorAttr: useQuerySelector,
          });
          const spy = env.sandbox.spy(element, 'mutatedAttributesCallback');
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(spy).calledWithMatch({
              checked: false,
              disabled: true,
            });
            // Callback shouldn't include global attributes (text, class) or those
            // whose values haven't changed.
            expect(
              spy.neverCalledWithMatch({
                text: 2,
                value: 4,
                multiple: false,
              })
            ).to.be.true;
          });
        });

        it('should support scope variable references', () => {
          const binding = '[text]="foo + bar + baz.qux.join(\',\')"';
          const element = createElement(env, container, binding, {
            insertQuerySelectorAttr: useQuerySelector,
          });
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
          const binding =
            '[value]="foo" [class]="\'abc\'" [text]="\'a\'+\'b\'"';
          const element = createElement(env, container, binding, {
            tag: 'input',
            insertQuerySelectorAttr: useQuerySelector,
          });
          element.mutatedAttributesCallback = env.sandbox.spy();
          return onBindReadyAndSetState(env, bind, {foo: {bar: [1]}})
            .then(() => {
              expect(element.textContent.length).to.not.equal(0);
              expect(element.classList.length).to.not.equal(0);
              expect(element.attributes.length).to.not.equal(0);
              expect(element.mutatedAttributesCallback).to.be.calledOnce;

              element.textContent = '';
              element.className = '';
              while (element.attributes.length > 0) {
                element.removeAttribute(element.attributes[0].name);
              }

              return onBindReadyAndSetState(env, bind, {});
            })
            .then(() => {
              // Attributes should not be updated and mutatedAttributesCallback
              // should not be called since the expression results haven't changed.
              expect(element.textContent).to.equal('');
              expect(element.className).to.equal('');
              expect(element.attributes.length).to.equal(0);
              expect(element.mutatedAttributesCallback).to.be.calledOnce;
            });
        });

        it('should NOT evaluate expression if binding is NOT allowed', () => {
          const element = createElement(
            env,
            container,
            '[invalidBinding]="1+1"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          return onBindReadyAndSetState(env, bind, {}).then(() => {
            expect(element.getAttribute('invalidbinding')).to.be.null;
          });
        });

        it('should rewrite attribute values regardless of result type', () => {
          const withString = createElement(env, container, '[href]="foo"', {
            tag: 'a',
            insertQuerySelectorAttr: useQuerySelector,
          });
          const withArray = createElement(env, container, '[href]="bar"', {
            tag: 'a',
            insertQuerySelectorAttr: useQuerySelector,
          });
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
          const errorStub = env.sandbox.stub(dev(), 'expectedError');

          const foo = createElement(env, container, '[text]="foo"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          const bar = createElement(
            env,
            container,
            '[text]="bar" [class]="baz"',
            {insertQuerySelectorAttr: useQuerySelector}
          );
          const qux = createElement(env, container, '[text]="qux"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          return onBindReadyAndSetState(env, bind, {
            foo: 1,
            bar: 2,
            baz: 3,
            qux: 4,
          }).then(() => {
            expect(foo.textContent).to.equal('1');
            expect(bar.textContent).to.equal('2');
            // Max number of bindings exceeded with [baz].
            expect(bar.className).to.be.equal('');
            expect(qux.textContent).to.be.equal('');

            expect(errorStub).to.have.been.calledWith(
              'amp-bind',
              env.sandbox.match(/Maximum number of bindings reached/)
            );
          });
        });

        it('should update premutate keys that are overridable', () => {
          bind.addOverridableKey('foo');
          bind.addOverridableKey('bar');

          const foo = createElement(env, container, '[text]="foo"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          const bar = createElement(env, container, '[text]="bar"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          const baz = createElement(env, container, '[text]="baz"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          const qux = createElement(env, container, '[text]="qux"', {
            insertQuerySelectorAttr: useQuerySelector,
          });
          return onBindReadyAndSetState(env, bind, {
            foo: 1,
            bar: 2,
            baz: 3,
            qux: 4,
          }).then(() => {
            return viewer
              .receiveMessage('premutate', {
                state: {
                  foo: 'foo',
                  bar: 'bar',
                  baz: 'baz',
                  qux: 'qux',
                },
              })
              .then(() => {
                expect(foo.textContent).to.equal('foo');
                expect(bar.textContent).to.equal('bar');
                expect(baz.textContent).to.be.equal('3');
                expect(qux.textContent).to.be.equal('4');
              });
          });
        });

        describe('rescan()', () => {
          let toRemove;
          let toAdd;

          beforeEach(async () => {
            toRemove = createElement(env, container, '[text]="foo"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            // New elements to rescan() don't need to be attached to DOM.
            toAdd = createElement(env, /* container */ null, '[text]="1+1"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
          });

          it('{update: true, fast: true}', async () => {
            const options = {update: true, fast: true};

            await onBindReadyAndSetState(env, bind, {foo: 'foo'});
            expect(toRemove.textContent).to.equal('foo');

            // [i-amphtml-binding] necessary in {fast: true}.
            toAdd.setAttribute('i-amphtml-binding', '');

            // `toAdd` should be scanned and updated.
            await onBindReadyAndRescan(env, bind, [toAdd], [toRemove], options);
            expect(toAdd.textContent).to.equal('2');

            await onBindReadyAndSetState(env, bind, {foo: 'bar'});
            // The `toRemove` element's bindings should have been removed.
            expect(toRemove.textContent).to.not.equal('bar');
          });

          it('{update: true, fast: false}', async () => {
            const options = {update: true, fast: false};

            await onBindReadyAndSetState(env, bind, {foo: 'foo'});
            expect(toRemove.textContent).to.equal('foo');

            // `toAdd` should be scanned and updated.
            await onBindReadyAndRescan(env, bind, [toAdd], [toRemove], options);
            expect(toAdd.textContent).to.equal('2');

            await onBindReadyAndSetState(env, bind, {foo: 'bar'});
            // The `toRemove` element's bindings should have been removed.
            expect(toRemove.textContent).to.not.equal('bar');
          });

          it('{update: false, fast: true}', async () => {
            const options = {update: false, fast: true};

            await onBindReadyAndSetState(env, bind, {foo: 'foo'});
            expect(toRemove.textContent).to.equal('foo');

            // [i-amphtml-binding] necessary in {fast: true}.
            toAdd.setAttribute('i-amphtml-binding', '');

            // `toAdd` should be scanned but not updated.
            await onBindReadyAndRescan(env, bind, [toAdd], [toRemove], options);
            expect(toAdd.textContent).to.equal('');

            await onBindReadyAndSetState(env, bind, {foo: 'bar'});
            // Now that `toAdd` is scanned, it should be updated on setState().
            expect(toAdd.textContent).to.equal('2');
            // The `toRemove` element's bindings should have been removed.
            expect(toRemove.textContent).to.not.equal('bar');
          });

          it('{update: false, fast: false}', async () => {
            const options = {update: false, fast: false};

            await onBindReadyAndSetState(env, bind, {foo: 'foo'});
            expect(toRemove.textContent).to.equal('foo');

            // `toAdd` should be scanned but not updated.
            await onBindReadyAndRescan(env, bind, [toAdd], [toRemove], options);
            expect(toAdd.textContent).to.equal('');

            await onBindReadyAndSetState(env, bind, {foo: 'bar'});
            // Now that `toAdd` is scanned, it should be updated on setState().
            expect(toAdd.textContent).to.equal('2');
            // The `toRemove` element's bindings should have been removed.
            expect(toRemove.textContent).to.not.equal('bar');
          });

          it('{update: "evaluate"}', async () => {
            const options = {update: 'evaluate', fast: false};

            toAdd = createElement(env, /* container */ null, '[text]="x"', {
              insertQuerySelectorAttr: useQuerySelector,
            });
            // `toRemove` is updated normally before removal.
            await onBindReadyAndSetState(env, bind, {foo: 'foo', x: '1'});
            expect(toRemove.textContent).to.equal('foo');

            // `toAdd` should be scanned but not updated. With {update: 'evaluate'},
            // its expression "x" is now cached on the element.
            await onBindReadyAndRescan(env, bind, [toAdd], [toRemove], options);
            expect(toAdd.textContent).to.equal('');

            await onBindReadyAndSetState(env, bind, {foo: 'bar', x: '1'});
            // `toAdd` should _not_ update since the value of its expression "x"
            // hasn't changed (due to caching).
            expect(toAdd.textContent).to.equal('');
            // `toRemove`'s bindings have been removed and remains unchanged.
            expect(toRemove.textContent).to.equal('foo');

            await onBindReadyAndSetState(env, bind, {x: '2'});
            // toAdd changes now that its expression "x"'s value has changed.
            expect(toAdd.textContent).to.equal('2');
          });
        });

        describe('AmpEvents_Enum.FORM_VALUE_CHANGE', () => {
          it('should dispatch FORM_VALUE_CHANGE on <input [value]> changes', () => {
            const element = createElement(env, container, '[value]="foo"', {
              tag: 'input',
              insertQuerySelectorAttr: useQuerySelector,
            });
            const spy = env.sandbox.spy(element, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'bar'}).then(() => {
              expect(spy).to.have.been.calledOnce;
              expect(spy).calledWithMatch(FORM_VALUE_CHANGE_EVENT_ARGUMENTS);
            });
          });

          it('should dispatch FORM_VALUE_CHANGE on <input [checked]> changes', () => {
            const element = createElement(env, container, '[checked]="foo"', {
              tag: 'input',
              insertQuerySelectorAttr: useQuerySelector,
            });
            const spy = env.sandbox.spy(element, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'checked'}).then(
              () => {
                expect(spy).to.have.been.calledOnce;
                expect(spy).calledWithMatch(FORM_VALUE_CHANGE_EVENT_ARGUMENTS);
              }
            );
          });

          it('should dispatch FORM_VALUE_CHANGE at parent <select> on <option [selected]> changes', () => {
            const select = env.win.document.createElement('select');
            const optgroup = createElement(env, select, '', {
              tag: 'optgroup',
            });
            createElement(env, optgroup, '[selected]="foo"', {
              tag: 'option',
              insertQuerySelectorAttr: useQuerySelector,
            });
            container.appendChild(select);

            const spy = env.sandbox.spy(select, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'selected'}).then(
              () => {
                expect(spy).to.have.been.calledOnce;
                expect(spy).calledWithMatch({
                  type: AmpEvents_Enum.FORM_VALUE_CHANGE,
                  bubbles: true,
                });
              }
            );
          });

          it('should dispatch FORM_VALUE_CHANGE on <textarea [text]> changes', () => {
            const element = createElement(env, container, '[text]="foo"', {
              tag: 'textarea',
              insertQuerySelectorAttr: useQuerySelector,
            });
            const spy = env.sandbox.spy(element, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'bar'}).then(() => {
              expect(spy).to.have.been.calledOnce;
              expect(spy).calledWithMatch({
                type: AmpEvents_Enum.FORM_VALUE_CHANGE,
                bubbles: true,
              });
            });
          });

          it('should NOT dispatch FORM_VALUE_CHANGE on other attributes changes', () => {
            const element = createElement(env, container, '[name]="foo"', {
              tag: 'input',
              insertQuerySelectorAttr: useQuerySelector,
            });
            const spy = env.sandbox.spy(element, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'name'}).then(() => {
              expect(spy).to.not.have.been.called;
            });
          });

          it('should NOT dispatch FORM_VALUE_CHANGE on other element changes', () => {
            const element = createElement(env, container, '[text]="foo"', {
              tag: 'p',
              insertQuerySelectorAttr: useQuerySelector,
            });
            const spy = env.sandbox.spy(element, 'dispatchEvent');

            return onBindReadyAndSetState(env, bind, {foo: 'selected'}).then(
              () => {
                expect(spy).to.not.have.been.called;
              }
            );
          });
        });
      }
    );
  }
});
