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
const argv = require('minimist')(process.argv.slice(2));
const log = require('fancy-log');
const {exec} = require('../../common/exec');
const {getOutput} = require('../../common/process');
const {magenta, cyan} = require('ansi-colors');
const {readJsonSync, writeFileSync} = require('fs-extra');

const dirsContainRuntimeSource = ['3p', 'ads', 'extensions', 'src', 'test'];

const experimentsConfigPath = 'tools/experiments/experiments-config.js';
const prodConfigPath = 'build-system/global-configs/prod-config.json';
const canaryConfigPath = 'build-system/global-configs/canary-config.json';

const globalWritablePaths = [
  experimentsConfigPath,
  prodConfigPath,
  canaryConfigPath,
];

/**
 * @param {string} cmd
 * @return {?string}
 */
function getStdout(cmd) {
  const {stdout} = getOutput(cmd);
  return stdout && stdout.trim();
}

/**
 * @param {string} string
 * @return {!Array<string>}
 */
const filesContainingString = (string) =>
  getStdout(
    `grep -lr "${cmdEscape(string)}" {${dirsContainRuntimeSource.join(',')}}`
  )
    .split('\n')
    .filter((name) => name.endsWith('.js'));

/**
 * @param {string} fromHash
 * @return {!Array<string>}
 */
const getModifiedSourceFiles = (fromHash) =>
  getStdout(`git diff --name-only ${fromHash}..HEAD | grep .js`)
    .split('\n')
    .filter((file) => !globalWritablePaths.includes(file));

/**
 * Runs a jscodeshift transform under this directory.
 * @param {string} transform
 * @param {Array<string>=} args
 * @return {string}
 */
const jscodeshift = (transform, args = []) =>
  getStdout(
    'npx jscodeshift ' +
      ` -t ${__dirname}/jscodeshift/${transform} ` +
      args.join(' ')
  );

/**
 * @param {string} id
 * @return {Array<string>} modified files
 */
function removeFromExperimentsConfig(id) {
  jscodeshift(
    'remove-experiment-config.js'[
      (`--experimentId=${id}`, experimentsConfigPath)
    ]
  );
  return [experimentsConfigPath];
}

/**
 * @param {!Object<string, *>} config
 * @param {string} path
 * @param {string} id
 * @return {Array<string>} modified files
 */
function removeFromJsonConfig(config, path, id) {
  delete config[id];
  writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
  return [path];
}

/**
 * @param {string} id
 * @param {number} percentage
 * @return {Array<string>} modified files
 */
function removeFromRuntimeSource(id, percentage) {
  const possiblyModifiedSourceFiles = filesContainingString(id);
  if (possiblyModifiedSourceFiles.length > 0) {
    jscodeshift('remove-experiment-runtime.js', [
      `--isExperimentOnLaunched=${percentage}`,
      `--isExperimentOnExperiment=${id}`,
      ...possiblyModifiedSourceFiles,
    ]);
  }
  return possiblyModifiedSourceFiles;
}

/**
 * @param {string} str
 * @return {string}
 */
const cmdEscape = (str) => str.replace(/["`]/g, (c) => `\\${c}`);

/**
 * @param {string} id
 * @param {*} workItem
 * @param {!Array<string>} modified
 * @return {?string}
 */
function gitCommitSingleExperiment(
  id,
  {previousHistory, percentage},
  modified
) {
  exec(`git add ${modified.join(' ')}`);
  const commitMessage =
    `${readableRemovalId(id, {previousHistory, percentage})}\n\n` +
    `${prodConfigPath.split('/').pop()} history:\n\n` +
    previousHistory
      .map(
        ({hash, authorDate, subject}) =>
          ` - ${hash} - ${authorDate}\n   ${subject}\n`
      )
      .join('\n');
  return getStdout(`git commit -m "${cmdEscape(commitMessage)}"`);
}

function readableRemovalId(id, {percentage, previousHistory}) {
  const {knownPr, authorDate, hash} = previousHistory[0];
  return (
    `(${truncateYyyyMmDd(authorDate)}, ${knownPr || hash}) ` +
    `\`${id}\`: ${percentage}`
  );
}

/**
 * @param {!Array<string>=} extraFiles
 * @return {*}
 */
const lintFix = (extraFiles = []) =>
  getOutput(
    `gulp lint --fix --files="${[experimentsConfigPath]
      .concat(extraFiles)
      .join(',')}"`
  );

/**
 * @param {number=} daysAgo
 * @return {!Date}
 */
function daysAgo(daysAgo = 365) {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo - 1);
  pastDate.setHours(0);
  pastDate.setMinutes(0);
  return pastDate;
}

/** @return {?string} */
const getHeadHash = () => getStdout('git log  --pretty=format:%h HEAD^..HEAD');

/**
 * @param {string} formattedDate
 * @return {string}
 */
const truncateYyyyMmDd = (formattedDate) =>
  formattedDate.substr(0, 'YYYY-MM-DD'.length);

/**
 * @param {string} cutoffDateFormatted
 * @param {string} configPath
 * @param {string} experiment
 * @param {number} percentage
 * @return {Array<string>}
 */
const findConfigBitCommits = (
  cutoffDateFormatted,
  configPath,
  experiment,
  percentage
) => {
  const out = getStdout(
    'git log' +
      ' --pretty="format:%h %aI %s"' +
      ` -S '"${experiment}": ${percentage},'` +
      ` --until=${cutoffDateFormatted}` +
      ` ${configPath}`
  );
  if (out.length <= 0) {
    return [];
  }
  return out.split('\n');
};

/**
 * @param {!Object<string, *>} prodConfig
 * @param {!Object<string, *>} canaryConfig
 * @param {string} cutoffDateFormatted
 * @param {string=} removeExperiment
 * @return {!Object<string, {percentage: number, previousHistory: Array}>}
 */
function collectWork(
  prodConfig,
  canaryConfig,
  cutoffDateFormatted,
  removeExperiment
) {
  const work = {};
  for (const experiment in prodConfig) {
    const percentage = prodConfig[experiment];

    if (removeExperiment && experiment !== removeExperiment) {
      continue;
    }

    if (
      !removeExperiment &&
      (experiment === 'canary' ||
        !(percentage >= 1 || percentage <= 0) ||
        percentage !== canaryConfig[experiment])
    ) {
      continue;
    }

    const commitStrings = findConfigBitCommits(
      cutoffDateFormatted,
      prodConfigPath,
      experiment,
      percentage
    );
    if (commitStrings.length <= 0) {
      continue;
    }

    work[experiment] = {
      percentage,
      previousHistory: commitStrings.map((line) => {
        const tokens = line.split(' ');
        const hash = tokens.shift();
        const authorDate = tokens.shift();
        const knownPr = /\(#[0-9]+\)/.test(tokens[tokens.length - 1])
          ? tokens[tokens.length - 1].replace(/[()]/g, '')
          : null;
        const subject = tokens.join(' ');
        return {hash, authorDate, knownPr, subject};
      }),
    };
  }
  return work;
}

async function sweepExperiments() {
  const headHash = getHeadHash();

  const prodConfig = readJsonSync(prodConfigPath);
  const canaryConfig = readJsonSync(canaryConfigPath);

  const cutoffPointFormatted = daysAgo(
    argv.experiment ? 0 : argv.days_ago || 365
  ).toISOString();

  const work = collectWork(
    prodConfig,
    canaryConfig,
    cutoffPointFormatted,
    argv.experiment
  );
  const report = [];

  let at = 0;
  const total = Object.keys(work).length;

  if (total === 0) {
    log(cyan('No experiments to remove.'));
    log(`Cutoff at ${cutoffPointFormatted}`);
    return;
  }

  log();
  log(cyan('Removing references to the following experiments:'));
  for (const experiment in work) {
    log(readableRemovalId(experiment, work[experiment]));
  }
  log();

  if (argv.dry) {
    log('❗️ (Not making changes due to --dry)');
    return;
  }

  for (const id in work) {
    log(`🚮 ${++at}/${total}`, magenta(`${id}...`));

    const modified = [
      ...removeFromExperimentsConfig(id),
      ...removeFromJsonConfig(prodConfig, prodConfigPath, id),
      ...removeFromJsonConfig(canaryConfig, canaryConfigPath, id),
      ...removeFromRuntimeSource(id),
    ];

    if (argv.skip_lint_fix) {
      log('❗️ (Not fixing lint issues due to --skip_lint_fix)');
    } else {
      lintFix(modified);
    }

    gitCommitSingleExperiment(id, work[id], modified)
      .split('\n')
      .forEach((line) => log(line));

    log();

    report.push(`- ${readableRemovalId(id, work[id])}`);
  }

  if (report.length > 0) {
    let reportCommitMessage =
      `🚮 Sweep experiments\n\n` +
      `Sweep experiments last flipped globally up to ${truncateYyyyMmDd(
        cutoffPointFormatted
      )}:\n\n` +
      report.join('\n') +
      '\n\n';

    const modifiedSourceFiles = getModifiedSourceFiles(headHash);
    if (modifiedSourceFiles.length > 0) {
      reportCommitMessage += String(
        '---\n\n**⚠️ This changes Javascript source files**\n\n' +
          'The following may contain errors and/or require intervention to remove superfluous conditionals:\n\n' +
          modifiedSourceFiles.map((path) => `- \`${path}\``).join('\n') +
          '\n\n'
      );
    }

    log(
      getStdout(
        `git commit --allow-empty -m "${cmdEscape(reportCommitMessage)}"`
      ),
      '\n\n',
      getStdout('git log --pretty=format:%b "HEAD^..HEAD"'),
      `\n\n`
    );

    const reportHash = getHeadHash();
    log(cyan('You may recover the above report at any point:'));
    log(`git log ${reportHash}`);
    log();
  }
}

module.exports = {
  sweepExperiments,
};

sweepExperiments.description =
  'Sweep experiments whose configuration is too old, or specified with --experiment.';

sweepExperiments.flags = {
  'days_ago':
    ' How old experiment configuration flips must be for an experiment to be removed. Default is 365 days. This is ignored when using --experiment.',
  'experiment': ' Remove a specific experiment id.',
  'dry':
    " Don't write, but only display which experiments would be removed from the cutoff point.",
  'skip_lint_fix': ' Skips lint-fixing modified files before each commit.',
};
