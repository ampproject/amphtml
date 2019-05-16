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

import {
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  getAmpAdTemplateHelper,
} from '../../../amp-a4a/0.1/template-validator';
import {AmpAdTemplate} from '../amp-ad-custom';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {data} from '../../../amp-a4a/0.1/test/testdata/valid_css_at_rules_amp.reserialized';
import {tryParseJson} from '../../../../src/json';
import {utf8Encode} from '../../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateRenderer', realWinConfig, env => {
  const templateUrl = '/adzerk/1';

  let containerElement;
  let impl;

  beforeEach(() => {
    containerElement = document.createElement('div');
    containerElement.setAttribute('height', 50);
    containerElement.setAttribute('width', 320);
    containerElement.setAttribute('src', templateUrl);
    containerElement.signals = () => ({
      whenSignal: () => Promise.resolve(),
    });
    containerElement.renderStarted = () => {};
    containerElement.getPageLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getLayoutBox = () => ({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });
    containerElement.getIntersectionChangeEntry = () => ({});
    containerElement.isInViewport = () => true;
    containerElement.getAmpDoc = () => env.ampdoc;
    document.body.appendChild(containerElement);

    impl = new AmpAdTemplate(containerElement);
    impl.attemptChangeSize = (width, height) => {
      impl.element.style.width = width;
      impl.element.style.height = height;
    };
    env.win.AMP.registerTemplate('amp-mustache', AmpMustache);
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(containerElement);
  });

  describe('Iframe Rendering', () => {
    it('should load AMP ad in friendly frame', () => {
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () =>
          Promise.resolve(
            utf8Encode(
              JSON.stringify({
                templateUrl,
                data: {
                  url: 'https://www.google.com',
                },
              })
            )
          ),
        headers: {
          get: header => {
            switch (header) {
              case AMP_TEMPLATED_CREATIVE_HEADER_NAME:
                return 'amp-mustache';
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      sandbox.stub(getAmpAdTemplateHelper(env.win), 'fetch').callsFake(url => {
        expect(url).to.equal(templateUrl);
        return Promise.resolve(data.adTemplate);
      });

      impl.buildCallback();
      impl.getRequestUrl();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        expect(iframe.contentWindow.document.body.innerHTML.trim()).to.equal(
          '<div>\n      <p>ipsum lorem</p>\n      <a href="https://' +
            'www.google.com/" target="_top">Click for ad!</a>\n    ' +
            '</div>'
        );
      });
    });

    it('should load non-AMP ad in nameframe', () => {
      const mockCreative = '<html><body>Ipsum Lorem</body></html>';
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () => Promise.resolve(utf8Encode(mockCreative)),
        headers: {
          get: header => {
            switch (header) {
              case AMP_TEMPLATED_CREATIVE_HEADER_NAME:
                return 'amp-mustache';
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      impl.buildCallback();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        const nameAttr = tryParseJson(iframe.getAttribute('name'));
        expect(nameAttr).to.be.ok;
        expect(nameAttr.creative).to.equal(mockCreative);
      });
    });

    it('should load non-AMP ad in nameframe if missing mustache header', () => {
      const mockCreative = '<html><body>Ipsum Lorem</body></html>';
      impl.adResponsePromise_ = Promise.resolve({
        arrayBuffer: () => Promise.resolve(utf8Encode(mockCreative)),
        headers: {
          get: header => {
            switch (header) {
              case 'AMP-Ad-Response-Type':
                return 'template';
              default:
                return null;
            }
          },
        },
      });

      impl.buildCallback();
      return impl.layoutCallback().then(() => {
        const iframe = containerElement.querySelector('iframe');
        expect(iframe).to.be.ok;
        const nameAttr = tryParseJson(iframe.getAttribute('name'));
        expect(nameAttr).to.be.ok;
        expect(nameAttr.creative).to.equal(mockCreative);
      });
    });
  });

  describe('#getRequestUrl', () => {
    it('should add url to context', () => {
      impl.buildCallback();
      impl.getRequestUrl();
      expect(impl.getContext().adUrl).to.equal(templateUrl);
    });
    it('should expand url', () => {
      impl.buildCallback();
      impl.element.setAttribute('data-request-param-bar', '123');
      impl.element.setAttribute('data-request-param-baz', '456');
      impl.element.setAttribute('data-request-param-camel-case', '789');
      impl.baseRequestUrl_ = 'https://foo.com';
      expect(impl.getRequestUrl()).to.equal(
        'https://foo.com?bar=123&baz=456&camelCase=789'
      );
    });
  });

  describe('mandatory fields', () => {
    it('should throw if missing src attribute', () => {
      containerElement.removeAttribute('src');
      allowConsoleError(() => {
        expect(() => new AmpAdTemplate(containerElement)).to.throw(
          'Invalid network configuration: no request URL specified'
        );
      });
    });
  });
});
