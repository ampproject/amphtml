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

import {
  MESSAGE_INTERVAL_MS,
  AmpSignalCollectionFrame,
} from '../amp-signal-collection-frame';
import {Layout} from '../../../../src/layout';

describes.sandboxed('amp-signal-collection-frame', {}, () => {

  function createAmpSignalCollectionFrameElement(win, attrs) {
    const ampAdElement = win.document.createElement('amp-ad');
    win.document.body.appendChild(ampAdElement);
    const signalCollectionElement = win.document.createElement(
        'amp-signal-collection-frame');
    for (const attr in attrs) {
      signalCollectionElement.setAttribute(attr, attrs[attr]);
    }
    ampAdElement.appendChild(signalCollectionElement);
    signalCollectionElement.build();
    return signalCollectionElement;
  }

  describes.realWin('real win', {
    amp: {
      extensions: ['amp-signal-collection-frame'],
    },
  }, env => {

    it('should create child xdomain iframe', () => {
      const element = createAmpSignalCollectionFrameElement(env.win, {
        'type': 'google',
        'data-hash': 'abc123',
        height: 0,
        width: 0,
      });
      expect(element.querySelector('iframe')).to.not.be.ok;
      expect(element.getAttribute('aria-hidden')).to.equal('true');
      return element.layoutCallback().then(() => {
        const frame = element.querySelector('iframe');
        expect(frame).to.be.ok;
        expect(frame.getAttribute('src')).to.equal(
            '//tpc.googlesyndication.com/b4a_runner.html#abc123');
        expect(frame).to.not.be.visible;
        expect(frame.style.position).to.equal('fixed');
        expect(frame.style.top).to.equal('0px');
        expect(frame.getAttribute('height')).to.equal('0');
        expect(frame.getAttribute('width')).to.equal('0');
      });
    });

    it('should have priority 1', () => {
      expect(AmpSignalCollectionFrame.prototype.getPriority()).to.equal(1);
    });

    it('isLayoutSupported should return true iff Layout.FIXED', () => {
      for (const layout in Layout) {
        expect(AmpSignalCollectionFrame.prototype.isLayoutSupported(layout))
            .to.equals(layout == Layout.FIXED);
      }
    });

    it('should throw if type is missing/invalid', () => {
      expect(() => {
        createAmpSignalCollectionFrameElement(env.win, {
          'type': 'unknown',
          'data-hash': 'abc123',
          height: 0,
          width: 0,
        }, true);
      }).to.throw(/invalid type unknown/);
    });

    it('should throw if hash has XSS', () => {
      expect(() => {
        createAmpSignalCollectionFrameElement(env.win, {
          'type': 'google',
          'data-hash': 'abcjavascript:alert("foo!")def',
          height: 0,
          width: 0,
        });
      }).to.throw(/invalid data-hash/);
    });

    describe('unlayoutCallback', () => {

      it('should remove iframe', () => {
        const element = createAmpSignalCollectionFrameElement(env.win, {
          'type': 'google',
          'data-hash': 'abc123',
          height: 0,
          width: 0,
        });
        return element.layoutCallback().then(() => {
          const frame = element.querySelector('iframe');
          expect(frame).to.be.ok;
          expect(frame.getAttribute('src')).to.equal(
              '//tpc.googlesyndication.com/b4a_runner.html#abc123');
          expect(element.implementation_.unlisteners_.length).to.not.equal(0);
          expect(element.implementation_.intervalId_).to.not.equal(-1);
          element.unlayoutCallback();
          expect(element.children.length).to.equal(0);
          expect(element.implementation_.unlisteners_.length).to.equal(0);
          expect(element.implementation_.intervalId_).to.equal(-1);
        });
      });
    });

    describe('broadcast touch events', () => {

      const timeoutPromise = delay => {
        let resolver;
        const promise = new Promise(resolve => {
          resolver = resolve;
        });
        env.win.setTimeout(() => {
          resolver();
        }, delay);
        return promise;
      };

      it('should broadcast events', () => {
        const postMessageSpy =
            sandbox.spy(AmpSignalCollectionFrame.prototype, 'sendPostMessage');
        const element = createAmpSignalCollectionFrameElement(env.win, {
          'type': 'google',
          'data-hash': 'abc123',
          height: 0,
          width: 0,
        });
        return element.layoutCallback().then(() => {
          const frame = element.querySelector('iframe');
          expect(frame).to.be.ok;
          expect(frame.getAttribute('src')).to.equal(
              '//tpc.googlesyndication.com/b4a_runner.html#abc123');
          expect(frame).to.not.be.visible;
          const sendEvent = (name, x, y) => {
            const ev1 = new Event(name, {bubbles: true});
            ev1.pageX = x;
            ev1.pageY = y;
            env.win.document.documentElement.dispatchEvent(ev1);
          };
          sendEvent('click', 10, 20);
          sendEvent('click', 11, 21);
          sendEvent('touchstart', 30, 40);
          sendEvent('touchend', 50, 60);
          sendEvent('touchend', 51, 61);
          // Send touch move as an array of touches.
          const ev1 = new Event('touchmove', {bubbles: true});
          ev1.touches = [{pageX: 70, pageY: 80}, {pageX: 71, pageY: 81}];
          env.win.document.documentElement.dispatchEvent(ev1);
          // Wait for interval timer.
          expect(postMessageSpy.called).to.be.false;
          return timeoutPromise(MESSAGE_INTERVAL_MS + 10).then(() => {
            expect(postMessageSpy.calledOnce).to.be.true;
            expect(postMessageSpy.args[0][0]).to.equal(frame.contentWindow);
            let spyData = JSON.parse(postMessageSpy.args[0][1]);
            let events = spyData['collection-events'];
            expect(events).to.be.ok;
            const verifyEvent = (name, coords) => {
              expect(events[name]).to.be.array;
              expect(events[name].length).to.equal(coords.length);
              coords.forEach((coord, idx) => {
                expect(events[name][idx].x = coord[0]);
                expect(events[name][idx].y = coord[1]);
                expect(typeof events[name][idx].timestamp).to.be.number;
              });
            };
            verifyEvent('click', [[10, 20], [11, 21]]);
            verifyEvent('touchstart', [[30, 40]]);
            verifyEvent('touchend', [[50, 60], [51, 61]]);
            const touchmoveEvents = events['touchmove'];
            expect(touchmoveEvents).to.be.array;
            expect(touchmoveEvents.length).to.equal(1);
            expect(touchmoveEvents[0].touches).to.deep.equal(
                [{x: 70, y: 80}, {x: 71, y: 81}]);
            expect(typeof touchmoveEvents[0].timestamp).to.be.number;
            // Verify that post message is not sent again as no new events have
            // occurred.
            return timeoutPromise(MESSAGE_INTERVAL_MS + 10).then(() => {
              expect(postMessageSpy.calledOnce).to.be.true;
              // send a new event and verify post message sent after interval
              sendEvent('click', 101, 201);
              expect(postMessageSpy.calledOnce).to.be.true;
              return timeoutPromise(MESSAGE_INTERVAL_MS + 10).then(() => {
                expect(postMessageSpy.calledTwice).to.be.true;
                expect(postMessageSpy.args[1][0]).to.equal(frame.contentWindow);
                spyData = JSON.parse(postMessageSpy.args[1][1]);
                events = spyData['collection-events'];
                verifyEvent('click', [[101, 201]]);
              });
            });
          });
        });
      });
    });
  });
});
