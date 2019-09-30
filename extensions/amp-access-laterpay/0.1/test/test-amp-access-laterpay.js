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

const TAG = 'amp-access-laterpay';

describes.fakeWin(
  'LaterpayVendor',
  {
    amp: true,
    location: 'https://pub.com/doc1',
  },
  env => {
    let win, document, ampdoc;
    let accessSource;
    let accessService;
    let accessSourceMock;
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
        region: 'us',
      };

      accessSource = {
        getAdapterConfig: () => {
          return laterpayConfig;
        },
        buildUrl: () => {},
        loginWithUrl: () => {},
        getLoginUrl: () => {},
      };

      accessService = {
        ampdoc,
        getSource: () => accessSource,
      };

      accessSourceMock = sandbox.mock(accessSource);

      articleTitle = document.createElement('h1');
      articleTitle.id = 'laterpay-test-title';
      articleTitle.textContent = 'test title';
      document.body.appendChild(articleTitle);

      vendor = new LaterpayVendor(accessService, accessSource);
      xhrMock = sandbox.mock(vendor.xhr_);
    });

    afterEach(() => {
      articleTitle.parentNode.removeChild(articleTitle);
      accessSourceMock.verify();
      xhrMock.verify();
    });

    describe('authorize', () => {
      let emptyContainerStub;
      beforeEach(() => {
        emptyContainerStub = sandbox.stub(vendor, 'emptyContainer_');
        sandbox.stub(vendor, 'renderPurchaseOverlay_');
      });

      it('uses a non default region', () => {
        const buildUrl = accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve(''))
          .once();
        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({access: true});
              },
            })
          )
          .once();
        return vendor.authorize().then(() => {
          expect(
            /connector\.uselaterpay\.com/g.test(buildUrl.firstCall.args[0])
          ).to.be.true;
        });
      });

      it('successful authorization', () => {
        vendor.purchaseConfigBaseUrl_ = 'https://baseurl?param';
        accessSourceMock
          .expects('buildUrl')
          .withExactArgs(
            'https://baseurl?param&article_title=test%20title',
            false
          )
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
          .withExactArgs('https://builturl', {
            credentials: 'include',
          })
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({access: true});
              },
            })
          )
          .once();
        return vendor.authorize().then(resp => {
          expect(resp.access).to.be.true;
          expect(emptyContainerStub.called).to.be.true;
        });
      });

      it('authorization fails due to lack of server config', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
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
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        xhrMock
          .expects('fetchJson')
          .withExactArgs('https://builturl', {
            credentials: 'include',
          })
          .returns(
            Promise.reject({
              response: {
                status: 402,
                json() {
                  return Promise.resolve({access: false});
                },
              },
            })
          )
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
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.i18n_ = {};
        vendor.purchaseConfig_ = {
          premiumcontent: {
            price: {},
          },
          subscriptions: [{price: {}}],
          timepasses: [{price: {}}],
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
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.i18n_ = {};
        vendor.purchaseConfig_ = {
          premiumcontent: {
            price: {},
          },
          subscriptions: [{price: {}}],
          timepasses: [{price: {}}],
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
        expect(
          vendor.selectedPurchaseOption_.classList.contains(TAG + '-selected')
        ).to.be.true;
      });
    });

    describe('purchase', () => {
      let container;
      beforeEach(() => {
        container = document.createElement('div');
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.i18n_ = {};
        vendor.purchaseConfig_ = {
          premiumcontent: {
            price: {},
          },
          subscriptions: [{price: {}}],
          timepasses: [{price: {}}],
          apl: 'http://apllink',
        };
        vendor.renderPurchaseOverlay_();
      });

      afterEach(() => {
        container.parentNode.removeChild(container);
      });

      it('sends request for purchase', done => {
        const changeEv = new Event('change');
        container.querySelector('input').dispatchEvent(changeEv);
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock.expects('loginWithUrl').once();
        const clickEv = new Event('click');
        container.querySelector('button').dispatchEvent(clickEv);
        setTimeout(() => {
          done();
        }, 500);
      });

      it('sends request for already purchased', done => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://apllink'))
          .once();
        accessSourceMock.expects('loginWithUrl').once();
        const clickEv = new Event('click');
        container
          .querySelector('.' + TAG + '-already-purchased-link-container > a')
          .dispatchEvent(clickEv);
        setTimeout(() => {
          done();
        }, 500);
      });
    });
  }
);
