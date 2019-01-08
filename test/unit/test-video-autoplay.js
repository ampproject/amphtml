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

import {AutoplayEntry} from '../../src/service/video/autoplay';
import {Deferred} from '../../src/utils/promise';
import {Services} from '../../src/services';
import {createCustomEvent, listenOncePromise} from '../../src/event-helper';


const noop = () => {};


describes.sandboxed('Video - AutoplayEntry', {}, () => {

  let video;
  let signals;
  let ampdoc;

  const positionObserverMock = {observe: () => noop};

  beforeEach(() => {
    sandbox.stub(Services, 'platformFor').returns({
      isIos: () => false,
    });

    ampdoc = {win: window};

    signals = {
      whenSignal: () => ({then: noop}),
      get: noop,
    };

    video = {
      element: document.createElement('div'),
      mute: sandbox.spy(),
      unmute: sandbox.spy(),
      hideControls: sandbox.spy(),
      showControls: sandbox.spy(),
      mutateElement: sandbox.stub().callsArg(0),
      isInteractive: () => true,
      signals: () => signals,
    };

    video.element.dispatchCustomEvent = type => {
      video.element.dispatchEvent(createCustomEvent(window, type, {}));
    };
  });

  function expectToContainInteractionOverlay(element) {
    const overlay = element.querySelector('i-amphtml-video-mask');
    const icon = element.querySelector('i-amphtml-video-icon');

    expect(overlay).to.not.be.null;
    expect(icon).to.not.be.null;

    expect(icon).to.have.class('amp-video-eq');

    expect(icon.querySelector('.amp-video-eq-1-1')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-1-2')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-2-1')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-2-2')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-3-1')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-3-2')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-4-1')).to.not.be.null;
    expect(icon.querySelector('.amp-video-eq-4-2')).to.not.be.null;
  }

  describe('#constructor', () => {
    it('mutes video, hides controls, observes position & adds overlay', () => {
      const positionObserverMock = {observe: sandbox.spy()};

      new AutoplayEntry(ampdoc, positionObserverMock, video);

      expect(video.mute).to.have.been.calledOnce;
      expect(video.hideControls).to.have.been.calledOnce;
      expect(positionObserverMock.observe).to.have.been.calledOnce;
      expectToContainInteractionOverlay(video.element);
    });

    it('removes overlay, unmutes & shows controls on IX', () => {
      const {
        promise: whenUserInteracts,
        resolve: triggerUserInteraction,
      } = new Deferred();

      sandbox.stub(signals, 'whenSignal')
          .withArgs('user-interacted')
          .returns(whenUserInteracts);

      new AutoplayEntry(ampdoc, positionObserverMock, video);

      triggerUserInteraction();

      return whenUserInteracts.then(() => {
        expect(video.element.querySelector('i-amphtml-video-mask')).to.be.null;
        expect(video.unmute).to.have.been.calledOnce;
        expect(video.showControls).to.have.been.calledOnce;
      });
    });
  });

  describe('#onPositionChange_', () => {

    it('does not trigger if not visible', () => {
      const entry = new AutoplayEntry(ampdoc, positionObserverMock, video);

      video.element.getIntersectionChangeEntry = () => ({
        intersectionRatio: 0.49,
      });

      const trigger = sandbox.stub(entry, 'trigger_');

      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();

      expect(trigger.withArgs(true)).to.not.have.been.called;
    });

    it('triggers once when visible', () => {
      const entry = new AutoplayEntry(ampdoc, positionObserverMock, video);

      video.element.getIntersectionChangeEntry = () => ({
        intersectionRatio: 0.5,
      });

      const trigger = sandbox.stub(entry, 'trigger_');

      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();

      expect(trigger.withArgs(true)).to.have.been.calledOnce;
    });

    it('triggers once when becoming invisible', () => {
      const entry = new AutoplayEntry(ampdoc, positionObserverMock, video);

      video.element.getIntersectionChangeEntry = () => ({
        intersectionRatio: 0.5,
      });

      const trigger = sandbox.stub(entry, 'trigger_');

      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();

      expect(trigger.withArgs(true)).to.have.been.calledOnce;

      video.element.getIntersectionChangeEntry = () => ({
        intersectionRatio: 0.49,
      });

      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();
      entry.onPositionChange_();

      expect(trigger.withArgs(false)).to.have.been.calledOnce;
    });
  });

  describe('#trigger_', () => {
    it('triggers autoplay', () => {
      const entry = new AutoplayEntry(ampdoc, positionObserverMock, video);
      const whenAutoPlaying = listenOncePromise(video.element, 'amp:autoplay');
      entry.trigger_(true);
      return whenAutoPlaying;
    });

    it('triggers autopause', () => {
      const entry = new AutoplayEntry(ampdoc, positionObserverMock, video);
      const whenAutoPaused = listenOncePromise(video.element, 'amp:autopause');
      entry.trigger_(false);
      return whenAutoPaused;
    });
  });
});
