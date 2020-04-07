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

import {
  AnalyticsPercentageTracker,
  PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS,
  PERCENTAGE_INTERVAL,
} from '../../src/service/video-manager-impl';
import {PlayingStates, VideoEvents} from '../../src/video-interface';
import {Services} from '../../src/services';
import {createCustomEvent} from '../../src/event-helper';

describes.fakeWin(
  'video-manager-impl#AnalyticsPercentageTracker',
  {
    amp: false,
  },
  (env) => {
    const interval = PERCENTAGE_INTERVAL;

    let mockTimer;
    let mockTimerCallback;
    let mockEntry;

    let tracker;

    function createFakeVideo() {
      const element = env.win.document.createElement('div');
      return {
        element,
        getCurrentTime() {
          return NaN;
        },
        getDuration() {
          return NaN;
        },
      };
    }

    function setDuration(video, durationSeconds) {
      video.getDuration = () => durationSeconds;
    }

    function setCurrentTime(video, currentTimeSeconds) {
      video.getCurrentTime = () => currentTimeSeconds;
    }

    function setPlayingState(entry, playingState) {
      entry.getPlayingState = () => playingState;
    }

    function dispatchCustom(element, eventType) {
      element.dispatchEvent(
        createCustomEvent(env.win, eventType, /* detail */ null)
      );
    }

    function dispatchLoadedMetadata(element) {
      dispatchCustom(element, VideoEvents.LOADEDMETADATA);
    }

    function mockTrigger(tracker) {
      return env.sandbox.stub(tracker, 'analyticsEventForTesting_');
    }

    beforeEach(() => {
      const {win, sandbox} = env;

      mockTimer = {
        delay: sandbox.stub().callsFake((fn) => {
          mockTimerCallback = fn;
        }),
      };

      mockEntry = {
        video: createFakeVideo(),
        getPlayingState() {
          return PlayingStates.PAUSED;
        },
      };

      env.sandbox.stub(Services, 'timerFor').returns(mockTimer);

      tracker = new AnalyticsPercentageTracker(win, mockEntry);
    });

    describe('#start', () => {
      it('waits for LOADEDMETADATA', () => {
        const {video} = mockEntry;
        const {element} = video;

        tracker.start();

        expect(mockTimer.delay).to.not.have.been.called;

        const validDurationSeconds = 10;
        const validCurrentTimeSeconds = 0;

        setDuration(video, validDurationSeconds);
        setCurrentTime(video, validCurrentTimeSeconds);

        dispatchLoadedMetadata(element);

        expect(mockTimer.delay).to.have.been.calledOnce;
      });

      it('works if LOADEDMETADATA fires before the tracker starts', () => {
        const {video} = mockEntry;
        const {element} = video;

        dispatchLoadedMetadata(element);

        const validDurationSeconds = 10;
        const validCurrentTimeSeconds = 0;
        setDuration(video, validDurationSeconds);
        setCurrentTime(video, validCurrentTimeSeconds);

        expect(mockTimer.delay).to.not.have.been.called;

        tracker.start();

        expect(mockTimer.delay).to.have.been.calledOnce;
      });

      [0, NaN, -1, undefined, null].forEach((invalidDuration) => {
        it(`aborts if duration is invalid (${invalidDuration})`, () => {
          const {video} = mockEntry;
          const {element} = video;

          tracker.start();

          setDuration(video, invalidDuration);
          dispatchLoadedMetadata(element);

          expect(mockTimer.delay).to.not.have.been.called;
        });
      });

      // TODO(#25954): This test is a bit specific and odd, but replicates
      // what we see in prod. Possibly remove when root cause for video with
      // duration => no duration is found.
      [0, NaN, -1, undefined, null].forEach((invalidDuration) => {
        it(`aborts if duration is ${invalidDuration} after initially valid`, () => {
          const {video} = mockEntry;
          const durationStub = env.sandbox.stub(video, 'getDuration');
          durationStub.onFirstCall().returns(1000 /* valid duration */);
          durationStub.returns(invalidDuration);

          const {element} = video;

          setPlayingState(mockEntry, PlayingStates.PLAYING_MANUAL);
          tracker.start();

          dispatchLoadedMetadata(element);

          expect(mockTimer.delay).to.always.have.been.calledWith(
            env.sandbox.match.func,
            PERCENTAGE_FREQUENCY_WHEN_PAUSED_MS
          );
        });
      });

      it('does not trigger if the video is paused', () => {
        const {video} = mockEntry;
        const {element} = video;

        tracker.start();

        const triggerMock = mockTrigger(tracker);

        const validDurationSeconds = 10;
        const validCurrentTimeSeconds = 0;

        setDuration(video, validDurationSeconds);
        setCurrentTime(video, validCurrentTimeSeconds);

        dispatchLoadedMetadata(element);

        expect(triggerMock).to.not.have.been.called;
      });

      it(`does not trigger if percentage < ${interval}%`, () => {
        const {video} = mockEntry;
        const {element} = video;

        tracker.start();

        const triggerMock = mockTrigger(tracker);

        const validDurationSeconds = 10;
        setDuration(video, validDurationSeconds);
        setCurrentTime(video, 0);

        dispatchLoadedMetadata(element);

        setPlayingState(mockEntry, PlayingStates.PLAYING_MANUAL);

        const cutoff = (validDurationSeconds / 100) * interval;

        for (
          let currentTimeSeconds = 0;
          currentTimeSeconds < cutoff;
          currentTimeSeconds += 0.1
        ) {
          setCurrentTime(video, currentTimeSeconds);
          expect(triggerMock).to.not.have.been.called;
          mockTimerCallback();
        }
      });

      for (
        let startTimeSeconds = 0;
        startTimeSeconds < 100;
        startTimeSeconds += 2
      ) {
        it(`triggers every ${interval}% starting on ${startTimeSeconds}s`, () => {
          const {video} = mockEntry;
          const {element} = video;

          tracker.start();

          const triggerMock = mockTrigger(tracker);

          const validDurationSeconds = 100;

          setDuration(video, validDurationSeconds);
          setCurrentTime(video, startTimeSeconds);

          dispatchLoadedMetadata(element);

          setPlayingState(mockEntry, PlayingStates.PLAYING_MANUAL);

          for (
            let timeSeconds = startTimeSeconds;
            timeSeconds < validDurationSeconds;
            timeSeconds += 1
          ) {
            setCurrentTime(video, timeSeconds);
            mockTimerCallback();
          }

          for (
            let percentage = Math.max(
              interval,
              Math.ceil(startTimeSeconds / interval) * interval
            );
            percentage < 100;
            percentage += interval
          ) {
            expect(
              triggerMock.withArgs(percentage),
              `triggerMock.withArgs(${percentage}%)`
            ).to.have.been.calledOnce;
          }
        });
      }

      it('triggers 100% on ended', () => {
        const {video} = mockEntry;
        const {element} = video;
        const triggerMock = mockTrigger(tracker);

        const startTimeSeconds = 0;
        const validDurationSeconds = 100;

        setDuration(video, validDurationSeconds);
        setCurrentTime(video, startTimeSeconds);

        setPlayingState(mockEntry, PlayingStates.PLAYING_MANUAL);

        tracker.start();

        dispatchLoadedMetadata(element);

        mockTimerCallback();
        dispatchCustom(element, VideoEvents.ENDED);

        expect(triggerMock.withArgs(100)).to.have.been.calledOnce;
      });
    });

    describe('#stop', () => {
      it('cancels upcoming events', () => {
        const {video} = mockEntry;
        const {element} = video;

        const triggerMock = mockTrigger(tracker);

        const startTimeSeconds = 0;
        const validDurationSeconds = 100;

        setDuration(video, validDurationSeconds);
        setCurrentTime(video, startTimeSeconds);

        setPlayingState(mockEntry, PlayingStates.PLAYING_MANUAL);

        tracker.start();

        dispatchLoadedMetadata(element);

        tracker.stop();

        mockTimerCallback();
        dispatchCustom(element, VideoEvents.ENDED);

        expect(triggerMock).to.not.have.been.called;
      });
    });
  }
);
