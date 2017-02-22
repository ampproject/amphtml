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

import {StandardActions} from '../../src/service/standard-actions-impl';
import {AmpDocSingle} from '../../src/service/ampdoc-impl';
import {bindForDoc} from '../../src/bind';
import {setParentWindow} from '../../src/service';
import {vsyncFor} from '../../src/vsync';


describes.sandboxed('StandardActions', {}, () => {
  let standardActions;
  let mutateElementStub;
  let deferMutateStub;

  const elementsToCleanUp = [];

  function addStyles(cssText) {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(cssText));
    document.head.appendChild(style);
  }

  function createElement() {
    const element = document.createElement('div');
    window.document.body.appendChild(element);
    elementsToCleanUp.push(element);
    return element;
  }

  function createAmpElement() {
    const element = createElement();
    element.classList.add('i-amphtml-element');
    element.collapse = sandbox.stub();
    element.expand = sandbox.stub();
    return element;
  }

  function stubVsyncRun() {
    sandbox.stub(vsyncFor(window), 'run', (task, state) => {
      if (task.measure) {
        task.measure(state);
      }
      if (task.mutate) {
        task.mutate(state);
      }
    });
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
    expect(deferMutateStub).to.be.calledOnce;
    expect(deferMutateStub.firstCall.args[0]).to.equal(element);
    expect(element.style.display).to.not.equal('none');
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
    standardActions = new StandardActions(new AmpDocSingle(window));
    mutateElementStub = stubMutate('mutateElement');
    deferMutateStub = stubMutate('deferMutate');
    addStyles('.-test-hidden { display: none }');
    stubVsyncRun();
  });

  afterEach(() => {
    while (elementsToCleanUp.length) {
      const element = elementsToCleanUp.pop();
      element.parentNode.removeChild(element);
    }
  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      standardActions.handleHide({target: element});
      expectElementToHaveBeenHidden(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      standardActions.handleHide({target: element});
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"show" action', () => {
    it('should handle normal element', () => {
      const element = createElement();
      standardActions.handleShow({target: element});
      expectElementToHaveBeenShown(element);
    });

    it('should handle AmpElement', () => {
      const element = createAmpElement();
      standardActions.handleShow({target: element});
      expectAmpElementToHaveBeenShown(element);
    });

  });

  describe('"toggle" action', () => {
    it('should show normal element when hidden (inline)', () => {
      const element = createElement();
      element.style.display = 'none';
      standardActions.handleToggle({target: element});
      expectElementToHaveBeenShown(element);
    });

    it('should show normal element when hidden (css)', () => {
      const element = createElement();
      element.className += ' -test-hidden';
      standardActions.handleToggle({target: element});
      expectElementToHaveBeenShown(element);
    });

    it('should hide normal element when shown', () => {
      const element = createElement();
      standardActions.handleToggle({target: element});
      expectElementToHaveBeenHidden(element);
    });

    it('should show AmpElement when hidden (inline)', () => {
      const element = createAmpElement();
      element.style.display = 'none';
      standardActions.handleToggle({target: element});
      expectAmpElementToHaveBeenShown(element);
    });

    it('should show AmpElement when hidden (css)', () => {
      const element = createAmpElement();
      element.className += ' -test-hidden';
      standardActions.handleToggle({target: element});
      expectAmpElementToHaveBeenShown(element);
    });

    it('should hide AmpElement when shown', () => {
      const element = createAmpElement();
      standardActions.handleToggle({target: element});
      expectAmpElementToHaveBeenHidden(element);
    });
  });

  describe('"AMP" global target', () => {
    it('should implement goBack', () => {
      const history = window.services.history.obj;
      const goBackStub = sandbox.stub(history, 'goBack');
      standardActions.handleAmpTarget({method: 'goBack'});
      expect(goBackStub).to.be.calledOnce;
    });

    it('should implement setState', () => {
      const setStateSpy = sandbox.spy();
      const bind = {setState: setStateSpy};
      window.services.bind = {obj: bind};
      const args = {};
      standardActions.handleAmpTarget({method: 'setState', args});
      return bindForDoc(standardActions.ampdoc).then(() => {
        expect(setStateSpy).to.be.calledOnce;
        expect(setStateSpy).to.be.calledWith(args);
      });
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
      expect(embedActions.addGlobalMethodHandler.args[2][0]).to.equal('toggle');
      expect(embedActions.addGlobalMethodHandler.args[2][1]).to.be.function;
      embedActions.addGlobalMethodHandler.args[0][1]();
      expect(hideStub).to.be.calledOnce;
    });
  });
});
