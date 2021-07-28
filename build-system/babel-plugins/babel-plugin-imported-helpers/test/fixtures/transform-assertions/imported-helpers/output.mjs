import _objectSpread from "@babel/runtime/helpers/objectSpread2";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";

/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
const _foo = foo,
      a = _foo.a,
      b = _foo.b,
      c = _objectWithoutPropertiesLoose(_foo, ["a", "b"]);

const _bar = bar,
      d = _bar.d,
      e = _bar.e,
      f = _objectWithoutPropertiesLoose(_bar, ["d", "e"]);

const g = _objectSpread({}, foo);

const h = _objectSpread({
  bar
}, bar);
