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
const fastGlob = require('fast-glob');
const log = require('fancy-log');
const path = require('path');
const {getOutput} = require('../../common/process');
const {magenta, cyan} = require('ansi-colors');
const {readJsonSync, writeFileSync} = require('fs-extra');

const containRuntimeSource = ['3p', 'ads', 'extensions', 'src', 'test'];
const containExampleHtml = ['examples', 'test'];

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
  const {stdout, stderr} = getOutput(cmd);
  if (!stdout && stderr) {
    throw new Error(`${cmd}\n\n${stderr}`);
  }
  return stdout && stdout.trim();
}

/**
 * @param {string} cmd
 * @return {Array<string>}
 */
function getStdoutLines(cmd) {
  const stdout = getStdout(cmd);
  return !stdout ? [] : stdout.split('\n');
}

/**
 * @param {string} str
 * @return {string}
 */
const cmdEscape = (str) => str.replace(/["`]/g, (c) => `\\${c}`);

/**
 * @param {!Array<string>} glob
 * @param {string} string
 * @return {!Array<string>}
 */
const filesContainingPattern = (glob, string) =>
  getStdoutLines(
    `grep -El "${cmdEscape(string)}" {${fastGlob.sync(glob).join(',')}}`
  );

/**
 * @param {string} fromHash
 * @return {!Array<string>}
 */
const getModifiedSourceFiles = (fromHash) =>
  getStdoutLines(`git diff --name-only ${fromHash}..HEAD | grep .js`).filter(
    (file) => !globalWritablePaths.includes(file)
  );

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
  jscodeshift('remove-experiment-config.js', [
    `--experimentId=${id}`,
    experimentsConfigPath,
  ]);
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
  const possiblyModifiedSourceFiles = filesContainingPattern(
    containRuntimeSource.map((dir) => `${dir}/**/*.js`),
    id
  );
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
 * @param {string} id
 * @param {*} workItem
 * @param {!Array<string>} modified
 * @return {? string}
 */
function gitCommitSingleExperiment(id, workItem, modified) {
  const messageParagraphs = [readableRemovalId(id, workItem)];
  if (workItem.previousHistory.length > 0) {
    messageParagraphs.push(
      `Previous history on ${prodConfigPath.split('/').pop()}:`,
      workItem.previousHistory
        .map(
          ({hash, authorDate, subject}) =>
            `- ${hash} - ${authorDate} - ${subject}`
        )
        .join('\n')
    );
  }
  return getStdout(
    `git add ${modified.join(' ')} && ` +
      `git commit -m "${cmdEscape(messageParagraphs.join('\n\n'))}"`
  );
}

/**
 * @param {string} id
 * @param {{percentage: number, previousHistory: Array}} workItem
 * @return {string}
 */
function readableRemovalId(id, {percentage, previousHistory}) {
  const lastCommit = previousHistory[0];
  const prefix = lastCommit
    ? `(${truncateYyyyMmDd(lastCommit.authorDate)}, ${lastCommit.hash})`
    : 'Remove';
  return `${prefix} \`${id}\`: ${percentage}`;
}

/**
 * @param {number=} daysAgo
 * @return {!Date} "Rounded up" to the following day at 00:00:00
 */
function dateDaysAgo(daysAgo = 365) {
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysAgo - 1);
  pastDate.setHours(0);
  pastDate.setMinutes(0);
  pastDate.setSeconds(0);
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
 * @param {string} configJsonPath
 * @param {string} experiment
 * @param {number} percentage
 * @return {Array<{hash: string, authorDate: string, subject: string}>}
 */
const findConfigBitCommits = (
  cutoffDateFormatted,
  configJsonPath,
  experiment,
  percentage
) =>
  getStdoutLines(
    [
      'git log',
      `--until=${cutoffDateFormatted}`,
      // Look for entries that contain exact percentage string, like:
      // "my-launched-experiment": 1
      `-S '"${experiment}": ${percentage},'`,
      // %h: hash
      // %aI: authorDate
      // %s: subject
      ' --format="%h %aI %s"',
      configJsonPath,
    ].join(' ')
  ).map((line) => {
    const tokens = line.split(' ');
    // PR numbers in subject lines create spammy references when committed,
    // remove them early on.
    if (/^\(#[0-9]+\)$/.test(tokens[tokens.length - 1])) {
      tokens.pop();
    }
    return {
      hash: tokens.shift(),
      authorDate: tokens.shift(),
      subject: tokens.join(' '),
    };
  });

/**
 * @param {string} files
 * @return {string}
 */
const fileListMarkdown = (files) =>
  files.map((path) => `- \`${path}\``).join('\n');

/**
 * @return {string}
 */
const readmeMdGithubLink = () =>
  `https://github.com/ampproject/amphtml/${path.relative(
    process.cwd(),
    __dirname
  )}/README.md`;

/**
 * @param {{
 *   removed: string,
 *   cutoffDateFormatted: string,
 *   modifiedSourceFiles: Array<string>,
 *   htmlFilesWithReferences: Array<string>,
 * }} vars
 * @return {string}
 */
function summaryCommitMessage({
  removed,
  cutoffDateFormatted,
  modifiedSourceFiles,
  htmlFilesWithReferences,
}) {
  const paragraphs = [
    `🚮 Sweep experiments older than ${cutoffDateFormatted}`,
    `Sweep experiments last flipped globally up to ${cutoffDateFormatted}:`,
    removed.join('\n'),
  ];

  if (modifiedSourceFiles.length > 0) {
    paragraphs.push(
      '---',
      '### ⚠️ Javascript source files require intervention',
      'The following may contain errors and/or require intervention to remove superfluous conditionals:',
      fileListMarkdown(modifiedSourceFiles),
      `Refer to the removal guide for [suggestions on handling these modified Javascript files.](${readmeMdGithubLink()}#followup)`
    );
  }

  if (htmlFilesWithReferences.length > 0) {
    paragraphs.push(
      '---',
      '### ⚠️ HTML files may still contain references',
      'The following HTML files contain references to experiment names which may be stale and should be manually removed:',
      fileListMarkdown(htmlFilesWithReferences),
      `Refer to the removal guide for [suggestions on handling these HTML files.](${readmeMdGithubLink()}#followup:html)`
    );
  }

  return paragraphs.join('\n\n');
}

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
  if (removeExperiment) {
    // 0 if not on prodConfig
    const percentage = Number(prodConfig[removeExperiment]);
    const previousHistory = findConfigBitCommits(
      cutoffDateFormatted,
      prodConfigPath,
      removeExperiment,
      percentage
    );
    return {[removeExperiment]: {percentage, previousHistory}};
  }

  const work = {};
  for (const [experiment, percentage] of Object.entries(prodConfig)) {
    if (
      typeof percentage === 'number' &&
      percentage === canaryConfig[experiment] &&
      experiment !== 'canary' &&
      (percentage >= 1 || percentage <= 0)
    ) {
      const previousHistory = findConfigBitCommits(
        cutoffDateFormatted,
        prodConfigPath,
        experiment,
        percentage
      );
      if (previousHistory.length > 0) {
        work[experiment] = {percentage, previousHistory};
      }
    }
  }
  return work;
}

/**
 * Entry point to gulp sweep-experiments.
 * See README.md for usage.
 */
async function sweepExperiments() {
  const headHash = getHeadHash();

  const prodConfig = readJsonSync(prodConfigPath);
  const canaryConfig = readJsonSync(canaryConfigPath);

  const cutoffDateFormatted = dateDaysAgo(
    argv.experiment ? 0 : argv.days_ago || 365
  ).toISOString();

  const work = collectWork(
    prodConfig,
    canaryConfig,
    cutoffDateFormatted,
    argv.experiment
  );

  const total = Object.keys(work).length;

  if (total === 0) {
    log(cyan('No experiments to remove.'));
    log(`Cutoff at ${cutoffDateFormatted}`);
    return;
  }

  log();
  log(cyan('Removing references to the following experiments:'));
  for (const experiment in work) {
    log(readableRemovalId(experiment, work[experiment]));
  }
  log();

  if (argv.dry_run) {
    log('❗️ (Not making changes due to --dry_run)');
    return;
  }

  const removed = [];

  Object.entries(work).forEach(([id, workItem], i) => {
    log(`🚮 ${i + 1}/${total}`, magenta(`${id}...`));

    const modified = [
      ...removeFromExperimentsConfig(id),
      ...removeFromJsonConfig(prodConfig, prodConfigPath, id),
      ...removeFromJsonConfig(canaryConfig, canaryConfigPath, id),
      ...removeFromRuntimeSource(id, workItem.percentage),
    ];

    getStdout(
      `./node_modules/prettier/bin-prettier.js --write ${modified.join(' ')}`
    );

    gitCommitSingleExperiment(id, workItem, modified)
      .split('\n')
      .forEach((line) => log(line));

    log();

    removed.push(`- ${readableRemovalId(id, workItem)}`);
  });

  if (removed.length > 0) {
    const modifiedSourceFiles = getModifiedSourceFiles(headHash);

    const htmlFilesWithReferences = filesContainingPattern(
      containExampleHtml.map((dir) => `${dir}/**/*.html`),
      `['"](${Object.keys(work).join('|')})['"]`
    );

    log(
      getStdout(
        `git commit --allow-empty -m "${cmdEscape(
          summaryCommitMessage({
            removed,
            modifiedSourceFiles,
            htmlFilesWithReferences,
            cutoffDateFormatted: truncateYyyyMmDd(cutoffDateFormatted),
          })
        )}"`
      ),
      '\n\n',
      getStdout('git log --pretty=format:%b "HEAD^..HEAD"'),
      `\n\n`
    );

    const reportHash = getHeadHash();
    log(cyan('You may recover the above report at any point:'));
    log(`git log ${reportHash}`);
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
  'dry_run':
    " Don't write, but only list the experiments that would be removed by this command.",
  'experiment': ' Remove a specific experiment id.',
};
