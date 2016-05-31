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

var minimist = require('minimist');

var argv = minimist(process.argv.slice(2));
var isCanary = argv.type === 'canary';

var config = {
  'canary': isCanary,
};

exports.getTemplate = function() {
  var configStr = JSON.stringify(config);
  // If window.AMP_CONFIG already exists don't clobber it.
  // This can be useful for testing where we need to setup experiments before
  // the main binary has loaded (setting up builtins for example).
  return `window.AMP_CONFIG||(window.AMP_CONFIG=${configStr});/*AMP_CONFIG*/`;
};
