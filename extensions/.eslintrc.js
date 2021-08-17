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

// These extensions have been modified in the last 2 weeks, so we're not
// including them yet to minimize disruption to devs actively working on them.
const EXCLUDED_EXTENSIONS = require('./import-order-excluded.json');

module.exports = {
  'rules': {'import/order': 2},
  'overrides': [
    {
      'files': EXCLUDED_EXTENSIONS.map((ext) => `./${ext}/**/*.js`),
      'rules': {'import/order': 0},
    },
  ],
};
