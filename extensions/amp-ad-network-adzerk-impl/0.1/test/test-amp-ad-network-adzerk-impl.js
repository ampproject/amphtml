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
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  AmpAdNetworkAdzerkImpl,
} from '../amp-ad-network-adzerk-impl';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {Xhr} from '../../../../src/service/xhr-impl';
import {createElementWithAttributes} from '../../../../src/dom';
import {utf8Decode, utf8Encode} from '../../../../src/utils/bytes';

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
      'width': '320',
      'height': '50',
    });
    doc.body.appendChild(element);
    impl = new AmpAdNetworkAdzerkImpl(element);
  });

  describe('#getAdUrl', () => {
    it('should be valid', () => {
      const r = '{"p":[{"n":1234,"t":[5],"s":677496}]}';
      element.setAttribute('data-r', r);
      expect(impl.getAdUrl()).to.equal(
          `https://engine.adzerk.net/amp?r=${encodeURIComponent(r)}`);
    });

    it('should be valid #2', () => {
      element.setAttribute('data-r',
          '{"p":[{"t":[5],"s":333999,"a":5603000}]}');
      expect(impl.getAdUrl()).to.equal(
          'https://engine.adzerk.net' +
          '/amp?r=%7B%22p%22%3A%5B%7B%22t%22%3A%5B5%5D%2C%22s%22%3A333999' +
          '%2C%22a%22%3A5603000%7D%5D%7D');
    });

    it('should be invalid', () => {
      expect(() => impl.getAdUrl()).to.throw(/Expected data-r attribte/);
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
          'https://www-adzerk-com.cdn.ampproject.org/ad/s/www.adzerk.com/456',
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
              customElementExtensions: ['amp-mustache'],
              extensions: [],
            });
          });
    });
  });

  describe('#getAmpAdMetadata', () => {
    let template;

    beforeEach(() => {
      template = `<!doctype html><html ⚡><head>
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
          'https://www-adzerk-com.cdn.ampproject.org/ad/s/www.adzerk.com/456',
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
    });

    it('should auto add amp-analytics if required', () => {
      const adResponseBody = {
        templateUrl: 'https://www.adzerk.com/456',
        analytics: {'type': 'googleanalytics'},
      };
      return impl.maybeValidateAmpCreative(
          utf8Encode(JSON.stringify(adResponseBody)).buffer,
          {
            get: name => {
              expect(name).to.equal(AMP_TEMPLATED_CREATIVE_HEADER_NAME);
              return 'amp-mustache';
            },
          },
          () => {})
          .then(buffer => utf8Decode(buffer))
          .then(creative => {
            expect(impl.getAmpAdMetadata()).to.jsonEqual({
              minifiedCreative: creative,
              customElementExtensions: ['amp-analytics', 'amp-mustache'],
              extensions: [],
            });
            // Won't insert duplicate
            expect(impl.getAmpAdMetadata()).to.jsonEqual({
              minifiedCreative: creative,
              customElementExtensions: ['amp-analytics', 'amp-mustache'],
              extensions: [],
            });
          });
    });

    it('should not add amp-analytics if not', () => {
      const adResponseBody = {
        templateUrl: 'https://www.adzerk.com/456',
        analytics: undefined,
      };
      return impl.maybeValidateAmpCreative(
          utf8Encode(JSON.stringify(adResponseBody)).buffer,
          {
            get: name => {
              expect(name).to.equal(AMP_TEMPLATED_CREATIVE_HEADER_NAME);
              return 'amp-mustache';
            },
          },
          () => {})
          .then(buffer => utf8Decode(buffer))
          .then(creative => {
            expect(impl.getAmpAdMetadata()).to.jsonEqual({
              minifiedCreative: creative,
              customElementExtensions: ['amp-mustache'],
              extensions: [],
            });
          });
    });
  });
});
