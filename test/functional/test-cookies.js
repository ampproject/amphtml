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

import {getCookie, setCookie} from '../../src/cookies';


describe('cookies', () => {

  function expectCookie(cookiesString, cookieName, opt_locationHref) {
    return expect(getCookie({
      document: {
        cookie: cookiesString,
      },
    }, cookieName));
  }

  it('should return null for no cookie, malformed, or not found', () => {
    expectCookie(null, 'c1').to.be.null;
    expectCookie(undefined, 'c1').to.be.null;
    expectCookie('', 'c1').to.be.null;
    expectCookie('c1', 'c1').to.be.null;
    expectCookie('e2=1', 'c1').to.be.null;
  });

  it('should return value when found', () => {
    expectCookie('c1=1', 'c1').to.equal('1');
    expectCookie(' c1 = 1 ', 'c1').to.equal('1');
    expectCookie('c1=1;c2=2', 'c1').to.equal('1');
    expectCookie('c1=1;c2=2', 'c2').to.equal('2');
  });

  it('should return value for an escaped cookie name', () => {
    expectCookie('c%26=1', 'c&').to.equal('1');
  });

  it('should return an unescaped value', () => {
    expectCookie('c1=1%26', 'c1').to.equal('1&');
  });

  it('should write the cookie', () => {
    const doc = {};
    setCookie({
      document: doc,
      location: {
        href: 'https://www.example.com/test',
      },
    }, 'c&1', 'v&1', 1447383159853);
    expect(doc.cookie).to.equal(
        'c%261=v%261; path=/; expires=Fri, 13 Nov 2015 02:52:39 GMT');
  });

  it('should write the cookie to the right domain', () => {
    function test(hostname, targetDomain, opt_noset, opt_allowOnProxyOrigin) {
      let cookie;
      const doc = {
        set cookie(val) {
          // Delete cookies on ampproject.org
          if (val.indexOf('domain=ampproject.org; ' +
              'expires=Thu, 01 Jan 1970 00:00:00 GMT') != -1) {
            cookie = undefined;
            return;
          }
          if (val.indexOf('; domain=' + targetDomain) != -1) {
            cookie = val;
          }
        },
        get cookie() {
          return cookie;
        },
      };
      setCookie({
        document: doc,
        location: {
          hostname,
          href: 'https://' + hostname + '/test.html',
        }},
      'c&1', 'v&1', 1447383159853, {
        highestAvailableDomain: true,
        allowOnProxyOrigin: !!opt_allowOnProxyOrigin,
      });
      if (opt_noset) {
        expect(cookie).to.be.undefined;
      } else {
        expect(cookie).to.equal(
            'c%261=v%261; path=/; domain=' + targetDomain +
            '; expires=Fri, 13 Nov 2015 02:52:39 GMT');
      }
    }
    test('www.example.com', 'example.com');
    test('123.www.example.com', 'example.com');
    test('example.com', 'example.com');
    test('www.example.com', 'www.example.com');
    test('123.www.example.com', '123.www.example.com');
    test('www.example.net', 'example.com', true);
    test('example.net', 'example.com', true);
    test('cdn.ampproject.org', 'ampproject.org', true, true);
    allowConsoleError(() => {
      expect(() => {
        test('cdn.ampproject.org', 'ampproject.org', true);
      }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);
      expect(() => {
        test('CDN.ampproject.org', 'ampproject.org', true);
      }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);
      expect(() => {
        test('CDN.ampproject.org', 'AMPproject.org', true);
      }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);
    });
    test('www.ampproject.org', 'www.ampproject.org');
    test('cdn.ampproject.org', 'cdn.ampproject.org', false, true);
    allowConsoleError(() => {
      expect(() => {
        test('cdn.ampproject.org', 'cdn.ampproject.org', false);
      }).to.throw(/Should never attempt to set cookie on proxy origin\: c\&1/);
      expect(() => {
        test('foo.bar.cdn.ampproject.org', 'foo.bar.cdn.ampproject.org', false);
      }).to.throw(/in depth check/);
      expect(() => {
        test('&&&.cdn.ampproject.org', '&&&.cdn.ampproject.org', false);
      }).to.throw(/in depth check/);
      expect(() => {
        test('&&&.CDN.ampproject.org', '&&&.cdn.AMPproject.org', false);
      }).to.throw(/in depth check/);
    });
  });
});
