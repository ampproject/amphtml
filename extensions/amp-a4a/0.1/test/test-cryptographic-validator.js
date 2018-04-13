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

import * as sinon from 'sinon';
import {AdResponseType, ValidatorResult} from '../amp-ad-type-defs';
import {
  CryptographicValidator,
  SIGNATURE_VERIFIER_PROPERTY_NAME,
} from '../cryptographic-validator';
import {VerificationStatus} from '../signature-verifier';
import {data} from './testdata/valid_css_at_rules_amp.reserialized';
import {user} from '../../../../src/log';
import {utf8Encode} from '../../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('CryptographicValidator', realWinConfig, env => {

  const headers = {'Content-Type': 'application/jwk-set+json'};
  let sandbox;
  let userErrorStub;
  let validator;

  beforeEach(() => {
    validator = new CryptographicValidator();
    sandbox = sinon.sandbox.create();
    userErrorStub = sandbox.stub(user(), 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should have AMP validator result', () => {
    // We are mocking out the actual verifier for simplicity, but that's okay
    // since its logic is well tested in test-signature-verifier.js.
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.OK),
    };
    return validator.validate(
        {win: env.win}, utf8Encode(data.reserialized), headers)
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.AMP);
          expect(validatorOutput.adResponseType).to.equal(
              AdResponseType.CRYPTO);
          expect(validatorOutput.creativeData).to.be.ok;

          const creativeMetadata =
              validatorOutput.creativeData.creativeMetadata;
          expect(creativeMetadata.minifiedCreative).to.equal(
              data.minifiedCreative);
        });
  });

  it('should have non-AMP validator result', () => {
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.UNVERIFIED),
    };
    return validator.validate(
        {win: env.win}, utf8Encode(data.reserialized), headers)
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
          expect(validatorOutput.adResponseType).to.equal(
              AdResponseType.CRYPTO);
          expect(validatorOutput.creativeData).to.be.ok;

          const creativeMetadata =
              validatorOutput.creativeData.creativeMetadata;
          expect(creativeMetadata.minifiedCreative).to.equal(
              data.minifiedCreative);
          expect(userErrorStub).to.be.calledOnce;
        });
  });

  it('should have non-AMP validator result due to bad metadata', () => {
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] = {
      verify: () => Promise.resolve(VerificationStatus.UNVERIFIED),
    };
    return validator.validate(
        {win: env.win}, utf8Encode(data.reserializedInvalidOffset), headers)
        .then(validatorOutput => {
          expect(validatorOutput).to.be.ok;
          expect(validatorOutput.type).to.equal(ValidatorResult.NON_AMP);
          expect(validatorOutput.adResponseType).to.equal(
              AdResponseType.CRYPTO);
          expect(validatorOutput.creativeData).to.be.ok;
          expect(validatorOutput.creativeData.creativeMetadata).to.not.be.ok;

          expect(userErrorStub).to.be.calledOnce;
        });
  });
});
