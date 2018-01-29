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

// Need the following side-effect import because in actual production code,
// Fast Fetch impls are always loaded via an AmpAd tag, which means AmpAd is
// always available for them. However, when we test an impl in isolation,
// AmpAd is not loaded already, so we need to load it separately.
import '../../../amp-ad/0.1/amp-ad';
import {
  AmpAdNetworkAdzerkImpl,
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
} from '../amp-ad-network-adzerk-impl';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {createElementWithAttributes} from '../../../../src/dom';
import {Xhr} from '../../../../src/service/xhr-impl';
import {utf8Encode, utf8Decode} from '../../../../src/utils/bytes';

describes.fakeWin('amp-ad-network-adzerk-impl', {amp: true}, env => {
  let win, doc;
  let element, impl;
  let fetchTextMock;

  beforeEach(() => {
    win = env.win;
    win.AMP_MODE = {localDev: false};
    win.AMP.registerTemplate('amp-mustache', AmpMustache);
    doc = win.document;
    fetchTextMock = sandbox.stub(Xhr.prototype, 'fetchText');
    element = createElementWithAttributes(doc, 'amp-ad', {
      'type': 'adzerk',
      'src': 'https://adzerk.com?id=1234',
      'width': '320',
      'height': '50',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkAdzerkImpl(element);
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      ['https://adzerk.com?id=1234',
        'https://aDzErK.com?id=1234',
        'https://adzerk.com?id=9'].forEach(src => {
        element.setAttribute('src', src);
        expect(impl.isValidElement()).to.be.true;
        expect(impl.getAdUrl()).to.equal(src);
      });
    });

    it('should not be valid', () => {
      ['http://adzerk.com?id=1234',
        'https://adzerk.com?id=a',
        'https://www.adzerk.com?id=1234',
        'https://adzerk.com?id=1234&a=b',
        'foohttps://adzer.com?id=1234'].forEach(src => {
        element.setAttribute('src', src);
        expect(impl.isValidElement()).to.be.false;
        expect(impl.getAdUrl()).to.equal('');
      });
    });
  });

  describe('#getSigningServiceNames', () => {
    it('should be empty array', () => {
      expect(impl.getSigningServiceNames()).to.deep.equal([]);
    });
  });

  describe('#maybeValidateAmpCreative', () => {
    it('should properly inflate template', () => {
      const adResponseBody = {
        templateUrl: 'https://www.adzerk.com/456',
        data: {
          USER_NAME: 'some_user',
          USER_NUM: 9876,
          HTML_CONTENT: '<img src=https://img.com/>',
          IMG_SRC: 'https://some.img.com?a=b',
        },
      };
      const template = `<!doctype html><html ⚡><head>
          <script async src="https://cdn.ampproject.org/v0.js"></script>
          <script async custom-template="amp-mustache"
            src="https://cdn.ampproject.org/v0/amp-mustache-0.1.js"></script>
          </head>
          <body>
            <template type="amp-mustache">
            <p>{{foo}}</p>
            </template>
          </body></html>`;
      fetchTextMock.withArgs(
          'https://www-adzerk-com.cdn.ampproject.org/c/s/www.adzerk.com/456',
          {
            mode: 'cors',
            method: 'GET',
            ampCors: false,
            credentials: 'omit',
          }).returns(Promise.resolve(
          {
            headers: {},
            text: () => template,
          }));
      return impl.maybeValidateAmpCreative(
          utf8Encode(JSON.stringify(adResponseBody)).buffer,
          {
            get: name => {
              expect(name).to.equal(AMP_TEMPLATED_CREATIVE_HEADER_NAME);
              return 'amp-mustache';
            },
          },
          () => {})
          .then(buffer => Promise.resolve(utf8Decode(buffer)))
          .then(creative => {
            expect(creative
                .indexOf(
                    '<script async src="https://cdn.ampproject.org/v0.js">' +
                    '</script>') == -1).to.be.true;
            expect(creative
                .indexOf(
                    '<script async custom-template="amp-mustache" src=' +
                    '"https://cdn.ampproject.org/v0/amp-mustache-0.1.js">' +
                    '</script>') == -1).to.be.true;
            expect(impl.getAmpAdMetadata()).to.jsonEqual({
              minifiedCreative: creative,
              customElementExtensions: [],
              extensions: [],
            });
          });
    });
  });
});
