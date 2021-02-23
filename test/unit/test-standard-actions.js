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

import {AmpDocService, AmpDocSingle} from '../../src/service/ampdoc-impl';
import {RAW_OBJECT_ARGS_KEY} from '../../src/action-constants';
import {Services} from '../../src/services';
import {
  StandardActions,
  getAutofocusElementForShowAction,
} from '../../src/service/standard-actions-impl';
import {cidServiceForDocForTesting} from '../../src/service/cid-impl';
import {htmlFor} from '../../src/static-template';
import {installHistoryServiceForDoc} from '../../src/service/history-impl';
import {macroTask} from '../../testing/yield';
import {toggle} from '../../src/style';
import {user} from '../../src/log';

describes.sandboxed('StandardActions', {}, (env) => {
  let standardActions;
  let mutateElementStub;
  let scrollStub;
  let ampdoc;

  function createElement() {
    return document.createElement('div');
  }

  function createAmpElement() {
    const element = createElement();
    element.classList.add('i-amphtml-element');
    element.collapse = env.sandbox.stub();
    element.expand = env.sandbox.stub();
    return element;
  }

  function stubMutate() {
    return env.sandbox
      .stub(standardActions.mutator_, 'mutateElement')
      .callsFake((unusedElement, mutator) => mutator());
  }
  function stubMutateNoop() {
    standardActions.mutator_.mutateElement.restore();
    return env.sandbox
      .stub(standardActions.mutator_, 'mutateElement')
      .callsFake(() => {});
  }

  function expectElementMutatedAsync(element) {
    expect(mutateElementStub.withArgs(element, env.sandbox.match.any)).to.be
      .calledOnce;
  }

  function expectElementToHaveBeenHidden(element) {
    expectElementMutatedAsync(element);
    expect(element).to.have.attribute('hidden');
  }

  function expectElementToHaveBeenShown(element) {
    expectElementMutatedAsync(element);
    expect(element).to.not.have.attribute('hidden');
    expect(element.hasAttribute('hidden')).to.be.false;
  }

  function expectElementToHaveClass(element, className) {
    expectElementMutatedAsync(element);
    expect(element.classList.contains(className)).to.true;
  }

  function expectElementToDropClass(element, className) {
    expectElementMutatedAsync(element);
    expect(element.classList.contains(className)).to.false;
  }

  function expectAmpElementToHaveBeenHidden(element) {
    expectElementMutatedAsync(element);
    expect(element.collapse).to.be.calledOnce;
  }

  function expectAmpElementToHaveBeenShown(element, sync = false) {
    if (!sync) {
      expectElementMutatedAsync(element);
    } else {
      expect(mutateElementStub).to.not.have.been.called;
    }
    expect(element.expand).to.be.calledOnce;
  }

  function expectAmpElementToHaveBeenScrolledIntoView(element) {
    expect(scrollStub).to.be.calledOnce;
    expect(scrollStub.firstCall.args[0]).to.equal(element);
  }

  function trustedInvocation(obj) {
    return {satisfiesTrust: () => true, ...obj};
  }

  function stubPlatformIsIos(isIos = true) {
    env.sandbox.stub(Services, 'platformFor').returns({isIos: () => isIos});
  }

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
    env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(ampdoc);
    standardActions = new StandardActions(ampdoc);
    mutateElementStub = stubMutate();
    scrollStub = env.sandbox.stub(
      standardActions.viewport_,
      'animateScrollIntoView'
    );
  });

  describe('getAutofocusElementForShowAction', () => {
    let html;
    beforeEach(() => {
      html = htmlFor(document);
    });

    it('returns element (direct)', () => {
      const el = html` <input autofocus /> `;
      expect(getAutofocusElementForShowAction(el)).to.equal(el);
    });

    it('returns element (wrapped)', () => {
      const el = html` <input autofocus /> `;
      const wrapper = html` <div><div></div></div> `;
      wrapper.firstElementChild.appendChild(el);
      expect(getAutofocusElementForShowAction(wrapper)).to.equal(el);
    });

    it('returns null', () => {
      const el = html`
        <div>
          <div><input /></div>
        </div>
      `;
      expect(getAutofocusElementForShowAction(el)).to.be.null;
    });
  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleHide_(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleHide_(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"show" action', () => {
    it('should handle normal element (toggle)', () => {
      const element = createElement();
      toggle(element, false);
      const invocation = trustedInvocation({node: element});
      standardActions.handleShow_(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle normal element (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = trustedInvocation({node: element});
      standardActions.handleShow_(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle AmpElement (toggle)', () => {
      const element = createAmpElement();
      toggle(element, false);
      const invocation = trustedInvocation({node: element});
      standardActions.handleShow_(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    it('should handle AmpElement (hidden attribute)', () => {
      const element = createAmpElement();
      element.setAttribute('hidden', '');
      const invocation = trustedInvocation({node: element});
      standardActions.handleShow_(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    describe('iOS force sync', () => {
      let html;
      beforeEach(() => {
        html = htmlFor(document);
        stubPlatformIsIos();
      });

      it('executes asynchronously when no autofocus (wrapped)', () => {
        const node = html`
          <div>
            <div><input /></div>
          </div>
        `;
        standardActions.handleShow_(trustedInvocation({node}));
        expectElementToHaveBeenShown(node);
      });

      it('executes asynchronously when no autofocus (direct)', () => {
        const node = html` <input /> `;
        standardActions.handleShow_(trustedInvocation({node}));
        expectElementToHaveBeenShown(node);
      });

      it('executes synchronously when autofocus (wrapped)', () => {
        mutateElementStub = stubMutateNoop();
        const node = html`
          <div>
            <div><input autofocus /></div>
          </div>
        `;
        standardActions.handleShow_(trustedInvocation({node}));
        expectElementToHaveBeenShown(node);
      });

      it('executes synchronously when autofocus (direct)', () => {
        mutateElementStub = stubMutateNoop();
        const node = html` <input autofocus /> `;
        standardActions.handleShow_(trustedInvocation({node}));
        expectElementToHaveBeenShown(node);
      });
    });

    describe('autofocus', () => {
      let html;
      beforeEach(() => {
        html = htmlFor(document);
      });

      describe('iOS force sync', () => {
        beforeEach(() => {
          stubPlatformIsIos();
        });

        it('focuses [autofocus] element synchronously (direct)', () => {
          mutateElementStub = stubMutateNoop();
          const node = html` <input autofocus /> `;
          node.focus = env.sandbox.spy();

          standardActions.handleShow_(trustedInvocation({node}));

          expectElementToHaveBeenShown(node);
          expect(node.focus).to.have.been.calledOnce;
        });

        it('focuses [autofocus] element synchronously (wrapped)', () => {
          mutateElementStub = stubMutateNoop();
          const wrapper = html` <div><div></div></div> `;
          const node = html` <input autofocus /> `;
          node.focus = env.sandbox.spy();

          wrapper.firstElementChild.appendChild(node);
          standardActions.handleShow_(trustedInvocation({node: wrapper}));

          expectElementToHaveBeenShown(wrapper);
          expect(node.focus).to.have.been.calledOnce;
        });

        it('does not focus element', () => {
          const node = html` <input /> `;
          node.focus = env.sandbox.spy();

          standardActions.handleShow_(trustedInvocation({node}));

          expectElementMutatedAsync(node);
          expect(node.focus).to.not.have.been.called;
        });
      });

      it('focuses [autofocus] element asynchronously (direct)', () => {
        stubPlatformIsIos(false);

        const node = html` <input autofocus /> `;
        node.focus = env.sandbox.spy();

        standardActions.handleShow_(trustedInvocation({node}));

        expectElementMutatedAsync(node);
        expect(node.focus).to.have.been.calledOnce;
      });

      it('focuses [autofocus] element asynchronously (wrapped)', () => {
        stubPlatformIsIos(false);

        const wrapper = html` <div><div></div></div> `;
        const node = html` <input autofocus /> `;
        node.focus = env.sandbox.spy();

        wrapper.firstElementChild.appendChild(node);
        standardActions.handleShow_(trustedInvocation({node: wrapper}));

        expectElementMutatedAsync(wrapper);
        expect(node.focus).to.have.been.calledOnce;
      });

      it('does not focus element', () => {
        const node = html` <input /> `;
        node.focus = env.sandbox.spy();

        standardActions.handleShow_(trustedInvocation({node}));

        expectElementMutatedAsync(node);
        expect(node.focus).to.not.have.been.called;
      });
    });
  });

  describe('"toggle" action', () => {
    it('should show normal element when hidden (toggle)', () => {
      const element = createElement();
      toggle(element, false);
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should show normal element when hidden (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should hide normal element when shown', () => {
      const element = createElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should show AmpElement when hidden (toggle)', () => {
      const element = createAmpElement();
      toggle(element, false);
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    it('should show AmpElement when hidden (hidden attribute)', () => {
      const element = createAmpElement();
      element.setAttribute('hidden', '');
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    it('should hide AmpElement when shown', () => {
      const element = createAmpElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleToggle_(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"toggleClass" action', () => {
    const dummyClass = 'test-class-toggle';

    it('should add class when not in classList', () => {
      const element = createElement();
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToHaveClass(element, dummyClass);
    });

    it('should delete class when in classList', () => {
      const element = createElement();
      element.classList.add(dummyClass);
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToDropClass(element, dummyClass);
    });

    it('should add classes with amp- and -amp- prefixes', () => {
      const element = createElement();
      const invocation1 = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': 'amp-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation1);
      expect(element.classList.contains('amp-test-class-toggle')).to.be.true;
      const invocation2 = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': '-amp-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation2);
      expect(element.classList.contains('-amp-test-class-toggle')).to.be.true;
    });

    it('should delete classes with amp- and -amp- prefixes', () => {
      const element = createElement();
      element.classList.add('amp-test-class-toggle');
      const invocation1 = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': 'amp-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation1);
      expect(element.classList.contains('amp-test-class-toggle')).to.be.false;
      element.classList.add('-amp-test-class-toggle');
      const invocation2 = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': '-amp-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation2);
      expect(element.classList.contains('amp-test-class-toggle')).to.be.false;
    });

    it('should not add amp internal classes', () => {
      const element = createElement();
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': 'i-amphtml-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation);
      expect(element.classList.contains('i-amphtml-test-class-toggle')).to.be
        .false;
    });

    it('should not delete amp internal classes', () => {
      const element = createElement();
      element.classList.add('i-amphtml-test-class-toggle');
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': 'i-amphtml-test-class-toggle',
        },
      };
      standardActions.handleToggleClass_(invocation);
      expect(element.classList.contains('i-amphtml-test-class-toggle')).to.be
        .true;
    });

    it('should add class when not in classList, when force=true', () => {
      const element = createElement();
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
          'force': true,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToHaveClass(element, dummyClass);
    });

    it('should keep class when in classList, when force=true', () => {
      const element = createElement();
      element.classList.add(dummyClass);
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
          'force': true,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToHaveClass(element, dummyClass);
    });

    it('should not add when not in classList, when force=false', () => {
      const element = createElement();
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
          'force': false,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToDropClass(element, dummyClass);
    });

    it('should delete class when in classList, when force=false', () => {
      const element = createElement();
      element.classList.add(dummyClass);
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'class': dummyClass,
          'force': false,
        },
      };
      standardActions.handleToggleClass_(invocation);
      expectElementToDropClass(element, dummyClass);
    });
  });

  describe('"scrollTo" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleScrollTo_(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = trustedInvocation({node: element});
      standardActions.handleScrollTo_(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });
  });

  describe('"focus" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = trustedInvocation({node: element});
      const focusStub = env.sandbox.stub(element, 'focus');
      standardActions.handleFocus_(invocation);
      expect(focusStub).to.be.calledOnce;
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = trustedInvocation({node: element});
      const focusStub = env.sandbox.stub(element, 'focus');
      standardActions.handleFocus_(invocation);
      expect(focusStub).to.be.calledOnce;
    });
  });

  describe('"AMP" global target', () => {
    let win;
    let invocation;

    beforeEach(() => {
      win = {
        close: () => {},
      };
      invocation = {
        node: {
          ownerDocument: {
            defaultView: win,
          },
        },
        satisfiesTrust: () => true,
      };
    });

    describe('navigateTo', () => {
      let navigator;

      beforeEach(() => {
        navigator = {navigateTo: env.sandbox.stub()};
        env.sandbox.stub(Services, 'navigationForDoc').returns(navigator);

        // Fake ActionInvocation.
        invocation.method = 'navigateTo';
        invocation.args = {
          url: 'http://bar.com',
        };
        invocation.caller = {tagName: 'DIV'};
      });

      it('should be implemented', () => {
        // Should check trust and fail.
        invocation.satisfiesTrust = () => false;
        standardActions.handleAmpTarget_(invocation);
        expect(navigator.navigateTo).to.be.not.called;

        // Should succeed.
        invocation.satisfiesTrust = () => true;
        return standardActions.handleAmpTarget_(invocation).then(() => {
          expect(navigator.navigateTo).to.be.calledOnce;
          expect(navigator.navigateTo).to.be.calledWithExactly(
            win,
            'http://bar.com',
            'AMP.navigateTo',
            {target: undefined, opener: undefined}
          );
        });
      });

      it('should pass if node does not have throwIfCannotNavigate()', () => {
        invocation.caller.tagName = 'AMP-FOO';
        invocation.caller.getImpl = () => Promise.resolve({});

        return standardActions.handleAmpTarget_(invocation).then(() => {
          expect(navigator.navigateTo).to.be.calledOnce;
          expect(navigator.navigateTo).to.be.calledWithExactly(
            win,
            'http://bar.com',
            'AMP.navigateTo',
            {target: undefined, opener: undefined}
          );
        });
      });

      it(
        'should pass if node does not have throwIfCannotNavigate(), ' +
          'given target',
        () => {
          invocation.caller.tagName = 'AMP-FOO';
          invocation.caller.getImpl = () => Promise.resolve({});
          invocation.args['target'] = '_blank';
          invocation.args['opener'] = true;

          return standardActions.handleAmpTarget_(invocation).then(() => {
            expect(navigator.navigateTo).to.be.calledOnce;
            expect(navigator.navigateTo).to.be.calledWithExactly(
              win,
              'http://bar.com',
              'AMP.navigateTo',
              {target: '_blank', opener: true}
            );
          });
        }
      );

      it('should check throwIfCannotNavigate() for AMP elements', function* () {
        const userError = env.sandbox.stub(user(), 'error');

        invocation.caller.tagName = 'AMP-FOO';

        // Should succeed if throwIfCannotNavigate() is not implemented.
        invocation.caller.getImpl = () => Promise.resolve({});
        yield standardActions.handleAmpTarget_(invocation);
        expect(navigator.navigateTo).to.be.calledOnce;
        expect(navigator.navigateTo).to.be.calledWithExactly(
          win,
          'http://bar.com',
          'AMP.navigateTo',
          {target: undefined, opener: undefined}
        );

        // Should succeed if throwIfCannotNavigate() returns null.
        invocation.caller.getImpl = () =>
          Promise.resolve({
            throwIfCannotNavigate: () => null,
          });
        yield standardActions.handleAmpTarget_(invocation);
        expect(navigator.navigateTo).to.be.calledTwice;
        expect(navigator.navigateTo.getCall(1)).to.be.calledWithExactly(
          win,
          'http://bar.com',
          'AMP.navigateTo',
          {target: undefined, opener: undefined}
        );

        // Should fail if throwIfCannotNavigate() throws an error.
        invocation.caller.getImpl = () =>
          Promise.resolve({
            throwIfCannotNavigate: () => {
              throw new Error('Fake error.');
            },
          });
        yield standardActions.handleAmpTarget_(invocation);
        expect(navigator.navigateTo).to.be.calledTwice;
        expect(userError).to.be.calledWith('STANDARD-ACTIONS', 'Fake error.');
      });
    });

    describe('closeOrNavigateTo', () => {
      let navigateToStub;
      let closeOrNavigateToSpy;
      let winCloseStub;

      beforeEach(() => {
        navigateToStub = env.sandbox
          .stub(standardActions, 'handleNavigateTo_')
          .returns(Promise.resolve());

        closeOrNavigateToSpy = env.sandbox.spy(
          standardActions,
          'handleCloseOrNavigateTo_'
        );

        winCloseStub = env.sandbox.stub(win, 'close');
        winCloseStub.callsFake(() => {
          win.closed = true;
        });
        // Fake ActionInvocation.
        invocation.method = 'closeOrNavigateTo';
        invocation.args = {
          url: 'http://bar.com',
        };
        invocation.caller = {tagName: 'DIV'};
      });

      it('should be implemented', async () => {
        await standardActions.handleAmpTarget_(invocation);
        expect(closeOrNavigateToSpy).to.be.calledOnce;
        expect(closeOrNavigateToSpy).to.be.calledWithExactly(invocation);
      });

      it('should close window if allowed', async () => {
        win.opener = {};
        win.parent = win;
        await standardActions.handleAmpTarget_(invocation);
        expect(winCloseStub).to.be.calledOnce;
        expect(navigateToStub).to.be.not.called;
      });

      it('should NOT close if no opener', async () => {
        win.opener = null;
        win.parent = win;
        await standardActions.handleAmpTarget_(invocation);
        expect(winCloseStub).to.be.not.called;
      });

      it('should NOT close if has a parent', async () => {
        win.opener = {};
        win.parent = {};
        await standardActions.handleAmpTarget_(invocation);
        expect(winCloseStub).to.be.not.called;
      });

      it('should NOT close if in multi-doc', async () => {
        win.opener = {};
        win.parent = win;
        env.sandbox.stub(ampdoc, 'isSingleDoc').returns(false);
        await standardActions.handleAmpTarget_(invocation);
        expect(winCloseStub).to.be.not.called;
      });

      it('should navigate if not allowed to close', async () => {
        win.opener = null;
        win.parent = win;
        env.sandbox.stub(ampdoc, 'isSingleDoc').returns(false);
        await standardActions.handleAmpTarget_(invocation);
        expect(winCloseStub).to.be.not.called;
        expect(navigateToStub).to.be.called;
      });

      it('should navigate if win.close rejects', async () => {
        win.opener = {};
        win.parent = win;
        winCloseStub.callsFake(() => {
          win.closed = false;
        });
        await standardActions.handleAmpTarget_(invocation);
        expect(navigateToStub).to.be.called;
      });
    });

    it('should implement goBack', () => {
      installHistoryServiceForDoc(ampdoc);
      const history = Services.historyForDoc(ampdoc);
      const goBackStub = env.sandbox.stub(history, 'goBack');
      invocation.method = 'goBack';
      standardActions.handleAmpTarget_(invocation);
      expect(goBackStub).to.be.calledWithExactly(false);
      goBackStub.resetHistory();

      invocation.args = {navigate: true};
      standardActions.handleAmpTarget_(invocation);
      expect(goBackStub).to.be.calledWith(true);
    });

    it('should implement optoutOfCid', function* () {
      const cid = cidServiceForDocForTesting(ampdoc);
      const optoutStub = env.sandbox.stub(cid, 'optOut');
      invocation.method = 'optoutOfCid';
      standardActions.handleAmpTarget_(invocation);
      yield macroTask();
      expect(optoutStub).to.be.calledOnce;
    });

    it('should implement setState()', () => {
      const element = createElement();

      const bind = {invoke: env.sandbox.stub()};
      // Bind.invoke() doesn't actually resolve with a value,
      // but add one here to check that the promise is chained.
      bind.invoke.returns(Promise.resolve('set-state-complete'));
      env.sandbox
        .stub(Services, 'bindForDocOrNull')
        .withArgs(element)
        .returns(Promise.resolve(bind));

      invocation.method = 'setState';
      invocation.args = {
        [RAW_OBJECT_ARGS_KEY]: '{foo: 123}',
      };
      invocation.node = element;

      return standardActions.handleAmpTarget_(invocation).then((result) => {
        expect(result).to.equal('set-state-complete');
        expect(bind.invoke).to.be.calledOnce;
        expect(bind.invoke).to.be.calledWith(invocation);
      });
    });

    it('should implement pushState()', () => {
      const element = createElement();

      const bind = {invoke: env.sandbox.stub()};
      // Bind.invoke() doesn't actually resolve with a value,
      // but add one here to check that the promise is chained.
      bind.invoke.returns(Promise.resolve('push-state-complete'));
      env.sandbox
        .stub(Services, 'bindForDocOrNull')
        .withArgs(element)
        .returns(Promise.resolve(bind));

      invocation.method = 'pushState';
      invocation.args = {
        [RAW_OBJECT_ARGS_KEY]: '{foo: 123}',
      };
      invocation.node = element;

      return standardActions.handleAmpTarget_(invocation).then((result) => {
        expect(result).to.equal('push-state-complete');
        expect(bind.invoke).to.be.calledOnce;
        expect(bind.invoke).to.be.calledWith(invocation);
      });
    });

    it('should implement print', () => {
      const windowApi = {
        print: () => {},
      };
      const printStub = env.sandbox.stub(windowApi, 'print');

      invocation.method = 'print';
      invocation.node = {
        ownerDocument: {
          defaultView: windowApi,
        },
      };
      standardActions.handleAmpTarget_(invocation);
      expect(printStub).to.be.calledOnce;
    });

    it('should implement scrollTo with element target', () => {
      invocation.method = 'scrollTo';
      invocation.args = {
        id: 'testIdElement',
      };
      invocation.node = ampdoc;
      const element = createElement();
      const elStub = env.sandbox
        .stub(ampdoc, 'getElementById')
        .returns(element);
      const scrollStub = env.sandbox
        .stub(standardActions, 'handleScrollTo_')
        .returns('scrollToResponsePromise');
      const result = standardActions.handleAmpTarget_(invocation);
      expect(elStub).to.be.calledWith('testIdElement');
      invocation.node = element;
      expect(scrollStub).to.be.calledWith(invocation);
      expect(result).to.eql('scrollToResponsePromise');
    });
  });
});
