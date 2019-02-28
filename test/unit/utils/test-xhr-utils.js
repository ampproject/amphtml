/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  ALLOW_SOURCE_ORIGIN_HEADER,
  CORS_ALLOW_ORIGIN_HEADER,
  validAmpCORSHeadersForAmpCache,
  verifyAmpCORSHeaders,
} from '../../../src/utils/xhr-utils';

describes.sandboxed('utils/xhr-utils', {}, () => {

  describe('verifyAmpCORSHeaders', () => {
    it('should verify allowed source origin', () => {
      const sourceOrigin = 'https://www.da-original.org';
      const headers = {};
      headers[ALLOW_SOURCE_ORIGIN_HEADER] = sourceOrigin;
      const response = new Response({}, {headers: new Headers(headers)});
      const win = {
        location: {
          href: sourceOrigin,
        },
      };
      expect(() => {
        verifyAmpCORSHeaders(win, response, {} /* init */);}).to.not.throw;
    });

    it('should throw error if invalid origin', () => {
      const sourceOrigin = 'https://www.da-original.org';
      const headers = {};
      headers[ALLOW_SOURCE_ORIGIN_HEADER] = 'https://www.original.org';
      const response = new Response({}, {headers: new Headers(headers)});
      const win = {
        location: {
          href: sourceOrigin,
        },
      };
      allowConsoleError(() => {
        expect(() => {
          verifyAmpCORSHeaders(win, response, {} /* init */);})
            .to.throw('Returned AMP-Access-Control-Allow-Source-Origin '
                + 'is not equal to the current: https://www.original.org vs '
                + 'https://www.da-original.org');
      });
    });
  });

  describe('verifyAmpCORSHeadersForAmpCache', () => {
    const newResponseWithAllowOriginHeader = allowOriginHeader => {
      const headers = {};
      headers[CORS_ALLOW_ORIGIN_HEADER] = allowOriginHeader;
      return new Response({}, {headers: new Headers(headers)});
    };

    it('should be valid for cdn subdomains', () => {
      expect(validAmpCORSHeadersForAmpCache(
          newResponseWithAllowOriginHeader('http://cdn-subdomain.cdn.amproject.org')))
          .to.be.false;
    });

    it('should be invalid for non cdn subdomains', () => {
      expect(validAmpCORSHeadersForAmpCache(
          newResponseWithAllowOriginHeader('http://www.not-cdn-subdomain-mode')))
          .to.be.false;
    });
  });

});
