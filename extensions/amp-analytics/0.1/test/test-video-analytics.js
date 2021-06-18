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
   AmpStoryEventTracker,
   AnalyticsEvent,
   AnalyticsEventType,
   ClickEventTracker,
   CustomEventTracker,
   IniLoadTracker,
   ScrollEventTracker,
   SignalTracker,
   TimerEventTracker,
   VisibilityTracker,
   trackerTypeForTesting,
   VideoEventTracker,
 } from '../events';
 import {getData} from '../../../../src/event-helper';
 import {
   PlayingStates,
   VideoAnalyticsEvents,
   videoAnalyticsCustomEventTypeKey,
 } from '../../../../src/video-interface';
 import {AmpdocAnalyticsRoot} from '../analytics-root';
 import {Deferred} from '#core/data-structures/promise';
 import {Signals} from '#core/data-structures/signals';
 import {macroTask} from '../../../../testing/yield';
 import {toggleExperiment} from '#experiments';

 describes.realWin('Events', {amp: 1}, (env) => {
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
     console.log(win,win.document.eventListeners)
     ampdoc = env.ampdoc;
     root = new AmpdocAnalyticsRoot(ampdoc);
     handler = env.sandbox.spy();

     analyticsElement = win.document.createElement('amp-analytics');
     win.document.body.appendChild(analyticsElement);

     target = win.document.createElement('div');
     target.classList.add('target');
     win.document.body.appendChild(target);

     myVideo = win.document.createElement('div');
     myVideo.setAttribute('id', 'myVideo');
     target.appendChild(myVideo);

     myVideo2 = win.document.createElement('div');
     myVideo2.setAttribute('id', 'myVideo-2');
     target.appendChild(myVideo2);
   });

   describe('VideoEventTracker', () => {
     let iniEventCount;
     let tracker;

     const defaultVideoConfig = {
       'on': 'video-play',
       'selector' : ['#myVideo', '#myVideo-2'],
       'videoSpec': {
         'end-session-when-invisible': false
       },
     };

     beforeEach(() => {
       console.log(VideoAnalyticsEvents);
       tracker = root.getTracker(AnalyticsEventType.VIDEO, VideoEventTracker);
       console.log(tracker.root_, tracker)
     });

     it('should initalize, add listeners and dispose', () => {

       expect(tracker.root).to.equal(root);
       expect(tracker.sessionObservable_.getHandlerCount()).to.equal(0);

       tracker.add(
         undefined,
         AnalyticsEventType.VIDEO,
         defaultVideoConfig,
         env.sandbox.spy()
       );

       expect(tracker.sessionObservable_.getHandlerCount()).to.equal(1);

       tracker.dispose();

       expect(tracker.sessionObservable_).to.equal(null);

     });

     it('should require selector', () => {
       allowConsoleError(() => {
         expect(() => {
           tracker.add(analyticsElement, AnalyticsEventType.VIDEO, {selector: ''});
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

     it('fires on a video trigger', async () => {
       const fn1 = env.sandbox.stub();
       const fn2 = env.sandbox.stub();

       let getElementSpy = env.sandbox.spy(root, 'getElement');

       tracker.add(
         undefined,
         AnalyticsEventType.VIDEO,
         {
           'on': 'video-play',
           "request": "event",
           "selector": "#myVideo"
         },
         fn1
       );

       expect(getElementSpy).to.be.callCount(1);
       expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

     });

     it('fires on multiple selectors', async () => {
       const fn1 = env.sandbox.spy();
       let getElementSpy = env.sandbox.spy(root, 'getElement');

       tracker.add(
         undefined,
         AnalyticsEventType.VIDEO,
         defaultVideoConfig,
         fn1
       );

       expect(getElementSpy).to.be.callCount(2);
       expect(tracker.sessionObservable_.handlers_.length).to.equal(1);

     });

     it('fires on multiple video triggers', async () => {
       const fn1 = env.sandbox.spy();
       const fn2 = env.sandbox.spy();
       const handler2 = env.sandbox.spy();
       let getElementSpy = env.sandbox.spy(root, 'getElement');
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
           'on': 'video-play',
           "request": "event",
           "selector": "#myVideo"
         },
         fn2
       );
       tracker.add(
         undefined,
         AnalyticsEventType.VIDEO,
         {
           'on': 'video-pause',
           "request": "event",
           "selector": "#myVideo-2"
         },
         handler2
       );
       expect(getElementSpy).to.be.callCount(4);
       expect(tracker.sessionObservable_.handlers_.length).to.equal(3);

     });

     it('fires on all video triggers', async () => {
       const fn1 = env.sandbox.spy();
       let getElementSpy = env.sandbox.spy(root, 'getElement');
       let trigger = ['video-play', 'video-pause', "video-ended", "video-session",
       "video-seconds-played", "video-percentage-played"]

       function videoTriggers(trigger, i){
         return {
           'on': trigger[i],
           "request": "event",
           "selector": ["#myVideo", "#myVideo-2"]
         }
       }

       for (let i = 0; i < 6; i++){
         tracker.add(
           undefined,
           AnalyticsEventType.VIDEO,
           videoTriggers(trigger, i),
           fn1
         );
       }

       expect(getElementSpy).to.be.callCount(12);
       expect(tracker.sessionObservable_.handlers_.length).to.equal(6);

     });

     it('fires on video-seconds-played trigger', async () => {
       const fn1 = env.sandbox.spy();
       let getElementSpy = env.sandbox.spy(root, 'getElement');

       tracker.add(
         undefined,
         AnalyticsEventType.VIDEO,
         {
           'on': 'video-seconds-played',
           "request": "event",
           "selector": ["#myVideo", "#myVideo-2"],
           "videoSpec": {
             "interval": 10
            }
         },
         fn1
       );

       expect(getElementSpy).to.be.callCount(2);
       expect(tracker.sessionObservable_.handlers_.length).to.equal(1);
       Promise.resolve(getElementSpy).then((element) => {console.log(getElementSpy.returnValues[0])})
       //console.log(getElementSpy.returnValues[1])

     });

   });


 })
