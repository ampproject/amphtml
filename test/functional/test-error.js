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

import {getErrorReportUrl, cancellation} from '../../src/error';
import {parseUrl, parseQueryString} from '../../src/url';
import {user} from '../../src/log';
import * as sinon from 'sinon';


describe('reportErrorToServer', () => {

  let sandbox;
  let onError;

  beforeEach(() => {
    onError = window.onerror;
    sandbox = sinon.sandbox.create();
    sandbox.spy(window, 'Image');
  });

  afterEach(() => {
    window.onerror = onError;
    sandbox.restore();
    window.viewerState = undefined;
  });

  it('reportError with error object', () => {
    const e = new Error('XYZ');
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.equal('XYZ');
    expect(query.el).to.equal('u');
    expect(query.a).to.equal('0');
    expect(query.s).to.equal(e.stack);
    expect(query['3p']).to.equal(undefined);
    expect(e.message).to.contain('_reported_');
    expect(query.or).to.contain('http://localhost');
    expect(query.vs).to.be.undefined;
    expect(query.r).to.contain('http://localhost');
  });

  it('reportError with associatedElement', () => {
    const e = new Error('XYZ');
    const el = document.createElement('foo-bar');
    e.associatedElement = el;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.el).to.equal('FOO-BAR');
    expect(query.a).to.equal('0');
    expect(query.v).to.equal('$internalRuntimeVersion$');
  });

  it('reportError mark asserts', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.a).to.equal('1');
    expect(query.v).to.equal('$internalRuntimeVersion$');
  });

  it('reportError mark asserts without error object', () => {
    let e = '';
    try {
      user().assert(false, 'XYZ');
    } catch (error) {
      e = error;
    }
    const url = parseUrl(
        getErrorReportUrl(e.message, undefined, undefined, undefined));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query.a).to.equal('1');
    expect(query.v).to.equal('$internalRuntimeVersion$');
  });

  it('reportError marks 3p', () => {
    window.context = {
      location: {},
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query['3p']).to.equal('1');
  });

  it('reportError marks canary and viewerState', () => {
    window.viewerState = 'some-state';
    window.AMP_CONFIG = {
      canary: true,
    };
    const e = new Error('XYZ');
    e.fromAssert = true;
    const url = parseUrl(
        getErrorReportUrl(undefined, undefined, undefined, undefined, e));
    const query = parseQueryString(url.search);

    expect(query.m).to.equal('XYZ');
    expect(query['ca']).to.equal('1');
    expect(query['vs']).to.equal('some-state');
  });

  it('reportError without error object', () => {
    const url = parseUrl(
        getErrorReportUrl('foo bar', 'foo.js', '11', '22', undefined));
    const query = parseQueryString(url.search);
    expect(url.href.indexOf(
        'https://amp-error-reporting.appspot.com/r?')).to.equal(0);

    expect(query.m).to.equal('foo bar');
    expect(query.f).to.equal('foo.js');
    expect(query.l).to.equal('11');
    expect(query.c).to.equal('22');
  });

  it('should not double report', () => {
    const e = new Error('something _reported_');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });

  it('reportError with error object', () => {
    const e = cancellation();
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });

  it('should not report load errors', () => {
    const e = new Error('Failed to load:');
    const url =
        getErrorReportUrl(undefined, undefined, undefined, undefined, e);
    expect(url).to.be.undefined;
  });
});
