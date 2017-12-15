/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-dynamic-css-classes';
import {Services} from '../../../../src/services';
import {vsyncForTesting} from '../../../../src/service/vsync-impl';

const tcoReferrer = 'http://t.co/xyzabc123';
const PinterestUA = 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G920F' +
  ' Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0' +
  ' Chrome/47.0.2526.100 Mobile Safari/537.36 [Pinterest/Android]';


describes.fakeWin('dynamic classes are inserted at runtime', {
  amp: true, // Extension will be installed manually in tests.
  location: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
}, env => {
  let win, doc, ampdoc;
  let body;
  let viewer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    ampdoc = env.ampdoc;
    body = doc.body;
  });

  function setup(embeded, userAgent, referrer) {
    const vsync = vsyncForTesting(win);
    vsync.schedule_ = () => {
      vsync.runScheduledTasks_();
    };
    viewer = Services.viewerForDoc(ampdoc);
    viewer.isEmbedded = () => !!embeded;
    if (userAgent !== undefined) {
      win.navigator.userAgent = userAgent;
    }
    if (referrer !== undefined) {
      sandbox.stub(viewer, 'getUnconfirmedReferrerUrl').callsFake(
          () => referrer);
    }
    env.installExtension('amp-dynamic-css-classes');
  }

  describe('when embedded', () => {
    beforeEach(() => {
      setup(true);
    });

    it('should include viewer class', () => {
      expect(body).to.have.class('amp-viewer');
    });
  });

  describe('Normalizing Referrers', () => {
    it('should normalize twitter shortlinks to twitter', () => {
      setup(false, '', tcoReferrer);
      expect(body).to.have.class('amp-referrer-com');
      expect(body).to.have.class('amp-referrer-twitter-com');
    });

    it('should normalize pinterest on android', () => {
      setup(false, PinterestUA, '');
      expect(body).to.have.class('amp-referrer-com');
      expect(body).to.have.class('amp-referrer-pinterest-com');
      expect(body).to.have.class('amp-referrer-www-pinterest-com');
    });
  });
});
