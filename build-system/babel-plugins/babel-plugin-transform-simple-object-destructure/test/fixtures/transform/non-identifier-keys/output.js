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

function string() {
  const obj = {};
  let bar = obj['foo'],_foo = void 0;
  let _get = get(),baz = _get['foo'],_foo2 = void 0;
}

function number() {
  const obj = {};
  let bar = obj[0],_foo3 = void 0;
  let _get2 = get(),baz = _get2[0],_foo4 = void 0;
}
