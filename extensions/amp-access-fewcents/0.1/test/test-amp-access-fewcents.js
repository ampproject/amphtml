/**
 * Copyright 2022 The AMP HTML Authors. All Rights Reserved.
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

import {sleep} from '#testing/helpers';

import {AmpAccessFewcents} from '../fewcents-impl';

const TAG = 'amp-access-fewcents';

const TAG_SHORTHAND = 'aaf';

const fewcentsConfigValue = {
  publisherLogoUrl: 'https://www.jagranimages.com/images/jagran-logo-2021.png',
  contentSelector: 'amp-access-fewcents-dialog',
  primaryColor: '',
  accessKey: 'localhost',
  category: 'paywall',
  articleIdentifier: 'mockArticleIdentifier',
};

const paywallResponse = {
  success: true,
  message: 'Amp article price returned with unlock url.',
  data: {
    loginUrl:
      'https://wallet.hounds.fewcents.co/?login_source=amp_paywall&login_publisher_id=47&login_publisher_bid_id=90531&bid_mode=paywall&bid_price=622.38&login_redirect_url=http%3A%2F%2Flocalhost%3A8000%2Fexamples%2Famp-access-fewcents.html&login_publisher_logo_url=https%3A%2F%2Fi1.wp.com%2Fthefix.media%2Fwp-content%2Fuploads%2F2021%2F04%2Flogo-no-margins.png&amp_reader_id=amp-yfpD7ewsxdSdbH4xCboNIw',
    purchaseOptions: [
      {
        price: {
          currency: 'INR',
          price: 622.38,
        },
        unlockUrl:
          'https://wallet.hounds.fewcents.co/?login_source=amp_paywall&login_publisher_id=47&login_publisher_bid_id=90531&bid_mode=paywall&bid_price=622.38&login_redirect_url=http%3A%2F%2Flocalhost%3A8000%2Fexamples%2Famp-access-fewcents.html&login_publisher_logo_url=https%3A%2F%2Fi1.wp.com%2Fthefix.media%2Fwp-content%2Fuploads%2F2021%2F04%2Flogo-no-margins.png&amp_reader_id=amp-yfpD7ewsxdSdbH4xCboNIw',
      },
    ],
    bidId: 90531,
    access: false,
  },
  statusCode: 402,
};

describes.realWin(
  'amp-access-fewcents-v0.1',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-access-fewcents:0.1'],
    },
  },
  (env) => {
    let win;
    let document;
    let ampdoc;
    let accessSource;
    let accessService;
    let accessSourceMock;
    let xhrMock;
    let fewcentsConfig;
    let vendor;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      document = win.document;

      fewcentsConfig = fewcentsConfigValue;
      fewcentsConfig['environment'] = 'development';

      accessSource = {
        getAdapterConfig: () => {
          return fewcentsConfig;
        },
        buildUrl: () => {},
        loginWithUrl: () => {},
        getLoginUrl: () => {},
      };

      accessService = {
        ampdoc,
        getSource: () => accessSource,
      };

      accessSourceMock = env.sandbox.mock(accessSource);
      vendor = new AmpAccessFewcents(accessService, accessSource);
      xhrMock = env.sandbox.mock(vendor.xhr_);
    });

    afterEach(() => {
      accessSourceMock.verify();
      xhrMock.verify();
    });

    describe('authorize on development environment', () => {
      let emptyContainerStub;
      beforeEach(() => {
        emptyContainerStub = env.sandbox.stub(vendor, 'emptyContainer_');
        env.sandbox.stub(vendor, 'renderPurchaseOverlay_');
      });

      afterEach(() => {
        vendor.fewCentsBidId_ = null;
      });

      it('should show the premium content', () => {
        accessSourceMock
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

        return vendor.authorize().then((resp) => {
          expect(resp.access).to.be.true;
          expect(emptyContainerStub.called).to.be.true;
        });
      });

      it('should show the premium content along with passing bidId', () => {
        vendor.fewCentsBidId_ = 92602;
        accessSourceMock
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

        return vendor.authorize().then((resp) => {
          expect(resp.access).to.be.true;
          expect(emptyContainerStub.called).to.be.true;
        });
      });

      it('should show the paywall : authorization response fails - 402 error', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();

        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              response: {
                status: 402,
                json() {
                  return Promise.resolve(paywallResponse);
                },
              },
            })
          )
          .once();

        emptyContainerStub.returns(Promise.resolve());
        return vendor.authorize().then((res) => {
          expect(res.access).to.be.false;
        });
      });

      it('should show the premium : authorization response fails - 500 error', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();

        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              response: {
                status: 500,
              },
            })
          )
          .once();

        return vendor.authorize().then((res) => {
          expect(res.access).to.be.true;
        });
      });

      it('should show the paywall : when authorize response does not have the response key', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();

        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              newResponse: {
                status: 402,
                json() {
                  return Promise.resolve(paywallResponse);
                },
              },
            })
          )
          .once();

        emptyContainerStub.returns(Promise.resolve());
        return vendor.authorize().then((res) => {
          expect(res.access).to.be.true;
        });
      });
    });

    describe('authorize on demo environment', () => {
      let emptyContainerStub;

      beforeEach(() => {
        fewcentsConfig = fewcentsConfigValue;
        fewcentsConfig['environment'] = 'demo';
        vendor = new AmpAccessFewcents(accessService, accessSource);
        emptyContainerStub = env.sandbox.stub(vendor, 'emptyContainer_');
        env.sandbox.stub(vendor, 'renderPurchaseOverlay_');
      });

      afterEach(() => {
        vendor.fewCentsBidId_ = null;
      });

      it('should show the paywall on demo : authorization response fails - 402 error', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();

        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              response: {
                status: 402,
                json() {
                  return Promise.resolve(paywallResponse);
                },
              },
            })
          )
          .once();

        emptyContainerStub.returns(Promise.resolve());
        return vendor.authorize().then((res) => {
          expect(res.access).to.be.false;
        });
      });
    });

    describe('authorize on default environment', () => {
      let emptyContainerStub;

      beforeEach(() => {
        fewcentsConfig = fewcentsConfigValue;
        fewcentsConfig['environment'] = 'production';
        vendor = new AmpAccessFewcents(accessService, accessSource);
        emptyContainerStub = env.sandbox.stub(vendor, 'emptyContainer_');
        env.sandbox.stub(vendor, 'renderPurchaseOverlay_');
      });

      afterEach(() => {
        vendor.fewCentsBidId_ = null;
      });

      it('should show the paywall on demo : authorization response fails - 402 error', () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://builturl'))
          .once();

        xhrMock
          .expects('fetchJson')
          .returns(
            Promise.reject({
              response: {
                status: 402,
                json() {
                  return Promise.resolve(paywallResponse);
                },
              },
            })
          )
          .once();

        emptyContainerStub.returns(Promise.resolve());
        return vendor.authorize().then((res) => {
          expect(res.access).to.be.false;
        });
      });
    });

    describe('Unlocking an article', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.i18n_ = {};
        vendor.renderPurchaseOverlay_();
      });

      afterEach(() => {
        container.parentNode.removeChild(container);
        accessSourceMock.verify();
        xhrMock.verify();
      });

      it('should check clicking on unlock button', async () => {
        accessSourceMock
          .expects('buildUrl')
          .returns(Promise.resolve('https://apllink'))
          .once();

        accessSourceMock.expects('loginWithUrl').once();

        const clickEv = new Event('click');
        container.querySelector('button').dispatchEvent(clickEv);
        await sleep(500);
      });
    });

    describe('Create paywall overlay', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.i18n_ = {
          fcTitleText: 'Instant Access With Fewcents.',
          fcPromptText: 'Prompted Message',
          fcButtonText: 'Unlock',
          fcFewcentsImageRef:
            'https://dev.fewcents.co/static/media/powered-fewcents.5c8ee304.png',
          fcTermsRef: 'https://www.fewcents.co/terms',
        };

        vendor.purchaseOptions_ = {
          price: {currency: 'INR', price: '881'},
          unlockUrl:
            'https://wallet.hounds.fewcents.co/?login_source=amp…53A8000%252Fexamples%252Famp-access-fewcents.html',
        };
        vendor.renderPurchaseOverlay_();
      });

      afterEach(() => {
        container.parentNode.removeChild(container);
      });

      it('renders price', () => {
        const priceDiv = container.querySelector(
          '.' + TAG_SHORTHAND + '-article-price'
        );

        expect(priceDiv).to.not.be.null;
        expect(parseInt(priceDiv.textContent, 10)).to.equal(881);
      });

      it('renders unlock button', () => {
        const unlockButton = container.querySelector(
          '.' + TAG_SHORTHAND + '-purchase-button'
        );

        expect(unlockButton).to.not.be.null;
        expect(unlockButton.textContent).to.equal('Unlock');
      });

      it('renders title div', () => {
        const headerDiv = container.querySelector(
          '.' + TAG_SHORTHAND + '-headerText'
        );

        expect(headerDiv).to.not.be.null;
        expect(headerDiv.textContent).to.equal('Instant Access With Fewcents.');
      });
    });

    describe('Checks empty container function', () => {
      let container;

      beforeEach(() => {
        vendor.vsync_ = {
          mutate: (callback) => {
            callback();
          },
          mutatePromise: (callback) => {
            callback();
            return Promise.resolve();
          },
        };
        container = document.createElement('div');
        container.id = TAG + '-dialog';
        document.body.appendChild(container);
        vendor.renderPurchaseOverlay_();
        vendor.emptyContainer_();
      });

      it('should check price element is not present', () => {
        const priceDiv = container.querySelector(
          '.' + TAG_SHORTHAND + '-article-price'
        );

        expect(priceDiv).to.be.null;
      });
    });
  }
);
