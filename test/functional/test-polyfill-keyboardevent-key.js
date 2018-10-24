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

import {install} from '../../src/polyfills/keyboardevent-key';

describes.fakeWin('KeyboardEvent#key', {}, env => {

  beforeEach(() => {
    env.win.KeyboardEvent = KeyboardEvent;
  });

  describe('in IE', () => {
    beforeEach(() => {
      env.win.Object.defineProperty(env.win.navigator, 'userAgent', {
        get() { return 'MSIE'; },
      });
      install(env.win);
    });

    it('changes IE behavior to match modern behavior', () => {
      expect(getKeypressEvent('Win').key).to.equal('Meta');
      expect(getKeypressEvent('Scroll').key).to.equal('ScrollLock');
      expect(getKeypressEvent('Spacebar').key).to.equal(' ');
      expect(getKeypressEvent('Down').key).to.equal('ArrowDown');
      expect(getKeypressEvent('Left').key).to.equal('ArrowLeft');
      expect(getKeypressEvent('Right').key).to.equal('ArrowRight');
      expect(getKeypressEvent('Up').key).to.equal('ArrowUp');
      expect(getKeypressEvent('Del').key).to.equal('Delete');
      expect(getKeypressEvent('Apps').key).to.equal('ContextMenu');
      expect(getKeypressEvent('Esc').key).to.equal('Escape');
      expect(getKeypressEvent('Multiply').key).to.equal('*');
      expect(getKeypressEvent('Add').key).to.equal('+');
      expect(getKeypressEvent('Subtract').key).to.equal('-');
      expect(getKeypressEvent('Decimal').key).to.equal('.');
      expect(getKeypressEvent('Divide').key).to.equal('/');
    });
  });

  describe('in non-IE', () => {
    beforeEach(() => {
      env.win.Object.defineProperty(env.win.navigator, 'userAgent', {
        get() { return ''; },
      });
      install(env.win);
    });

    it('does not change the behavior of modern browsers', () => {
      expect(getKeypressEvent('ContextMenu').key).to.equal('ContextMenu');
      expect(getKeypressEvent('Meta').key).to.equal('Meta');
      expect(getKeypressEvent('ScrollLock').key).to.equal('ScrollLock');
      expect(getKeypressEvent('ArrowDown').key).to.equal('ArrowDown');
      expect(getKeypressEvent('ArrowLeft').key).to.equal('ArrowLeft');
      expect(getKeypressEvent('ArrowRight').key).to.equal('ArrowRight');
      expect(getKeypressEvent('ArrowUp').key).to.equal('ArrowUp');
      expect(getKeypressEvent('Delete').key).to.equal('Delete');
      expect(getKeypressEvent('ContextMenu').key).to.equal('ContextMenu');
      expect(getKeypressEvent('Escape').key).to.equal('Escape');
      expect(getKeypressEvent(' ').key).to.equal(' ');
      expect(getKeypressEvent('*').key).to.equal('*');
      expect(getKeypressEvent('+').key).to.equal('+');
      expect(getKeypressEvent('-').key).to.equal('-');
      expect(getKeypressEvent('.').key).to.equal('.');
      expect(getKeypressEvent('/').key).to.equal('/');
    });
  });

  function getKeypressEvent(key) {
    return new KeyboardEvent('keypress', {key});
  }
});
