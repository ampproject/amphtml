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
  DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  TemplateValidator,
  getAmpAdTemplateHelper,
} from '../template-validator';
import {AdResponseType, ValidatorResult} from '../amp-ad-type-defs';
import {data} from './testdata/valid_css_at_rules_amp.reserialized';
import {utf8Encode} from '../../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateValidator', realWinConfig, env => {
  const templateUrl = 'https://adnetwork.com/amp-template.html';
  const headers = {
    get: name => {
      if (name == AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
        return 'amp-mustache';
      }
    },
  };
  let validator;

  beforeEach(() => {
    validator = new TemplateValidator();
  });

  describe('AMP Result', () => {
    let sandbox;
    let validatorPromise;

    beforeEach(() => {
      sandbox = sinon.sandbox;
      sandbox.stub(getAmpAdTemplateHelper(env.win), 'fetch').callsFake(url => {
        expect(url).to.equal(templateUrl);
        return Promise.resolve(data.adTemplate);
      });

      validatorPromise = validator.validate(
        {win: env.win},
        utf8Encode(
          JSON.stringify({
            templateUrl,
            data: {url: 'https://buy.com/buy-1'},
            analytics: {foo: 'bar'},
          })
        ),
        headers
      );
    });

    afterEach(() => sandbox.restore());

    it('should have AMP validator result', () => {
      return validatorPromise.then(validatorOutput => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      });
    });

    it('should have AMP validator result w/ deprecated header name', () => {
      validator
        .validate(
          {win: env.win},
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          ),
          {
            get: name => {
              if (name == DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
                return 'amp-mustache';
              }
            },
          }
        )
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
        });
    });

    it('should have TEMPLATE ad response type', () => {
      return validatorPromise.then(validatorOutput => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.adResponseType).to.equal(
          AdResponseType.TEMPLATE
        );
      });
    });

    it('should have creativeData with minified creative in metadata', () => {
      return validatorPromise.then(validatorOutput => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.creativeData).to.be.ok;
        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.minifiedCreative).to.equal(
          data.minifiedTemplateCreative
        );
      });
    });

    it('should have amp-analytics and mustache in customElementExtensions', () => {
      return validatorPromise.then(validatorOutput => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.creativeData).to.be.ok;
        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.customElementExtensions).to.deep.equal([
          'amp-analytics',
          'amp-mustache',
        ]);
      });
    });
  });

  describe('Non-AMP Result', () => {
    it('should have NON_AMP validator result due to lack of headers', () => {
      return validator
        .validate(
          {win: env.win},
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          )
        )
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        });
    });

    it('should have NON_AMP validator result due to lack of mustache header', () => {
      return validator
        .validate(
          {win: env.win},
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          ),
          {
            get: () => null,
          }
        )
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        });
    });

    it('should have TEMPLATE ad response type', () => {
      return validator
        .validate(
          {win: env.win},
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          )
        )
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.adResponseType).to.equal(
            AdResponseType.TEMPLATE
          );
        });
    });

    it('should have the response body as the creative in creativeData', () => {
      return validator
        .validate({win: env.win}, utf8Encode(JSON.stringify({templateUrl})), {
          get: () => null,
        })
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.creativeData).to.be.ok;
          const {creativeData} = validatorOutput;
          expect(creativeData).to.be.ok;
          expect(creativeData.creative).to.deep.equal(
            '{"templateUrl":"https://adnetwork.com/amp-template.html"}'
          );
        });
    });
  });
});
