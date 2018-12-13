/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  ConsentUI,
  consentUiClasses,
} from '../consent-ui';
import {dict} from '../../../../src/utils/object';
import {elementByTag} from '../../../../src/dom';
import {toggleExperiment} from '../../../../src/experiments';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin('consent-ui', {
  amp: {
    ampdoc: 'single',
  },
}, env => {
  let sandbox;
  let win;
  let doc;
  let ampdoc;
  let consentUI;
  let mockInstance;
  let parent;

  beforeEach(() => {
    sandbox = env.sandbox;
    doc = env.win.document;
    ampdoc = env.ampdoc;
    win = env.win;
    parent = doc.createElement('div');
    const test1 = document.createElement('div');
    test1.setAttribute('id', 'test1');
    parent.appendChild(test1);
    const postPrompt = document.createElement('div');
    postPrompt.setAttribute('id', 'testPost');
    parent.appendChild(postPrompt);
    doc.body.appendChild(parent);
    mockInstance = {
      getAmpDoc: () => {return ampdoc;},
      element: parent,
      win,
      getViewport: () => {
        return {
          addToFixedLayer: () => {},
          updateFixedLayer: () => {},
        };
      },
      getVsync: () => {
        return {
          mutate: callback => {callback();},
        };
      },
      scheduleLayout: () => {},
      mutateElement: callback => callback(),
    };
    toggleExperiment(win, 'amp-consent-v2', true);
  });

  afterEach(() => sandbox.restore());

  const getReadyIframeCmpConsentUi = () => {
    const config = dict({
      'promptUISrc': 'https//promptUISrc',
    });
    const consentUI =
      new ConsentUI(mockInstance, config);
    const showIframeSpy = sandbox.spy(consentUI, 'showIframe_');
    consentUI.show();
    consentUI.iframeReady_.resolve();
    return whenCalled(showIframeSpy).then(() => Promise.resolve(consentUI));
  };

  describe('init', () => {
    it('should repsect postPromptUI if there is one', function* () {
      consentUI =
          new ConsentUI(mockInstance, dict({'promptUI': 'test1'}), 'testPost');
      expect(consentUI.ui_.id).to.equal('testPost');
    });

    it('should ignore promptUISrc w/ promptUI', function* () {
      const config = dict({
        'promptUI': 'test1',
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
          new ConsentUI(mockInstance, config);
      expect(consentUI.ui_.id).to.equal('test1');
    });

    it('should create iframe from promptUISrc', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
          new ConsentUI(mockInstance, config);
      expect(consentUI.ui_.tagName).to.equal('IFRAME');
    });
  });

  describe('show/hide', () => {
    it('toggle display', () => {
      const config = dict({
        'promptUI': 'test1',
      });
      consentUI =
          new ConsentUI(mockInstance, config);
      expect(parent.classList.contains('amp-active')).to.be.false;
      expect(parent.classList.contains('amp-hidden')).to.be.false;
      consentUI.show();
      expect(parent.classList.contains('amp-active')).to.be.true;
      expect(parent).to.not.have.display('none');
      consentUI.hide();
      expect(parent.classList.contains('amp-active')).to.be.false;
      expect(parent.classList.contains('amp-hidden')).to.be.true;
    });

    it('append/remove iframe', () => {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
          new ConsentUI(mockInstance, config);
      expect(elementByTag(parent, 'iframe')).to.be.null;
      consentUI.show();
      expect(elementByTag(parent, 'iframe')).to.not.be.null;
      consentUI.hide();
      expect(elementByTag(parent, 'iframe')).to.be.null;
    });
  });

  describe('CMP Iframe', () => {

    it('should load the iframe, ' +
      'then show it with correct state CSS classes', () => {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
        new ConsentUI(mockInstance, config);
      expect(parent.classList.contains('amp-active')).to.be.false;
      expect(parent.classList.contains('amp-hidden')).to.be.false;

      const showIframeSpy = sandbox.spy(consentUI, 'showIframe_');

      consentUI.show();
      expect(parent.classList.contains('amp-active')).to.be.true;
      expect(parent.classList.contains(consentUiClasses.loading)).to.be.true;
      expect(parent).to.not.have.display('none');

      // Resolve the iframe ready
      consentUI.iframeReady_.resolve();

      return whenCalled(showIframeSpy).then(() => {
        expect(
            parent.classList.contains(consentUiClasses.iframeActive)
        ).to.be.true;
      });
    });
  });

  describe('fullscreen', () => {

    it('should respond to the fullscreen event', () => {

      return getReadyIframeCmpConsentUi().then(consentUI => {
        const enterFullscreenStub = sandbox.stub(consentUI, 'enterFullscreen_');

        consentUI.ui_ = {
          contentWindow: 'mock-src',
        };
        consentUI.handleIframeMessages_({
          source: 'mock-src',
          data: {
            type: 'consent-ui',
            action: 'enter-fullscreen',
          },
        });

        expect(enterFullscreenStub).to.be.calledOnce;
      });
    });

    it('should not handle the fullscreen event, ' +
      'if the iframe wasn\'t visible', () => {

      return getReadyIframeCmpConsentUi().then(consentUI => {
        const enterFullscreenStub = sandbox.stub(consentUI, 'enterFullscreen_');

        consentUI.ui_ = {
          contentWindow: 'mock-src',
        };
        consentUI.isIframeVisible_ = false;
        consentUI.handleIframeMessages_({
          source: 'mock-src',
          data: {
            type: 'consent-ui',
            action: 'enter-fullscreen',
          },
        });

        expect(enterFullscreenStub).to.not.be.called;
      });
    });


    describe('enterFullscreen', () => {
      it('should add fullscreen classes and set fullscreen state', () => {
        return getReadyIframeCmpConsentUi().then(consentUI => {
          consentUI.enterFullscreen_();

          expect(
              parent.classList.contains(consentUiClasses.iframeFullscreen)
          ).to.be.true;
          expect(consentUI.isFullscreen_).to.be.true;
        });
      });

      it('should not enter fullscreen if already fullscreen', () => {
        return getReadyIframeCmpConsentUi().then(consentUI => {
          consentUI.isFullscreen_ = true;
          consentUI.enterFullscreen_();

          expect(
              parent.classList.contains(consentUiClasses.iframeFullscreen)
          ).to.be.false;
        });
      });
    });

  });
});
