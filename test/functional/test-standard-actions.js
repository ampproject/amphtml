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


describes.sandboxed('StandardActions', {}, () => {
  let standardActions;
  let mutateElementStub;

  beforeEach(() => {
    standardActions = new StandardActions(new AmpDocSingle(window));
    mutateElementStub = sandbox.stub(
        standardActions.resources_,
        'mutateElement',
        (unusedElement, mutator) => mutator());
  });

  describe('"hide" action', () => {
    it('should handle normal element', () => {
      const element = document.createElement('div');
      standardActions.handleHide({target: element});
      expect(mutateElementStub.callCount).to.equal(1);
      expect(mutateElementStub.firstCall.args[0]).to.equal(element);
      expect(element.style.display).to.equal('none');
    });

    it('should handle AmpElement', () => {
      const element = document.createElement('div');
      let called = false;
      element.classList.add('i-amphtml-element');
      element.collapse = function() {
        called = true;
      };

      standardActions.handleHide({target: element});
      expect(mutateElementStub.callCount).to.equal(1);
      expect(mutateElementStub.firstCall.args[0]).to.equal(element);
      expect(called).to.equal(true);
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
      expect(embedActions.addGlobalMethodHandler).to.be.calledOnce;
      expect(embedActions.addGlobalMethodHandler.args[0][0]).to.equal('hide');
      expect(embedActions.addGlobalMethodHandler.args[0][1]).to.be.function;
      embedActions.addGlobalMethodHandler.args[0][1]();
      expect(hideStub).to.be.calledOnce;
    });
  });
});
