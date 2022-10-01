import {VisibilityState_Enum} from '#core/constants/visibility-state';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';
import {getVendorJsPropertyName} from '#core/dom/style';

import {Services} from '#service';

import {createCustomEvent} from '#utils/event-helper';

const t = describes.sandboxed
  .configure()
  .skipIfPropertiesObfuscated()
  .ifChrome();

t.run('Viewer Visibility State', {}, () => {
  function noop() {}

  describes.integration(
    'Element Transitions',
    {
      body: '',
      hash: 'visibilityState=prerender',
    },
    (env) => {
      let win;

      let resources;
      let viewer;
      let layoutCallback;
      let unlayoutCallback;
      let pauseCallback;
      let resumeCallback;
      let docHidden;
      let docVisibilityState;
      let prerenderAllowed;
      let previewAllowed;

      function visChangeEventName() {
        const hiddenName = getVendorJsPropertyName(
          win.document,
          'hidden',
          true
        );
        const index = hiddenName.indexOf('Hidden');
        if (index == -1) {
          return 'visibilitychange';
        }
        return hiddenName.substr(0, index) + 'Visibilitychange';
      }

      function changeVisibility(vis) {
        if (docVisibilityState) {
          docVisibilityState.value(vis);
        }
        docHidden.value(vis === 'hidden');
        win.document.dispatchEvent(
          createCustomEvent(win, visChangeEventName(), /* detail */ null)
        );
      }

      function changeViewerVisibilityState(state) {
        viewer.receiveMessage('visibilitychange', {state});
      }

      let shouldPass = false;
      let doPass_;
      let notifyPass = noop;

      function doPass() {
        if (shouldPass) {
          doPass_.call(this);
          shouldPass = false;
          notifyPass();
        }
      }

      function waitForNextPass() {
        return new Promise((resolve) => {
          notifyPass = resolve;
          shouldPass = true;
          resources.schedulePass();
        }).then(() => {
          if (R1_IMG_DEFERRED_BUILD) {
            return new Promise((resolve) => setTimeout(resolve, 20));
          }
        });
      }

      function setupSpys() {
        layoutCallback.reset();
        unlayoutCallback.reset();
        pauseCallback.reset();
        resumeCallback.reset();
      }

      beforeEach(async () => {
        win = env.win;
        notifyPass = noop;
        shouldPass = false;

        const vsync = Services.vsyncFor(win);
        env.sandbox.stub(vsync, 'mutate').callsFake((mutator) => {
          mutator();
        });
        viewer = await Services.viewerPromiseForDoc(win.document);

        docHidden = env.sandbox.stub(win.document, 'hidden').value(false);
        if ('visibilityState' in win.document) {
          docVisibilityState = env.sandbox
            .stub(win.document, 'visibilityState')
            .value('visible');
        }

        resources = Services.resourcesForDoc(win.document);
        doPass_ = resources.doPass;
        env.sandbox.stub(resources, 'doPass').callsFake(doPass);

        const ampImg = win.document.createElement('amp-img');
        ampImg.setAttribute('width', 100);
        ampImg.setAttribute('height', 100);
        ampImg.setAttribute('layout', 'fixed');
        // TODO(#31915): Cleanup when R1_IMG_DEFERRED_BUILD is complete.
        if (!R1_IMG_DEFERRED_BUILD) {
          win.document.body.appendChild(ampImg);
        }

        const upgradedImg = await whenUpgradedToCustomElement(ampImg);
        prerenderAllowed = env.sandbox.stub(upgradedImg, 'prerenderAllowed');
        prerenderAllowed.returns(false);
        previewAllowed = env.sandbox.stub(upgradedImg, 'previewAllowed');
        previewAllowed.returns(false);

        if (R1_IMG_DEFERRED_BUILD) {
          win.document.body.appendChild(upgradedImg);
        }

        const impl = await upgradedImg.getImpl(false);
        layoutCallback = R1_IMG_DEFERRED_BUILD
          ? env.sandbox.stub(impl, 'mountCallback')
          : env.sandbox.stub(impl, 'layoutCallback');
        unlayoutCallback = R1_IMG_DEFERRED_BUILD
          ? env.sandbox.stub(impl, 'unmountCallback')
          : env.sandbox.stub(impl, 'unlayoutCallback');
        pauseCallback = env.sandbox.stub(impl, 'pauseCallback');
        resumeCallback = env.sandbox.stub(impl, 'resumeCallback');
        env.sandbox.stub(impl, 'isRelayoutNeeded').callsFake(() => true);
        env.sandbox.stub(impl, 'isLayoutSupported').callsFake(() => true);

        layoutCallback.returns(Promise.resolve());
        unlayoutCallback.returns(true);
      });

      describe('from in the PRERENDER state', () => {
        describe('for prerenderable element', () => {
          beforeEach(() => {
            prerenderAllowed.returns(true);
            setupSpys();
          });

          it('does layout when going to PRERENDER', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
            changeViewerVisibilityState(VisibilityState_Enum.PRERENDER);
            await waitForNextPass();

            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls layout when going to PREVIEW', async () => {
            previewAllowed.returns(true);
            changeViewerVisibilityState(VisibilityState_Enum.PREVIEW);
            await waitForNextPass();

            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls layout when going to VISIBLE', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
            await waitForNextPass();

            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls callbacks when going to HIDDEN', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
            changeVisibility('hidden');
            await waitForNextPass();

            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('does not call callbacks when going to INACTIVE', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
            await waitForNextPass();

            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('does not call callbacks when going to PAUSED', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
            await waitForNextPass();

            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        describe('for non-prerenderable element', () => {
          beforeEach(() => {
            setupSpys();
          });

          it('does not call callbacks when going to PRERENDER', async () => {
            await waitForNextPass();

            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls layout when going to PREVIEW', async () => {
            previewAllowed.returns(true);
            changeViewerVisibilityState(VisibilityState_Enum.PREVIEW);
            await waitForNextPass();

            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls layout when going to VISIBLE', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
            await waitForNextPass();

            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls callbacks when going to HIDDEN', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
            changeVisibility('hidden');
            await waitForNextPass();

            if (R1_IMG_DEFERRED_BUILD) {
              expect(layoutCallback).to.have.been.called;
            } else {
              expect(layoutCallback).not.to.have.been.called;
            }
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('does not call callbacks when going to INACTIVE', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
            await waitForNextPass();

            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('does not call callbacks when going to PAUSED', async () => {
            changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
            await waitForNextPass();

            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });
      });

      describe('from in the VISIBLE state', () => {
        beforeEach(async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          setupSpys();
        });

        it('does not call callbacks when going to VISIBLE', async () => {
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('does not call callbacks when going to HIDDEN', async () => {
          changeVisibility('hidden');
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('calls unload when going to INACTIVE', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
          await waitForNextPass();

          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('calls pause when going to PAUSED', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      describe('from in the HIDDEN state', () => {
        beforeEach(async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          changeVisibility('hidden');
          await waitForNextPass();

          setupSpys();
        });

        it('does not call callbacks going to VISIBLE', async () => {
          changeVisibility('visible');
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('does not call callbacks when going to HIDDEN', async () => {
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('calls unload when going to INACTIVE', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('calls pause when going to PAUSED', async () => {
          changeVisibility('visible');
          changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      describe('from in the INACTIVE state', () => {
        beforeEach(async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
          await waitForNextPass();

          setupSpys();
        });

        it('calls layout and resume when going to VISIBLE', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          expect(layoutCallback).to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).to.have.been.called;
        });

        it('calls resume when going to HIDDEN', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          changeVisibility('hidden');
          await waitForNextPass();

          if (R1_IMG_DEFERRED_BUILD) {
            expect(layoutCallback).to.have.been.called;
          } else {
            expect(layoutCallback).not.to.have.been.called;
          }
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).to.have.been.called;
        });

        it('does not call callbacks when going to PAUSED', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      describe('from in the PAUSED state', () => {
        beforeEach(async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          changeViewerVisibilityState(VisibilityState_Enum.PAUSED);
          await waitForNextPass();

          setupSpys();
        });

        it('calls resume when going to VISIBLE', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.VISIBLE);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).to.have.been.called;
        });

        it('calls unlayout when going to HIDDEN', async () => {
          changeVisibility('hidden');
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('calls unlayout when going to INACTIVE', async () => {
          changeViewerVisibilityState(VisibilityState_Enum.INACTIVE);
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });

        it('does not call callbacks when going to PAUSED', async () => {
          await waitForNextPass();

          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });
    }
  );
});
