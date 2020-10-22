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
var _A = class {
  method1() {}

  method2() {}

  static staticMethod1() {}

};

{
  new _A2();

  var _A2 = class {
    method1() {}

    method2() {}

    static staticMethod1() {}

  };

  new _A2();
}

function hello() {
  new _A3();

  var _A3 = class {
    method1() {}

    method2() {}

    static staticMethod1() {}

  };

  new _A3();
}

new _A();
