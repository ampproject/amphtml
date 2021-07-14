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

/**
 * Change a Webpack config object so that filenames resulting from chunk
 * splitting do not include a tilde (~) character.
 * We do this since serving infrastructure does not play well with tildes.
 * See https://go.amp.dev/issue/30954#issuecomment-868679665
 * @param {Object} config
 * @return {Object}
 */
function webpackConfigNoChunkTilde(config) {
  // Change runtime filenames (like runtime~main.*)
  if (config.optimization.runtimeChunk) {
    config.optimization.runtimeChunk = {
      name: ({name}) => `runtime-${name}`,
    };
  }
  // Change all other chunked filenames (like vendors~main.*)
  if (config.optimization.splitChunks) {
    config.optimization.splitChunks.automaticNameDelimiter = '-';
  }
  return config;
}

module.exports = {
  webpackConfigNoChunkTilde,
};
