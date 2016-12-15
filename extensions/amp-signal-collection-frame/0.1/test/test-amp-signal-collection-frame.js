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

import {AmpSignalCollectionFrame} from '../amp-signal-collection-frame';

describes.sandboxed('amp-signal-collection-frame', {}, () => {

  function createAmpSignalCollectionFrameElement(win, attrs) {
    const element =
        win.document.createElement('amp-signal-collection-frame');
    for (const attr in attrs) {
      element.setAttribute(attr, attrs[attr]);
    }
    win.document.body.appendChild(element);
    element.build();
    return element;
  }

  describes.fakeWin('fake win', {
    amp: {
      extensions: ['amp-signal-collection-frame'],
    },
  }, env => {

    it('should create child xdomain iframe', () => {
      const element = createAmpSignalCollectionFrameElement(env.win, {
        'type': 'google',
        'data-hash': 'abc123',
        'data-src-suffix': 'some_file.js'
      });
      expect(element.querySelector('iframe')).to.not.be.ok;
      return element.layoutCallback().then(() => {
        const frame = element.querySelector('iframe');
        expect(frame).to.be.ok;
        expect(frame.getAttribute('src')).to.equal(
            '//tpc.googlesyndication.com/sodar/some_file.js#abc123');
      });
    });

    it('should have priority 2', () => {
      expect(AmpSignalCollectionFrame.prototype.getPriority()).to.equal(2);
    });
  });
});
