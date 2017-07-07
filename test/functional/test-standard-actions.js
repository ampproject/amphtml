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
import {bindForDoc, historyForDoc} from '../../src/services';
import {installHistoryServiceForDoc} from '../../src/service/history-impl';
import {setParentWindow} from '../../src/service';


describes.sandboxed('StandardActions', {}, () => {
  let standardActions;
  let mutateElementStub;
  let deferMutateStub;
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
    return sandbox.stub(
        standardActions.resources_,
        methodName,
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

  beforeEach(() => {
    ampdoc = new AmpDocSingle(window);
    standardActions = new StandardActions(ampdoc);
    mutateElementStub = stubMutate('mutateElement');
    deferMutateStub = stubMutate('deferMutate');
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

  describe('"AMP" global target', () => {
    it('should implement navigateTo', () => {
      const expandUrlStub = sandbox.stub(standardActions.urlReplacements_,
          'expandUrlSync', url => url);

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
      const history = historyForDoc(ampdoc);
      const goBackStub = sandbox.stub(history, 'goBack');
      const invocation = {method: 'goBack', satisfiesTrust: () => true};
      standardActions.handleAmpTarget(invocation);
      expect(goBackStub).to.be.calledOnce;
    });

    it('should implement setState', () => {
      const spy = sandbox.spy();
      window.services.bind = {
        obj: {
          setStateWithExpression: spy,
        },
      };

      const args = {};
      args[OBJECT_STRING_ARGS_KEY] = '{foo: 123}';

      const invocation = {
        method: 'setState',
        args,
        target: ampdoc,
        satisfiesTrust: () => true,
      };
      standardActions.handleAmpTarget(invocation);
      return bindForDoc(ampdoc).then(() => {
        expect(spy).to.be.calledOnce;
        expect(spy).to.be.calledWith('{foo: 123}');
      });
    });

    it('should implement print', () => {
      installHistoryServiceForDoc(ampdoc);
      const history = historyForDoc(ampdoc);
      const printStub = sandbox.stub(history, 'print');
      const invocation = {method: 'print', satisfiesTrust: () => true};
      standardActions.handleAmpTarget(invocation);
      expect(print).to.be.calledOnce;
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
      expect(embedActions.addGlobalMethodHandler).to.be.calledThrice;
      expect(embedActions.addGlobalMethodHandler.args[0][0]).to.equal('hide');
      expect(embedActions.addGlobalMethodHandler.args[0][1]).to.be.function;
      expect(embedActions.addGlobalMethodHandler.args[1][0]).to.equal('show');
      expect(embedActions.addGlobalMethodHandler.args[1][1]).to.be.function;
      expect(embedActions.addGlobalMethodHandler.args[2][0]).to
          .equal('toggleVisibility');
      expect(embedActions.addGlobalMethodHandler.args[2][1]).to.be.function;
      embedActions.addGlobalMethodHandler.args[0][1]();
      expect(hideStub).to.be.calledOnce;
    });
  });
});
