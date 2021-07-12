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

module.exports = {
  stories: [
    '../../../../src/builtins/storybook/*.amp.js',
    '../../../../extensions/**/*.*/storybook/*.amp.js',
  ],
  addons: [
    // TODO(alanorozco): AMP previews are loaded inside an iframe, so the a11y
    // addon is not able to inspect the tree inside it. Its results are incorrect,
    // since it only checks the structure of the outer iframe element.
    // Enable this once we find a way to inspect the iframe document's tree.
    // '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-knobs',
    '@ampproject/storybook-addon',
  ],
  webpackFinal: async (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
