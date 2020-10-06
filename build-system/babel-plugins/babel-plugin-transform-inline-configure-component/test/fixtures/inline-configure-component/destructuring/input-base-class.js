/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
const {a, b, c} = x.STATIC_CONFIG_;
const {a: a1, b: b1, c: c1} = x.y.STATIC_CONFIG_;

export class Destructuring {
  method() {
    const {a, b: bRenamed, c} = this.STATIC_CONFIG_;
  }
  withDefaultValues() {
    const {
      a = 'default value for a',
      b: renamedBbbb = 'default value for b',
      c = 'default value for c',
      d = 'default value for d',
      e: renamedE = 'default value for e',
    } = this.STATIC_CONFIG_;
  }
  unset() {
    const {
      a,
      thisPropIsUnset,
      thisPropIsUnsetToo,
    } = this.STATIC_CONFIG_;
  }
}
