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
'use strict';

/**
 * @typedef {{
 *  name?: string,
 *  environment?: string,
 *  issue?: string,
 *  expiration_date_utc?: string,
 *  define_experiment_constant?: string,
 * }}
 */
let ExperimentConfigDef;

/**
 * @typedef {{
 *  experimentA: ExperimentConfigDef,
 *  experimentB: ExperimentConfigDef,
 *  experimentC: ExperimentConfigDef,
 * }}
 */
let ExperimentsConfigDef;

/**
 * @typedef {ExperimentConfigDef & {
 *  flavorType: string;
 *  rtvPrefixes: string[];
 *  command: string;
 * }}
 */
let DistFlavorDef;

const argv = require('minimist')(process.argv.slice(2));
/** @type {ExperimentsConfigDef} */
const experimentsConfig = require('../../global-configs/experiments-config.json');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const klaw = require('klaw');
const path = require('path');
const tar = require('tar');
const {cyan, green} = require('../../common/colors');
const {execOrDie} = require('../../common/exec');
const {log} = require('../../common/logging');
const {MINIFIED_TARGETS} = require('../helpers');
const {VERSION} = require('../../compile/internal-version');

// Flavor config for the base flavor type.
const BASE_FLAVOR_CONFIG = {
  flavorType: 'base',
  name: 'base',
  rtvPrefixes: ['00', '01', '02', '03', '04', '05'],
  command: 'amp dist --noconfig',
  environment: 'AMP',
};

// Deep map from [environment][flavorType] to an RTV prefix.
const EXPERIMENTAL_RTV_PREFIXES = {
  AMP: {
    experimentA: '10',
    experimentB: '11',
    experimentC: '12',
  },
  INABOX: {
    'experimentA-control': '20',
    experimentA: '21',
    'experimentB-control': '22',
    experimentB: '23',
    'experimentC-control': '24',
    experimentC: '25',
  },
};

// Directory containing multiple static files to dist/.
const STATIC_FILES_DIR = path.resolve(__dirname, 'static');

// List of individual files to copy directly from the Git workspace to dist/.
const STATIC_FILE_PATHS = ['build-system/global-configs/caches.json'];

// List of individual files to copy from post-build files, key-values as the
// from-to of the copy operations.
const POST_BUILD_MOVES = {
  'dist.tools/experiments/experiments.cdn.html': 'dist/experiments.html',
  'dist.tools/experiments/experiments.js': 'dist/v0/experiments.js',
  'dist.tools/experiments/experiments.js.map': 'dist/v0/experiments.js.map',
};

// URL to the JSON info API for the amp-sw package on the npm registry.
const AMP_SW_NPM_PACKAGE_URL = 'https://registry.npmjs.org/@ampproject/amp-sw';

// List of directories to keep in the temp directory from each flavor's build.
const DIST_DIRS = ['dist', 'dist.3p', 'dist.tools'];

// Mapping from a channel's RTV prefix, to an object with channel configuration
// data based on the spec/amp-framework-hosting.md document. The fields are:
// - type: machine name of the channel (Some of these are the same as their name
//   in spec/amp-framework-hosting.md, but some are different. Those that have a
//   different machine name are marked in a comment.)
// - configBase: name of the config JSON file to prepend as the AMP_CONFIG to
//   all the entry files in this channel. Either `canary` or `prod` (these files
//   are located in build-system/global-configs/${configBase}-config.json).
const CHANNEL_CONFIGS = {
  '00': {type: 'experimental', configBase: 'canary'},
  '01': {type: 'production', configBase: 'prod'}, // Spec name: 'stable'
  '02': {type: 'control', configBase: 'prod'},
  '03': {type: 'rc', configBase: 'prod'}, // Spec name: 'beta'
  '04': {type: 'nightly', configBase: 'prod'},
  '05': {type: 'nightly-control', configBase: 'prod'},
  '10': {type: 'experimentA', configBase: 'prod'},
  '11': {type: 'experimentB', configBase: 'prod'},
  '12': {type: 'experimentC', configBase: 'prod'},
  '20': {type: 'experimentA-control', configBase: 'prod'}, // Spec name: 'inabox-experimentA-control'
  '21': {type: 'experimentA', configBase: 'prod'}, // Spec name: 'inabox-experimentA'
  '22': {type: 'experimentB-control', configBase: 'prod'}, // Spec name: 'inabox-experimentB-control'
  '23': {type: 'experimentB', configBase: 'prod'}, // Spec name: 'inabox-experimentB'
  '24': {type: 'experimentC-control', configBase: 'prod'}, // Spec name: 'inabox-experimentC-control'
  '25': {type: 'experimentC', configBase: 'prod'}, // Spec name: 'inabox-experimentC'
};

function logSeparator_() {
  log('---\n\n');
}

/**
 * Prepares output and temp directories.
 *
 * @param {string} outputDir full directory path to emplace artifacts in.
 * @param {string} tempDir full directory path to temporary working directory.
 */
async function prepareEnvironment_(outputDir, tempDir) {
  execOrDie('amp clean');
  await fs.emptyDir(outputDir);
  await fs.emptyDir(tempDir);
  logSeparator_();
}

/**
 * Discovers which AMP flavors are defined in the current working directory.
 *
 * The returned list of flavors will always contain the base flavor, and any
 * defined experiments in ../../global-configs/experiments-config.json.
 *
 * @return {!Array<!DistFlavorDef>} list of AMP flavors to build.
 */
function discoverDistFlavors_() {
  const experimentConfigDefs = Object.entries(experimentsConfig);
  const distFlavors = [
    BASE_FLAVOR_CONFIG,
    ...experimentConfigDefs
      .filter(
        // Only include experiments that have a `define_experiment_constant` field.
        ([, experimentConfig]) => experimentConfig.define_experiment_constant
      )
      .map(([flavorType, experimentConfig]) => ({
        // TODO(#28168, erwinmombay): relace with single `--module --nomodule` command.
        command: `amp dist --noconfig --define_experiment_constant ${experimentConfig.define_experiment_constant}`,
        flavorType,
        rtvPrefixes: [
          EXPERIMENTAL_RTV_PREFIXES[experimentConfig.environment][flavorType],
        ],
        ...experimentConfig,
      })),
  ].filter(
    // If --flavor is defined, filter out the rest.
    ({flavorType}) => !argv.flavor || flavorType == argv.flavor
  );

  log(
    'The following',
    cyan('amp dist'),
    'commands will be executed to compile each',
    `${green('flavor')}:`
  );
  distFlavors.forEach(({command, flavorType, name}) => {
    log('-', `(${green(flavorType)}, ${green(name)})`, cyan(command));
  });

  logSeparator_();

  return distFlavors;
}

/**
 * Compiles all AMP flavors sequentially.
 *
 * @param {string} flavorType AMP flavor to build.
 * @param {string} command `amp` command to build the flavor.
 * @param {string} tempDir full directory path to temporary working directory.
 */
async function compileDistFlavors_(flavorType, command, tempDir) {
  // TODO(danielrozenberg): remove undefined case when the release automation platform explicitly handles it.
  if (argv.esm === undefined) {
    command = `${command} --esm && ${command}`;
  } else if (argv.esm) {
    command += ' --esm';
  }
  log('Compiling flavor', green(flavorType), 'using', cyan(command));

  execOrDie('amp clean --exclude release');
  execOrDie(command);

  const flavorTempDistDir = path.join(tempDir, flavorType);
  log('Moving build artifacts to', `${cyan(flavorTempDistDir)}...`);
  await fs.ensureDir(flavorTempDistDir);

  await Promise.all(
    DIST_DIRS.map((distDir) =>
      fs.move(distDir, path.join(flavorTempDistDir, distDir))
    )
  );

  log('Copying static files...');
  const staticFilesPromises = [
    // Directory-to-directory copy from the ./static sub-directory.
    fs.copy(STATIC_FILES_DIR, path.join(flavorTempDistDir, 'dist')),
    // Individual files to copy from the Git repository.
    ...STATIC_FILE_PATHS.map((staticFilePath) =>
      fs.copy(
        staticFilePath,
        path.join(flavorTempDistDir, 'dist', path.basename(staticFilePath))
      )
    ),
  ];
  const postBuildMovesPromises = !argv.esm
    ? [
        // Individual files to copy from the resulting build artifacts.
        // This is only relevant for nomodule builds.
        ...Object.entries(POST_BUILD_MOVES).map(([from, to]) =>
          fs.copy(
            path.join(flavorTempDistDir, from),
            path.join(flavorTempDistDir, to)
          )
        ),
      ]
    : [Promise.resolve()];
  await Promise.all([...staticFilesPromises, ...postBuildMovesPromises]);

  logSeparator_();
}

/**
 * Fetches latest AMP service-worker package from the npm registry.
 *
 * @param {string} flavorType AMP flavor to build.
 * @param {string} tempDir full directory path to temporary working directory.
 */
async function fetchAmpSw_(flavorType, tempDir) {
  const ampSwTempDir = path.join(tempDir, 'ampproject/amp-sw');
  await Promise.all([
    fs.ensureDir(ampSwTempDir),
    fs.ensureDir(path.join(tempDir, flavorType, 'dist/sw')),
  ]);

  const ampSwNpmPackageResponse = await fetch(AMP_SW_NPM_PACKAGE_URL);
  const ampSwNpmPackageJson = await ampSwNpmPackageResponse.json();
  const {latest} = ampSwNpmPackageJson['dist-tags'];
  const ampSwTarballUrl = ampSwNpmPackageJson.versions[latest].dist.tarball;

  const tarWritableStream = tar.extract({
    cwd: ampSwTempDir,
    filter: (path) => path.startsWith('package/dist'),
    strip: 2, // to strip "package/dist/".
  });
  (await fetch(ampSwTarballUrl)).body.pipe(tarWritableStream);
  await new Promise((resolve) => {
    tarWritableStream.on('end', resolve);
  });

  await fs.copy(ampSwTempDir, path.join(tempDir, flavorType, 'dist/sw'));

  logSeparator_();
}

/**
 * Copies compiled build artifacts to RTV-based directories.
 *
 * Each flavor translates to one or more RTV numbers, for a detailed explanation
 * see spec/amp-framework-hosting.md.
 *
 * @param {string} flavorType AMP flavor to build.
 * @param {!Array<string>} rtvPrefixes list of 2-digit RTV prefixes to generate.
 * @param {string} tempDir full directory path to temporary working directory.
 * @param {string} outputDir full directory path to emplace artifacts in.
 */
async function populateOrgCdn_(flavorType, rtvPrefixes, tempDir, outputDir) {
  const rtvCopyingPromise = async (/** @type {string} */ rtvPrefix) => {
    const rtvNumber = `${rtvPrefix}${VERSION}`;
    const rtvPath = path.join(outputDir, 'org-cdn/rtv', rtvNumber);
    await fs.ensureDir(rtvPath);
    return fs.copy(path.join(tempDir, flavorType, 'dist'), rtvPath);
  };

  const rtvCopyingPromises = rtvPrefixes.map(rtvCopyingPromise);

  // Special handling for INABOX experiments when compiling the base flavor.
  // INABOX experiments need to have their control population be created from
  // the base flavor.
  if (flavorType == 'base') {
    rtvCopyingPromises.push(
      ...Object.entries(experimentsConfig)
        .filter(([, {environment}]) => environment == 'INABOX')
        .map(
          ([experimentFlavor]) =>
            EXPERIMENTAL_RTV_PREFIXES['INABOX'][`${experimentFlavor}-control`]
        )
        .map(rtvCopyingPromise)
    );
  }
  await Promise.all(rtvCopyingPromises);

  logSeparator_();
}

/**
 * Generates a listing of all files in each org-cdn/rtv/ subdirectory.

 * @param {string} outputDir full directory path to emplace artifacts in.
 */
async function generateFileListing_(outputDir) {
  await Promise.all(
    Object.entries(CHANNEL_CONFIGS)
      .map(([rtvPrefix]) =>
        path.join(outputDir, 'org-cdn/rtv', `${rtvPrefix}${VERSION}`)
      )
      .filter((rtvPath) => fs.pathExistsSync(path.join(rtvPath)))
      .map(async (rtvPath) => {
        const filesPath = path.join(rtvPath, 'files.txt');

        const files = [];
        for await (const file of klaw(rtvPath)) {
          if (file.stats.isFile()) {
            files.push(path.relative(rtvPath, file.path));
          }
        }
        files.sort();
        files.push(''); // Add an empty line at end of file.

        await fs.writeFile(filesPath, files.join('\n'));
      })
  );
}

/**
 * Prepends the AMP_CONFIG configuration object to all the entry files.
 *
 * Entry files are those that publishers would embed in their page, i.e.
 * https://cdn.ampproject.org/v0.js, but could be others for different users,
 * e.g., /amp4ads-v0.js for AMP ads.
 *
 * @param {string} outputDir full directory path to emplace artifacts in.
 */
async function prependConfig_(outputDir) {
  const activeChannels = Object.entries(CHANNEL_CONFIGS).filter(
    ([rtvPrefix]) => {
      const rtvNumber = `${rtvPrefix}${VERSION}`;
      const rtvPath = path.join(outputDir, 'org-cdn/rtv', rtvNumber);
      return fs.pathExistsSync(path.join(rtvPath));
    }
  );

  const allPrependPromises = [];
  for (const [rtvPrefix, channelConfig] of activeChannels) {
    const rtvNumber = `${rtvPrefix}${VERSION}`;
    const rtvPath = path.join(outputDir, 'org-cdn/rtv', rtvNumber);
    const channelPartialConfig = {
      v: rtvNumber,
      type: channelConfig.type,
      ...require(`../../global-configs/${channelConfig.configBase}-config.json`),
    };
    // Mapping of entry file names to a dictionary of AMP_CONFIG additions.
    const targetsToConfig = MINIFIED_TARGETS.flatMap((minifiedTarget) => {
      const targets = [];
      // TODO(danielrozenberg): remove undefined case when the release automation platform explicitly handles it.
      if (!argv.esm) {
        // For explicit --no-esm or when no ESM flag is passed.
        targets.push({file: `${minifiedTarget}.js`, config: {}});
      }
      if (argv.esm === undefined || argv.esm) {
        // For explicit --esm or when no ESM flag is passed.
        targets.push({file: `${minifiedTarget}.mjs`, config: {esm: 1}});
      }
      return targets;
    });

    allPrependPromises.push(
      ...targetsToConfig.map(async (target) => {
        const targetPath = path.join(rtvPath, target.file);
        const channelConfig = JSON.stringify({
          ...channelPartialConfig,
          ...target.config,
        });

        const contents = await fs.readFile(targetPath, 'utf-8');
        return fs.writeFile(
          targetPath,
          `self.AMP_CONFIG=${channelConfig};/*AMP_CONFIG*/${contents}`
        );
      })
    );
  }
  await Promise.all(allPrependPromises);

  logSeparator_();
}

/**
 * Copies compiled build artifacts to the AMP ads frame container directory.
 *
 * @param {string} tempDir full directory path to temporary working directory.
 * @param {string} outputDir full directory path to emplace artifacts in.
 */
async function populateNetWildcard_(tempDir, outputDir) {
  const netWildcardDir = path.join(outputDir, 'net-wildcard', VERSION);
  await fs.ensureDir(netWildcardDir);
  await fs.copy(path.join(tempDir, 'base/dist.3p', VERSION), netWildcardDir);

  logSeparator_();
}

/**
 * Cleans are deletes the temp directory.
 *
 * @param {string} tempDir full directory path to temporary working directory.
 */
async function cleanup_(tempDir) {
  await fs.rmdir(tempDir, {recursive: true});

  logSeparator_();
}

/**
 * @return {Promise<void>}
 */
async function release() {
  const outputDir = path.resolve(argv.output_dir || './release');
  const tempDir = path.join(outputDir, 'tmp');

  log('Preparing environment for release build in', `${cyan(outputDir)}...`);
  await prepareEnvironment_(outputDir, tempDir);

  log('Discovering release', `${green('flavors')}...`);
  const distFlavors = discoverDistFlavors_();

  if (argv.flavor && distFlavors.length == 0) {
    log('Flavor', cyan(argv.flavor), 'is inactive. Quitting...');
    return;
  }

  if (!argv.flavor) {
    log('Compiling all', `${green('flavors')}...`);
  }

  for (const {command, flavorType, rtvPrefixes} of distFlavors) {
    await compileDistFlavors_(flavorType, command, tempDir);

    log('Fetching npm package', `${cyan('@ampproject/amp-sw')}...`);
    await fetchAmpSw_(flavorType, tempDir);

    log('Copying from temporary directory to', cyan('org-cdn'));
    await populateOrgCdn_(flavorType, rtvPrefixes, tempDir, outputDir);
  }

  log('Generating', cyan('files.txt'), 'files in', cyan('org-cdn/rtv/*'));
  await generateFileListing_(outputDir);

  log('Prepending config to entry files...');
  await prependConfig_(outputDir);

  if (!argv.flavor || argv.flavor == 'base') {
    // Only populate the net-wildcard directory if --flavor=base or if --flavor is not set.
    log('Copying from temporary directory to', cyan('net-wildcard'));
    await populateNetWildcard_(tempDir, outputDir);
  }

  log('Cleaning up temp dir...');
  await cleanup_(tempDir);

  log('Release build is done!');
  log('  See:', cyan(outputDir));
}

module.exports = {
  release,
};

release.description = 'Generates a release build';
release.flags = {
  'output_dir':
    'Directory path to emplace release files (defaults to "./release")',
  'flavor':
    'Limit this release build to a single flavor. Can be used to split the release work between multiple build machines.',
  'esm':
    // TODO(danielrozenberg): remove undefined case when the release automation platform explicitly handles it.
    'True to compile with --esm, false to compile without; Do not set to compile both.',
};
