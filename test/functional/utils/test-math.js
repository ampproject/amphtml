/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
  mapRange,
} from '../../../src/utils/math';

describes.sandboxed('mapRange', {}, () => {

  it('should map a number to the corrent value', () => {
    expect(mapRange(5, 0, 10, 40, 80)).to.equal(60);
    expect(mapRange(5, 0, 10, 10, 20)).to.equal(15);
  });

  it('should automatically detect source range bounds order', () => {
    expect(mapRange(5, 10, 0, 40, 80)).to.equal(60);
    expect(mapRange(8, 10, 0, 10, 20)).to.equal(12);
  });

  it('should accept decreasing target ranges', () => {
    expect(mapRange(8, 0, 10, 10, 0)).to.equal(2);
  });

  it('should constrain input to the source range', () => {
    expect(mapRange(-2, 0, 10, 10, 20)).to.equal(10);
    expect(mapRange(50, 0, 10, 10, 20)).to.equal(20);
    expect(mapRange(19, 0, 5, 40, 80)).to.equal(80);
  });

});
