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

const iframeSrc = '/base/test/fixtures/served/amp-dynamic-css-classes.html';
const FBUA = 'Mozilla/5.0 (Linux; Android 5.1.1; SM-G920V Build/LMY47X; wv)' +
  ' AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0Chrome/47.0.2526.99' +
  ' Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/58.0.0.28.70;]';
const TwitterUA = 'Mozilla/5.0 (Linux: Android 6.0.1: Nexus 6P Build/MHB76B;' +
  ' wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0' +
  'Chrome/47.0.2526.99 Mobile Safari/537.36 TwitterAndroid';
const PinterestUA = 'Mozilla/5.0 (iPod touch; CPU iPhone OS 8_1 like Mac OS' +
  ' X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411' +
    ' [Pinterest/iOS]';

describe('dynamic classes are inserted at runtime', () => {
  let documentElement;
  function setup(enabled, userAgent) {
    return createServedIframe(iframeSrc).then(fixture => {
      const win = fixture.win;
      documentElement = fixture.doc.documentElement;

      toggleExperiment(win, 'dynamic-css-classes', enabled);
      Object.defineProperty(win.navigator, 'userAgent', {
        enumerable: true,
        writeable: false,
        configurable: true,
        value: userAgent
      });

      return win.insertDynamicCssScript();
    });
  }

  describe('when experiment is disabled', () => {
    beforeEach(() => {
      return setup(false, FBUA);
    });

    it('should not include referrer classes', () => {
      expect(documentElement).not.to.have.class('amp-referrer-localhost');
    });

    it('should not include viewer class', () => {
      expect(documentElement).not.to.have.class('amp-viewer');
    });

    it('should not include UA classes', () => {
      expect(documentElement).not.to.have.class('amp-ua-facebook');
    });
  });

  describe('when experiment is enabled', () => {
    beforeEach(() => {
      return setup(true, FBUA);
    });

    it('should include referrer classes', () => {
      expect(documentElement).to.have.class('amp-referrer-localhost');
    });

    it('should include viewer class', () => {
      expect(documentElement).to.have.class('amp-viewer');
    });

    it('should include UA classes', () => {
      expect(documentElement).to.have.class('amp-ua-facebook');
    });
  });

  describe('Service UserAgents', () => {
    const services = {
      Facebook: FBUA,
      Twitter: TwitterUA,
      Pinterest: PinterestUA
    };

    for (const service in services) {
      it(`should detect ${service}`, () => {
        return setup(true, services[service]).then(() => {
          const serviceClass = `amp-ua-${service.toLowerCase()}`;
          expect(documentElement).to.have.class(serviceClass);
        });
      });
    }
  });
});
