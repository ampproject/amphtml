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
 *
 *
 * NOTE: This special file is required for three reasons:
 *
 * 1. The AMP unit tests use the 'chai' v4 assertion library, which depends on
 *    'chai-as-promised' v7, a library that contains ES6 code.
 *    See https://github.com/domenic/chai-as-promised/issues/133.
 *
 * 2. We cannot use 'chai-as-promised' on Sauce labs, since some browsers only
 *    support ES5 code.
 *    See https://github.com/domenic/chai-as-promised#browsernode-compatibility.
 *
 * 3. Transpiling 'chai-as-promised' with babelify is not possible
 *    since directories under `node_modules/` are ignored by default.
 *    See https://github.com/babel/babelify/issues/53.
 *
 * We therefore include this file while running unit tests (only run on chrome),
 * but not while running integration tests (run on multiple browsers).
 * As a result, integration tests may not use `chai-as-promised.
 */

chai.use(require('chai-as-promised'));
