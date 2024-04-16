'use strict';

const argv = require('minimist')(process.argv.slice(2));
const childProcess = require('child_process');
const colors = require('kleur/colors');
const fs = require('fs');
const path = require('path');
const util = require('util');
const {log} = require('../../common/logging');

const exec = util.promisify(childProcess.exec);

const {cyan, red, yellow} = colors;

/**
 * List of unminified targets to which AMP_CONFIG should be written
 */
const UNMINIFIED_TARGETS = ['alp.max', 'amp-inabox', 'amp-shadow', 'amp'];

/**
 * List of minified targets to which AMP_CONFIG should be written
 */
const MINIFIED_TARGETS = ['alp', 'amp4ads-v0', 'shadow-v0', 'v0'];

/**
 * Path to custom overlay config, see: build-system/global-configs/README.md
 */
const CUSTOM_OVERLAY_CONFIG_PATH = path.resolve(
  __dirname,
  '../../global-configs/custom-config.json'
);

/**
 * Returns the number of AMP_CONFIG matches in the given config string.
 *
 * @param {string} str
 * @return {number}
 */
function numConfigs(str) {
  const re = /\/\*AMP_CONFIG\*\//g;
  const matches = str.match(re);
  return matches == null ? 0 : matches.length;
}

/**
 * Checks that only 1 AMP_CONFIG should exist after append.
 *
 * @param {string} str
 */
function sanityCheck(str) {
  const numMatches = numConfigs(str);
  if (numMatches != 1) {
    throw new Error(
      'Found ' + numMatches + ' AMP_CONFIG(s) before write. Aborting!'
    );
  }
}

/**
 * @param {string} filename File containing the config
 * @param {boolean=} opt_localBranch Whether to use the local branch version
 * @param {string=} opt_branch If not the local branch, which branch to use
 * @return {!Promise<string>}
 */
async function fetchConfigFromBranch_(filename, opt_localBranch, opt_branch) {
  if (opt_localBranch) {
    return fs.promises.readFile(filename, 'utf8');
  }
  const branch = opt_branch || 'origin/main';
  return (await exec(`git show ${branch}:${filename}`)).stdout;
}

/**
 * @param {string} filename Destination filename
 * @param {string} fileString String to write
 * @param {boolean=} opt_dryrun If true, print the contents without writing them
 * @return {!Promise<void>}
 */
async function writeTarget_(filename, fileString, opt_dryrun) {
  if (opt_dryrun) {
    log(cyan(`overwriting: ${filename}`));
    log(fileString);
    return;
  }
  return fs.promises.writeFile(filename, fileString);
}

/**
 * @param {string|boolean} value
 * @param {string} defaultValue
 * @return {string}
 */
function valueOrDefault(value, defaultValue) {
  if (typeof value === 'string') {
    return value;
  }
  return defaultValue;
}

/**
 * @param {string} type Prod or canary
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {string} filename File containing the (prod or canary) config
 * @return {!Promise<void>}
 */
async function applyConfig(type, target, filename) {
  const config = await getConfig(
    type,
    target,
    filename,
    argv.local_dev,
    argv.local_branch,
    argv.branch,
    argv.fortesting,
    argv.derandomize
  );
  const targetString = await fs.promises.readFile(target, 'utf8');
  const fileString = config + targetString;
  sanityCheck(fileString);
  await writeTarget_(target, fileString, argv.dryrun);
}

/**
 * @param {string} type Prod or canary
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {string} filename File containing the (prod or canary) config
 * @param {boolean=} opt_localDev Whether to enable local development
 * @param {boolean=} opt_localBranch Whether to use the local branch version
 * @param {string=} opt_branch If not the local branch, which branch to use
 * @param {boolean=} opt_fortesting Whether to force getMode().test to be true
 * @param {boolean=} opt_derandomize Whether to remove experiment randomization
 * @return {!Promise<string>}
 */
async function getConfig(
  type,
  target,
  filename,
  opt_localDev,
  opt_localBranch,
  opt_branch,
  opt_fortesting,
  opt_derandomize
) {
  const fsConfigString = await fetchConfigFromBranch_(
    filename,
    opt_localBranch,
    opt_branch
  );

  let configJson;
  try {
    configJson = JSON.parse(fsConfigString);
  } catch (e) {
    log(red(`Error parsing config file: ${filename}`));
    throw e;
  }

  if (fs.existsSync(CUSTOM_OVERLAY_CONFIG_PATH)) {
    const overlayFilename = path.basename(CUSTOM_OVERLAY_CONFIG_PATH);
    try {
      const overlayJson = require(CUSTOM_OVERLAY_CONFIG_PATH);
      Object.assign(configJson, overlayJson);
      log(
        yellow('Notice:'),
        cyan(type),
        'config overlaid with',
        cyan(overlayFilename)
      );
    } catch (e) {
      log(red('Could not apply overlay from'), cyan(overlayFilename));
    }
  }
  if (opt_localDev) {
    configJson = enableLocalDev_(target, configJson);
  }
  if (opt_fortesting) {
    configJson = {test: true, ...configJson};
  }
  if (opt_derandomize) {
    configJson = derandomize_(target, configJson);
  }

  const details =
    '(' +
    cyan(type) +
    (opt_localDev ? ', ' + cyan('localDev') : '') +
    (opt_fortesting ? ', ' + cyan('test') : '') +
    (opt_derandomize ? ', ' + cyan('derandomized') : '') +
    ')';
  log('Generated AMP config', details, 'for', cyan(target));

  const configString = JSON.stringify(configJson);
  return `self.AMP_CONFIG||(self.AMP_CONFIG=${configString});/*AMP_CONFIG*/`;
}

/**
 * Given a target, retrieves the appropriate AMP_CONFIG string to prepend.
 * Returns an empty string if no AMP_CONFIG is necessary.
 *
 * @param {string} filename the file being operated on.
 * @param {object} options
 * @return {!Promise<string>}
 */
async function getAmpConfigForFile(filename, options) {
  const targets = options.minify ? MINIFIED_TARGETS : UNMINIFIED_TARGETS;
  const target = path.basename(filename, path.extname(filename));
  if (!!argv.noconfig || !targets.includes(target)) {
    return '';
  }

  const type = argv.config === 'canary' ? 'canary' : 'prod';
  const baseConfigFile = 'build-system/global-configs/' + type + '-config.json';

  return getConfig(
    type,
    filename,
    baseConfigFile,
    /* opt_localDev */ !!options.localDev,
    /* opt_localBranch */ true,
    /* opt_branch */ undefined,
    /* opt_fortesting */ !!options.fortesting
  );
}

/**
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {!JSON} configJson The json object in which to enable local dev
 * @return {!JSON}
 */
function enableLocalDev_(target, configJson) {
  let LOCAL_DEV_AMP_CONFIG = {localDev: true};
  const TESTING_HOST = process.env.AMP_TESTING_HOST;
  if (typeof TESTING_HOST == 'string') {
    const TESTING_HOST_FULL_URL = TESTING_HOST.match(/^https?:\/\//)
      ? TESTING_HOST
      : 'http://' + TESTING_HOST;
    const TESTING_HOST_NO_PROTOCOL = TESTING_HOST.replace(/^https?:\/\//, '');

    LOCAL_DEV_AMP_CONFIG = Object.assign(LOCAL_DEV_AMP_CONFIG, {
      thirdPartyUrl: TESTING_HOST_FULL_URL,
      thirdPartyFrameHost: TESTING_HOST_NO_PROTOCOL,
      thirdPartyFrameRegex: TESTING_HOST_NO_PROTOCOL,
    });
    log(
      'Set',
      cyan('TESTING_HOST'),
      'to',
      cyan(TESTING_HOST),
      'in',
      cyan(target)
    );
  }
  return Object.assign(LOCAL_DEV_AMP_CONFIG, configJson);
}

/**
 * @param {string} target File containing the AMP runtime (amp.js or v0.js)
 * @param {!JSON} configJson The json object in which to enable local dev
 * @return {!JSON}
 */
function derandomize_(target, configJson) {
  for (const [key, value] of Object.entries(configJson)) {
    if (typeof value == 'number') {
      configJson[key] = Math.round(value);
    }
  }
  log('Derandomized experiements in', cyan(target));
  return configJson;
}

/**
 * @param {string} target Target file from which to remove the AMP config
 * @return {!Promise<void>}
 */
async function removeConfig(target) {
  const file = await fs.promises.readFile(target);
  let contents = file.toString();
  if (numConfigs(contents) == 0) {
    return;
  }
  sanityCheck(contents);
  const config =
    /self\.AMP_CONFIG\|\|\(self\.AMP_CONFIG=(.|\n)*?\/\*AMP_CONFIG\*\//;
  contents = contents.replace(config, '');
  await writeTarget_(target, contents, argv.dryrun);
  log('Removed existing config from', cyan(target));
}

/**
 * @return {Promise<void>}
 */
async function prependGlobal() {
  if (!argv.target) {
    log(red('Missing --target.'));
    return;
  }
  const targets = argv.target.split(',');

  if (Boolean(argv.prod) == Boolean(argv.canary)) {
    log(red('Exactly one of --prod or --canary should be provided.'));
    return;
  }

  let filename = '';

  // Prod by default.
  const type = argv.canary ? 'canary' : 'prod';
  if (argv.canary) {
    filename = valueOrDefault(
      argv.canary,
      'build-system/global-configs/canary-config.json'
    );
  } else {
    filename = valueOrDefault(
      argv.prod,
      'build-system/global-configs/prod-config.json'
    );
  }
  await Promise.all([...targets.map(removeConfig)]);
  await Promise.all(
    targets.map((target) => applyConfig(type, target, filename))
  );
}

module.exports = {
  getAmpConfigForFile,
  numConfigs,
  prependGlobal,
  removeConfig,
  sanityCheck,
  valueOrDefault,
  MINIFIED_TARGETS,
};

prependGlobal.description = 'Prepend a json config to a target file';
prependGlobal.flags = {
  'target': 'Comma-separated list of files to prepend the json config to',
  'canary':
    'Prepend the default canary config (takes an optional value for a custom config source)',
  'prod':
    'Prepend the default prod config (takes an optional value for a custom config source)',
  'local_dev': 'Enable the runtime to be used for local development',
  'branch':
    'Get config source from the given branch (uses the main branch by default)',
  'local_branch':
    'Use the config from the local branch (does not switch branches)',
  'fortesting': 'Enable local testing by setting getMode().test to true',
  'derandomize':
    'Round all experiment percentages to 0 or 1, whichever is closest',
};
