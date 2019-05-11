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
  CONSENT_ITEM_STATE,
  constructConsentInfo,
} from '../consent-info';
import {
  ConsentUI,
  consentUiClasses,
} from '../consent-ui';
import {dict} from '../../../../src/utils/object';
import {elementByTag} from '../../../../src/dom';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
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
          removeFromFixedLayer: () => {},
        };
      },
      getVsync: () => {
        return {
          mutate: callback => {callback();},
        };
      },
      scheduleLayout: () => {},
      mutateElement: callback => {
        callback();
        return Promise.resolve();
      },
    };
    resetServiceForTesting(win, 'consentStateManager');
    registerServiceBuilder(win, 'consentStateManager', function() {
      return Promise.resolve({
        getLastConsentInstanceInfo: () => {return Promise.resolve(
            constructConsentInfo(CONSENT_ITEM_STATE.ACCEPTED, 'test'));},
      });
    });

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
    consentUI.show(false);
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
      consentUI.show(false);
      expect(parent.classList.contains('amp-active')).to.be.true;
      expect(parent).to.not.have.display('none');
      consentUI.hide();
      expect(parent.classList.contains('amp-active')).to.be.false;
      expect(parent.classList.contains('amp-hidden')).to.be.true;
    });

    it('append/remove iframe', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
          new ConsentUI(mockInstance, config);
      expect(elementByTag(parent, 'iframe')).to.be.null;
      consentUI.show(false);
      yield macroTask();
      expect(elementByTag(parent, 'iframe')).to.not.be.null;
      consentUI.hide();
      expect(elementByTag(parent, 'iframe')).to.be.null;
    });

    it('should not lock scrolling', () => {

      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
        new ConsentUI(mockInstance, config);

      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.show(false);
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.hide();
      expect(consentUI.scrollEnabled_).to.be.true;

      consentUI.show(false);
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.disableScroll_();
      expect(consentUI.scrollEnabled_).to.be.false;
      consentUI.enableScroll_();
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.disableScroll_();
      consentUI.hide();
      expect(consentUI.scrollEnabled_).to.be.true;
    });
  });

  describe('placeholder', () => {
    it('should be created / shown' +
      ' while loading CMP Iframe', async() => {

      const config = dict({
        'promptUISrc': 'https//promptUISrc',
      });
      consentUI =
          new ConsentUI(mockInstance, config);

      const placeholder = consentUI.placeholder_;
      expect(placeholder).to.be.ok;
      expect(placeholder.hidden).to.be.true;

      consentUI.show(false);

      // Pop onto the back of the event queue,
      // so we expect() once our mutate element in show() resolves
      await mockInstance.mutateElement(() => {});

      expect(placeholder.hidden).to.be.false;
      expect(placeholder.childNodes).to.not.be.empty;
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
      const applyInitialStylesSpy =
          sandbox.spy(consentUI, 'applyInitialStyles_');

      consentUI.show(false);
      expect(parent.classList.contains('amp-active')).to.be.true;
      expect(parent.classList.contains(consentUiClasses.loading)).to.be.true;
      expect(parent).to.not.have.display('none');

      // Resolve the iframe ready
      consentUI.iframeReady_.resolve();

      return whenCalled(showIframeSpy).then(() => {
        expect(
            parent.classList.contains(consentUiClasses.iframeActive)
        ).to.be.true;

        return whenCalled(applyInitialStylesSpy);
      });
    });

    it('should pass the info to the iframe', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
        'clientConfig': {
          'test': 'ABC',
        },
      });
      consentUI = new ConsentUI(mockInstance, config);
      consentUI.show(false);
      yield macroTask();

      expect(consentUI.ui_.getAttribute('name')).to.deep.equal(JSON.stringify({
        'clientConfig': {
          'test': 'ABC',
        },
        'consentState': 'accepted',
        'consentString': 'test',
        'promptTrigger': 'load',
        'isDirty': false,
      }));
    });

    it('should pass the promptTrigger reason to the iframe', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
        'clientConfig': {
          'test': 'ABC',
        },
      });
      consentUI = new ConsentUI(mockInstance, config);
      consentUI.show(true);
      yield macroTask();

      expect(consentUI.ui_.getAttribute('name')).to.deep.equal(JSON.stringify({
        'clientConfig': {
          'test': 'ABC',
        },
        'consentState': 'accepted',
        'consentString': 'test',
        'promptTrigger': 'action',
      }));
    });

  });

  describe('overlay', () => {

    it('should not enable the overlay if not configured', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
        'uiConfig': {},
      });
      consentUI =
        new ConsentUI(mockInstance, config);
      // Mock out load Iframe_
      consentUI.loadIframe_ = () => {
        return Promise.resolve();
      };
      expect(consentUI.maskElement_).to.be.null;
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.show(false);
      yield macroTask();
      expect(consentUI.maskElement_).to.be.null;
      expect(consentUI.scrollEnabled_).to.be.true;
    });

    it('append/hide/show overlay', function* () {
      const config = dict({
        'promptUISrc': 'https//promptUISrc',
        'uiConfig': {
          'overlay': true,
        },
      });
      consentUI =
        new ConsentUI(mockInstance, config);
      // Mock out load Iframe_
      consentUI.loadIframe_ = () => {
        return Promise.resolve();
      };

      expect(consentUI.overlayEnabled_).to.be.true;

      expect(consentUI.maskElement_).to.be.null;
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.show(false);
      yield macroTask();
      expect(consentUI.maskElement_).to.not.be.null;
      expect(consentUI.scrollEnabled_).to.be.false;
      consentUI.hide();
      yield macroTask();
      expect(consentUI.maskElement_.hasAttribute('hidden')).to.be.ok;
      expect(consentUI.scrollEnabled_).to.be.true;
      consentUI.show(false);
      yield macroTask();
      expect(consentUI.maskElement_.hasAttribute('hidden')).to.not.be.ok;
      expect(consentUI.scrollEnabled_).to.be.false;
      consentUI.hide();
      yield macroTask();
      expect(consentUI.maskElement_.hasAttribute('hidden')).to.be.ok;
      expect(consentUI.scrollEnabled_).to.be.true;
    });
  });

  describe('ready', () => {

    it('should respond to the ready event', () => {
      return getReadyIframeCmpConsentUi().then(consentUI => {
        const handleReadyStub = sandbox.stub(consentUI, 'handleReady_');

        consentUI.ui_ = {
          contentWindow: 'mock-src',
        };
        consentUI.handleIframeMessages_({
          source: 'mock-src',
          data: {
            type: 'consent-ui',
            action: 'ready',
          },
        });

        expect(handleReadyStub).to.be.calledOnce;
      });
    });

    it('should handle a valid initial height', () => {
      return getReadyIframeCmpConsentUi().then(consentUI => {

        expect(consentUI.initialHeight_).to.be.equal('30vh');

        consentUI.ui_ = {
          contentWindow: 'mock-src',
        };
        consentUI.handleIframeMessages_({
          source: 'mock-src',
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '50vh',
          },
        });

        expect(consentUI.initialHeight_).to.be.equal('50vh');
      });
    });

    it('should throw an error on an invalid initial height', () => {
      return getReadyIframeCmpConsentUi().then(consentUI => {

        expect(consentUI.initialHeight_).to.be.equal('30vh');

        return allowConsoleError(() => {
          consentUI.ui_ = {
            contentWindow: 'mock-src',
          };
          consentUI.handleIframeMessages_({
            source: 'mock-src',
            data: {
              type: 'consent-ui',
              action: 'ready',
              initialHeight: '9vh',
            },
          });

          expect(consentUI.initialHeight_).to.be.equal('30vh');
        });
      });
    });

    it('should handle a border value', () => {
      return getReadyIframeCmpConsentUi().then(consentUI => {

        expect(consentUI.enableBorder_).to.be.equal(true);

        consentUI.ui_ = {
          contentWindow: 'mock-src',
        };
        consentUI.handleIframeMessages_({
          source: 'mock-src',
          data: {
            type: 'consent-ui',
            action: 'ready',
            border: false,
          },
        });

        expect(consentUI.enableBorder_).to.be.equal(false);
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

    it('should disable scrolling', () => {
      return getReadyIframeCmpConsentUi().then(consentUI => {

        expect(consentUI.scrollEnabled_).to.be.true;

        consentUI.enterFullscreen_();

        expect(consentUI.scrollEnabled_).to.be.false;

        sandbox.stub(consentUI, 'baseInstance_')
            .callsFake(callback => callback());
        consentUI.hide();
        expect(consentUI.scrollEnabled_).to.be.true;
      });
    });
  });
});
