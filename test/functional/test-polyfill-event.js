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

import {install} from '../../src/polyfills/event.js';

describes.fakeWin('Event', {}, env => {

  beforeEach(() => {
    // makes the Event polyfill install by setting window.Event to an object
    env.win.Event = Object.create(self.Event.prototype);
    // makes the prototype available for assignment
    env.win.Event.prototype = self.Event.prototype;
    install(env.win);
  });

  it('should be a function', () => {
    expect(env.win.Event).to.be.a('function');
  });

  it('should require a type argument', () => {
    expect(() => new env.win.Event()).to.throw(TypeError);
  });

  it('should not bubble or be cancelable by default', () => {
    const defaultEvent = new env.win.Event('event');
    expect(defaultEvent.bubbles).to.be.false;
    expect(defaultEvent.cancelable).to.be.false;
  });

  it('should be configurable', () => {
    const ev = new env.win.Event('event', {bubbles: true, cancelable: true});
    expect(ev.bubbles).to.be.true;
    expect(ev.cancelable).to.be.true;
  });

  it('should trigger listeners', () => {
    const ev = new env.win.Event('event');
    const elm = document.createElement('p');
    let flag = false;
    elm.addEventListener('event', () => {
      flag = true;
    });
    elm.dispatchEvent(ev);
    expect(flag).to.be.true;
  });
});
