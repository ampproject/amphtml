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
const argv = require('minimist')(process.argv.slice(2));
const experimentDefines = require('../global-configs/experiments-const.json');

function getBuildTimeConstants() {
  return {
    ...experimentDefines,
    IS_FORTESTING: !!argv.fortesting,
    IS_MINIFIED: !!argv.compiled,

    // We build on the idea that SxG is an upgrade to the ESM build.
    // Therefore, all conditions set by ESM will also hold for SxG.
    // However, we will also need to introduce a separate IS_SxG flag
    // for conditions only true for SxG.
    IS_ESM: !!(argv.esm || argv.sxg),
    IS_SXG: !!argv.sxg,
  };
}

module.exports = {
  getBuildTimeConstants,
};
