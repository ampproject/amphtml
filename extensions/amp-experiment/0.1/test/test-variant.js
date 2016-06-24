/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {allocateVariant} from '../variant';

describe('allocateVariant', () => {

  let fakeWin;

  beforeEach(() => {
    fakeWin = {
      Math: {
        random: () => {
          return 0.567;
        },
      },
    };
  });

  it('should throw for invalid config', () => {
    expect(() => {
      allocateVariant(fakeWin, null);
    }).to.throw();

    expect(() => {
      allocateVariant(fakeWin, undefined);
    }).to.throw();

    expect(() => {
      allocateVariant(fakeWin, {});
    }).to.throw(/Missing experiment variants config/);

    expect(() => {
      allocateVariant(fakeWin, {
        variants: {
          'invalid_char_%_in_name': 1,
        },
      });
    }).to.throw(/Invalid variant name/);

    expect(() => {
      allocateVariant(fakeWin, {
        variants: {
          'variant_1': 50,
          'variant_2': 51,
        },
      });
    }).to.throw(/Total percentage is bigger than 100/);

    expect(() => {
      allocateVariant(fakeWin, {
        variants: {
          'negative_percentage': -1,
        },
      });
    }).to.throw(/Invalid percentage/);

    expect(() => {
      allocateVariant(fakeWin, {
        variants: {
          'too_big_percentage': 101,
        },
      });
    }).to.throw(/Invalid percentage/);
  });

  it('without CID scope, succeed with a variant allocated', () => {
    return expect(allocateVariant(fakeWin, {
      cidScope: null,
      variants: {
        '-Variant_1': 56.1,
        '-Variant_2': 23.3,
      },
    })).to.eventually.equal('-Variant_2');
  });

  it('without CID scope, succeed with no variant allocated', () => {
    return expect(allocateVariant(fakeWin, {
      cidScope: null,
      variants: {
        '-Variant_1': 2.1,
        '-Variant_2': 23.3,
        '-Variant_3': 20.123,
      },
    })).to.eventually.equal(null);
  });
});
