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

import {createServedIframe} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';
import {viewerFor} from '../../../../src/viewer';
import {vsyncFor} from '../../../../src/vsync';

function overwrite(object, property, value) {
  Object.defineProperty(object, property, {
    enumerable: true,
    writeable: false,
    configurable: true,
    value: value,
  });
}

const iframeSrc = '/base/test/fixtures/served/amp-dynamic-css-classes.html';

const tcoReferrer = 'http://t.co/xyzabc123';
const PinterestUA = 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G920F' +
  ' Build/LMY47X; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0' +
  ' Chrome/47.0.2526.100 Mobile Safari/537.36 [Pinterest/Android]';

describe('dynamic classes are inserted at runtime', () => {
  let documentElement;

  function mockVsync(win) {
    const vsync = vsyncFor(win);
    vsync.schedule_ = () => {
      vsync.runScheduledTasks_();
    };
  }

  function setup(enabled, userAgent, referrer) {
    return createServedIframe(iframeSrc).then(fixture => {
      const win = fixture.win;
      documentElement = fixture.doc.documentElement;

      toggleExperiment(win, 'dynamic-css-classes', enabled);
      mockVsync(win);

      if (userAgent !== undefined) {
        overwrite(win.navigator, 'userAgent', userAgent);
      }
      if (referrer !== undefined) {
        viewerFor(win).getUnconfirmedReferrerUrl = () => referrer;
      }

      return win.insertDynamicCssScript();
    });
  }

  describe('when experiment is disabled', () => {
    beforeEach(() => {
      return setup(false);
    });

    it('should not include referrer classes', () => {
      expect(documentElement).not.to.have.class('amp-referrer-localhost');
    });

    it('should not include viewer class', () => {
      expect(documentElement).not.to.have.class('amp-viewer');
    });
  });

  describe('when experiment is enabled', () => {
    beforeEach(() => {
      return setup(true);
    });

    it('should include referrer classes', () => {
      expect(documentElement).to.have.class('amp-referrer-localhost');
    });

    it('should include viewer class', () => {
      expect(documentElement).to.have.class('amp-viewer');
    });
  });

  describe('Normalizing Referrers', () => {
    it('should normalize twitter shortlinks to twitter', () => {
      return setup(true, '', tcoReferrer).then(() => {
        expect(documentElement).to.have.class('amp-referrer-com');
        expect(documentElement).to.have.class('amp-referrer-twitter-com');
      });
    });

    it('should normalize pinterest on android', () => {
      return setup(true, PinterestUA, '').then(() => {
        expect(documentElement).to.have.class('amp-referrer-com');
        expect(documentElement).to.have.class('amp-referrer-pinterest-com');
        expect(documentElement).to.have.class('amp-referrer-www-pinterest-com');
      });
    });
  });

  it('should delay unhiding the body', () => {
    return createServedIframe(iframeSrc).then(fixture => {
      expect(fixture.doc.body).to.be.hidden;

      const win = fixture.win;
      mockVsync(win);
      return win.insertDynamicCssScript().then(() => fixture);
    }).then(fixture => {
      expect(fixture.doc.body).to.be.visible;
    });
  });
});
