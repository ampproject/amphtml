/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
  doesOriginDomainMatchIframeSrc,
  initRecaptcha,
} from '../../../3p/recaptcha';
import {
  parseUrlDeprecated,
} from '../../../src/url';

describe('3p recaptcha.js', () => {

  it('should require a window.name', () => {
    allowConsoleError(() => {
      window.name = undefined;
      expect(initRecaptcha).to.throw('window');
    });
  });

  it('should require a sitekey in the window.name dataObject', () => {
    allowConsoleError(() => {
      window.name = '{}';
      expect(initRecaptcha).to.throw('sitekey');
      window.name = undefined;
    });
  });

  describe('doesOriginDomainMatchIframeSrc()', () => {

    const getMockIframeWindowWithLocation = url => {
      // NOTE: The thirdPartyUrl returned by the config
      // Will return localhost for testing.
      // Therefore, passed URLS should do the same
      return {
        location: parseUrlDeprecated(url),
      };
    };

    it('should require the origin', () => {
      return allowConsoleError(() => {
        return doesOriginDomainMatchIframeSrc({}, {}).catch(err => {
          expect(err.message.includes('origin')).to.be.ok;
        });
      });
    });

    it('should allow localhost as a valid host', () => {
      return doesOriginDomainMatchIframeSrc(
          getMockIframeWindowWithLocation('http://localhost'),
          {origin: 'http://localhost'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });

    it('should allow cache domains', () => {
      return doesOriginDomainMatchIframeSrc(
          getMockIframeWindowWithLocation('https://example-com.recaptcha.localhost'),
          {origin: 'https://example-com.cdn.ampproject.org'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });

    it('should allow canonical domains', () => {
      return doesOriginDomainMatchIframeSrc(
          getMockIframeWindowWithLocation('https://example-com.recaptcha.localhost'),
          {origin: 'https://example.com'}
      ).then(() => {
        expect(true).to.be.ok;
      });
    });
  });
});

