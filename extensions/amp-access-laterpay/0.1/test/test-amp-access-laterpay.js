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

import {LaterpayVendor} from '../laterpay-impl';

describes.fakeWin('LaterpayVendor', {
  amp: true,
  location: 'https://pub.com/doc1',
}, env => {
  let win, document, ampdoc;
  let accessService;
  let accessServiceMock;
  let xhrMock;
  let articleTitle;
  let laterpayConfig;
  let vendor;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    document = win.document;

    laterpayConfig = {
      articleTitleSelector: '#laterpay-test-title',
    };
    accessService = {
      ampdoc,
      getAdapterConfig: () => { return laterpayConfig; },
      buildUrl: () => {},
      loginWithUrl: () => {},
      getLoginUrl: () => {},
    };
    accessServiceMock = sandbox.mock(accessService);

    articleTitle = document.createElement('h1');
    articleTitle.id = 'laterpay-test-title';
    articleTitle.textContent = 'test title';
    document.body.appendChild(articleTitle);

    vendor = new LaterpayVendor(accessService);
    xhrMock = sandbox.mock(vendor.xhr_);
  });

  afterEach(() => {
    articleTitle.parentNode.removeChild(articleTitle);
    accessServiceMock.verify();
    xhrMock.verify();
  });

  describe('authorize', () => {
    let emptyContainerStub;
    beforeEach(() => {
      emptyContainerStub = sandbox.stub(vendor, 'emptyContainer_');
      sandbox.stub(vendor, 'renderPurchaseOverlay_');
    });

    it('successful authorization', () => {
      vendor.purchaseConfigBaseUrl_ = 'https://baseurl?param';
      accessServiceMock.expects('buildUrl')
        .withExactArgs('https://baseurl?param&article_title=test%20title', false)
        .returns(Promise.resolve('https://builturl'))
        .once();
      accessServiceMock.expects('getLoginUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      xhrMock.expects('fetchJson')
        .withExactArgs('https://builturl', {
          credentials: 'include',
        })
        .returns(Promise.resolve({access: true}))
        .once();
      return vendor.authorize().then(resp => {
        expect(resp.access).to.be.true;
        expect(emptyContainerStub.called).to.be.true;
      });
    });

    it('authorization fails due to lack of server config', () => {
      accessServiceMock.expects('buildUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      accessServiceMock.expects('getLoginUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      xhrMock.expects('fetchJson')
        .withExactArgs('https://builturl', {
          credentials: 'include',
        })
        .returns(Promise.resolve({status: 204}))
        .once();
      return vendor.authorize().catch(err => {
        expect(err.message).to.exist;
      });
    });

    it('authorization response from server fails', () => {
      accessServiceMock.expects('buildUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      accessServiceMock.expects('getLoginUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      xhrMock.expects('fetchJson')
        .withExactArgs('https://builturl', {
          credentials: 'include',
        })
        .returns(Promise.reject({
          response: {status: 402},
          responseJson: {access: false},
        }))
        .once();
      emptyContainerStub.returns(Promise.resolve());
      return vendor.authorize().then(err => {
        expect(err.access).to.be.false;
      });
    });

  });

  describe('create purchase overlay', () => {
    let container;
    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'amp-access-laterpay-dialog';
      document.body.appendChild(container);
      vendor.i18n_ = {};
      vendor.purchaseConfig_ = {
        premiumcontent: {
          price: {},
        },
        subscriptions: [
          {price: {}},
        ],
        timepasses: [
          {price: {}},
        ],
      };
      vendor.renderPurchaseOverlay_();
    });

    afterEach(() => {
      container.parentNode.removeChild(container);
    });

    it('renders list', () => {
      expect(container.querySelector('ul')).to.not.be.null;
    });

    it('renders 3 purchase options', () => {
      expect(container.querySelector('ul').childNodes.length).to.equal(3);
    });

  });

  describe('purchase option selection', () => {
    let container;
    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'amp-access-laterpay-dialog';
      document.body.appendChild(container);
      vendor.i18n_ = {};
      vendor.purchaseConfig_ = {
        premiumcontent: {
          price: {},
        },
        subscriptions: [
          {price: {}},
        ],
        timepasses: [
          {price: {}},
        ],
      };
      vendor.renderPurchaseOverlay_();
      const ev = new Event('change');
      container.querySelector('input').dispatchEvent(ev);
    });

    afterEach(() => {
      container.parentNode.removeChild(container);
    });

    it('purchase option is selected', () => {
      expect(vendor.selectedPurchaseOption_).to.not.be.null;
      expect(vendor.selectedPurchaseOption_.classList
        .contains('amp-access-laterpay-selected')).to.be.true;
    });

  });

  describe('purchase', () => {
    let container;
    beforeEach(() => {
      container = document.createElement('div');
      container.id = 'amp-access-laterpay-dialog';
      document.body.appendChild(container);
      vendor.i18n_ = {};
      vendor.purchaseConfig_ = {
        premiumcontent: {
          price: {},
        },
        subscriptions: [
          {price: {}},
        ],
        timepasses: [
          {price: {}},
        ],
      };
      vendor.renderPurchaseOverlay_();
      const changeEv = new Event('change');
      container.querySelector('input').dispatchEvent(changeEv);
    });

    afterEach(() => {
      container.parentNode.removeChild(container);
    });

    it('sends request for purchase', done => {
      accessServiceMock.expects('buildUrl')
        .returns(Promise.resolve('https://builturl'))
        .once();
      accessServiceMock.expects('loginWithUrl')
        .once();
      const clickEv = new Event('click');
      container.querySelector('button').dispatchEvent(clickEv);
      setTimeout(() => {done();}, 500);
    });

  });
});
