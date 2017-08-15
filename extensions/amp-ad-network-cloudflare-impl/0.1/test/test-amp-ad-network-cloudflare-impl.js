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

import {AmpAdNetworkCloudflareImpl} from '../amp-ad-network-cloudflare-impl';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {cloudflareIsA4AEnabled} from '../cloudflare-a4a-config';
import {createElementWithAttributes} from '../../../../src/dom';
import * as vendors from '../vendors';

describes.realWin('cloudflare-a4a-config', {amp: true}, env => {
  let doc;
  let win;
  beforeEach(() => {
    win = env.win;
    doc = env.win.document;
  });
  it('should pass a4a config predicate', () => {
    const el = createElementWithAttributes(doc, 'amp-ad', {
      'data-cf-network': 'cloudflare',
      src: '/ad.html',
      'data-cf-a4a': 'true',
    });
    expect(cloudflareIsA4AEnabled(win, el)).to.be.true;
  });
});

describes.realWin('amp-ad-network-cloudflare-impl', {amp: true}, env => {

  let cloudflareImpl;
  let el;
  let doc;

  beforeEach(() => {
    doc = env.win.document;
    el = doc.createElement('amp-ad');
    el.setAttribute('type', 'cloudflare');
    el.setAttribute('data-cf-network', 'cloudflare');
    el.setAttribute('src',
        'https://firebolt.cloudflaredemo.com/a4a-ad.html');
    sandbox.stub(
        AmpAdNetworkCloudflareImpl.prototype, 'getSigningServiceNames',
        () => {
          return ['cloudflare','cloudflare-dev'];
        });
    sandbox.stub(vendors, 'NETWORKS', {
      cloudflare: {
        base: 'https://firebolt.cloudflaredemo.com',
      },

      'cf-test': {
        base: 'https://cf-test.com',
        src: 'https://cf-test.com/path/ad?width=SLOT_WIDTH&height=SLOT_HEIGHT',
      },
    });
    doc.body.appendChild(el);
    cloudflareImpl = new AmpAdNetworkCloudflareImpl(el);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#isValidElement', () => {
    it('should be valid', () => {
      expect(cloudflareImpl.isValidElement()).to.be.true;
    });
    it('should NOT be valid (impl tag name)', () => {
      el = doc.createElement('amp-ad-network-cloudflare-impl');
      el.setAttribute('type', 'cloudflare');
      cloudflareImpl = new AmpAdNetworkCloudflareImpl(el);
      expect(cloudflareImpl.isValidElement()).to.be.false;
    });
  });

  describe('#getAdUrl', () => {

    it('should be valid', () => {
      expect(cloudflareImpl.getAdUrl()).to.equal(
          'https://firebolt.cloudflaredemo.com/_a4a/a4a-ad.html');
    });

    it('should handle non-a4a URLs', () => {
      el.setAttribute('data-cf-a4a', 'false');
      expect(cloudflareImpl.getAdUrl()).to.equal(
          'https://firebolt.cloudflaredemo.com/a4a-ad.html');
    });

    it('should accept a4a src', () => {
      el.setAttribute('src',
          'https://firebolt.cloudflaredemo.com/_a4a/a4a-ad.html');
      expect(cloudflareImpl.getAdUrl()).to.equal(
          'https://firebolt.cloudflaredemo.com/_a4a/a4a-ad.html');
    });

    it('should handle additional templated width/height', () => {
      el.setAttribute('src', 'https://firebolt.cloudflaredemo.com/'
        + 'ad?width=SLOT_WIDTH&height=SLOT_HEIGHT');
      expect(cloudflareImpl.getAdUrl()).to.equal(
          'https://firebolt.cloudflaredemo.com/_a4a/ad?width=0&height=0');
    });

    function parseQuery(query) {
      const kvs = query.split(/&/);
      const params = {};
      for (let i = 0; i < kvs.length; i++) {
        const parts = kvs[i].match(/^([^=]+)=?(.*)/);
        params[parts[1]] = parts[2];
      }
      return params;
    }

    it('should handle data parameters', () => {
      el.setAttribute('src', 'https://firebolt.cloudflaredemo.com/ad');
      el.setAttribute('data-key', 'value');
      el.setAttribute('data-another', 'more');

      const url = cloudflareImpl.getAdUrl();
      const base = 'https://firebolt.cloudflaredemo.com/_a4a/ad?';
      expect(url.substring(0, base.length)).to.equal(base);
      expect(parseQuery(url.substring(base.length))).to.deep.equal({
        another: 'more',
        key: 'value',
      });
    });

    it('should handle default src with data parameters', () => {
      el.setAttribute('data-cf-network', 'cf-test');
      el.removeAttribute('src');
      el.setAttribute('data-key', 'value');
      el.setAttribute('data-another', 'more');

      const url = cloudflareImpl.getAdUrl();
      const base = 'https://cf-test.com/_a4a/path/ad?';
      expect(url.substring(0, base.length)).to.equal(base);
      expect(parseQuery(url.substring(base.length))).to.deep.equal({
        another: 'more',
        height: '0',
        key: 'value',
        width: '0',
      });
    });
  });
});
