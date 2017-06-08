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

import {BaseElement} from '../../src/base-element';
import {registerElement} from '../../src/custom-element';
import {viewerForDoc} from '../../src/services';
import {documentStateFor} from '../../src/service/document-state';
import {resourcesForDoc} from '../../src/services';
import {VisibilityState} from '../../src/visibility-state';
import {getVendorJsPropertyName} from '../../src/style';
import {createCustomEvent} from '../../src/event-helper';

describe.configure().retryOnSaucelabs().run('Viewer Visibility State', () => {

  function noop() {}

  describes.integration('Element Transitions', {
    body: `<amp-test width=100 height=100></amp-test>`,
    hash: 'visibilityState=prerender',
  }, env => {
    let win;
    let sandbox;

    let resources;
    let viewer;
    let layoutCallback;
    let unlayoutCallback;
    let pauseCallback;
    let resumeCallback;
    let docHidden;
    let unselect;

    function visChangeEventName() {
      const hiddenName = getVendorJsPropertyName(win.document, 'hidden', true);
      const index = hiddenName.indexOf('Hidden');
      if (index == -1) {
        return 'visibilitychange';
      }
      return hiddenName.substr(0, index) + 'Visibilitychange';
    }
    function changeVisibility(vis) {
      docHidden.returns(vis === 'hidden');
      win.document.dispatchEvent(createCustomEvent(win, visChangeEventName(),
          /* detail */ null));
    }

    let shouldPass = false;
    let doPass_;
    let notifyPass = noop;

    class TestElement extends BaseElement {
      // Basic setup
      isLayoutSupported(unusedLayout) {
        return true;
      }
      isRelayoutNeeded() {
        return true;
      }
      prerenderAllowed() {
        return true;
      }
      // Actual state transitions
      layoutCallback() {
        return Promise.resolve();
      }
      unlayoutCallback() {
        return true;
      }
      pauseCallback() {}
      resumeCallback() {}
    }

    function doPass() {
      if (shouldPass) {
        doPass_.call(this);
        shouldPass = false;
        notifyPass();
      }
    }

    function waitForNextPass() {
      return new Promise(resolve => {
        shouldPass = true;
        notifyPass = resolve;
        resources.schedulePass();
      });
    }

    function setupSpys() {
      layoutCallback = sandbox.spy(TestElement.prototype, 'layoutCallback');
      unlayoutCallback = sandbox.spy(TestElement.prototype, 'unlayoutCallback');
      pauseCallback = sandbox.spy(TestElement.prototype, 'pauseCallback');
      resumeCallback = sandbox.spy(TestElement.prototype, 'resumeCallback');
      unselect = sandbox.spy();
      sandbox.stub(win, 'getSelection').returns({
        removeAllRanges: unselect,
      });
    }

    beforeEach(() => {
      win = env.win;
      sandbox = env.sandbox;
      notifyPass = noop;
      shouldPass = false;

      viewer = viewerForDoc(win.document);
      const docState = documentStateFor(win);
      docHidden = sandbox.stub(docState, 'isHidden').returns(false);

      registerElement(win, 'amp-test', TestElement);

      resources = resourcesForDoc(win.document);
      doPass_ = resources.doPass;
      sandbox.stub(resources, 'doPass', doPass);
    });

    describe('from in the PRERENDER state', () => {
      beforeEach(() => {
        return waitForNextPass().then(setupSpys);
      });

      // TODO(jridgewell): Need to test non-prerenderable element doesn't
      // prerender, and prerenderable does.
      it('does not call callbacks when going to PRERENDER', () => {
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      // TODO(jridgewell): Need to test non-prerenderable element already
      // laid-out, and prerenderable is not.
      it('calls layout when going to VISIBLE', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      // TODO(jridgewell): Need to test non-prerenderable element calls
      // unlayout, and prerenderable does not.
      it('calls unlayout when going to HIDDEN', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        changeVisibility('hidden');
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      // TODO(jridgewell): Need to test non-prerenderable element calls
      // unlayout, and prerenderable does not.
      it('calls unlayout when going to INACTIVE', () => {
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      // TODO(jridgewell): Need to test non-prerenderable element calls
      // unlayout, and prerenderable does not.
      it('does not call callbacks when going to PAUSED', () => {
        viewer.setVisibilityState_(VisibilityState.PAUSED);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });
    });

    describe('from in the VISIBLE state', () => {
      beforeEach(() => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
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
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
          expect(unselect).to.have.been.called;
        });
      });

      it('calls pause when going to PAUSED', () => {
        viewer.setVisibilityState_(VisibilityState.PAUSED);
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
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          changeVisibility('hidden');
          return waitForNextPass();
        }).then(setupSpys);
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
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
          expect(unselect).to.have.been.called;
        });
      });

      it('calls pause when going to PAUSED', () => {
        changeVisibility('visible');
        viewer.setVisibilityState_(VisibilityState.PAUSED);
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
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          viewer.setVisibilityState_(VisibilityState.INACTIVE);
          return waitForNextPass();
        }).then(setupSpys);
      });

      it('calls layout and resume when going to VISIBLE', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).to.have.been.called;
        });
      });

      it('calls resume when going to HIDDEN', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        changeVisibility('hidden');
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).to.have.been.called;
        });
      });

      it('does not call callbacks when going to INACTIVE', () => {
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      it('does not call callbacks when going to PAUSED', () => {
        viewer.setVisibilityState_(VisibilityState.PAUSED);
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
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          viewer.setVisibilityState_(VisibilityState.PAUSED);
          return waitForNextPass();
        }).then(setupSpys);
      });

      it('calls resume when going to VISIBLE', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
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
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
          expect(unselect).to.have.been.called;
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
  });
});
