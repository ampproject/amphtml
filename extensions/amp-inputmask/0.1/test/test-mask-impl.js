/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Mask} from '../mask-impl';

describes.sandboxed('amp-inputmask mask-impl', {}, () => {

  class FakeElement {}

  describe('config', () => {

    let constructorStub;

    beforeEach(() => {
      constructorStub = sandbox.stub();
      constructorStub.extendDefaults = function() {};

      sandbox.stub(Mask, 'getInputmask_').returns(constructorStub);

      FakeElement.prototype.getAttribute = sandbox.stub();
    });

    it('should create a custom mask with the custom mask string' +
        ' and default options', () => {
      const fakeElement = new FakeElement();
      const maskString = '0';

      new Mask(fakeElement, maskString);
      const results = constructorStub.getCall(0).args[0];
      expect(results).to.include.deep({
        'alias': 'custom',
        'customMask': ['9'],
        'jitMasking': true,
        'noValuePatching': true,
        'placeholder': '\u2000',
        'showMaskOnFocus': false,
        'showMaskOnHover': false,
        'trimZeros': 2,
      });
    });

    it('should create a custom mask with the custom mask string' +
        ' and configurable zeros', () => {
      const fakeElement = new FakeElement();
      fakeElement.getAttribute.withArgs('mask-trim-zeros').returns('0');
      const maskString = '0';

      new Mask(fakeElement, maskString);

      const results = constructorStub.getCall(0).args[0];
      expect(results).to.include.deep({
        'trimZeros': 0,
      });
    });
  });
});
