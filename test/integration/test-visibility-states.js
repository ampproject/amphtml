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

import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
} from '../../testing/iframe.js';
import {BaseElement} from '../../src/base-element';
import {createAmpElementProto} from '../../src/custom-element';
import {viewerForDoc} from '../../src/services';
import {resourcesForDoc} from '../../src/services';
import {VisibilityState} from '../../src/visibility-state';
import * as sinon from 'sinon';

describe.configure().retryOnSaucelabs().run('Viewer Visibility State', () => {

  // This test only works with uncompiled JS, because it stubs out
  // private properties.
  let origUseCompiledJs;
  beforeEach(() => {
    origUseCompiledJs = window.ampTestRuntimeConfig.useCompiledJs;
    window.ampTestRuntimeConfig.useCompiledJs = false;
  });
  afterEach(() => {
    window.ampTestRuntimeConfig.useCompiledJs = origUseCompiledJs;
  });

  let sandbox;

  function noop() {}

  // TODO(lannka, #3561): unmute the test.
  describe.configure().skipSafari().run('Element Transitions', () => {
    let fixture;
    let resources;
    let viewer;
    let protoElement;
    let layoutCallback;
    let unlayoutCallback;
    let pauseCallback;
    let resumeCallback;
    let docHidden;
    let unselect;

    function changeVisibility(vis) {
      docHidden.returns(vis === 'hidden');
      viewer.docState_.onVisibilityChanged_();
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
      return new Promise(resolve => {
        shouldPass = true;
        notifyPass = resolve;
        resources.schedulePass();
      });
    }

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

    function setupSpys() {
      layoutCallback = sandbox.spy(protoElement, 'layoutCallback');
      unlayoutCallback = sandbox.spy(protoElement, 'unlayoutCallback');
      pauseCallback = sandbox.spy(protoElement, 'pauseCallback');
      resumeCallback = sandbox.spy(protoElement, 'resumeCallback');
      unselect = sandbox.spy();
      sandbox.stub(fixture.win, 'getSelection').returns({
        removeAllRanges: unselect,
      });
    }

    beforeEach(function() {
      this.timeout(5000);
      sandbox = sinon.sandbox.create();
      notifyPass = noop;
      shouldPass = false;

      return createFixtureIframe('test/fixtures/visibility-state.html', 10000)
      .then(f => {
        fixture = f;
        fixture.win.name = '__AMP__visibilityState=prerender';
        return expectBodyToBecomeVisible(fixture.win);
      }).then(() => {
        viewer = viewerForDoc(fixture.win.document);
        docHidden = sandbox.stub(viewer.docState_, 'isHidden').returns(false);

        protoElement = createAmpElementProto(
          fixture.win,
          'amp-test',
          TestElement
        );

        fixture.doc.registerElement('amp-test', {
          prototype: protoElement,
        });
        resources = resourcesForDoc(fixture.win.document);
        doPass_ = resources.doPass_;
        sandbox.stub(resources, 'doPass_', doPass);
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    describe.skip('from in the PRERENDER state', () => {
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
