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

import {AmpAdNetworkSmartAdsImpl} from '../../../amp-ad-network-smartads-impl/0.1/amp-ad-network-smartads-impl';
import {
  AmpAdUIHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-ui';
import {
  AmpAdXOriginIframeHandler, // eslint-disable-line no-unused-vars
} from '../../../amp-ad/0.1/amp-ad-xorigin-iframe-handler';
import {createElementWithAttributes} from '../../../../src/dom';
import {smartAdsIsA4AEnabled} from '../../../amp-ad-network-smartads-impl/0.1/smartads-a4a-config';

describes.realWin('smartads-a4a-config', {amp: false}, (env) => {
  let win, doc;
  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://smart-ads.biz/_amp',
      'data-use-a4a': 'true',
    });
    expect(smartAdsIsA4AEnabled(win, element)).to.be.true;
  });
  it('should pass a4a config predicate', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://smart-ads.biz/_a4a',
      'data-use-a4a': 'true',
    });
    expect(smartAdsIsA4AEnabled(win, element)).to.be.true;
  });
  it('should fail a4a config predicate due to useRemoteHtml', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://smart-ads.biz/_a4a',
      'data-use-a4a': 'true',
    });
    const useRemoteHtml = true;
    expect(smartAdsIsA4AEnabled(win, element, useRemoteHtml)).to.be.false;
  });
  it('should fail a4a config predicate due to missing use-a4a', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://smart-ads.biz/_amp',
    });
    expect(smartAdsIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to missing src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      'data-use-a4a': 'true',
    });
    expect(smartAdsIsA4AEnabled(win, element)).to.be.false;
  });
  it('should fail a4a config predicate due to invalid src', () => {
    const element = createElementWithAttributes(doc, 'amp-ad', {
      src: 'https://evil.com?hello=world&https://smart-ads.biz',
      'data-use-a4a': 'true',
    });
    expect(smartAdsIsA4AEnabled(win, element)).to.be.false;
  });
});

describes.realWin(
  'amp-ad-network-smartads-impl',
  {
    amp: {
      extensions: ['amp-ad-network-smartads-impl'],
    },
  },
  (env) => {
    let win, doc;
    let impl;
    let implElem;
    beforeEach(() => {
      win = env.win;
      doc = win.document;
      implElem = doc.createElement('amp-ad');
      implElem.setAttribute('type', 'smartads');
      implElem.setAttribute('data-use-a4a', 'true');
      env.sandbox
        .stub(AmpAdNetworkSmartAdsImpl.prototype, 'getSigningServiceNames')
        .callsFake(() => {
          return ['google'];
        });
      impl = new AmpAdNetworkSmartAdsImpl(implElem);
    });

    describe('#isValidElement', () => {
      it('should be valid', () => {
        implElem.setAttribute(
          'src',
          'https://smart-ads.biz/_a4a?buid=1&is_a4a=1'
        );
        expect(impl.isValidElement()).to.be.true;
      });
      it('should be valid', () => {
        implElem.setAttribute(
          'src',
          'https://smart-ads.biz/_amp?buid=1&is_a4a=1'
        );
        expect(impl.isValidElement()).to.be.true;
      });
      it('should NOT be valid (impl tag name)', () => {
        implElem = doc.createElement('amp-ad-network-smartads-impl');
        implElem.setAttribute('type', 'smartads');
        impl = new AmpAdNetworkSmartAdsImpl(implElem);
        expect(impl.isValidElement()).to.be.false;
      });
    });

    describe('#getAdUrl', () => {
      it('should be valid', () => {
        implElem.setAttribute(
          'src',
          'https://smart-ads.biz/_a4a?buid=1&is_a4a=1'
        );
        const base = 'https://smart-ads.biz/_a4a';
        expect(impl.getAdUrl().substring(0, base.length)).to.equal(base);
      });
      it('should be valid', () => {
        implElem.setAttribute(
          'src',
          'https://smart-ads.biz/_amp?buid=1&is_a4a=1'
        );
        const base = 'https://smart-ads.biz/_a4a';
        expect(impl.getAdUrl().substring(0, base.length)).to.equal(base);
      });
    });
  }
);
