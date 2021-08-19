import {utf8Encode} from '#core/types/string/bytes';

import {data} from './testdata/valid_css_at_rules_amp.reserialized';

import {getAmpAdTemplateHelper} from '../amp-ad-template-helper';
import {AdResponseType, ValidatorResult} from '../amp-ad-type-defs';
import {
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  TemplateValidator,
} from '../template-validator';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateValidator', realWinConfig, (env) => {
  const templateUrl = 'https://adnetwork.com/amp-template.html';
  const headers = {
    get: (name) => {
      if (name == AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
        return 'amp-mustache';
      }
    },
  };

  let validator;
  let containerElement;

  beforeEach(() => {
    validator = new TemplateValidator();

    containerElement = env.win.document.createElement('div');
    env.win.document.body.appendChild(containerElement);
  });

  describe('AMP Result', () => {
    let validatorPromise;

    beforeEach(() => {
      env.sandbox
        .stub(getAmpAdTemplateHelper(env.ampdoc), 'fetch')
        .callsFake((url) => {
          expect(url).to.equal(templateUrl);
          return Promise.resolve(data.adTemplate);
        });

      validatorPromise = validator.validate(
        {win: env.win},
        containerElement,
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

    afterEach(() => env.sandbox.restore());

    it('should have AMP validator result', () => {
      return validatorPromise.then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
      });
    });

    it('should have AMP validator result w/ deprecated header name', () => {
      validator
        .validate(
          {win: env.win},
          containerElement,
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          ),
          {
            get: (name) => {
              if (name == DEPRECATED_AMP_TEMPLATED_CREATIVE_HEADER_NAME) {
                return 'amp-mustache';
              }
            },
          }
        )
        .then((validatorOutput) => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
        });
    });

    it('should have TEMPLATE ad response type', () => {
      return validatorPromise.then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.adResponseType).to.equal(
          AdResponseType.TEMPLATE
        );
      });
    });

    it('should have creativeData with minified creative in metadata', () => {
      return validatorPromise.then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.creativeData).to.be.ok;
        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.minifiedCreative).to.equal(
          data.minifiedTemplateCreative
        );
      });
    });

    it('should have amp-analytics and mustache in extensions', () => {
      return validatorPromise.then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.creativeData).to.be.ok;
        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.extensions).to.deep.include({
          'custom-element': 'amp-analytics',
          'src': 'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
        });
        expect(creativeMetadata.extensions).to.deep.include({
          'custom-element': 'amp-mustache',
          'src': 'https://cdn.ampproject.org/v0/amp-mustache-latest.js',
        });
      });
    });
  });

  it('should add elements in creativeMetaData to extensions if not present', async () => {
    const templateHelper = getAmpAdTemplateHelper(env.ampdoc);
    const response = data.adTemplate.replace(
      /"customElementExtensions" : \[\]/,
      '"customElementExtensions" : ["amp-cats"]'
    );
    env.sandbox.stub(templateHelper, 'fetch').resolves(response);
    const validatorOutput = await validator.validate(
      {win: env.win},
      containerElement,
      utf8Encode(
        JSON.stringify({
          templateUrl,
          data: {url: 'https://buy.com/buy-1'},
          analytics: {foo: 'bar'},
        })
      ),
      headers
    );
    const {creativeMetadata} = validatorOutput.creativeData;
    expect(creativeMetadata.extensions).to.deep.include({
      'custom-element': 'amp-cats',
      'src': 'https://cdn.ampproject.org/v0/amp-cats-0.1.js',
    });
  });

  describe('Non-AMP Result', () => {
    it('should have NON_AMP validator result due to lack of headers', () => {
      return validator
        .validate(
          {win: env.win},
          containerElement,
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          )
        )
        .then((validatorOutput) => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        });
    });

    it('should have NON_AMP validator result due to lack of mustache header', () => {
      return validator
        .validate(
          {win: env.win},
          containerElement,
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
        .then((validatorOutput) => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        });
    });

    it('should have TEMPLATE ad response type', () => {
      return validator
        .validate(
          {win: env.win},
          containerElement,
          utf8Encode(
            JSON.stringify({
              templateUrl,
              data: {url: 'https://buy.com/buy-1'},
              analytics: {foo: 'bar'},
            })
          )
        )
        .then((validatorOutput) => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.adResponseType).to.equal(
            AdResponseType.TEMPLATE
          );
        });
    });

    it('should have the response body as the creative in creativeData', () => {
      return validator
        .validate(
          {win: env.win},
          containerElement,
          utf8Encode(JSON.stringify({templateUrl})),
          {
            get: () => null,
          }
        )
        .then((validatorOutput) => {
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
