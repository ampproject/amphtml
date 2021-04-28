/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

const argv = require('minimist')(process.argv.slice(2), {string: ['version']});
const del = require('del');
const fs = require('fs-extra');
const objstr = require('obj-str');
const path = require('path');
const {cyan, green, red, yellow} = require('kleur/colors');
const {format} = require('./format');
const {getStdout, getOutput} = require('../../common/process');
const {log, logLocalDev, logWithoutTimestamp} = require('../../common/logging');

const extensionBundlesJson =
  'build-system/compile/bundles.config.extensions.json';

/**
 * Convert dash-case-name to PascalCaseName.
 * @param {string} name
 * @return {string}
 */
function dashToPascalCase(name) {
  return name.replace(/(?:-|^)([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Replaces from a map of keys/values.
 * @param {string} inputText
 * @param {Object<string, string>} replacements
 * @return {function(string): string}
 */
const replace = (inputText, replacements) =>
  Object.keys(replacements).reduce(
    (text, key) => text.replace(new RegExp(key, 'g'), replacements[key]),
    inputText
  );

/**
 * Generate a sequence of all files in a directory recursively.
 * @param {string} dir
 * @yields {string}
 */
async function* walkDir(dir) {
  for (const f of await fs.readdir(dir)) {
    const dirPath = path.join(dir, f);

    if ((await fs.stat(dirPath)).isDirectory()) {
      yield* walkDir(dirPath);
    } else {
      yield path.join(dir, f);
    }
  }
}

const getTemplateDir = (template) =>
  path.join(path.relative(process.cwd(), __dirname), 'template', template);

/**
 * @param {string} templateDir
 * @param {Object<string, string>} replacements
 * @param {string=} destinationDir
 * @return {Array<string>}
 */
async function writeFromTemplateDir(
  templateDir,
  replacements,
  destinationDir = '.'
) {
  const destinationPath = (templatePath) =>
    path.join(
      destinationDir,
      replace(templatePath.substr(templateDir.length + 1), replacements)
    );

  const written = [];
  for await (const templatePath of walkDir(templateDir)) {
    const destination = destinationPath(templatePath);

    await fs.mkdirp(path.dirname(destination));

    // Skip if the destination file already exists
    let fileHandle;
    try {
      fileHandle = await fs.open(destination, 'wx');
    } catch (e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
      if (!argv.overwrite) {
        logLocalDev(
          yellow('WARNING:'),
          'Skipping existing file',
          cyan(destination)
        );
        continue;
      }
      logLocalDev(
        yellow('WARNING:'),
        'Overwriting existing file',
        cyan(destination)
      );
    }

    const template = await fs.readFile(templatePath, 'utf8');
    await fs.write(fileHandle, replace(template, replacements));
    await fs.close(fileHandle);

    logLocalDev(green('SUCCESS:'), 'Created', cyan(destination));

    written.push(destination);
  }
  return written;
}

/**
 * Inserts an extension entry into bundles.config.extensions.json
 *
 * @param {{
 *   name: string,
 *   version: string,
 *   latestVersion?: (string|undefined)
 *   options: ({hasCss: boolean}|undefined)
 * }} bundle
 * @param {string=} destination
 */
async function insertExtensionBundlesConfig(
  bundle,
  destination = extensionBundlesJson
) {
  let extensionBundles = [];
  try {
    extensionBundles = await fs.readJson(destination, {throws: false});
  } catch (_) {}

  const existingOrNull = extensionBundles.find(
    ({name}) => name === bundle.name
  );

  extensionBundles.push({
    ...bundle,
    latestVersion:
      (existingOrNull && existingOrNull.latestVersion) ||
      bundle.latestVersion ||
      bundle.version,
  });

  await fs.mkdirp(path.dirname(destination));

  await fs.writeJson(
    destination,
    extensionBundles.sort((a, b) => {
      if (!a.name) {
        return 1;
      }
      if (!b.name) {
        return -1;
      }
      return a.name.localeCompare(b.name);
    })
  );

  format([destination]);

  logLocalDev(green('SUCCESS:'), 'Wrote', cyan(path.basename(destination)));
}

/**
 * @typedef {{
 *   bundleConfig: Object,
 *   modified: !Array<string>,
 *   created: !Array<string>,
 * }}
 */
let MakeExtensionResultDef;

/**
 * @param {Array<string>} templateDirs
 * @param {string=} destinationDir
 * @param {{
 *   version: (string|undefined),
 *   bento: (boolean|undefined),
 *   name: (string|undefined),
 * }} options
 * @return {Promise<?MakeExtensionResultDef>}
 */
async function makeExtensionFromTemplates(
  templateDirs,
  destinationDir = '.',
  options = argv
) {
  const version = (
    options.version || (options.bento ? '1.0' : '0.1')
  ).toString();
  const name = (options.name || '').replace(/^amp-/, '');
  if (!name) {
    log(red('ERROR:'), 'Must specify component name with', cyan('--name'));
    return null;
  }

  const namePascalCase = dashToPascalCase(name);

  const replacements = {
    '__current_year__': `${new Date().getFullYear()}`,
    '__component_version__': version,
    '__component_version_snakecase__': version.replace(/\./g, '_'),
    '__component_name_hyphenated__': name,
    '__component_name_hyphenated_capitalized__': name.toUpperCase(),
    '__component_name_pascalcase__': namePascalCase,
    ...(!options.nocss
      ? {
          '__jss_import_component_css__': `import {CSS as COMPONENT_CSS} from './component.jss'`,
          '__jss_component_css__': 'COMPONENT_CSS',
          '__jss_import_use_styles__': `import {useStyles} from './component.jss'`,
          '__jss_styles_use_styles__': 'const styles = useStyles()',
          '__jss_styles_example_or_placeholder__':
            '`${styles.exampleContentHidden}`',
          '__css_import__': `import {CSS} from '../../../build/amp-${name}-${version}.css'`,
          '__css_id__': `CSS`,
          '__register_element_args__': `TAG, Amp${namePascalCase}, CSS`,
        }
      : {
          '__jss_import_component_css_': '',
          '__jss_component_css__': 'null',
          '__jss_import_use_styles__': '',
          '__jss_styles_use_styles__': '',
          '__jss_styles_example_or_placeholder__': `'my-classname'`,
          '__css_import__': '',
          '__css_id__': '',
          '__register_element_args__': `TAG, Amp${namePascalCase}`,
        }),
    // eslint-disable-next-line local/no-forbidden-terms
    // This allows generated code to contain "DO NOT SUBMIT", which will cause
    // PRs to fail CI if example code isn't removed from the PR. We can't
    // actually write that out, here or in templates, without CI failing.
    // eslint-disable-next-line local/no-forbidden-terms
    '__do_not_submit__': 'DO NOT SUBMIT',
    // A rule on OWNERS assigns all filenames starting with "/validator-*" to
    // belong to wg-caching. We don't require this group to review these
    // template files, so using the __validator__ placeholder helps us exclude
    // them from ownership.
    '__validator__': 'validator',
  };

  const created = (
    await Promise.all(
      templateDirs.map((templateDirs) =>
        writeFromTemplateDir(templateDirs, replacements, destinationDir)
      )
    )
  ).flat();

  if (created.length > 0) {
    format(created);
  }

  const bundleConfig = {
    name: `amp-${name}`,
    version,
  };

  if (!options.nocss) {
    bundleConfig.options = {hasCss: true};
  }

  await insertExtensionBundlesConfig(
    bundleConfig,
    path.join(destinationDir, extensionBundlesJson)
  );

  const findCreatedByRegex = (regex) => {
    const filenames = created.filter((filename) => regex.test(filename));
    return filenames.length < 1 ? null : filenames;
  };

  const blurb = [
    `${green('FINISHED:')} Created extension ${cyan(`<amp-${name}>`)}`,
    `Boilerplate for your new component has been created in:
    ${cyan(`extensions/amp-${name}/`)}`,
  ];

  const unitTestFiles = findCreatedByRegex(new RegExp('test/test-'));
  if (unitTestFiles) {
    blurb.push(`You can run tests on your new component with the following command:
    ${cyan(`amp unit --files="${unitTestFiles.join(',')}"`)}`);
  }

  if (findCreatedByRegex(new RegExp('/storybook/'))) {
    blurb.push(`You may view the component during development in storybook:
    ${cyan(`amp storybook`)}`);
  }

  if (findCreatedByRegex(new RegExp('/validator-(.+)\\.html$'))) {
    blurb.push(`You should generate accompanying validator test result files by running:
    ${cyan(`amp validator --update_tests`)}`);
  }

  logLocalDev(`${blurb.join('\n\n')}\n`);

  return {
    bundleConfig,
    created,
    modified: [extensionBundlesJson],
  };
}

/**
 * @param {function(...*):?{modified: ?Array<string>, created: ?Array<string>}} fn
 * @return {Promise}
 */
async function affectsWorkingTree(fn) {
  const stashStdout = getStdout(`git stash push --keep-index`);

  const {modified, created} = (await fn()) || {};

  if (created) {
    await del(created);
  }

  if (modified) {
    const head = getStdout('git rev-parse HEAD').trim();
    getOutput(`git checkout ${head} ${modified.join(' ')}`);
  }

  if (!stashStdout.startsWith('No local changes')) {
    getOutput('git stash pop');
  }
}

/**
 * Builds and tests a generated extension.
 * (Unit tests for the generator are located in test/test.js)
 * @param {string} name
 * @return {!Promise{?string}} stderr or null if passing
 */
async function runExtensionTests(name) {
  for (const command of [
    `amp build --extensions=${name} --core_runtime_only`,
    `amp unit --nohelp --headless --files="extensions/${name}/**/test/test-*.js" --report`,
  ]) {
    log('Running', cyan(command) + '...');
    const result = getOutput(command);
    if (result.status !== 0) {
      return result.stderr || result.stdout;
    }
  }
  const report = await fs.readJson('result-reports/unit.json');
  if (!report.summary.success) {
    return `Zero tests succeeded\n${JSON.stringify(
      report,
      /* replacer */ undefined,
      /* space */ 2
    )}`;
  }
  return null;
}

/**
 * @return {Promise<void>}
 */
async function makeExtension() {
  let testError;

  const {bento, nocss} = argv;

  const templateDirs = objstr({
    shared: true,
    bento,
    classic: !bento,
    css: !nocss,
    jss: bento && !nocss,
  })
    .split(/\s+/)
    .map((name) => getTemplateDir(name));

  const withCleanup = argv.cleanup ? affectsWorkingTree : (fn) => fn();
  await withCleanup(async () => {
    const result = await makeExtensionFromTemplates(templateDirs);
    if (!result) {
      const warningOrError = 'Could not write extension files.';
      if (argv.test) {
        testError = warningOrError;
      } else {
        log(yellow('WARNING:'), warningOrError);
      }
      return null;
    }
    const {bundleConfig, created, modified} = result;
    if (argv.test) {
      testError = await runExtensionTests(bundleConfig.name);
    }
    return {created, modified};
  });

  if (testError) {
    logWithoutTimestamp(testError);
    throw new Error(
      [
        'Failed testing generated extension',
        yellow('⤷ Try updating the template files located in:'),
        ...templateDirs.map((dir) => '\t' + dir),
        '',
      ].join('\n')
    );
  }
}

module.exports = {
  insertExtensionBundlesConfig,
  makeExtension,
  makeExtensionFromTemplates,
  writeFromTemplateDir,
};

makeExtension.description = 'Create an extension skeleton';
makeExtension.flags = {
  name: 'The name of the extension. Preferably prefixed with `amp-*`',
  cleanup: 'Undo file changes before exiting. This is useful alongside --test',
  bento: 'Generate a Bento component',
  nocss: 'Exclude extension-specific CSS',
  test: 'Build and test the generated extension',
  version: 'Sets the version number (default: 0.1; or 1.0 with --bento)',
  overwrite:
    'Overwrites existing files at the destination, if present. Otherwise skips them',
};
