/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2));
const {execOrDie} = require('../common/exec');

let storybookArgs = '--quiet';
if (argv.port) {
  storybookArgs += ` -p ${argv.port}`;
}

/**
 * Simple wrapper around the storybook start script
 * for AMP components (HTML Environment)
 */
async function storybookAmp() {
  execOrDie(
    'node_modules/.bin/start-storybook -c ./tools/storybook/amp-env ' +
      storybookArgs
  );
}

/**
 * Simple wrapper around the storybook start script.
 */
async function storybookBento() {
  execOrDie(
    'node_modules/.bin/start-storybook -c ./tools/storybook/bento-env ' +
      storybookArgs
  );
}

module.exports = {
  storybookAmp,
  storybookBento,
};

storybookBento.description =
  'Isolated testing and development for AMP Bento components.';
storybookAmp.description =
  'Isolated testing and development for AMPHTML components.';

storybookBento.flags = storybookAmp.flags = {
  'port': '  Change the port that the storybook dashboard is served from',
};
