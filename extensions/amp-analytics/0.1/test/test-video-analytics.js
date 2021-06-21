/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import * as fakeTimers from '@sinonjs/fake-timers';
import {
  AnalyticsEvent,
  AnalyticsEventType,
  VideoEventTracker
} from '../events';
import {AmpdocAnalyticsRoot} from '../analytics-root';
import {macroTask} from '../../../../testing/yield';
import {dispatchCustomEvent} from 'src/core/dom/index.js';

describes.realWin('Events', {
  amp: 1
}, (env) => {
  let win;
  let ampdoc;
  let root;
  let handler;
  let analyticsElement;
  let target;
  let myVideo;
  let myVideo2;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    root = new AmpdocAnalyticsRoot(ampdoc);
    handler = env.sandbox.spy();

    analyticsElement = win.document.createElement('amp-analytics');
    win.document.body.appendChild(analyticsElement);

    target = win.document.createElement('div');
    target.classList.add('target');
    win.document.body.appendChild(target);

    myVideo = win.document.createElement('amp-video');
    myVideo.setAttribute('id', 'myVideo');
    target.appendChild(myVideo);

    myVideo2 = win.document.createElement('amp-video');
    myVideo2.setAttribute('id', 'myVideo-2');
    target.appendChild(myVideo2);

  });

  describe('VideoEventTracker', () => {
    let tracker;
    const selectors = ['#myVideo', '#myVideo-2']

    const defaultVideoConfig = {
      'on': 'video-play',
      'selector': selectors,
      'videoSpec': {
        'end-session-when-invisible': false
      },
    };

    beforeEach(() => {
      tracker = root.getTracker(AnalyticsEventType.VIDEO, VideoEventTracker);
    });

    it('should initalize, add listeners and dispose', () => {
      const fn1 = env.sandbox.stub();
      expect(tracker.root).to.equal(root);
      expect(tracker.sessionObservable_.getHandlerCount()).to.equal(0);

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO,
        defaultVideoConfig,
        fn1
      );

      expect(tracker.sessionObservable_.getHandlerCount()).to.equal(1);

      tracker.dispose();

      expect(tracker.sessionObservable_).to.equal(null);

    });

    it('should require selector', () => {
      allowConsoleError(() => {
        expect(() => {
          tracker.add(analyticsElement, AnalyticsEventType.VIDEO, {
            selector: ''
          });
        }).to.throw(/Missing required selector/);
      });
    });

    it('should error on duplicate selectors', () => {
      let config = {
        selector: ['#myVideo', '#myVideo'],
      };

      expect(() => {
        tracker.add(analyticsElement, AnalyticsEventType.VIDEO, config, env.sandbox.stub());
      }).to.throw(
        /Cannot have duplicate selectors in selectors list: #myVideo,#myVideo/
      );
    });

    it('fires on one video selector', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-play',
          "request": "event",
          "selector": "#myVideo"
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-play', data, null)

      await macroTask();
      expect(fn1).to.have.callCount(1);
      expect(fn1).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-play', data))
      expect(getElementSpy).to.be.callCount(1);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on multiple selectors', async () => {
      const fn1 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO,
        defaultVideoConfig,
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-play', data, null)
      dispatchCustomEvent(myVideo2, 'video-play', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-play', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-play', data_2))
      expect(getElementSpy).to.be.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on pause video trigger', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');
      let triggers = ['video-pause', 'video-ended'];
      let fns = [fn1, fn2]

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-pause',
          'selector': selectors,
          'videoSpec': {
            'end-session-when-invisible': false
          },
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-pause', data, null)
      dispatchCustomEvent(myVideo2, 'video-pause', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-pause', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-pause', data_2))
      expect(getElementSpy).to.be.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on video-session trigger', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');
      let triggers = ['video-pause', 'video-ended'];
      let fns = [fn1, fn2]

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-session',
          'selector': selectors,
          'videoSpec': {
            'end-session-when-invisible': false
          },
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-session', data, null)
      dispatchCustomEvent(myVideo2, 'video-session', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-session', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-session', data_2))
      expect(getElementSpy).to.be.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on video-ended trigger', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-ended',
          'selector': selectors,
          'videoSpec': {
            'end-session-when-invisible': false
          },
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-ended', data, null)
      dispatchCustomEvent(myVideo2, 'video-ended', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-ended', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-ended', data_2))
      expect(getElementSpy).to.be.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on video-percentage-played trigger', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-percentage-played',
          'selector': selectors,
          'videoSpec': {
            'percentages': [5, 25, 50, 75, 100]
          }
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'normalizedPercentage': "100",
        'playedRangesJson': "[[0,0.0045]]",
        'playedTotal': 0.0045,
        'state': 'paused',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'normalizedPercentage': "50",
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-percentage-played', data, null)
      dispatchCustomEvent(myVideo2, 'video-percentage-played', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-percentage-played', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-percentage-played', data_2))
      expect(getElementSpy).to.be.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on video-seconds-played trigger', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-seconds-played',
          'selector': selectors,
          'videoSpec': {
            "end-session-when-invisible": false,
            "exclude-autoplay": false,
            'interval': 7
          }
        },
        fn1
      );

      let data = {
        'autoplay': false,
        'currentTime': 10,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedRangesJson': "[[0,10.498756]]",
        'playedTotal': 10.498756,
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 7.49,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,7.49]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-seconds-played', data, null)
      dispatchCustomEvent(myVideo2, 'video-seconds-played', data_2, null)

      await macroTask();
      // expect(fn1).to.have.callCount(2);
      // expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-seconds-played', data))
      // expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-seconds-played', data_2))
      expect(getElementSpy).to.have.callCount(2);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

    });

    it('fires on multiple video triggers', async () => {
      const fn1 = env.sandbox.stub();
      const fn2 = env.sandbox.stub();
      const fn3 = env.sandbox.stub();
      let getElementSpy = env.sandbox.spy(root, 'getElement');

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO,
        defaultVideoConfig,
        fn1
      );

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-pause',
          "request": "event",
          "selector": selectors
        },
        fn2
      );

      tracker.add(
        undefined,
        AnalyticsEventType.VIDEO, {
          'on': 'video-ended',
          "request": "event",
          "selector": selectors
        },
        fn3
      );

      let data = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      let data_2 = {
        'autoplay': false,
        'currentTime': 0.0045,
        'duration': 15,
        'height': 399,
        'id': 'myVideo-2',
        'muted': false,
        'playedTotal': 0.0045,
        'playedRangesJson': "[[0,0.0045]]",
        'state': 'playing_manual',
        'width': 700,
      };

      dispatchCustomEvent(myVideo, 'video-play', data, null)
      dispatchCustomEvent(myVideo, 'video-pause', data, null)
      dispatchCustomEvent(myVideo, 'video-ended', data, null)

      dispatchCustomEvent(myVideo2, 'video-play', data_2, null)
      dispatchCustomEvent(myVideo2, 'video-pause', data_2, null)
      dispatchCustomEvent(myVideo2, 'video-ended', data_2, null)

      await macroTask();
      expect(fn1).to.have.callCount(2);
      expect(fn1.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-play', data))
      expect(fn1.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-play', data_2))
      expect(fn2).to.have.callCount(2);
      expect(fn2.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-pause', data))
      expect(fn2.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-pause', data_2))
      expect(fn3).to.have.callCount(2);
      expect(fn3.firstCall).to.be.calledWith(new AnalyticsEvent([myVideo], 'video-ended', data))
      expect(fn3.secondCall).to.be.calledWith(new AnalyticsEvent([myVideo2], 'video-ended', data_2))

      expect(getElementSpy).to.be.callCount(6);
      expect(tracker.sessionObservable_.handlers_.length).to.equal(3);

    });
  });
})
