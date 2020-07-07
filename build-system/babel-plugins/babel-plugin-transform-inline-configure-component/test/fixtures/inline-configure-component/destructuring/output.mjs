const _a = 'value for a',
      _b = 'value for b',
      _c = 'value for c';

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
const a = _a,
      b = _b,
      c = _c;
const a1 = _a,
      b1 = _b,
      c1 = _c;

class Destructuring {
  method() {
    const a = _a,
          bRenamed = _b,
          c = _c;
  }

  withDefaultValues() {
    const a = _a,
          renamedBbbb = _b,
          c = _c,
          d = 'default value for d',
          renamedE = 'default value for e';
  }

  unset() {
    const a = _a,
          thisPropIsUnset = undefined,
          thisPropIsUnsetToo = undefined;
  }

}

import { Destructuring as _Destructuring } from './input-base-class';
foo(_Destructuring);
