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

import {referrers_} from '../amp-dynamic-css-classes';

describe('amp-dynamic-css-classes', () => {
  describe('referrers_', () => {
    describe('when referrer is TLD-less', () => {
      const referrer = 'localhost';

      it('contains the domain', () => {
        expect(referrers_(referrer)).to.deep.equal(['localhost']);
      });
    });

    describe('when referrer has no subdomains', () => {
      const referrer = 'google.com';
      const referrers = referrers_(referrer);

      it('contains the TLD', () => {
        expect(referrers).to.contain('com');
      });

      it('contains the domain', () => {
        expect(referrers).to.contain('google.com');
        expect(referrers.length).to.equal(2);
      });
    });

    describe('when referrer has subdomains', () => {
      const referrer = 'a.b.c.google.com';
      const referrers = referrers_(referrer);

      it('contains the TLD', () => {
        expect(referrers).to.contain('com');
      });

      it('contains the domain', () => {
        expect(referrers).to.contain('google.com');
      });

      it('contains each subdomain', () => {
        expect(referrers).to.include.members([
          'c.google.com',
          'b.c.google.com',
          'a.b.c.google.com',
        ]);
        expect(referrers.length).to.equal(5);
      });
    });
  });
});
