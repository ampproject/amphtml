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
import {VisibilityState} from '../../src/visibility-state';
import {createCustomEvent} from '../../src/event-helper';
import {getVendorJsPropertyName} from '../../src/style';
import {whenUpgradedToCustomElement} from '../../src/dom';

const t = describe.configure().skipIfPropertiesObfuscated().ifChrome();

t.run('Viewer Visibility State', () => {
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
      //let unselect;
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
      let intersect_;
      let notifyPass = noop;

      let intersected;
      let notifyIntersected;

      function doPass() {
        if (shouldPass) {
          doPass_.call(this);
          shouldPass = false;
          notifyPass();
        }
      }

      function intersect() {
        intersect_.apply(this, arguments);
        notifyIntersected();
      }

      function waitForNextPass() {
        return new Promise((resolve) => {
          notifyPass = resolve;

          if (resources.isIntersectionExperimentOn()) {
            // Element lifecycle callbacks depend on the observer taking its
            // initial measurements, so wait for an intersection first.
            return intersected.then(() => {
              shouldPass = true;
              resources.schedulePass();
            });
          } else {
            shouldPass = true;
            resources.schedulePass();
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
        intersected = new Promise((resolve) => {
          notifyIntersected = resolve;
        });

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
            intersect_ = resources.intersect;
            env.sandbox.stub(resources, 'doPass').callsFake(doPass);
            env.sandbox.stub(resources, 'intersect').callsFake(intersect);

            const img = win.document.createElement('amp-img');
            img.setAttribute('width', 100);
            img.setAttribute('height', 100);
            img.setAttribute('layout', 'fixed');
            win.document.body.appendChild(img);

            return whenUpgradedToCustomElement(img);
          })
          .then((img) => {
            layoutCallback = env.sandbox.stub(
              img.implementation_,
              'layoutCallback'
            );
            unlayoutCallback = env.sandbox.stub(
              img.implementation_,
              'unlayoutCallback'
            );
            pauseCallback = env.sandbox.stub(
              img.implementation_,
              'pauseCallback'
            );
            resumeCallback = env.sandbox.stub(
              img.implementation_,
              'resumeCallback'
            );
            prerenderAllowed = env.sandbox.stub(
              img.implementation_,
              'prerenderAllowed'
            );
            env.sandbox
              .stub(img.implementation_, 'isRelayoutNeeded')
              .callsFake(() => true);
            env.sandbox
              .stub(img.implementation_, 'isLayoutSupported')
              .callsFake(() => true);

            layoutCallback.returns(Promise.resolve());
            unlayoutCallback.returns(true);
            prerenderAllowed.returns(false);
          });
      });

      describe('from in the PRERENDER state', () => {
        describe('for prerenderable element', () => {
          beforeEach(() => {
            prerenderAllowed.returns(true);
            setupSpys();
          });

          it('does layout when going to PRERENDER', () => {
            return waitForNextPass().then(() => {
              expect(layoutCallback).to.have.been.called;
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

          it('does not call callbacks when going to HIDDEN', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            changeVisibility('hidden');
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          // TODO(aghassemi): Investigate failure. #10974.
          it.skip('does not call callbacks when going to INACTIVE', () => {
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

          it('does not call callbacks when going to HIDDEN', () => {
            viewer.receiveMessage('visibilitychange', {
              state: VisibilityState.VISIBLE,
            });
            changeVisibility('hidden');
            return waitForNextPass().then(() => {
              expect(layoutCallback).not.to.have.been.called;
              expect(unlayoutCallback).not.to.have.been.called;
              expect(pauseCallback).not.to.have.been.called;
              expect(resumeCallback).not.to.have.been.called;
            });
          });

          // TODO(aghassemi): Investigate failure. #10974.
          it.skip('does not call callbacks when going to INACTIVE', () => {
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
            expect(layoutCallback).not.to.have.been.called;
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
            expect(layoutCallback).not.to.have.been.called;
            expect(unlayoutCallback).not.to.have.been.called;
            expect(pauseCallback).not.to.have.been.called;
            expect(resumeCallback).to.have.been.called;
          });
        });

        // TODO(aghassemi): Investigate failure. #10974.
        it.skip('does not call callbacks when going to INACTIVE', () => {
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
            expect(pauseCallback).not.to.have.been.called;
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
