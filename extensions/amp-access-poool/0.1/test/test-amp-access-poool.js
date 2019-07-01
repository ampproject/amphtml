/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {PooolVendor} from '../poool-impl';

describes.fakeWin(
  'PooolVendor',
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
    let pooolConfig;
    let vendor;

    beforeEach(() => {
      win = env.win;
      ampdoc = env.ampdoc;
      document = win.document;

      pooolConfig = {
        bundleID: 'ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH',
        pageType: 'premium',
        itemID: 'amp-test-article',
      };

      accessSource = {
        getAdapterConfig: () => {
          return pooolConfig;
        },
        buildUrl: () => {},
        getReaderId_: () => {},
        getLoginUrl: () => {},
      };

      accessService = {
        ampdoc,
        getSource: () => accessSource,
      };

      accessSourceMock = sandbox.mock(accessSource);

      vendor = new PooolVendor(accessService, accessSource);
      xhrMock = sandbox.mock(vendor.xhr_);
    });

    afterEach(() => {
      accessSourceMock.verify();
      xhrMock.verify();
    });

    describe('authorize', () => {
      let container;

      beforeEach(() => {
        container = document.createElement('div');
        container.id = 'poool-widget';
        document.body.appendChild(container);
        sandbox.stub(vendor, 'renderPoool_');
      });

      afterEach(() => {
        container.parentNode.removeChild(container);
      });

      it('successful authorization', () => {
        vendor.accessUrl_ = 'https://baseurl?param';
        accessSourceMock
          .expects('buildUrl')
          .withExactArgs('https://baseurl?param&iid=amp-test-article', false)
          .returns(Promise.resolve('https://builturl'))
          .once();
        accessSourceMock
          .expects('getLoginUrl')
          .returns(Promise.resolve('https://builturl'))
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
        return vendor.authorize().then(resp => {
          expect(resp.access).to.be.true;
        });
      });

      it('authorization fails because of wrong or missing server config', () => {
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
          .returns(
            Promise.resolve({
              json() {
                return Promise.resolve({access: true});
              },
            })
          )
          .once();
        return vendor.authorize().catch(err => {
          expect(err.message).to.exist;
        });
      });

      it('authorization response fails - 402 error', () => {
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
              },
            })
          )
          .once();
        return vendor.authorize().then(err => {
          expect(err.access).to.be.false;
        });
      });
    });
  }
);
