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

import {validateSrcPrefix, validateSrcContains, checkData, validateData}
    from '../../src/3p';
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

  it('should throw an error if prefix is not https:', () => {
    expect(() => {
      validateSrcPrefix('https:', 'http://adserver.adtechus.com');
    }).to.throw(/Invalid src/);
  });

  it('should not throw if source starts with https', () => {
    validateSrcPrefix('https:', 'https://adserver.adtechus.com');
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
});

