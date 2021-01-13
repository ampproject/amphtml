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

import * as lolex from 'lolex';
import {
  CONSENT_ITEM_STATE,
  constructConsentInfo,
  constructMetadata,
} from '../consent-info';
import {CONSENT_STRING_TYPE} from '../../../../src/consent-state';
import {ConsentUI, consentUiClasses} from '../consent-ui';
import {Services} from '../../../../src/services';
import {dict} from '../../../../src/utils/object';
import {elementByTag} from '../../../../src/dom';
import {macroTask} from '../../../../testing/yield';
import {
  registerServiceBuilder,
  resetServiceForTesting,
} from '../../../../src/service';
import {user} from '../../../../src/log';
import {whenCalled} from '../../../../testing/test-helper.js';

describes.realWin(
  'consent-ui',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let win;
    let doc;
    let ampdoc;
    let consentUI;
    let mockInstance;
    let parent;

    beforeEach(() => {
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
        getAmpDoc: () => {
          return ampdoc;
        },
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
            mutate: (callback) => {
              callback();
            },
          };
        },
        mutateElement: (callback) => {
          callback();
          return Promise.resolve();
        },
      };
      Services.ownersForDoc(doc).scheduleLayout = env.sandbox.mock();
      resetServiceForTesting(win, 'consentStateManager');
      registerServiceBuilder(win, 'consentStateManager', function () {
        return Promise.resolve({
          getLastConsentInstanceInfo: () => {
            return Promise.resolve(
              constructConsentInfo(
                CONSENT_ITEM_STATE.ACCEPTED,
                'test',
                constructMetadata(CONSENT_STRING_TYPE.TCF_V2, '1~1.10.12.103')
              )
            );
          },
        });
      });
    });

    afterEach(() => {
      env.sandbox.restore();
    });

    const getReadyIframeCmpConsentUi = () => {
      const config = dict({
        'promptUISrc': 'https://promptUISrc',
      });
      const consentUI = new ConsentUI(mockInstance, config);
      const showIframeSpy = env.sandbox.spy(consentUI, 'showIframe_');
      consentUI.show(false);
      consentUI.iframeReady_.resolve();
      return whenCalled(showIframeSpy).then(() => Promise.resolve(consentUI));
    };

    describe('init', () => {
      it('should repsect postPromptUI if there is one', function* () {
        consentUI = new ConsentUI(
          mockInstance,
          dict({'promptUI': 'test1'}),
          'testPost'
        );
        expect(consentUI.ui_.id).to.equal('testPost');
      });

      it('should ignore promptUISrc w/ promptUI', function* () {
        const config = dict({
          'promptUI': 'test1',
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);
        expect(consentUI.ui_.id).to.equal('test1');
      });

      it('should create iframe from promptUISrc', function* () {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);
        expect(consentUI.ui_.tagName).to.equal('IFRAME');
        expect(consentUI.ui_.getAttribute('sandbox')).to.equal(
          'allow-scripts allow-popups allow-same-origin'
        );
      });
    });

    describe('show/hide', () => {
      it('toggle display', () => {
        const config = dict({
          'promptUI': 'test1',
        });
        consentUI = new ConsentUI(mockInstance, config);
        expect(parent.classList.contains('amp-active')).to.be.false;
        expect(parent.classList.contains('amp-hidden')).to.be.false;
        consentUI.show(false);
        expect(parent.classList.contains('amp-active')).to.be.true;
        expect(parent).to.not.have.display('none');
        consentUI.hide();
        expect(parent.classList.contains('amp-active')).to.be.false;
        expect(parent.classList.contains('amp-hidden')).to.be.true;
      });

      it('append/remove iframe', async () => {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);
        const clock = lolex.install({target: win});

        // Append iframe, and remove iframe after 1sec timeout
        expect(elementByTag(parent, 'iframe')).to.be.null;
        consentUI.show(false);
        await macroTask();
        expect(elementByTag(parent, 'iframe')).to.not.be.null;
        consentUI.hide();
        clock.tick(999);
        expect(elementByTag(parent, 'iframe')).to.not.be.null;
        clock.tick(1);
        expect(elementByTag(parent, 'iframe')).to.be.null;

        // Not remove iframe if it got appended again
        consentUI.show(false);
        await macroTask();
        consentUI.hide();
        clock.tick(999);
        expect(elementByTag(parent, 'iframe')).to.not.be.null;
        consentUI.show(false);
        await macroTask();
        clock.tick(1);
        expect(elementByTag(parent, 'iframe')).to.not.be.null;

        clock.uninstall();
      });

      it('should not lock scrolling', () => {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);

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

      it('should set the iframe transform class on parent', async () => {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);

        consentUI.show(false);
        consentUI.handleIframeMessages_({
          source: consentUI.ui_.contentWindow,
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '80vh',
          },
        });
        await macroTask();
        expect(
          consentUI.parent_.style.getPropertyValue('--i-amphtml-modal-height')
        ).to.equal('80vh');
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.iframeTransform)
        ).to.be.true;
      });
    });

    describe('placeholder', () => {
      it('should be created / shown while loading CMP Iframe', async () => {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
        });
        consentUI = new ConsentUI(mockInstance, config);

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
      it(
        'should load the iframe, ' +
          'then show it with correct state CSS classes',
        () => {
          const config = dict({
            'promptUISrc': 'https://promptUISrc',
          });
          consentUI = new ConsentUI(mockInstance, config);
          expect(parent.classList.contains('amp-active')).to.be.false;
          expect(parent.classList.contains('amp-hidden')).to.be.false;

          const showIframeSpy = env.sandbox.spy(consentUI, 'showIframe_');
          const applyInitialStylesSpy = env.sandbox.spy(
            consentUI,
            'applyInitialStyles_'
          );

          consentUI.show(false);
          expect(parent.classList.contains('amp-active')).to.be.true;
          expect(parent.classList.contains(consentUiClasses.loading)).to.be
            .true;
          expect(parent).to.not.have.display('none');

          // Resolve the iframe ready
          consentUI.iframeReady_.resolve();

          return whenCalled(showIframeSpy).then(() => {
            expect(parent.classList.contains(consentUiClasses.iframeActive)).to
              .be.true;

            return whenCalled(applyInitialStylesSpy);
          });
        }
      );

      it('should expand the promptUISrc', function* () {
        const config = dict({
          'promptUISrc': 'https://example.test?cid=CLIENT_ID&r=RANDOM',
          'clientConfig': {
            'test': 'ABC',
          },
        });
        consentUI = new ConsentUI(mockInstance, config);
        consentUI.show(false);
        yield macroTask();
        expect(consentUI.ui_.src).to.match(/cid=amp-.{22}&r=RANDOM/);
      });

      it('should pass the info to the iframe', function* () {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
          'clientConfig': {
            'test': 'ABC',
          },
        });
        consentUI = new ConsentUI(mockInstance, config);
        consentUI.show(false);
        yield macroTask();

        expect(consentUI.ui_.getAttribute('name')).to.deep.equal(
          JSON.stringify({
            'clientConfig': {
              'test': 'ABC',
            },
            'consentState': 'accepted',
            'consentStateValue': 'accepted',
            'consentMetadata': constructMetadata(
              CONSENT_STRING_TYPE.TCF_V2,
              '1~1.10.12.103'
            ),
            'consentString': 'test',
            'promptTrigger': 'load',
            'isDirty': false,
          })
        );
      });

      it('should pass the promptTrigger reason to the iframe', function* () {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
          'clientConfig': {
            'test': 'ABC',
          },
        });
        consentUI = new ConsentUI(mockInstance, config);
        consentUI.show(true);
        yield macroTask();

        const clientInfo = JSON.parse(consentUI.ui_.getAttribute('name'));
        expect(clientInfo.promptTrigger).to.equal('action');
      });

      describe('fullscreen user interaction experiment', () => {
        it('should focus on the SR alert button', () => {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });
          const showIframeSpy = env.sandbox.spy(consentUI, 'showIframe_');

          consentUI.show(false);
          consentUI.iframeReady_.resolve();

          return whenCalled(showIframeSpy).then(() => {
            const srButton = consentUI.srAlert_.children[1];
            expect(doc.activeElement).to.equal(srButton);
          });
        });

        it('should style SR dialog correctly', () => {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });
          const showIframeSpy = env.sandbox.spy(consentUI, 'showIframe_');

          consentUI.show(false);
          consentUI.iframeReady_.resolve();

          return whenCalled(showIframeSpy).then(() => {
            expect(consentUI.srAlert_.classList[0]).to.equal(
              'i-amphtml-consent-alertdialog'
            );
          });
        });

        it('should append, remove, & not show the SR alert and have default titles', async () => {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });
          const clock = lolex.install({target: win});
          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();

          // iframe, placeholder, div, div, srAlert
          const lastChild = consentUI.baseInstance_.element.children[4];
          expect(lastChild).to.equal(consentUI.srAlert_);
          expect(lastChild.hasAttribute('hidden')).to.be.false;
          expect(lastChild.children[0].innerText).to.equal(
            'User Consent Prompt'
          );
          expect(lastChild.children[1].innerText).to.equal('Focus Prompt');

          consentUI.hide();
          await macroTask();
          // SR alert removed from DOM
          expect(consentUI.srAlert_).to.be.undefined;
          expect(consentUI.srAlertShown_).to.be.true;
          // placeholder, div, div
          expect(consentUI.baseInstance_.element.children.length).to.equal(4);
          clock.tick(1000);
          expect(consentUI.baseInstance_.element.children.length).to.equal(3);

          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();
          expect(consentUI.srAlertShown_).to.be.true;
          // iframe, placeholder, div, div
          expect(consentUI.baseInstance_.element.children.length).to.equal(4);
          clock.uninstall();
        });

        it('should have configurable captions', async () => {
          const newConsentPromptCaption = 'New Consent Policy Title';
          const newButtonActionCaption = 'New Button Action Caption';
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
            'captions': {
              'consentPromptCaption': newConsentPromptCaption,
              'buttonActionCaption': newButtonActionCaption,
            },
          });

          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();

          // Get the last child of the amp-consent element
          const dialog = consentUI.baseInstance_.element.children[4];
          expect(dialog.children[0].innerText).to.equal(
            newConsentPromptCaption
          );
          expect(dialog.children[1].innerText).to.equal(newButtonActionCaption);
        });

        it('should focus on iframe when button is clicked', function* () {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });

          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          yield macroTask();

          const button =
            consentUI.baseInstance_.element.children[4].children[1];
          const iframe = consentUI.ui_;
          expect(doc.activeElement).to.equal(button);
          button.click();
          expect(doc.activeElement).to.equal(iframe);
        });

        it('should not expand if iframe is not in focus', async () => {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });

          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();

          // not currently fullscreen
          expect(consentUI.isFullscreen_).to.be.false;
          expect(
            consentUI.parent_.classList.contains(
              consentUiClasses.iframeFullscreen
            )
          ).to.be.false;

          // Send expand
          sendMessageConsentUi(consentUI, 'enter-fullscreen');

          expect(consentUI.isFullscreen_).to.be.false;
          expect(
            consentUI.parent_.classList.contains(
              consentUiClasses.iframeFullscreen
            )
          ).to.be.false;
        });

        it('should expand if iframe is in focus', async () => {
          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });

          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();

          const button =
            consentUI.baseInstance_.element.children[4].children[1];
          const iframe = consentUI.ui_;
          expect(doc.activeElement).to.equal(button);
          button.click();
          expect(doc.activeElement).to.equal(iframe);
          await macroTask();

          // not currently fullscreen
          expect(consentUI.isFullscreen_).to.be.false;
          expect(
            consentUI.parent_.classList.contains(
              consentUiClasses.iframeFullscreen
            )
          ).to.be.false;

          // focus on iframe
          consentUI.ui_.focus();
          expect(doc.activeElement).to.equal(consentUI.ui_);

          sendMessageConsentUi(consentUI, 'enter-fullscreen');

          expect(consentUI.isFullscreen_).to.be.true;
          expect(
            consentUI.parent_.classList.contains(
              consentUiClasses.iframeFullscreen
            )
          ).to.be.true;
        });

        it('should show error and send messages back to iframe if not user interaction', async () => {
          const errorSpy = env.sandbox.spy(user(), 'warn');

          consentUI = new ConsentUI(mockInstance, {
            'promptUISrc': 'https://promptUISrc',
          });

          // No user interation through actionPromptTrigger
          consentUI.show(false);
          consentUI.iframeReady_.resolve();
          await macroTask();

          const windowSpy = env.sandbox.spy(
            consentUI.ui_.contentWindow,
            'postMessage'
          );

          // Unsuccessful fullscreen event
          sendMessageConsentUi(consentUI, 'enter-fullscreen');

          expect(errorSpy).to.be.calledOnce;
          expect(errorSpy.args[0][1]).to.match(/Could not enter fullscreen/);

          expect(windowSpy).to.be.calledOnce;
          expect(windowSpy.args[0][0]).to.deep.equal({
            'type': 'amp-consent-response',
            'requestType': 'consent-ui',
            'requestAction': 'enter-fullscreen',
            'state': 'error',
            'info':
              'Could not enter fullscreen. Fullscreen is only supported when the iframe is visible as a bottom sheet and after user interaction.',
          });

          errorSpy.resetHistory();
          windowSpy.resetHistory();

          // focus on iframe
          consentUI.ui_.focus();

          // Successful fullscreen event
          sendMessageConsentUi(consentUI, 'enter-fullscreen');

          expect(errorSpy).to.not.be.called;
          expect(windowSpy).to.be.calledOnce;
          expect(windowSpy.args[0][0]).to.deep.equal({
            'type': 'amp-consent-response',
            'requestType': 'consent-ui',
            'requestAction': 'enter-fullscreen',
            'state': 'success',
            'info': 'Entering fullscreen.',
          });
        });

        describe('actionPromptTrigger', () => {
          it('should expand when actionPromptTrigger is true', async () => {
            consentUI = new ConsentUI(mockInstance, {
              'promptUISrc': 'https://promptUISrc',
            });

            consentUI.show(true);
            consentUI.iframeReady_.resolve();
            await macroTask();

            // Send expand
            sendMessageConsentUi(consentUI, 'enter-fullscreen');

            expect(consentUI.isFullscreen_).to.be.true;
            expect(consentUI.isActionPromptTrigger_).to.be.true;
            expect(
              consentUI.parent_.classList.contains(
                consentUiClasses.iframeFullscreen
              )
            ).to.be.true;
          });
        });
      });
    });

    describe('overlay', () => {
      it('should not enable the overlay if not configured', function* () {
        const config = dict({
          'promptUISrc': 'https://promptUISrc',
          'uiConfig': {},
        });
        consentUI = new ConsentUI(mockInstance, config);
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
          'promptUISrc': 'https://promptUISrc',
          'uiConfig': {
            'overlay': true,
          },
        });
        consentUI = new ConsentUI(mockInstance, config);
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
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          const handleReadyStub = env.sandbox.stub(consentUI, 'handleReady_');

          sendMessageConsentUi(consentUI, 'ready');

          expect(handleReadyStub).to.be.calledOnce;
        });
      });

      it('should handle a valid initial height', () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          expect(consentUI.initialHeight_).to.be.equal('30vh');

          consentUI.handleIframeMessages_({
            source: consentUI.ui_.contentWindow,
            data: {
              type: 'consent-ui',
              action: 'ready',
              initialHeight: '50vh',
            },
          });

          expect(consentUI.initialHeight_).to.be.equal('50vh');
        });
      });

      it('should trigger modal with certain vh', async () => {
        consentUI = new ConsentUI(mockInstance, {
          'promptUISrc': 'https//promptUISrc',
        });

        expect(consentUI.initialHeight_).to.be.equal('30vh');
        expect(consentUI.modalEnabled_).to.be.false;
        expect(consentUI.overlayEnabled_).to.be.undefined;

        consentUI.show(true);
        consentUI.handleIframeMessages_({
          source: consentUI.ui_.contentWindow,
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '80vh',
          },
        });
        await macroTask();

        expect(consentUI.initialHeight_).to.be.equal('80vh');
        expect(consentUI.modalEnabled_).to.be.true;
        expect(consentUI.overlayEnabled_).to.be.true;
        expect(consentUI.parent_.classList.contains(consentUiClasses.modal)).to
          .be.true;
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.borderEnabled)
        ).to.be.true;
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.iframeActive)
        ).to.be.true;
        expect(
          consentUI.parent_.style.getPropertyValue('--i-amphtml-modal-height')
        ).to.equal('80vh');
        expect(consentUI.maskElement_.classList.contains(consentUiClasses.mask))
          .to.be.true;

        // Hide
        consentUI.hide();
        expect(consentUI.parent_.classList.contains(consentUiClasses.modal)).to
          .be.false;
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.borderEnabled)
        ).to.be.false;
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.iframeActive)
        ).to.be.false;
        expect(consentUI.maskElement_.hasAttribute('hidden')).to.be.true;
      });

      it('should trigger modal view and force overlay and borders', async () => {
        consentUI = new ConsentUI(mockInstance, {
          'promptUISrc': 'https//promptUISrc',
          'uiConfig': {},
        });

        consentUI.show(true);
        consentUI.handleIframeMessages_({
          source: consentUI.ui_.contentWindow,
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '80vh',
            border: false,
          },
        });
        await macroTask();

        expect(consentUI.overlayEnabled_).to.be.true;
        expect(
          consentUI.parent_.classList.contains(consentUiClasses.borderEnabled)
        ).to.be.true;
      });

      it('should throw an error on an invalid initial height', () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          expect(consentUI.initialHeight_).to.be.equal('30vh');

          return allowConsoleError(() => {
            consentUI.handleIframeMessages_({
              source: consentUI.ui_.contentWindow,
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

      it('should focus on ui when modal', async () => {
        consentUI = new ConsentUI(mockInstance, {
          'promptUISrc': 'https//promptUISrc',
          'uiConfig': {},
        });

        consentUI.show(true);
        consentUI.handleIframeMessages_({
          source: consentUI.ui_.contentWindow,
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '80vh',
            border: false,
          },
        });
        await macroTask();

        expect(consentUI.srAlertShown_).to.be.false;
        expect(consentUI.srAlert_).to.be.null;
        expect(doc.activeElement).to.equal(consentUI.ui_);
        expect(consentUI.parent_.classList.contains(consentUiClasses.modal)).to
          .be.true;
      });

      it('should handle a border value', () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          expect(consentUI.borderEnabled_).to.be.equal(true);

          consentUI.handleIframeMessages_({
            source: consentUI.ui_.contentWindow,
            data: {
              type: 'consent-ui',
              action: 'ready',
              border: false,
            },
          });

          expect(consentUI.borderEnabled_).to.be.equal(false);
        });
      });
    });

    describe('fullscreen', () => {
      it(
        'should not handle the fullscreen event, ' +
          "if the iframe wasn't visible",
        () => {
          return getReadyIframeCmpConsentUi().then((consentUI) => {
            const enterFullscreenStub = env.sandbox.stub(
              consentUI,
              'enterFullscreen_'
            );

            consentUI.isIframeVisible_ = false;
            sendMessageConsentUi(consentUI, 'enter-fullscreen');

            expect(enterFullscreenStub).to.not.be.called;
          });
        }
      );

      it('should not enter fullscreen in modal view', async () => {
        const errorSpy = env.sandbox.spy(user(), 'warn');

        consentUI = new ConsentUI(mockInstance, {
          'promptUISrc': 'https//promptUISrc',
        });

        // trigger modal view
        consentUI.show(true);
        consentUI.handleIframeMessages_({
          source: consentUI.ui_.contentWindow,
          data: {
            type: 'consent-ui',
            action: 'ready',
            initialHeight: '80vh',
          },
        });
        await macroTask();

        const windowSpy = env.sandbox.spy(
          consentUI.ui_.contentWindow,
          'postMessage'
        );

        sendMessageConsentUi(consentUI, 'enter-fullscreen');

        expect(errorSpy).to.be.calledOnce;
        expect(errorSpy.args[0][1]).to.match(/Could not enter fullscreen/);
        expect(windowSpy).to.be.calledOnce;
        expect(windowSpy.args[0][0]).to.deep.equal({
          'type': 'amp-consent-response',
          'requestType': 'consent-ui',
          'requestAction': 'enter-fullscreen',
          'state': 'error',
          'info':
            'Could not enter fullscreen. Fullscreen is only supported when the iframe is visible as a bottom sheet and after user interaction.',
        });
        expect(consentUI.isFullscreen_).to.be.false;
      });
    });

    describe('enterFullscreen', () => {
      it('should add fullscreen classes and set fullscreen state', () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          consentUI.enterFullscreen_();

          expect(parent.classList.contains(consentUiClasses.iframeFullscreen))
            .to.be.true;
          expect(consentUI.isFullscreen_).to.be.true;
        });
      });

      it('should not enter fullscreen if already fullscreen', () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          consentUI.isFullscreen_ = true;
          consentUI.enterFullscreen_();

          expect(parent.classList.contains(consentUiClasses.iframeFullscreen))
            .to.be.false;
        });
      });
    });

    it('should disable scrolling', () => {
      return getReadyIframeCmpConsentUi().then((consentUI) => {
        expect(consentUI.scrollEnabled_).to.be.true;

        consentUI.enterFullscreen_();

        expect(consentUI.scrollEnabled_).to.be.false;

        env.sandbox
          .stub(consentUI, 'baseInstance_')
          .callsFake((callback) => callback());
        consentUI.hide();
        expect(consentUI.scrollEnabled_).to.be.true;
      });
    });

    it(
      'should hide the viewer on enterFullscreen, ' +
        'and show the viewer on hide',
      () => {
        return getReadyIframeCmpConsentUi().then((consentUI) => {
          const sendMessageStub = env.sandbox.stub(
            consentUI.viewer_,
            'sendMessage'
          );

          consentUI.enterFullscreen_();

          expect(sendMessageStub).to.be.calledOnce;

          env.sandbox
            .stub(consentUI, 'baseInstance_')
            .callsFake((callback) => callback());
          consentUI.hide();
          expect(sendMessageStub).to.be.calledTwice;
        });
      }
    );

    it('should hide the viewer when modal enabled and show the viewer on hide', async () => {
      consentUI = new ConsentUI(mockInstance, {
        'promptUISrc': 'https//promptUISrc',
      });

      const enterLightboxStub = env.sandbox.stub(
        consentUI.viewport_,
        'enterLightboxMode'
      );
      const leaveLightboxStub = env.sandbox.stub(
        consentUI.viewport_,
        'leaveLightboxMode'
      );

      consentUI.show(true);
      consentUI.handleIframeMessages_({
        source: consentUI.ui_.contentWindow,
        data: {
          type: 'consent-ui',
          action: 'ready',
          initialHeight: '80vh',
        },
      });
      await macroTask();
      expect(enterLightboxStub).to.be.calledOnce;

      // Hide
      consentUI.hide();
      expect(leaveLightboxStub).to.be.calledOnce;
    });
  }
);

/**\
 * @param {!ConsentUI} consentUI
 * @param {string} source
 * @param {string} action
 */
function sendMessageConsentUi(consentUI, action) {
  consentUI.handleIframeMessages_({
    source: consentUI.ui_.contentWindow,
    data: {
      type: 'consent-ui',
      action,
    },
  });
}
