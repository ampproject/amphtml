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

import {validateSrcPrefix, validateSrcContains, checkData, validateData,
    validateDataExists, validateExactlyOne} from '../../src/3p';
import * as sinon from 'sinon';

describe('3p', () => {

  let sandbox;
  let clock;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
  });

  afterEach(() => {
    clock.tick(1000);
    sandbox.restore();
  });

  describe('validateSrcPrefix()', () => {

    it('should throw when a string prefix does not match', () => {
      expect(() => {
        validateSrcPrefix('https:', 'http://example.org');
      }).to.throw(/Invalid src/);
    });

    it('should throw when array prefixes do not match', () => {
      expect(() => {
        validateSrcPrefix(['https:', 'ftp:'], 'http://example.org');
      }).to.throw(/Invalid src/);
    });

    it('should not throw when a string prefix matches', () => {
      validateSrcPrefix('http:', 'http://example.org');
    });

    it('should not throw when any of the array prefixes match', () => {
      validateSrcPrefix(['https:', 'http:'], 'http://example.org');
      validateSrcPrefix(['http:', 'https:'], 'http://example.org');
    });
  });

  it('should throw an error if src does not contain addyn', () => {
    expect(() => {
      validateSrcContains('/addyn/', 'http://adserver.adtechus.com/');
    }).to.throw(/Invalid src/);
  });

  it('should not throw if source contains /addyn/', () => {
    validateSrcContains('/addyn/', 'http://adserver.adtechus.com/addyn/');
  });

  it('should accept good host supplied data', () => {
    checkData({
      width: '',
      height: false,
      initialWindowWidth: 1,
      initialWindowHeight: 2,
      type: true,
      referrer: true,
      canonicalUrl: true,
      pageViewId: true,
      location: true,
      mode: true,
    }, []);
    clock.tick(1);

    checkData({
      width: "",
      foo: true,
      bar: true,
    }, ['foo', 'bar']);
    clock.tick(1);
  });

  it('should accept supplied data', () => {
    validateDataExists({
      width: '',
      height: false,
      initialWindowWidth: 1,
      initialWindowHeight: 2,
      type: "taboola",
      referrer: true,
      canonicalUrl: true,
      pageViewId: true,
      location: true,
      mode: true,
    }, []);
    clock.tick(1);

    validateDataExists({
      width: "",
      type: "taboola",
      foo: true,
      bar: true,
    }, ['foo', 'bar']);
    clock.tick(1);
  });

  it('should accept supplied data', () => {
    validateExactlyOne({
      width: "",
      type: "taboola",
      foo: true,
      bar: true,
    }, ['foo', 'day', 'night']);
    clock.tick(1);
  });

  it('should complain about unexpected args', () => {
    checkData({
      type: 'TEST',
      foo: true,
      'not-whitelisted': true,
    }, ['foo']);
    expect(() => {
      clock.tick(1);
    }).to.throw(/Unknown attribute for TEST: not-whitelisted./);


    expect(() => {
      // Sync throw, not validateData vs. checkData
      validateData({
        type: 'TEST',
        foo: true,
        'not-whitelisted2': true,
      }, ['not-whitelisted', 'foo']);
    }).to.throw(/Unknown attribute for TEST: not-whitelisted2./);
  });

  it('should complain about missing args', () => {

    expect(() => {
      validateDataExists({
        width: "",
        type: "xxxxxx",
        foo: true,
        bar: true,
      }, ['foo', 'bar', 'persika']);
    }).to.throw(/Missing attribute for xxxxxx: persika./);

    expect(() => {
      validateExactlyOne({
        width: "",
        type: "xxxxxx",
        foo: true,
        bar: true,
      }, ['red', 'green', 'blue']);
    }).to.throw(
        /xxxxxx must contain exactly one of attributes: red, green, blue./);
  });


});

