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
function test() {
  let _a = a,
      _bb = bb,
      _c = c;
  const {
    a = 1,
    b: bb = 2
  } = param;
  const [c = 3] = array;
  _a;
  _bb;
  _c;
}

class Foo {
  test() {
    let _a2 = a,
        _bb2 = bb,
        _c2 = c;
    const {
      a = 1,
      b: bb = 2
    } = param;
    const [c = 3] = array;
    _a2;
    _bb2;
    _c2;
  }

}
