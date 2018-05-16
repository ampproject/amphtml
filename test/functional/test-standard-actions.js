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
import {RAW_OBJECT_ARGS_KEY} from '../../src/action-constants';
import {Services} from '../../src/services';
import {StandardActions} from '../../src/service/standard-actions-impl';
import {cidServiceForDocForTesting} from '../../src/service/cid-impl';
import {installHistoryServiceForDoc} from '../../src/service/history-impl';
import {macroTask} from '../../testing/yield';

import {setParentWindow} from '../../src/service';

describes.sandboxed('StandardActions', {}, () => {
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
    expect(mutateElementStub).to.be.calledOnce;
    expect(mutateElementStub.firstCall.args[0]).to.equal(element);
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
    scrollStub = sandbox.stub(
        standardActions.viewport_,
        'animateScrollIntoView');

  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleHide(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleHide(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"show" action', () => {
    it('should handle normal element (inline css)', () => {
      const element = createElement();
      element.style.display = 'none';
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle normal element (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should handle AmpElement (inline css)', () => {
      const element = createAmpElement();
      element.style.display = 'none';
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleShow(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

  });

  describe('"toggle" action', () => {
    it('should show normal element when hidden (inline css)', () => {
      const element = createElement();
      element.style.display = 'none';
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should show normal element when hidden (hidden attribute)', () => {
      const element = createElement();
      element.setAttribute('hidden', '');
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenShown(element);
    });

    it('should hide normal element when shown', () => {
      const element = createElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectElementToHaveBeenHidden(element);
    });

    it('should show AmpElement when hidden (inline css)', () => {
      const element = createAmpElement();
      element.style.display = 'none';
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectAmpElementToHaveBeenShown(element);
    });

    it('should hide AmpElement when shown', () => {
      const element = createAmpElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleToggle(invocation);
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"scrollTo" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleScrollTo(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      standardActions.handleScrollTo(invocation);
      expectAmpElementToHaveBeenScrolledIntoView(element);
    });
  });

  describe('"focus" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      const focusStub = sandbox.stub(element, 'focus');
      standardActions.handleFocus(invocation);
      expect(focusStub).to.be.calledOnce;
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      const invocation = {node: element, satisfiesTrust: () => true};
      const focusStub = sandbox.stub(element, 'focus');
      standardActions.handleFocus(invocation);
      expect(focusStub).to.be.calledOnce;
    });
  });

  describe('"AMP" global target', () => {
    let win;
    let invocation;

    beforeEach(() => {
      win = {};
      invocation = {
        args: {},
        node: {
          ownerDocument: {
            defaultView: win,
          },
        },
        satisfiesTrust: () => true,
      };
    });

    it('should implement navigateTo', () => {
      const navigator = {navigateTo: sandbox.stub()};
      sandbox.stub(Services, 'navigationForDoc').returns(navigator);

      invocation.method = 'navigateTo';
      invocation.args.url = 'http://bar.com';

      // Should check trust and fail.
      invocation.satisfiesTrust = () => false;
      standardActions.handleAmpTarget(invocation);
      expect(navigator.navigateTo).to.be.not.called;

      // Should succeed.
      invocation.satisfiesTrust = () => true;
      standardActions.handleAmpTarget(invocation);
      expect(navigator.navigateTo).to.be.calledOnce;
      expect(navigator.navigateTo).to.be.calledWithExactly(
          win, 'http://bar.com', 'AMP.navigateTo');
    });

    it('should implement goBack', () => {
      installHistoryServiceForDoc(ampdoc);
      const history = Services.historyForDoc(ampdoc);
      const goBackStub = sandbox.stub(history, 'goBack');
      invocation.method = 'goBack';
      standardActions.handleAmpTarget(invocation);
      expect(goBackStub).to.be.calledOnce;
    });


    it('should implement optoutOfCid', function*() {
      const cid = cidServiceForDocForTesting(ampdoc);
      const optoutStub = sandbox.stub(cid, 'optOut');
      invocation.method = 'optoutOfCid';
      standardActions.handleAmpTarget(invocation);
      yield macroTask();
      expect(optoutStub).to.be.calledOnce;
    });


    it('should implement setState()', () => {
      const invokeSpy = sandbox.stub();
      // Bind.invoke() doesn't resolve with a value,
      // but add one here to check that the promise is chained.
      invokeSpy.returns(Promise.resolve('set-state-complete'));

      window.services.bind = {
        obj: {invoke: invokeSpy},
      };

      invocation.method = 'setState';
      invocation.args = {
        [RAW_OBJECT_ARGS_KEY]: '{foo: 123}',
      };
      invocation.node = ampdoc;

      return standardActions.handleAmpTarget(invocation).then(result => {
        expect(result).to.equal('set-state-complete');
        expect(invokeSpy).to.be.calledOnce;
        expect(invokeSpy).to.be.calledWith(invocation);
      });
    });

    it('should implement pushState()', () => {
      const invokeSpy = sandbox.stub();
      // Bind.invoke() doesn't resolve with a value,
      // but add one here to check that the promise is chained.
      invokeSpy.returns(Promise.resolve('push-state-complete'));

      window.services.bind = {
        obj: {invoke: invokeSpy},
      };

      invocation.method = 'pushState';
      invocation.args = {
        [RAW_OBJECT_ARGS_KEY]: '{foo: 123}',
      };
      invocation.node = ampdoc;

      return standardActions.handleAmpTarget(invocation).then(result => {
        expect(result).to.equal('push-state-complete');
        expect(invokeSpy).to.be.calledOnce;
        expect(invokeSpy).to.be.calledWith(invocation);
      });
    });

    it('should implement print', () => {
      const windowApi = {
        print: () => {},
      };
      const printStub = sandbox.stub(windowApi, 'print');

      invocation.method = 'print';
      invocation.node = {
        ownerDocument: {
          defaultView: windowApi,
        },
      };
      standardActions.handleAmpTarget(invocation);
      expect(printStub).to.be.calledOnce;
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
