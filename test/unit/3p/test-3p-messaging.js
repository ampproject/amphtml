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

import {Services} from '../../../src/services';
import {createIframePromise} from '../../../testing/iframe';
import {listenParent} from '../../../3p/messaging';
import {postMessage} from '../../../src/iframe-helper';

describe('3p messaging', () => {

  let testWin;
  let iframe;
  const timer = Services.timerFor(window);

  beforeEach(() => {
    return createIframePromise(true).then(i => {
      testWin = i.win;
      testWin.context = {
        location: window.location,
        sentinel: 'test',
      };
      iframe = {
        contentWindow: testWin,
        getAttribute(attr) {
          return attr == 'data-amp-3p-sentinel' ? 'test' : undefined;
        },
      };
    });
  });

  it('should receive messages', () => {
    let progress = '';
    listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    postMessage(iframe, 'test', {s: 'a'}, '*', true);
    postMessage(iframe, 'test', {s: 'b'}, '*', false);
    postMessage(iframe, 'other', {s: 'c'}, '*', true);
    postMessage(iframe, 'test', {s: 'd'}, '*', true);
    return timer.promise(10).then(() => {
      expect(progress).to.equal('ad');
    });
  });

  it('should receive more messages', () => {
    let progress = '';
    listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    listenParent(testWin, 'test2', function(d) {
      progress += d.s;
    });
    postMessage(iframe, 'test', {s: 'a'}, '*', true);
    postMessage(iframe, 'test2', {s: 'a'}, '*', true);
    postMessage(iframe, 'test2', {s: 'a'}, '*', true);
    postMessage(iframe, 'test', {s: 'b'}, '*', false);
    postMessage(iframe, 'other', {s: 'c'}, '*', true);
    postMessage(iframe, 'test2', {s: 'a'}, '*', true);
    postMessage(iframe, 'test', {s: 'd'}, '*', true);
    return timer.promise(10).then(() => {
      expect(progress).to.equal('aaaaadd');
    });
  });

  it('should support unlisten', () => {
    let progress = '';
    const unlisten0 = listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    const unlisten1 = listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    const unlisten2 = listenParent(testWin, 'test2', function(d) {
      progress += d.s;
    });
    postMessage(iframe, 'test', {s: 'a'}, '*', true);
    return timer.promise(10).then(() => {
      expect(progress).to.equal('aa');
      unlisten0();
      postMessage(iframe, 'test2', {s: 'a'}, '*', true);
      postMessage(iframe, 'test2', {s: 'a'}, '*', true);
      postMessage(iframe, 'test', {s: 'b'}, '*', true);
      return timer.promise(10).then(() => {
        unlisten2();
        unlisten1();
        postMessage(iframe, 'test2', {s: 'a'}, '*', true);
        postMessage(iframe, 'test', {s: 'd'}, '*', true);
        return timer.promise(10).then(() => {
          expect(progress).to.equal('aaaab');
        });
      });
    });
  });

  it('should not stop on errors', () => {
    let progress = '';
    const origOnError = window.onError;
    const expected = new Error('expected');
    window.onerror = function(message, source, lineno, colno, error) {
      if (error === expected) {
        return;
      }
      origOnError.apply(this, arguments);
    };

    listenParent(testWin, 'test', function() {
      throw expected;
    });
    listenParent(testWin, 'test', function(d) {
      progress += d.s;
    });
    postMessage(iframe, 'test', {s: 'a'}, '*', true);
    postMessage(iframe, 'test', {s: 'd'}, '*', true);
    return timer.promise(10).catch(() => {}).then(() => {
      window.onError = origOnError;
      expect(progress).to.equal('ad');
    });
  });
});
