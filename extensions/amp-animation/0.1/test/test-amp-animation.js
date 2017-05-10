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

import {AmpAnimation} from '../amp-animation';
import {WebAnimationPlayState} from '../web-animation-types';
import {WebAnimationRunner} from '../web-animations';
import {toggleExperiment} from '../../../../src/experiments';


describes.sandboxed('AmpAnimation', {}, () => {

  beforeEach(() => {
    toggleExperiment(window, 'amp-animation', true);
  });

  afterEach(() => {
    toggleExperiment(window, 'amp-animation', false);
  });

  function createAnimInWindow(win, attrs, config) {
    const element = win.document.createElement('amp-animation');
    element.setAttribute('id', 'anim1');
    element.setAttribute('layout', 'nodisplay');
    for (const k in attrs) {
      element.setAttribute(k, attrs[k]);
    }

    if (config) {
      const configElement = win.document.createElement('script');
      configElement.setAttribute('type', 'application/json');
      if (typeof config == 'string') {
        configElement.textContent = config;
      } else {
        configElement.textContent = JSON.stringify(config);
      }
      element.appendChild(configElement);
    }

    win.document.body.appendChild(element);
    element.build();
    return element.implementation_;
  }


  describes.realWin('in top-level doc', {
    amp: {
      ampdoc: 'single',
      extensions: ['amp-animation'],
    },
  }, env => {
    let win;
    let viewer;
    let runner;
    let runnerMock;

    beforeEach(() => {
      win = env.win;
      viewer = win.services.viewer.obj;
      viewer.setVisibilityState_('hidden');
      runner = new WebAnimationRunner([]);
      runnerMock = sandbox.mock(runner);
      sandbox.stub(AmpAnimation.prototype, 'createRunner_',
          () => Promise.resolve(runner));
    });

    afterEach(() => {
      runnerMock.verify();
    });

    function createAnim(attrs, config) {
      return createAnimInWindow(win, attrs, config);
    }

    it('should load and parse config', () => {
      const anim = createAnim({}, {duration: 1001});
      expect(anim.configJson_).to.deep.equal({duration: 1001});
    });

    it('should fail without config', () => {
      expect(() => {
        createAnim({}, null);
      }).to.throw(/\"<script type=application\/json>\" must be present/);
    });

    it('should fail with malformed config', () => {
      expect(() => {
        createAnim({}, 'broken');
      }).to.throw(/failed to parse animation script/);
    });

    it('should default trigger to none', () => {
      const anim = createAnim({}, {duration: 1001});
      expect(anim.triggerOnVisibility_).to.be.false;
    });

    it('should parse visibility trigger', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      expect(anim.triggerOnVisibility_).to.be.true;

      // Animation is made to be always in viewport via mutateElement.
      expect(anim.element.style['position']).to.not.equal('fixed');
      return anim.mutateElement(() => {}).then(() => {
        expect(anim.element.style['position']).to.equal('fixed');
        expect(anim.element.style['visibility']).to.equal('hidden');
        expect(anim.element.style['top']).to.equal('0px');
        expect(anim.element.style['left']).to.equal('0px');
        expect(anim.element.style['width']).to.equal('1px');
        expect(anim.element.style['height']).to.equal('1px');
        expect(anim.element.style['display']).to.equal('block');
      });
    });

    it('should fail on invalid trigger', () => {
      expect(() => {
        createAnim({trigger: 'unknown'}, {duration: 1001});
      }).to.throw(/Only allowed value for \"trigger\" is \"visibility\"/);
    });

    it('should update visibility from viewer', () => {
      const anim = createAnim({}, {duration: 1001});
      expect(anim.visible_).to.be.false;

      viewer.setVisibilityState_('visible');
      expect(anim.visible_).to.be.true;
    });

    it('should update visibility when paused', () => {
      const anim = createAnim({}, {duration: 1001});
      viewer.setVisibilityState_('visible');
      expect(anim.visible_).to.be.true;

      anim.pauseCallback();
      expect(anim.visible_).to.be.false;
    });

    it('should not activate w/o visibility trigger', () => {
      const anim = createAnim({}, {duration: 1001});
      const activateStub = sandbox.stub(anim, 'activate');
      viewer.setVisibilityState_('visible');
      return anim.layoutCallback().then(() => {
        expect(activateStub).to.not.be.called;
      });
    });

    it('should activate with visibility trigger', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      const activateStub = sandbox.stub(anim, 'activate');
      viewer.setVisibilityState_('visible');
      return anim.layoutCallback().then(() => {
        expect(activateStub).to.be.calledOnce;
      });
    });

    it('should trigger animation, but not start when invisible', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      const startStub = sandbox.stub(anim, 'startOrResume_');
      anim.activate();
      expect(anim.triggered_).to.be.true;
      expect(startStub).to.not.be.called;
    });

    it('should trigger animation and start when visible', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      const startStub = sandbox.stub(anim, 'startOrResume_');
      viewer.setVisibilityState_('visible');
      anim.activate();
      expect(anim.triggered_).to.be.true;
      expect(startStub).to.be.calledOnce;
    });

    it('should resume/pause when visibility changes', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      const startStub = sandbox.stub(anim, 'startOrResume_');
      const pauseStub = sandbox.stub(anim, 'pause_');
      anim.activate();
      expect(anim.triggered_).to.be.true;

      // Go to visible state.
      viewer.setVisibilityState_('visible');
      expect(startStub).to.be.calledOnce;
      expect(pauseStub).to.not.be.called;

      // Go to hidden state.
      viewer.setVisibilityState_('hidden');
      expect(pauseStub).to.be.calledOnce;
      expect(startStub).to.be.calledOnce;  // Doesn't chnage.
    });

    it('should NOT resume/pause when visible, but not triggered', () => {
      const anim = createAnim({trigger: 'visibility'}, {duration: 1001});
      const startStub = sandbox.stub(anim, 'startOrResume_');
      const pauseStub = sandbox.stub(anim, 'pause_');
      expect(anim.triggered_).to.be.false;

      // Go to visible state.
      viewer.setVisibilityState_('visible');
      expect(startStub).to.not.be.called;
      expect(pauseStub).to.not.be.called;

      // Go to hidden state.
      viewer.setVisibilityState_('hidden');
      expect(pauseStub).to.not.be.called;
      expect(startStub).to.not.be.called;
    });

    it('should create runner', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      runnerMock.expects('start').once();
      runnerMock.expects('finish').never();
      return anim.startOrResume_().then(() => {
        expect(anim.triggered_).to.be.true;
        expect(anim.runner_).to.exist;
      });
    });

    it('should finish animation and runner', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      runnerMock.expects('start').once();
      runnerMock.expects('finish').once();
      return anim.startOrResume_().then(() => {
        anim.finish();
        expect(anim.triggered_).to.be.false;
        expect(anim.runner_).to.be.null;
      });
    });

    it('should pause/resume animation and runner', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      runnerMock.expects('start').once();
      runnerMock.expects('pause').once();
      return anim.startOrResume_().then(() => {
        anim.pause_();
        expect(anim.triggered_).to.be.true;

        runnerMock.expects('resume').once();
        anim.startOrResume_();
        expect(anim.triggered_).to.be.true;
      });
    });

    it('should finish when animation is complete', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      return anim.startOrResume_().then(() => {
        expect(anim.triggered_).to.be.true;
        expect(anim.runner_).to.exist;

        runner.setPlayState_(WebAnimationPlayState.FINISHED);
        expect(anim.triggered_).to.be.false;
        expect(anim.runner_).to.be.null;
      });
    });

    it('should resolve target in the main doc', () => {
      const anim = createAnim({}, {duration: 1001});
      const target = win.document.createElement('div');
      target.setAttribute('id', 'target1');
      win.document.body.appendChild(target);
      expect(anim.resolveTarget_('target1')).to.equal(target);
    });

    it('should query targets in the main doc', () => {
      const anim = createAnim({}, {duration: 1001});
      const target1 = win.document.createElement('div');
      target1.setAttribute('id', 'target1');
      target1.setAttribute('class', 'target');
      win.document.body.appendChild(target1);
      const target2 = win.document.createElement('div');
      target2.setAttribute('id', 'target2');
      target2.setAttribute('class', 'target');
      win.document.body.appendChild(target2);
      expect(anim.queryTargets_('#target1')).to.deep.equal([target1]);
      expect(anim.queryTargets_('div#target1')).to.deep.equal([target1]);
      expect(anim.queryTargets_('#target2')).to.deep.equal([target2]);
      expect(anim.queryTargets_('.target')).to.deep.equal([target1, target2]);
      expect(anim.queryTargets_('.target3')).to.deep.equal([]);
    });

    it('should resize from ampdoc viewport', () => {
      const anim = createAnim({}, {duration: 1001});
      const stub = sandbox.stub(anim, 'onResize_');
      const viewport = win.services.viewport.obj;

      // No size changes.
      viewport.changed_(/* relayoutAll */ false, 0);
      expect(stub).to.not.be.called;

      // Size has changed.
      viewport.changed_(/* relayoutAll */ true, 0);
      expect(stub).to.be.calledOnce;
    });

    it('should cancel running animation on resize and schedule restart', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      return anim.startOrResume_().then(() => {
        expect(anim.runner_).to.exist;

        runnerMock.expects('cancel').once();
        anim.onResize_();
        expect(anim.runner_).to.be.null;
        expect(anim.triggered_).to.be.true;
        expect(anim.restartPass_.isPending()).to.be.true;
        anim.restartPass_.cancel();
      });
    });

    it('should ignore not-triggered animation on resize', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.visible_ = true;
      expect(anim.runner_).to.not.exist;
      runnerMock.expects('cancel').never();
      anim.onResize_();
      expect(anim.runner_).to.be.null;
      expect(anim.triggered_).to.be.false;
      expect(anim.restartPass_.isPending()).to.be.false;
    });

    it('should cancel and NOT restart hidden animation on resize', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = true;
      return anim.startOrResume_().then(() => {
        expect(anim.runner_).to.exist;

        anim.visible_ = false;
        runnerMock.expects('cancel').once();
        anim.onResize_();
        expect(anim.runner_).to.be.null;
        expect(anim.triggered_).to.be.true;
        expect(anim.restartPass_.isPending()).to.be.false;
      });
    });

    it('should ignore start when not triggered', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.visible_ = true;
      expect(anim.startOrResume_()).to.be.null;
    });

    it('should ignore start when not triggered', () => {
      const anim = createAnim({trigger: 'visibility'},
          {duration: 1001, animations: []});
      anim.activate();
      anim.visible_ = false;
      expect(anim.startOrResume_()).to.be.null;
    });
  });


  describes.realWin('in FIE', {
    amp: {
      ampdoc: 'fie',
      extensions: ['amp-animation'],
    },
  }, env => {
    let embed;

    beforeEach(() => {
      embed = env.embed;
      embed.setVisible_(false);
    });

    function createAnim(attrs, config) {
      return createAnimInWindow(embed.win, attrs, config);
    }

    it('should update visibility from embed', () => {
      const anim = createAnim({}, {duration: 1001});
      expect(anim.visible_).to.be.false;

      embed.setVisible_(true);
      expect(anim.visible_).to.be.true;
    });

    it('should find target in the embed only', () => {
      const parentWin = env.ampdoc.win;
      const embedWin = embed.win;
      const anim = createAnim({}, {duration: 1001});

      const targetInDoc = parentWin.document.createElement('div');
      targetInDoc.setAttribute('id', 'target1');
      parentWin.document.body.appendChild(targetInDoc);
      expect(anim.resolveTarget_('target1')).to.be.null;

      const targetInEmbed = embedWin.document.createElement('div');
      targetInEmbed.setAttribute('id', 'target1');
      embedWin.document.body.appendChild(targetInEmbed);
      expect(anim.resolveTarget_('target1')).to.equal(targetInEmbed);
    });

    it('should query target in the main doc', () => {
      const parentWin = env.ampdoc.win;
      const embedWin = embed.win;
      const anim = createAnim({}, {duration: 1001});

      const targetInDoc = parentWin.document.createElement('div');
      targetInDoc.setAttribute('id', 'target1');
      targetInDoc.setAttribute('class', 'target');
      parentWin.document.body.appendChild(targetInDoc);
      expect(anim.queryTargets_('#target1')).to.be.deep.equal([]);
      expect(anim.queryTargets_('.target')).to.deep.equal([]);

      const target1 = embedWin.document.createElement('div');
      target1.setAttribute('id', 'target1');
      target1.setAttribute('class', 'target');
      embedWin.document.body.appendChild(target1);
      const target2 = embedWin.document.createElement('div');
      target2.setAttribute('id', 'target2');
      target2.setAttribute('class', 'target');
      embedWin.document.body.appendChild(target2);
      expect(anim.queryTargets_('#target1')).to.deep.equal([target1]);
      expect(anim.queryTargets_('div#target1')).to.deep.equal([target1]);
      expect(anim.queryTargets_('#target2')).to.deep.equal([target2]);
      expect(anim.queryTargets_('.target')).to.deep.equal([target1, target2]);
      expect(anim.queryTargets_('.target3')).to.deep.equal([]);
    });

    it('should take resize from embed\'s window', () => {
      const anim = createAnim({}, {duration: 1001});
      const stub = sandbox.stub(anim, 'onResize_');
      embed.win.eventListeners.fire({type: 'resize'});
      expect(stub).to.be.calledOnce;
    });
  });
});
