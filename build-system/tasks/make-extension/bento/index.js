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
 * @fileoverview This file implements the `amp test-report-upload` task, which POSTs test result reports
 * to an API endpoint that stores them in the database.
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs').promises;
const path = require('path');
const {cyan, green, red, yellow} = require('kleur/colors');
const {log} = require('../../../common/logging');

const EXTENSIONS_DIR = path.join(__dirname, '../../../../extensions');
const TEMPLATE_DIR = path.join(__dirname, 'amp-__component_name_hyphenated__');

/**
 * Convert dash-case-name to PascalCaseName.
 * @param {string} name
 * @return {string}
 */
function dashToPascalCase(name) {
  return name.replace(/(?:-|^)([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Create a mutator function from a map of keys/values to replace.
 * @param {Object<string, string>} replaceMap
 * @return {function(string): string}
 */
function makeReplacementFn(replaceMap) {
  return (inputText) =>
    Object.keys(replaceMap).reduce(
      (text, key) => text.replace(new RegExp(key, 'g'), replaceMap[key]),
      inputText
    );
}

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

/**
 * @return {Promise<{
 *   name: string,
 *   version,
 *   options: {hasCss: true},
 * }|void>}
 */
async function makeBentoExtension() {
  const componentName = (argv.name || '').replace(/^amp-/, '');
  const version = argv.version || '1.0';
  if (!componentName) {
    log(red('ERROR:'), 'Must specify component name with', cyan('--name'));
    return;
  }

  const doReplacements = makeReplacementFn({
    '__current_year__': `${new Date().getFullYear()}`,
    '__component_version__': version,
    '__component_version_snakecase__': version.replace(/\./g, '_'),
    '__component_name_hyphenated__': componentName,
    '__component_name_hyphenated_capitalized__': componentName.toUpperCase(),
    '__component_name_pascalcase__': dashToPascalCase(componentName),
    // This allows generated code to contain "DO_NOT_SUBMIT", which will cause
    // PRs to fail CI if example code isn't removed from the PR. We can't
    // actually write that out, here or in templates, without CI failing.
    '__do_not_submit__': 'DO_NOT_SUBMIT'.replace(/_/g, ' '),
  });

  const destinationPath = (templatePath) =>
    doReplacements(
      templatePath.replace(
        TEMPLATE_DIR,
        path.join(EXTENSIONS_DIR, `amp-${componentName}`)
      )
    );

  for await (const templatePath of walkDir(TEMPLATE_DIR)) {
    const destination = destinationPath(templatePath);

    // Skip if the destination file already exists
    try {
      await fs.access(destination);

      if (!argv.overwrite) {
        log(yellow('WARNING:'), 'Skipping existing file', cyan(destination));
        continue;
      }

      log(yellow('WARNING:'), 'Overwriting existing file', cyan(destination));
    } catch {}

    // Check that the directory exists, or create it
    const dirName = path.dirname(destination);
    try {
      await fs.access(dirName);
      // The directory exists
    } catch {
      await fs.mkdir(dirName, {recursive: true});
      log(cyan('INFO:'), 'Creating directory', cyan(dirName));
    }

    const template = (await fs.readFile(templatePath)).toString('utf8');
    await fs.writeFile(destination, doReplacements(template));

    log(green('SUCCESS:'), 'Created file', cyan(destination));
  }

  log(`
========================================
${green('FINISHED:')} Boilerplate for your new ${cyan(
    `amp-${componentName}`
  )} component has been created in ${cyan(
    `amphtml/extensions/amp-${componentName}/`
  )}

You can run tests on your new component with the following command:
    ${cyan(
      `amp unit --files=extensions/amp-${componentName}/1.0/test/test-amp-${componentName}.js`
    )}
If the component was generated successfully, the example test should pass.

You may also view the component during development in storybook:
    ${cyan(`amp storybook`)}`);

  // Return the resulting extension bundle config.
  return {
    name: `amp-${componentName}`,
    version,
    options: {hasCss: true},
  };
}

module.exports = {
  makeBentoExtension,
};
