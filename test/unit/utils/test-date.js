/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {getDate, getEpoch, parseDate} from '../../../src/utils/date';

describes.sandboxed('utils/date', {}, (env) => {
  describe('parseDate', () => {
    beforeEach(() => {
      env.sandbox.useFakeTimers(new Date('2018-01-01T08:00:00Z'));
    });

    it('should return null for empty values', () => {
      expect(parseDate(null)).to.be.null;
      expect(parseDate(undefined)).to.be.null;
      expect(parseDate('')).to.be.null;
    });

    it('should return null for invalid values', () => {
      expect(parseDate('abc')).to.be.null;
    });

    it('should return current date for "now"', () => {
      expect(parseDate('now')).to.equal(Date.now());
    });

    it('should parse a date', () => {
      // +1 second.
      expect(parseDate('2018-01-01T08:00:01Z')).to.equal(Date.now() + 1000);
    });
  });

  describe('getDate and getEpoch', () => {
    let date;

    beforeEach(() => {
      date = new Date(parseDate('2018-01-01T08:00:01Z'));
    });

    it('should return null for null input', () => {
      expect(getEpoch(null)).to.be.null;
      expect(getDate(null)).to.be.null;
      expect(getEpoch(0)).to.be.null;
      expect(getDate(0)).to.be.null;
    });

    it('should return the epoch value', () => {
      expect(getEpoch(date)).to.equal(date.getTime());
      expect(getEpoch(date.getTime())).to.equal(date.getTime());
    });

    it('should return the exact date instance value', () => {
      expect(getDate(date)).to.equal(date);
    });

    it('should create a new date', () => {
      expect(getDate(date.getTime()).getTime()).to.equal(date.getTime());
      expect(getDate(date.getTime())).to.not.equal(date);
    });
  });
});
