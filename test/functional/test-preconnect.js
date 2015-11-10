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

import {preconnectFor} from '../../src/preconnect';
import * as sinon from 'sinon';

describe('preconnect', () => {

  let sandbox;
  let clock;
  let preconnect;

  // Factored out to make our linter happy since we don't allow
  // bare javascript URLs.
  const javascriptUrlPrefix = 'javascript';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    preconnect = preconnectFor(window);
  });

  afterEach(() => {
    clock.tick(20000);
    clock.restore();
    sandbox.restore();
  });

  it('should preconnect', () => {
    preconnect.url('https://a.preconnect.com/foo/bar');
    preconnect.url('https://a.preconnect.com/other');
    preconnect.url(javascriptUrlPrefix + ':alert()');
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(1);
    expect(document.querySelector('link[rel=dns-prefetch]').href)
        .to.equal('https://a.preconnect.com/');
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(1);
    expect(document.querySelector('link[rel=preconnect]').href)
        .to.equal('https://a.preconnect.com/');
    expect(document.querySelectorAll('link[rel=prefetch]'))
        .to.have.length(0);
  });

  it('should cleanup', () => {
    preconnect.url('https://c.preconnect.com/foo/bar');
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(1);
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(1);
    clock.tick(9000);
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(1);
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(1);
    clock.tick(1000);
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(0);
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(0);
  });

  it('should preconnect to 2 different origins', () => {
    preconnect.url('https://d.preconnect.com/foo/bar');
    // Different origin
    preconnect.url('https://e.preconnect.com/other');
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(2);
    expect(document.querySelectorAll('link[rel=dns-prefetch]')[0].href)
        .to.equal('https://d.preconnect.com/');
    expect(document.querySelectorAll('link[rel=dns-prefetch]')[1].href)
        .to.equal('https://e.preconnect.com/');
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(2);
  });

  it('should prefetch', () => {
    preconnect.prefetch('https://a.prefetch.com/foo/bar');
    preconnect.prefetch('https://a.prefetch.com/foo/bar');
    preconnect.prefetch('https://a.prefetch.com/other');
    preconnect.prefetch(javascriptUrlPrefix + ':alert()');
    // Also preconnects.
    expect(document.querySelectorAll('link[rel=dns-prefetch]'))
        .to.have.length(1);
    expect(document.querySelector('link[rel=dns-prefetch]').href)
        .to.equal('https://a.prefetch.com/');
    expect(document.querySelectorAll('link[rel=preconnect]'))
        .to.have.length(1);
    expect(document.querySelector('link[rel=preconnect]').href)
        .to.equal('https://a.prefetch.com/');
    // Actual prefetch
    const fetches = document.querySelectorAll(
        'link[rel=prefetch]');
    expect(fetches).to.have.length(2);
    expect(fetches[0].href).to.equal('https://a.prefetch.com/foo/bar');
    expect(fetches[1].href).to.equal('https://a.prefetch.com/other');
  });
});
