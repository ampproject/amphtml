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

import {Crypto} from '../crypto-impl';

describe('crypto-impl', () => {

  let crypto;

  beforeEach(() => {
    crypto = new Crypto({});
  });

  it('should hash "abc" in sha384', () => {
    return crypto.sha384('abc').then(buffer => {
      expect(buffer.length).to.equal(48);
      expect(buffer[0]).to.equal(203);
      expect(buffer[1]).to.equal(0);
      expect(buffer[47]).to.equal(167);
    });
  });

  it('should hash "abc" in sha384Base64', () => {
    return expect(crypto.sha384Base64('abc')).to.eventually.equal(
        'ywB1P0WjXou1oD1pmsZQBycsMqsO3tFjGotgWkP_W-2AhgcroefMI1i67KE0yCWn');
  });

  it('should hash "foobar" in sha384Base64', () => {
    return expect(crypto.sha384Base64('foobar')).to.eventually.equal(
        'PJww2fZl501RXIQpYNSkUcg6ASX9Pec5LXs3IxrxDHLqWK7fzfiaV2W_kCr5Ps8G');
  });
});
