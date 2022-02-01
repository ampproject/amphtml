import {macroTask} from '#testing/helpers';

import {dispatchCustomEvent} from 'src/core/dom/index';

import {AmpdocAnalyticsRoot} from '../analytics-root';
import {AnalyticsEvent, AnalyticsEventType, VideoEventTracker} from '../events';

describes.realWin(
  'Events',
  {
    amp: 1,
  },
  (env) => {
    let win;
    let ampdoc;
    let root;
    let analyticsElement;
    let target;
    let target2;
    let myVideo;
    let myVideo2;
    let myVideo3;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      root = new AmpdocAnalyticsRoot(ampdoc);

      analyticsElement = win.document.createElement('amp-analytics');
      win.document.body.appendChild(analyticsElement);

      target = win.document.createElement('div');
      target.classList.add('target');
      win.document.body.appendChild(target);

      myVideo = win.document.createElement('amp-video');
      myVideo.setAttribute('id', 'myVideo');
      myVideo.setAttribute('class', 'video-class');
      target.appendChild(myVideo);

      myVideo2 = win.document.createElement('amp-video');
      myVideo2.setAttribute('id', 'myVideo-2');
      myVideo2.setAttribute('class', 'video-class');
      target.appendChild(myVideo2);

      target2 = win.document.createElement('div');
      target2.classList.add('target2');
      win.document.body.appendChild(target2);

      myVideo3 = win.document.createElement('amp-video');
      myVideo3.setAttribute('id', 'myVideo-3');
      myVideo3.setAttribute('class', 'video3-class');
      target2.appendChild(myVideo3);
    });

    describe('VideoEventTracker', () => {
      let tracker;
      let selectors;
      let defaultVideoConfig;
      let data;
      let data2;
      let data3;
      let dataPercentagePlayed;
      let dataPercentagePlayed2;

      beforeEach(() => {
        tracker = root.getTracker(AnalyticsEventType.VIDEO, VideoEventTracker);
        selectors = ['#myVideo', '#myVideo-2'];

        defaultVideoConfig = {
          'on': 'video-play',
          'selector': selectors,
        };

        function makeData(id, isPercentage, percent) {
          if (isPercentage) {
            return {
              'autoplay': false,
              'currentTime': 0.0045,
              'duration': 15,
              'height': 399,
              'id': id,
              'muted': false,
              'normalizedPercentage': percent,
              'playedRangesJson': '[[0,0.0045]]',
              'playedTotal': 0.0045,
              'state': 'paused',
              'width': 700,
            };
          }
          return {
            'autoplay': false,
            'currentTime': 0.0045,
            'duration': 15,
            'height': 399,
            'id': id,
            'muted': false,
            'playedTotal': 0.0045,
            'playedRangesJson': '[[0,0.0045]]',
            'state': 'playing_manual',
            'width': 700,
          };
        }

        data = makeData('myVideo', false, null);
        data2 = makeData('myVideo-2', false, null);
        data3 = makeData('myVideo-3', false, null);
        dataPercentagePlayed = makeData('myVideo', true, '100');
        dataPercentagePlayed2 = makeData('myVideo-2', true, '50');
      });

      it('should initalize, add listeners and dispose', () => {
        expect(tracker.root).to.equal(root);
        expect(tracker.sessionObservable_.getHandlerCount()).to.equal(0);

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          defaultVideoConfig,
          () => {},
          false
        );

        expect(tracker.sessionObservable_.getHandlerCount()).to.equal(1);

        tracker.dispose();

        expect(tracker.sessionObservable_).to.equal(null);
      });

      it('should require selector', () => {
        allowConsoleError(() => {
          expect(() => {
            tracker.add(analyticsElement, AnalyticsEventType.VIDEO, {
              selector: '',
            });
          }).to.throw(/Missing required selector on video trigger/);

          expect(() => {
            tracker.add(analyticsElement, AnalyticsEventType.VIDEO, {
              selector: [],
            });
          }).to.throw(/Missing required selector on video trigger/);
        });
      });

      it('should error on duplicate selectors', () => {
        const config = {
          selector: ['#myVideo', '#myVideo'],
        };

        expect(() => {
          tracker.add(analyticsElement, AnalyticsEventType.VIDEO, config);
        }).to.throw(
          /Cannot have duplicate selectors in selectors list: #myVideo,#myVideo/
        );
      });

      it('fires on one video selector', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(root, 'getElement');

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-play',
            'request': 'event',
            'selector': '#myVideo',
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-play', data, null);

        await macroTask();
        expect(fn1).to.have.callCount(1);
        expect(fn1).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-play', data)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('Listener called once with shared class selector', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(root, 'getElement');

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-play',
            'selector': '.video-class',
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-play', data, null);
        dispatchCustomEvent(myVideo2, 'video-play', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(1);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-play', data)
        );
        expect(fn1.secondCall).to.equal(null);
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on multiple class selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-play',
            'selector': ['.video-class', '.video3-class'],
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-play', data, null);
        dispatchCustomEvent(myVideo2, 'video-play', data2, null);
        dispatchCustomEvent(myVideo3, 'video-play', data3, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(3);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-play', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-play', data2)
        );
        expect(fn1.thirdCall).to.be.calledWith(
          new AnalyticsEvent(myVideo3, 'video-play', data3)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          defaultVideoConfig,
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-play', data, null);
        dispatchCustomEvent(myVideo2, 'video-play', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-play', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-play', data2)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on pause video trigger for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-pause',
            'selector': selectors,
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-pause', data, null);
        dispatchCustomEvent(myVideo2, 'video-pause', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-pause', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-pause', data2)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on video-session trigger for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-session',
            'selector': selectors,
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-session', data, null);
        dispatchCustomEvent(myVideo2, 'video-session', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-session', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-session', data2)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on video-ended trigger for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-ended',
            'selector': selectors,
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-ended', data, null);
        dispatchCustomEvent(myVideo2, 'video-ended', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-ended', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-ended', data2)
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on video-percentage-played trigger for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-percentage-played',
            'selector': selectors,
            'videoSpec': {
              'percentages': [5, 25, 50, 75, 100],
            },
          },
          fn1
        );

        dispatchCustomEvent(
          myVideo,
          'video-percentage-played',
          dataPercentagePlayed,
          null
        );
        dispatchCustomEvent(
          myVideo2,
          'video-percentage-played',
          dataPercentagePlayed2,
          null
        );

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(
            myVideo,
            'video-percentage-played',
            dataPercentagePlayed
          )
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(
            myVideo2,
            'video-percentage-played',
            dataPercentagePlayed2
          )
        );
        expect(getElementSpy).to.be.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on video-seconds-played trigger for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-seconds-played',
            'selector': selectors,
            'videoSpec': {
              'exclude-autoplay': false,
              'interval': 1,
            },
          },
          fn1
        );

        dispatchCustomEvent(myVideo, 'video-seconds-played', data, null);
        dispatchCustomEvent(myVideo2, 'video-seconds-played', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-seconds-played', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-seconds-played', data2)
        );
        expect(getElementSpy).to.have.callCount(1);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
      });

      it('fires on multiple video triggers for multiple selectors', async () => {
        const fn1 = env.sandbox.stub();
        const fn2 = env.sandbox.stub();
        const fn3 = env.sandbox.stub();
        const getElementSpy = env.sandbox.spy(
          root,
          'getElementsByQuerySelectorAll_'
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          defaultVideoConfig,
          fn1
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-pause',
            'request': 'event',
            'selector': selectors,
          },
          fn2
        );

        tracker.add(
          undefined,
          AnalyticsEventType.VIDEO,
          {
            'on': 'video-ended',
            'request': 'event',
            'selector': selectors,
          },
          fn3
        );

        dispatchCustomEvent(myVideo, 'video-play', data, null);
        dispatchCustomEvent(myVideo, 'video-pause', data, null);
        dispatchCustomEvent(myVideo, 'video-ended', data, null);

        dispatchCustomEvent(myVideo2, 'video-play', data2, null);
        dispatchCustomEvent(myVideo2, 'video-pause', data2, null);
        dispatchCustomEvent(myVideo2, 'video-ended', data2, null);

        await macroTask();
        await macroTask();
        expect(fn1).to.have.callCount(2);
        expect(fn1.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-play', data)
        );
        expect(fn1.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-play', data2)
        );
        expect(fn2).to.have.callCount(2);
        expect(fn2.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-pause', data)
        );
        expect(fn2.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-pause', data2)
        );
        expect(fn3).to.have.callCount(2);
        expect(fn3.firstCall).to.be.calledWith(
          new AnalyticsEvent(myVideo, 'video-ended', data)
        );
        expect(fn3.secondCall).to.be.calledWith(
          new AnalyticsEvent(myVideo2, 'video-ended', data2)
        );

        expect(getElementSpy).to.be.callCount(3);
        expect(tracker.sessionObservable_.handlers_.length).to.equal(3);
      });
    });
  }
);
