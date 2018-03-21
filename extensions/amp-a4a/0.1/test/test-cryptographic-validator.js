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
  CryptographicValidator,
  SIGNATURE_VERIFIER_PROPERTY_NAME,
} from '../cryptographic-validator';
import {ValidatorResult} from '../amp-ad-type-defs';
import {SignatureVerifier} from '../signature-verifier';
import {utf8Decode, utf8Encode} from '../../../src/utils/bytes';

const realWinConfig = {
  amp: {},
  ampAdCss: true,
  allowExternalResources: true,
};

describes.realWin('CryptographicValidator', realWinConfig, env => {

  const minifiedCreative = '<p>Hello, World!</p>';
  const headers = {'Content-Type': 'application/jwk-set+json'};
  const encodedCreative = utf8Encode(minifiedCreative);

  let sandbox;
  let validator;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    env.win[SIGNATURE_VERIFIER_PROPERTY_NAME] =
        new SignatureVerifier(env.win, {
        'service-1': 'https://signingservice1.net/keyset.json',
      });
    validator = new CryptographicValidator();
  });

  it('should pass validation', () => {
    sandbox.stub(CryptographicValidator.prototype, 'createOutput_').
        withArgs(true, encodedCreative).returns({
          result: ValidatorResult.AMP,
          adResponseType: 'cryptographic',
          creativeData: {
            creativeMetadata: {
              // 
            },
          },
        });
    validator.validate({win: env.win}, utf8Encode(minifiedCreative), headers)
        .then(validatorOutput => {
          // TODO
        });
  });
});
