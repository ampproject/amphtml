/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
'use strict';

module.exports = {
  rules: {
    'closure-type-primitives': require('./closure-type-primitives'),
    'dict-string-keys': require('./dict-string-keys'),
    'enforce-private-props': require('./enforce-private-props'),
    'no-array-destructuring': require('./no-array-destructuring'),
    'no-es2015-number-props': require('./no-es2015-number-props'),
    'no-export-side-effect': require('./no-export-side-effect'),
    'no-for-of-statement': require('./no-for-of-statement'),
    'no-global': require('./no-global'),
    'no-spread': require('./no-spread'),
    'query-selector': require('./query-selector'),
    'todo-format': require('./todo-format'),
  },
};
