/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../src/services';
import {VisibilityState} from '../../src/core/constants/visibility-state';
import {createCustomEvent} from '../../src/event-helper';
import {getVendorJsPropertyName} from '../../src/style';
import {whenUpgradedToCustomElement} from '../../src/dom';

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

      beforeEach(() => {
        win = env.win;
        notifyPass = noop;
        shouldPass = false;

        const vsync = Services.vsyncFor(win);
        env.sandbox.stub(vsync, 'mutate').callsFake((mutator) => {
          mutator();
        });

        return Services.viewerPromiseForDoc(win.document)
          .then((v) => {
            viewer = v;

            docHidden = env.sandbox.stub(win.document, 'hidden').value(false);
            if ('visibilityState' in win.document) {
              docVisibilityState = env.sandbox
                .stub(win.document, 'visibilityState')
                .value('visible');
            }

            resources = Services.resourcesForDoc(win.document);
            doPass_ = resources.doPass;
            env.sandbox.stub(resources, 'doPass').callsFake(doPass);

            const img = win.document.createElement('amp-img');
            img.setAttribute('width', 100);
            img.setAttribute('height', 100);
            img.setAttribute('layout', 'fixed');
            // TODO(#31915): Cleanup when R1_IMG_DEFERRED_BUILD is complete.
            if (!R1_IMG_DEFERRED_BUILD) {
              win.document.body.appendChild(img);
            }

            return whenUpgradedToCustomElement(img);
          })
          .then((img) => {
            prerenderAllowed = env.sandbox.stub(img, 'prerenderAllowed');
            prerenderAllowed.returns(false);

            if (R1_IMG_DEFERRED_BUILD) {
              win.document.body.appendChild(img);
            }
            return img.getImpl(false);
          })
          .then((impl) => {
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
      });

      describe('from in the PRERENDER state', () => {
        describe('for prerenderable element', () => {
          beforeEach(() => {
            prerenderAllowed.returns(true);
            setupSpys();
          });

          it('does layout when going to PRERENDER', async () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.PAUSED,
            });
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.PRERENDER,
            });
            await waitForNextPass();
            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls layout when going to VISIBLE', async () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            await waitForNextPass();
            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('calls callbacks when going to HIDDEN', async () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            changeVisibility('hidden');
            await waitForNextPass();
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });

          it('does not call callbacks when going to INACTIVE', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.INACTIVE,
            });
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          it('does not call callbacks when going to PAUSED', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.PAUSED,
            });
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });
        });

        describe('for non-prerenderable element', () => {
          beforeEach(() => {
            setupSpys();
          });

          it('does not call callbacks when going to PRERENDER', () => {
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          it('calls layout when going to VISIBLE', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            return waitForNextPass().then(() => {
              expect(layoutCallback).to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          it('calls callbacks when going to HIDDEN', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            changeVisibility('hidden');
            return waitForNextPass().then(() => {
              if (R1_IMG_DEFERRED_BUILD) {
                expect(layoutCallback).to.have.been.called;
              } else {
                expect(layoutCallback).not.to.have.been.called;
              }
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          it('does not call callbacks when going to INACTIVE', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.INACTIVE,
            });
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          it('does not call callbacks when going to PAUSED', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.PAUSED,
            });
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });
        });
      });

      describe('from in the VISIBLE state', () => {
        beforeEach(() => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass().then(setupSpys);
        });

        it('does not call callbacks when going to VISIBLE', () => {
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('does not call callbacks when going to HIDDEN', () => {
          changeVisibility('hidden');
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('calls unload when going to INACTIVE', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.INACTIVE,
          });
          return waitForNextPass().then(() => {
            expect(unlayoutCallback).to.have.been.called;
            expect(pauseCallback).to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('calls pause when going to PAUSED', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.PAUSED,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });
      });

      describe('from in the HIDDEN state', () => {
        beforeEach(() => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass()
            .then(() => {
              changeVisibility('hidden');
              return waitForNextPass();
            })
            .then(setupSpys);
        });

        it('does not call callbacks going to VISIBLE', () => {
          changeVisibility('visible');
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('does not call callbacks when going to HIDDEN', () => {
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('calls unload when going to INACTIVE', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.INACTIVE,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).to.have.been.called;
            expect(pauseCallback).to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('calls pause when going to PAUSED', () => {
          changeVisibility('visible');
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.PAUSED,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });
      });

      describe('from in the INACTIVE state', () => {
        beforeEach(() => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass()
            .then(() => {
              viewer.receiveMessage('visibilitychange', {
                state: VisibilityState.INACTIVE,
              });
              return waitForNextPass();
            })
            .then(setupSpys);
        });

        it('calls layout and resume when going to VISIBLE', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).to.have.been.called;
          });
        });

        it('calls resume when going to HIDDEN', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          changeVisibility('hidden');
          return waitForNextPass().then(() => {
            if (R1_IMG_DEFERRED_BUILD) {
              expect(layoutCallback).to.have.been.called;
            } else {
              expect(layoutCallback).not.to.have.been.called;
            }
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).to.have.been.called;
          });
        });

        it('does not call callbacks when going to PAUSED', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.PAUSED,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });
      });

      describe('from in the PAUSED state', () => {
        beforeEach(() => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass()
            .then(() => {
              viewer.receiveMessage('visibilitychange', {
                state: VisibilityState.PAUSED,
              });
              return waitForNextPass();
            })
            .then(setupSpys);
        });

        it('calls resume when going to VISIBLE', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.VISIBLE,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).to.have.been.called;
          });
        });

        it('calls unlayout when going to HIDDEN', () => {
          changeVisibility('hidden');
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('calls unlayout when going to INACTIVE', () => {
          viewer.receiveMessage('visibilitychange', {
            state: VisibilityState.INACTIVE,
          });
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).to.have.been.called;
            expect(pauseCallback).to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });

        it('does not call callbacks when going to PAUSED', () => {
          return waitForNextPass().then(() => {
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).not.to.have.been.called;
          });
        });
      });
    }
  );
});
