import {RAW_OBJECT_ARGS_KEY} from '#core/constants/action-constants';
import {htmlFor} from '#core/dom/static-template';
import {toggle} from '#core/dom/style';

import {Services} from '#service';
import {AmpDocService, AmpDocSingle} from '#service/ampdoc-impl';
import {cidServiceForDocForTesting} from '#service/cid-impl';
import {installHistoryServiceForDoc} from '#service/history-impl';
import {
  StandardActions,
  getAutofocusElementForShowAction,
} from '#service/standard-actions-impl';

import {user} from '#utils/log';

import {macroTask} from '#testing/helpers';

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

  function expectCheckboxToHaveCheckedStateTrue(element) {
    expectElementMutatedAsync(element);
    expect(element.checked).to.true;
  }

  function expectCheckboxToHaveCheckedStateFalse(element) {
    expectElementMutatedAsync(element);
    expect(element.checked).to.false;
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

  describe('"toggleChecked" action', () => {
    it('should set checked property to false when checked property is true', () => {
      const element = createElement();
      element.type = 'checkbox';
      element.checked = true;
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {},
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateFalse(element);
    });

    it('should set checked property to true when checked property is false', () => {
      const element = createElement();
      element.type = 'checkbox';
      element.checked = false;
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {},
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateTrue(element);
    });

    it('should set checked property to false when checked property is true and args is null', () => {
      const element = createElement();
      element.type = 'checkbox';
      element.checked = true;
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: null,
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateFalse(element);
    });

    it('should set checked property to true when checked property is false and args is null', () => {
      const element = createElement();
      element.type = 'checkbox';
      element.checked = false;
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: null,
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateTrue(element);
    });

    it('should set checked property to true when force=true', () => {
      const element = createElement();
      element.type = 'checkbox';
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'force': true,
        },
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateTrue(element);
    });

    it('should set checked property to false when force=false', () => {
      const element = createElement();
      element.type = 'checkbox';
      const invocation = {
        node: element,
        satisfiesTrust: () => true,
        args: {
          'force': false,
        },
      };
      standardActions.handleToggleChecked_(invocation);
      expectCheckboxToHaveCheckedStateFalse(element);
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
        expect(userError).to.be.calledWith(
          'STANDARD-ACTIONS',
          env.sandbox.match((arg) => arg.message === 'Fake error.')
        );
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

describes.realWin('toggleTheme action', {amp: true}, (env) => {
  let invocation, win, body, standardActions;
  let matchMediaStub, getItemStub, setItemStub;

  beforeEach(() => {
    win = env.win;
    body = win.document.body;
    standardActions = new StandardActions(env.ampdoc);

    getItemStub = env.sandbox.stub(win.localStorage, 'getItem');
    setItemStub = env.sandbox.stub(win.localStorage, 'setItem');

    matchMediaStub = env.sandbox.stub(win, 'matchMedia');

    invocation = {
      node: {
        ownerDocument: {
          defaultView: env.win,
        },
      },
      satisfiesTrust: () => true,
    };

    invocation.method = 'toggleTheme';
  });

  it('should set amp-dark-mode property in localStorage with yes', async () => {
    getItemStub.withArgs('amp-dark-mode').returns('no');

    await standardActions.handleAmpTarget_(invocation);

    expect(getItemStub)
      .to.be.calledOnce.and.calledWith('amp-dark-mode')
      .and.returned('no');

    expect(body).to.have.class('amp-dark-mode');

    expect(setItemStub).to.be.calledOnce.and.calledWith('amp-dark-mode', 'yes');
  });

  it('should set amp-dark-mode property in localStorage with no', async () => {
    getItemStub.withArgs('amp-dark-mode').returns('yes');

    await standardActions.handleAmpTarget_(invocation);

    expect(getItemStub)
      .to.be.calledOnce.and.calledWith('amp-dark-mode')
      .and.returned('yes');

    expect(body).to.not.have.class('amp-dark-mode');

    expect(setItemStub).to.be.calledOnce.and.calledWith('amp-dark-mode', 'no');
  });

  it('should set amp-dark-mode property in localStorage with yes if it is null and user prefers light mode', async () => {
    getItemStub.withArgs('amp-dark-mode').returns(null);

    matchMediaStub
      .withArgs('(prefers-color-scheme: dark)')
      .returns({matches: false});

    await standardActions.handleAmpTarget_(invocation);

    expect(getItemStub)
      .to.be.calledOnce.and.calledWith('amp-dark-mode')
      .and.returned(null);

    expect(body).to.have.class('amp-dark-mode');

    expect(setItemStub).to.be.calledOnce.and.calledWith('amp-dark-mode', 'yes');
  });

  it('should set amp-dark-mode property in localStorage with no if it is null and user prefers dark mode', async () => {
    getItemStub.withArgs('amp-dark-mode').returns(null);

    matchMediaStub
      .withArgs('(prefers-color-scheme: dark)')
      .returns({matches: true});

    await standardActions.handleAmpTarget_(invocation);

    expect(getItemStub)
      .to.be.calledOnce.and.calledWith('amp-dark-mode')
      .and.returned(null);

    expect(body).to.not.have.class('amp-dark-mode');

    expect(setItemStub).to.be.calledOnce.and.calledWith('amp-dark-mode', 'no');
  });

  it('should add custom dark mode class to the body', async () => {
    body.setAttribute('data-prefers-dark-mode-class', 'is-dark-mode');
    getItemStub.withArgs('amp-dark-mode').returns('no');

    await standardActions.handleAmpTarget_(invocation);

    expect(body).to.have.class('is-dark-mode');

    expect(setItemStub).to.be.calledOnce.and.calledWith('amp-dark-mode', 'yes');
  });
});

describes.realWin('copy action', {amp: true}, (env) => {
  let ampdoc, standardActions, win;
  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
    env.sandbox.stub(AmpDocService.prototype, 'getAmpDoc').returns(ampdoc);
    standardActions = new StandardActions(ampdoc);
    win = env.win;
  });

  function trustedInvocation(obj) {
    return {satisfiesTrust: () => true, ...obj};
  }

  it('should copy `static text` using navigator.clipboard api', async () => {
    env.sandbox.spy(env.win.navigator.clipboard, 'writeText');
    const doc = win.document;

    const invocation = trustedInvocation({
      args: {'text': 'Hello World!'},
      tagOrTarget: 'AMP',
      node: doc,
      caller: doc,
    });
    standardActions.handleCopy_(invocation);

    await expect(env.win.navigator.clipboard.writeText).to.be.calledWith(
      'Hello World!'
    );
  });

  it('should copy `DIV Content` using navigator.clipboard api', async () => {
    env.sandbox.spy(env.win.navigator.clipboard, 'writeText');
    const divElement = win.document.createElement('div');
    divElement.textContent = 'Hello World!';

    const invocation = trustedInvocation({
      node: divElement,
      caller: divElement,
    });
    standardActions.handleCopy_(invocation);

    await expect(env.win.navigator.clipboard.writeText).to.be.calledWith(
      'Hello World!'
    );
  });

  it('should copy `INPUT Value` using navigator.clipboard api', async () => {
    env.sandbox.spy(env.win.navigator.clipboard, 'writeText');
    const inputElement = win.document.createElement('input');
    inputElement.value = 'Hello World!';

    const invocation = trustedInvocation({
      node: inputElement,
      caller: inputElement,
    });
    standardActions.handleCopy_(invocation);

    await expect(env.win.navigator.clipboard.writeText).to.be.calledWith(
      'Hello World!'
    );
  });

  it('should fall back to legacy "doc.execCommand" if clipboard is not on the window.navigator', async () => {
    Object.defineProperties(env.win.navigator, {
      clipboard: {
        value: undefined,
        writable: true,
      },
    });

    env.sandbox.spy(env.win.document, 'execCommand');
    const divElement = win.document.createElement('div');
    divElement.textContent = 'Live long and prosper!';

    const invocation = trustedInvocation({
      node: divElement,
      caller: divElement,
    });
    standardActions.handleCopy_(invocation);

    await expect(env.win.document.execCommand).to.be.calledWith('copy');
  });
});
