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
import {viewerFor} from '../../src/viewer';
import {resourcesFor} from '../../src/resources';
import {VisibilityState} from '../../src/service/viewer-impl';

describe('Viewer Visibility State', () => {

  let sandbox;

  function noop() {}

  describe('Element Transitions', () => {
    let fixture;
    let resources;
    let viewer;
    let layoutCallback = noop;
    let unlayoutCallback = noop;
    let pauseCallback = noop;
    let resumeCallback = noop;
    let docHidden;

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
      // Actual state transitions
      layoutCallback() {
        layoutCallback();
        return Promise.resolve();
      }
      unlayoutCallback() {
        unlayoutCallback();
        return true;
      }
      pauseCallback() {
        pauseCallback();
      }
      resumeCallback() {
        resumeCallback();
      }
    }

    function setupSpys() {
      layoutCallback = sinon.spy();
      unlayoutCallback = sinon.spy();
      pauseCallback = sinon.spy();
      resumeCallback = sinon.spy();
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      layoutCallback = unlayoutCallback = pauseCallback = resumeCallback = noop;
      notifyPass = noop;
      shouldPass = false;

      return createFixtureIframe('test/fixtures/visibility-state.html', 10000)
      .then(f => {
        fixture = f;
        return expectBodyToBecomeVisible(fixture.win);
      }).then(() => {
        viewer = viewerFor(fixture.win);
        docHidden = sandbox.stub(viewer.docState_, 'isHidden').returns(false);

        fixture.doc.registerElement('amp-test', {
          prototype: createAmpElementProto(
            fixture.win,
            'amp-test',
            TestElement
          ),
        });
        resources = resourcesFor(fixture.win);
        doPass_ = resources.doPass_;
        sandbox.stub(resources, 'doPass_', doPass);
      });
    });

    afterEach(() => {
      sandbox.restore();
      fixture.iframe.parentNode.removeChild(fixture.iframe);
    });

    describe('from in the PRERENDER state', () => {
      beforeEach(() => {
        viewer.setVisibilityState_(VisibilityState.PRERENDER);
        return waitForNextPass().then(setupSpys);
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
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).to.have.been.called;
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

      it('does not call callbacks when going to INACTIVE', () => {
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
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

    describe('from in the VISIBLE state', () => {
      beforeEach(() => {
        return waitForNextPass().then(() => {
          return waitForNextPass();
        }).then(setupSpys);
      });

      it('does not call callbacks when going to VISIBLE', () => {
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      it('calls unlayout when going to HIDDEN', () => {
        changeVisibility('hidden');
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      it('calls pause and unlayout when going to INACTIVE', () => {
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
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
        return waitForNextPass().then(() => {
          changeVisibility('hidden');
          return waitForNextPass();
        }).then(setupSpys);
      });

      it('calls layout when going to VISIBLE', () => {
        changeVisibility('visible');
        return waitForNextPass().then(() => {
          expect(layoutCallback).to.have.been.called;
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

      it('calls pause when going to INACTIVE', () => {
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
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
        viewer.setVisibilityState_(VisibilityState.INACTIVE);
        return waitForNextPass().then(setupSpys);
      });

      it('calls layout when going to VISIBLE', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        return waitForNextPass().then(() => {
          expect(layoutCallback).to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
        });
      });

      it('does not call callbacks when going to HIDDEN', () => {
        viewer.setVisibilityState_(VisibilityState.VISIBLE);
        changeVisibility('hidden');
        return waitForNextPass().then(() => {
          expect(layoutCallback).not.to.have.been.called;
          expect(unlayoutCallback).not.to.have.been.called;
          expect(pauseCallback).not.to.have.been.called;
          expect(resumeCallback).not.to.have.been.called;
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
          expect(unlayoutCallback).to.have.been.called;
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
