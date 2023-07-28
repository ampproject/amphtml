const argv = require('minimist')(process.argv.slice(2));
const fastGlob = require('fast-glob');
const path = require('path');
const {
  getJscodeshiftReport,
  jscodeshift,
} = require('../../test-configs/jscodeshift');
const {cyan, magenta, yellow} = require('kleur/colors');
const {getOutput} = require('../../common/process');
const {log} = require('../../common/logging');
const {readJsonSync, writeJsonSync} = require('fs-extra');

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
 * Ignores experiments that cannot be removed automatically.
 * @param {string} id
 * @return {boolean}
 */
const isSpecialCannotBeRemoved = (id) =>
  // These are passed through to a third-party, so we can't determine whether
  // they're still in use by looking at this repo alone.
  // See https://git.io/JIBeB (amp-subscriptions-google.js)
  id.startsWith('swg-');

/**
 * @param {string} cmd
 * @return {string}
 */
function getStdoutThrowOnError(cmd) {
  const {stderr, stdout} = getOutput(cmd);
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
  const stdout = getStdoutThrowOnError(cmd);
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
 * @param {string} id
 * @param {Array} removedFromConfig
 * @return {Array<string>} modified files
 */
function removeFromExperimentsConfig(id, removedFromConfig) {
  const {stdout} = jscodeshift([
    `--no-babel`,
    `--transform ${__dirname}/jscodeshift/remove-experiment-config.js`,
    `--experimentId=${id}`,
    experimentsConfigPath,
  ]);

  for (const line of stdout.split('\n')) {
    const reportLine = getJscodeshiftReport(line);
    if (reportLine) {
      const [
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _,
        report,
      ] = reportLine;
      try {
        const removed = JSON.parse(report);
        removedFromConfig.push(removed);
      } catch (_) {}
    }
  }
  return [experimentsConfigPath];
}

/**
 * @param {!{[key: string]: *}} config
 * @param {string} path
 * @param {string} id
 * @return {Array<string>} modified files
 */
function removeFromJsonConfig(config, path, id) {
  delete config[id];

  for (const allowOptInKey of ['allow-doc-opt-in', 'allow-url-opt-in']) {
    const index = config[allowOptInKey].indexOf(id);
    if (index > -1) {
      config[allowOptInKey].splice(index, 1);
    }
  }

  writeJsonSync(path, config, {spaces: 2});
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
    jscodeshift([
      `--no-babel`,
      `--transform ${__dirname}/jscodeshift/remove-experiment-runtime.js`,
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
 * @return {Array<string>}
 */
function gitCommitSingleExperiment(id, workItem, modified) {
  const messageParagraphs = [readableRemovalId(id, workItem)];
  if (workItem.previousHistory.length > 0) {
    messageParagraphs.push(
      `Previous history on ${prodConfigPath.split('/').pop()}:`,
      workItem.previousHistory
        .map(
          ({authorDate, hash, subject}) =>
            `- ${hash} - ${authorDate} - ${subject}`
        )
        .join('\n')
    );
  }
  return getStdoutLines(
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
      hash: /** @type {string} */ (tokens.shift()),
      authorDate: /** @type {string} */ (tokens.shift()),
      subject: tokens.join(' '),
    };
  });

const issueUrlToNumberRe = new RegExp(
  [
    '^https://github.com/ampproject/amphtml/issues/(\\d+)',
    '^https://github.com/ampproject/amphtml/pull/(\\d+)',
    '^https://go.amp.dev/issue/(\\d+)',
    '^https://go.amp.dev/pr/(\\d+)',
    '^#?(\\d+)$',
  ].join('|')
);

/**
 * @param {string} url
 * @return {string}
 */
function issueUrlToNumberOrUrl(url) {
  const match = url.match(issueUrlToNumberRe);
  const number = match && match.find((group) => /^\d+$/.test(group));
  return number ? `#${number}` : url;
}

/**
 * @param {string[]} list
 * @return {string}
 */
const checklistMarkdown = (list) =>
  list.map((item) => `- [ ] ${item}`).join('\n');

/**
 * @return {string}
 */
const readmeMdGithubLink = () =>
  `https://github.com/ampproject/amphtml/blob/main/${path.relative(
    process.cwd(),
    __dirname
  )}/README.md`;

/**
 * @param {{
 *   removed: string[],
 *   cleanupIssues: Array<Object>,
 *   cutoffDateFormatted: string,
 *   modifiedSourceFiles: Array<string>,
 *   htmlFilesWithReferences: Array<string>,
 * }} vars
 * @return {string}
 */
function summaryCommitMessage({
  cleanupIssues,
  cutoffDateFormatted,
  htmlFilesWithReferences,
  modifiedSourceFiles,
  removed,
}) {
  const paragraphs = [
    `🚮 Sweep experiments older than ${cutoffDateFormatted}`,
    `Sweep experiments last flipped globally up to ${cutoffDateFormatted}:`,
    removed.join('\n'),
  ];

  if (cleanupIssues.length > 0) {
    paragraphs.push(
      '---',
      '### Cleanup issues',
      "Close these once they've been addressed and this PR has been merged:",
      checklistMarkdown(
        cleanupIssues.map(
          ({cleanupIssue, id}) =>
            `\`${id}\`: ${issueUrlToNumberOrUrl(cleanupIssue)}`
        )
      )
    );
  }

  if (modifiedSourceFiles.length > 0) {
    paragraphs.push(
      '---',
      '### ⚠️ Javascript source files require intervention',
      'The following may contain errors and/or require intervention to remove superfluous conditionals:',
      checklistMarkdown(modifiedSourceFiles.map((file) => `\`${file}\``)),
      `Refer to the removal guide for [suggestions on handling these modified Javascript files.](${readmeMdGithubLink()}#followup)`
    );
  }

  if (htmlFilesWithReferences.length > 0) {
    paragraphs.push(
      '---',
      '### ⚠️ HTML files may still contain references',
      'The following HTML files contain references to experiment names which may be stale and should be manually removed:',
      checklistMarkdown(htmlFilesWithReferences.map((file) => `\`${file}\``)),
      `Refer to the removal guide for [suggestions on handling these HTML files.](${readmeMdGithubLink()}#followup:html)`
    );
  }

  return paragraphs.join('\n\n');
}

/**
 * @param {!{[key: string]: *}} prodConfig
 * @param {!{[key: string]: *}} canaryConfig
 * @param {string} cutoffDateFormatted
 * @param {string=} removeExperiment
 * @return {{
 *   include?: {[key: string]: {percentage: number, previousHistory: Array}},
 *   exclude?: {[key: string]: {percentage: number, previousHistory: Array}}
 * }}
 */
function collectWork(
  prodConfig,
  canaryConfig,
  cutoffDateFormatted,
  removeExperiment
) {
  if (removeExperiment) {
    // 0 if not on prodConfig
    const percentage = prodConfig[removeExperiment]
      ? Number(prodConfig[removeExperiment])
      : 0;
    const previousHistory = findConfigBitCommits(
      cutoffDateFormatted,
      prodConfigPath,
      removeExperiment,
      percentage
    );
    /** @type {{[key: string]: {percentage: number, previousHistory: Array}}} */
    const entries = {[removeExperiment]: {percentage, previousHistory}};
    return isSpecialCannotBeRemoved(removeExperiment)
      ? {exclude: entries}
      : {include: entries};
  }

  /** @type {{[key: string]: {percentage: number, previousHistory: Array}}} */
  const include = {};
  /** @type {{[key: string]: {percentage: number, previousHistory: Array}}} */
  const exclude = {};
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
        const entries = isSpecialCannotBeRemoved(experiment)
          ? exclude
          : include;
        entries[experiment] = {percentage, previousHistory};
      }
    }
  }
  return {include, exclude};
}

/**
 * Entry point to amp sweep-experiments.
 * See README.md for usage.
 * @return {Promise<void>}
 */
async function sweepExperiments() {
  const headHash = getStdoutThrowOnError('git log -1 --format=%h');

  const prodConfig = readJsonSync(prodConfigPath);
  const canaryConfig = readJsonSync(canaryConfigPath);

  const cutoffDateFormatted = dateDaysAgo(
    argv.experiment ? 0 : argv.days_ago || 180
  ).toISOString();

  const {exclude, include = {}} = collectWork(
    prodConfig,
    canaryConfig,
    cutoffDateFormatted,
    argv.experiment
  );

  if (exclude && Object.keys(exclude).length > 0) {
    log(yellow('The following experiments are excluded as they are special:'));
    for (const experiment in exclude) {
      log(readableRemovalId(experiment, exclude[experiment]));
    }
  }

  const total = include ? Object.keys(include).length : 0;
  if (total === 0) {
    log(cyan('No experiments to remove.'));
    log(`Cutoff at ${cutoffDateFormatted}`);
    return;
  }

  log(cyan('Removing references to the following experiments:'));
  for (const experiment in include) {
    log(readableRemovalId(experiment, include[experiment]));
  }

  if (argv.dry_run) {
    log('❗️ (Not making changes due to --dry_run)');
    return;
  }

  const removed = [];

  const removedFromConfig = [];

  Object.entries(include).forEach(([id, workItem], i) => {
    log(`🚮 ${i + 1}/${total}`, magenta(`${id}...`));

    const modified = [
      ...removeFromExperimentsConfig(id, removedFromConfig),
      ...removeFromJsonConfig(prodConfig, prodConfigPath, id),
      ...removeFromJsonConfig(canaryConfig, canaryConfigPath, id),
      ...removeFromRuntimeSource(id, workItem.percentage),
    ];

    const formattable = modified.filter(
      (filename) =>
        // We don't need to format JSON files since they were written with
        // {spaces: 2}, and matches prettier's `json-stringify` parser
        !filename.endsWith('.json')
    );

    getStdoutThrowOnError(
      `./node_modules/prettier/bin-prettier.js --write ${formattable.join(' ')}`
    );

    for (const line of gitCommitSingleExperiment(id, workItem, modified)) {
      log(line);
    }

    log();

    removed.push(`- ${readableRemovalId(id, workItem)}`);
  });

  if (removed.length > 0) {
    const cleanupIssues = removedFromConfig.filter(
      ({cleanupIssue}) => !!cleanupIssue
    );

    const modifiedSourceFiles = getModifiedSourceFiles(headHash);

    const htmlFilesWithReferences = filesContainingPattern(
      containExampleHtml.map((dir) => `${dir}/**/*.html`),
      `['"](${Object.keys(include).join('|')})['"]`
    );

    log(
      getStdoutThrowOnError(
        `git commit --allow-empty -m "${cmdEscape(
          summaryCommitMessage({
            removed,
            cleanupIssues,
            modifiedSourceFiles,
            htmlFilesWithReferences,
            cutoffDateFormatted: truncateYyyyMmDd(cutoffDateFormatted),
          })
        )}"`
      ),
      '\n\n',
      getStdoutThrowOnError('git log -1 --format=%b'),
      `\n\n`
    );

    const reportHash = getStdoutThrowOnError('git log -1 --format=%h');
    log(cyan('You may recover the above report at any point:'));
    log(`git log ${reportHash}`);
  }
}

module.exports = {
  sweepExperiments,
};

sweepExperiments.description =
  'Remove outdated experiments from the AMP config';

sweepExperiments.flags = {
  'days_ago':
    'Age at which experiments are removed (default: 365 days, unless using --experiment)',
  'dry_run':
    'List experiments that will be removed without actually removing them',
  'experiment': 'Remove a specific experiment id, no matter what its age is',
};
