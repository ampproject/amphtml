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

import {getCookie} from '../../src/cookies';


describe('getCookie', () => {

  function expectCookie(cookiesString, cookieName) {
    return expect(getCookie({
      document: {
        cookie: cookiesString
      }
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
});
