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

import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {OBJECT_STRING_ARGS_KEY} from '../../src/service/action-impl';
import {StandardActions} from '../../src/service/standard-actions-impl';
import {Services} from '../../src/services';
import {installHistoryServiceForDoc} from '../../src/service/history-impl';
import {setParentWindow} from '../../src/service';


describes.sandboxed('StandardActions', {}, () => {
  let standardActions;
  let mutateElementStub;
  let deferMutateStub;
  let scrollStub;
  let ampdoc;

  function createElement() {
    return document.createElement('div');
  }

  function createAmpElement() {
    const element = createElement();
    element.classList.add('i-amphtml-element');
    element.collapse = sandbox.stub();
    element.expand = sandbox.stub();
    return element;
  }

  function stubMutate(methodName) {
    return sandbox.stub(standardActions.resources_, methodName).callsFake(
        (unusedElement, mutator) => mutator());
  }

  function expectElementToHaveBeenHidden(element) {
    expect(mutateElementStub).to.be.calledOnce;
    expect(mutateElementStub.firstCall.args[0]).to.equal(element);
    expect(element.style.display).to.equal('none');
  }

  function expectElementToHaveBeenShown(element) {
    expect(mutateElementStub).to.be.calledOnce;
    expect(mutateElementStub.firstCall.args[0]).to.equal(element);
    expect(element.style.display).to.not.equal('none');
    expect(element.hasAttribute('hidden')).to.be.false;
  }

  function expectAmpElementToHaveBeenHidden(element) {
    expect(mutateElementStub).to.be.calledOnce;
    expect(mutateElementStub.firstCall.args[0]).to.equal(element);
    expect(element.collapse).to.be.calledOnce;
  }

  function expectAmpElementToHaveBeenShown(element) {
    expect(deferMutateStub).to.be.calledOnce;
    expect(deferMutateStub.firstCall.args[0]).to.equal(element);
    expect(element.expand).to.be.calledOnce;
  }

  function expectAmpElementToHaveBeenScrolledIntoView(element) {
    expect(scrollStub).to.be.calledOnce;
    expect(scrollStub.firstCall.args[0]).to.equal(element);
  }

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
    standardActions = new StandardActions(ampdoc);
    mutateElementStub = stubMutate('mutateElement');
    deferMutateStub = stubMutate('deferMutate');
    scrollStub = sandbox.stub(
        standardActions.viewport_,
        'animateScrollIntoView');

  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleHide(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleHide(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"show" action', () => {
    it('should handle normal element (inline css)', () => {
      const element = createElement();
      element.style.display = 'none';
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle normal element (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle AmpElement (inline css)', () => {
      const element = createAmpElement();
      element.style.display = 'none';
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

  });

  describe('"toggle" action', () => {
    it('should show normal element when hidden (inline css)', () => {
      const element = createElement();
      element.style.display = 'none';
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should show normal element when hidden (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should hide normal element when shown', () => {
      const element = createElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should show AmpElement when hidden (inline css)', () => {
      const element = createAmpElement();
      element.style.display = 'none';
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    it('should hide AmpElement when shown', () => {
      const element = createAmpElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"scrollTo" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleScrollTo(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      standardActions.handleScrollTo(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });
  });

  describe('"focus" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      const focusStub = sandbox.stub(element, 'focus');
      standardActions.handleFocus(invocation);
      expect(focusStub).to.be.calledOnce;
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {target: element, satisfiesTrust: () => true};
      const focusStub = sandbox.stub(element, 'focus');
      standardActions.handleFocus(invocation);
      expect(focusStub).to.be.calledOnce;
    });
  });

  describe('"AMP" global target', () => {
    it('should implement navigateTo', () => {
      const expandUrlStub = sandbox.stub(standardActions.urlReplacements_,
          'expandUrlSync').callsFake(url => url);

      const win = {
        location: 'http://foo.com',
      };
      const invocation = {
        method: 'navigateTo',
        args: {
          url: 'http://bar.com',
        },
        target: {
          ownerDocument: {
            defaultView: win,
          },
        },
      };

      // Should check trust and fail.
      invocation.satisfiesTrust = () => false;
      standardActions.handleAmpTarget(invocation);
      expect(win.location).to.equal('http://foo.com');
      expect(expandUrlStub).to.not.be.called;

      // Should succeed.
      invocation.satisfiesTrust = () => true;
      standardActions.handleAmpTarget(invocation);
      expect(win.location).to.equal('http://bar.com');
      expect(expandUrlStub.calledOnce);

      // Invalid protocols should fail.
      invocation.args.url = /*eslint no-script-url: 0*/ 'javascript:alert(1)';
      standardActions.handleAmpTarget(invocation);
      expect(win.location).to.equal('http://bar.com');
      expect(expandUrlStub.calledOnce);
    });

    it('should implement goBack', () => {
      installHistoryServiceForDoc(ampdoc);
      const history = Services.historyForDoc(ampdoc);
      const goBackStub = sandbox.stub(history, 'goBack');
      const invocation = {method: 'goBack', satisfiesTrust: () => true};
      standardActions.handleAmpTarget(invocation);
      expect(goBackStub).to.be.calledOnce;
    });

    it('should implement setState()', () => {
      const setStateWithExpression = sandbox.stub();
      // Bind.setStateWithExpression() doesn't resolve with a value,
      // but add one here to check that the promise is chained.
      setStateWithExpression.returns(Promise.resolve('set-state-complete'));

      window.services.bind = {
        obj: {setStateWithExpression},
      };

      const args = {
        [OBJECT_STRING_ARGS_KEY]: '{foo: 123}',
      };
      const target = ampdoc;
      const satisfiesTrust = () => true;
      const setState = {method: 'setState', args, target, satisfiesTrust};

      return standardActions.handleAmpTarget(setState, 0, []).then(result => {
        expect(result).to.equal('set-state-complete');
        expect(setStateWithExpression).to.be.calledOnce;
        expect(setStateWithExpression).to.be.calledWith('{foo: 123}');
      });
    });

    it('should implement pushState()', () => {
      const pushStateWithExpression = sandbox.stub();
      // Bind.pushStateWithExpression() doesn't resolve with a value,
      // but add one here to check that the promise is chained.
      pushStateWithExpression.returns(Promise.resolve('push-state-complete'));

      window.services.bind = {
        obj: {pushStateWithExpression},
      };

      const args = {
        [OBJECT_STRING_ARGS_KEY]: '{foo: 123}',
      };
      const target = ampdoc;
      const satisfiesTrust = () => true;
      const pushState = {method: 'pushState', args, target, satisfiesTrust};

      return standardActions.handleAmpTarget(pushState, 0, []).then(result => {
        expect(result).to.equal('push-state-complete');
        expect(pushStateWithExpression).to.be.calledOnce;
        expect(pushStateWithExpression).to.be.calledWith('{foo: 123}');
      });
    });

    it('should not allow chained setState', () => {
      const spy = sandbox.spy();
      window.services.bind = {
        obj: {
          setStateWithExpression: spy,
        },
      };

      const firstSetState = {
        method: 'setState',
        args: {[OBJECT_STRING_ARGS_KEY]: '{foo: 123}'},
        target: ampdoc,
        satisfiesTrust: () => true,
      };
      const secondSetState = {
        method: 'setState',
        args: {[OBJECT_STRING_ARGS_KEY]: '{bar: 456}'},
        target: ampdoc,
        satisfiesTrust: () => true,
      };
      const actionInfos = [
        {target: 'AMP', method: 'setState'},
        {target: 'AMP', method: 'setState'},
      ];
      standardActions.handleAmpTarget(firstSetState, 0, actionInfos);
      standardActions.handleAmpTarget(secondSetState, 1, actionInfos);

      return Services.bindForDocOrNull(ampdoc).then(() => {
        // Only first setState call should be allowed.
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith('{foo: 123}');
        expect(spy).to.not.be.calledWith('{bar: 456}');
      });
    });

    it('should implement print', () => {
      const windowApi = {
        print: () => {},
      };
      const printStub = sandbox.stub(windowApi, 'print');
      const invocation = {
        method: 'print',
        satisfiesTrust: () => true,
        target: {
          ownerDocument: {
            defaultView: windowApi,
          },
        },
      };
      standardActions.handleAmpTarget(invocation);
      expect(printStub).to.be.calledOnce;
    });

    it('should not implement print when not whitelisted', () => {
      const fakeMeta = {
        getAttribute: () => 'AMP.pushState,AMP.setState',
      };
      sandbox.stub(window.document.head,
          'querySelector').callsFake(() => fakeMeta);
      standardActions = new StandardActions(ampdoc);

      const windowApi = {
        print: () => {},
      };
      const printStub = sandbox.stub(windowApi, 'print');
      const invocation = {
        method: 'print',
        satisfiesTrust: () => true,
        target: {
          ownerDocument: {
            defaultView: windowApi,
          },
        },
      };
      expect(() => standardActions.handleAmpTarget(invocation)).to.throw();
      expect(printStub).to.not.be.called;
    });

    it('should implement pushState when whitelisted', () => {
      const fakeMeta = {
        getAttribute: () => 'AMP.setState,AMP.pushState',
      };
      sandbox.stub(window.document.head,
          'querySelector').callsFake(() => fakeMeta);

      standardActions = new StandardActions(ampdoc);

      const handleAmpBindActionStub =
        sandbox.stub(standardActions, 'handleAmpBindAction_');
      const invocation = {
        method: 'pushState',
        satisfiesTrust: () => true,
        target: ampdoc,
      };

      expect(() =>
        standardActions.handleAmpTarget(invocation, 0, [])).to.not.throw();
      expect(handleAmpBindActionStub).to.be.calledOnce;
    });
  });

  describes.fakeWin('adoptEmbedWindow', {}, env => {
    let embedWin;
    let embedActions;
    let hideStub;

    beforeEach(() => {
      embedActions = {
        addGlobalTarget: sandbox.spy(),
        addGlobalMethodHandler: sandbox.spy(),
      };
      embedWin = env.win;
      embedWin.services = {
        action: {obj: embedActions},
      };
      setParentWindow(embedWin, window);
      hideStub = sandbox.stub(standardActions, 'handleHide');
    });

    it('should configured the embedded actions service', () => {
      const stub = sandbox.stub(standardActions, 'handleAmpTarget');
      standardActions.adoptEmbedWindow(embedWin);

      // Global targets.
      expect(embedActions.addGlobalTarget).to.be.calledOnce;
      expect(embedActions.addGlobalTarget.args[0][0]).to.equal('AMP');
      embedActions.addGlobalTarget.args[0][1]();
      expect(stub).to.be.calledOnce;

      // Global actions.
      expect(embedActions.addGlobalMethodHandler).to.have.callCount(5);
      expect(embedActions.addGlobalMethodHandler.args[0][0]).to.equal('hide');
      expect(
          embedActions.addGlobalMethodHandler.args[0][1]).to.be.a('function');
      expect(embedActions.addGlobalMethodHandler.args[1][0]).to.equal('show');
      expect(
          embedActions.addGlobalMethodHandler.args[1][1]).to.be.a('function');
      expect(embedActions.addGlobalMethodHandler.args[2][0]).to
          .equal('toggleVisibility');
      expect(
          embedActions.addGlobalMethodHandler.args[2][1]).to.be.a('function');
      expect(embedActions.addGlobalMethodHandler.args[3][0]).to
          .equal('scrollTo');
      expect(
          embedActions.addGlobalMethodHandler.args[3][1]).to.be.a('function');
      expect(embedActions.addGlobalMethodHandler.args[4][0]).to
          .equal('focus');
      expect(
          embedActions.addGlobalMethodHandler.args[4][1]).to.be.a('function');
      embedActions.addGlobalMethodHandler.args[0][1]();
      expect(hideStub).to.be.calledOnce;
    });
  });
});
