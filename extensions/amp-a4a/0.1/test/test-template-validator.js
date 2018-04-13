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
import {
  AMP_TEMPLATED_CREATIVE_HEADER_NAME,
  TemplateValidator,
} from '../template-validator';
import {AdResponseType, ValidatorResult} from '../amp-ad-type-defs';
import {VerificationStatus} from '../signature-verifier';
import {data} from './testdata/valid_css_at_rules_amp.reserialized';
import {utf8Encode} from '../../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('TemplateValidator', realWinConfig, env => {

  const headers = {[AMP_TEMPLATED_CREATIVE_HEADER_NAME]: 'amp-mustache'};
  let sandbox;
  let userErrorStub;
  let validator;
  let validatorPromise;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    validator = new TemplateValidator();
    validatorPromise = validator.validate(
        {win: env.win}, utf8Encode(data.adTemplate), headers);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should have AMP validator result', () => {
    return validatorPromise.then(validatorOutput => {
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

