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

const esbuild = require('esbuild');
const {BUILD_CONSTANTS} = require('../../compile/build-constants');
const {getEsbuildBabelPlugin} = require('../../common/esbuild-babel');

const cwd = process.cwd();
const injectedSrcDir = `${__dirname}/src/`;

const aliasPatterns = [
  // Inject our own implementation of service-helpers to scope them to a global
  // window, and collapse the concept of extension services (they're all global).
  ['.+/service-helpers', `${injectedSrcDir}/service-helpers.js`],

  // Inject our own empty implementation of LinkerManager.
  // The Linker is only useful when the cache and the publisher's origin are
  // different, which is to say only relevant to AMP documents.
  ['.+/linker-manager', `${injectedSrcDir}/linker-manager.js`],

  // #service(/index.js) is special in that we inject our own service getters.
  // Anything else under `#service/` is handled by the companion alias below.
  ['#service', `${injectedSrcDir}/service.js`],

  // Standard aliases:
  ['#core(/.+)?', `${cwd}/src/core$1`],
  ['#experiments(/.+)?', `${cwd}/src/experiments$1`],
  ['#service(/.+)?', `${cwd}/src/service$1`],
  ['#third_party(/.+)?', `${cwd}/third_party$1`],
];

const alias = {
  name: 'alias',
  setup(build) {
    build.onResolve({filter: /.+/}, (args) => {
      for (const [pattern, replacement] of aliasPatterns) {
        const regex = new RegExp(`^${pattern}$`);
        if (args.path.match(regex)) {
          const aliased = args.path.replace(regex, replacement);
          return {path: require.resolve(aliased)};
        }
      }
      if (args.path.startsWith('#')) {
        throw new Error(JSON.stringify(args, null, 2));
      }
    });
  },
};

(async () => {
  await esbuild.build({
    entryPoints: ['extensions/amp-analytics/0.1/amp-analytics.js'],
    bundle: true,
    minifySyntax: true,
    inject: [`${injectedSrcDir}/amp.js`],
    outfile: 'dist/universal-analytics.js',
    define: Object.fromEntries(
      Object.entries(BUILD_CONSTANTS).map(([k, v]) => [k, v.toString()])
    ),
    plugins: [
      alias,
      getEsbuildBabelPlugin('build-universal-analytics', /* cache */ false),
    ],
  });
  console.log('==========\n' + new Date().toLocaleTimeString());
})();
