import {utf8Encode} from '#core/types/string/bytes';

import {user} from '#utils/log';

import {data} from './testdata/valid_css_at_rules_amp.reserialized';

import {AdResponseType, ValidatorResult} from '../amp-ad-type-defs';
import {
  CryptographicValidator,
  SIGNATURE_VERIFIER_PROPERTY_NAME,
} from '../cryptographic-validator';
import {VerificationStatus} from '../signature-verifier';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('CryptographicValidator', realWinConfig, (env) => {
  const headers = {'Content-Type': 'application/jwk-set+json'};
  let userErrorStub;
  let validator;
  let containerElement;

  beforeEach(() => {
    validator = new CryptographicValidator();
    userErrorStub = env.sandbox.stub(user(), 'error');

    containerElement = env.win.document.createElement('div');
    env.win.document.body.appendChild(containerElement);
  });

  it('should have AMP validator result', () => {
    // We are mocking out the actual verifier for simplicity, but that's okay
    // since its logic is well tested in test-signature-verifier.js.
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.OK),
    };
    return validator
      .validate(
        {win: env.win},
        containerElement,
        utf8Encode(data.reserialized),
        headers
      )
      .then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
        expect(validatorOutput.adResponseType).to.equal(AdResponseType.CRYPTO);
        expect(validatorOutput.creativeData).to.be.ok;

        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.minifiedCreative).to.equal(
          data.minifiedCreative
        );
      });
  });

  it('should have non-AMP validator result', () => {
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.UNVERIFIED),
    };
    return validator
      .validate(
        {win: env.win},
        containerElement,
        utf8Encode(data.reserialized),
        headers
      )
      .then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        expect(validatorOutput.adResponseType).to.equal(AdResponseType.CRYPTO);
        expect(validatorOutput.creativeData).to.be.ok;

        const {creativeMetadata} = validatorOutput.creativeData;
        expect(creativeMetadata.minifiedCreative).to.equal(
          data.minifiedCreative
        );
        expect(userErrorStub).to.be.calledOnce;
      });
  });

  it('should have non-AMP validator result due to bad metadata', () => {
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.UNVERIFIED),
    };
    return validator
      .validate(
        {win: env.win},
        containerElement,
        utf8Encode(data.reserializedInvalidOffset),
        headers
      )
      .then((validatorOutput) => {
        expect(validatorOutput).to.be.ok;
        expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
        expect(validatorOutput.adResponseType).to.equal(AdResponseType.CRYPTO);
        expect(validatorOutput.creativeData).to.be.ok;
        expect(validatorOutput.creativeData.creativeMetadata).to.not.be.ok;

        expect(userErrorStub).to.be.calledOnce;
      });
  });
});
