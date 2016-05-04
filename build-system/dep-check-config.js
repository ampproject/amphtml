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

/**
 * - type - Is assumed to be "forbidden" if not provided.
 * - filesMatching - Is assumed to be all files if not provided.
 * - mustNotDependOn - If type is "forbidden" (default) then the files
 *     matched must not match the glob(s) provided.
 * - whitelist - Skip rule if file matches whitelist pattern(s).
 * @typedef {{
 *   type: (string|undefined),
 *   filesMatching: (string|!Array<string>|undefined),
 *   mustNotDependOn: (string|!Array<string>|undefined),
 *   whitelist: (string|!Array<string>|undefined),
 * }}
 */
var RuleConfigDef;

exports.rules = [
  // Extensions must not import any services directly.
  {
    filesMatching: 'extensions/**/*.js',
    mustNotDependOn: 'src/service/**/*.js',
    whitelist: 'extensions/**/amp-analytics.js',
  },
];
