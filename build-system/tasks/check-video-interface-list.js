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
const argv = require('minimist')(process.argv.slice(2));
const globby = require('globby');
const tempy = require('tempy');
const {bold, blue, yellow} = require('kleur/colors');
const {getStdout} = require('../common/process');
const {log, logWithoutTimestamp} = require('../common/logging');
const {readFile, writeFile} = require('fs-extra');

/** Checks or updates 3rd party video player list on this Markdown file. */
const filepath = 'spec/amp-video-interface.md';

/** Excludes these extensions since they're on a separate list. */
const excludeGeneric = ['amp-video', 'amp-video-iframe'];

/** Determines whether a file belongs to an extension that should be listed. */
const grepJsContent = '@implements {.*VideoInterface}';

/** Finds extension files here. */
const grepJsFiles = 'extensions/**/*.js';

/**
 * Returns a formatted list entry.
 * @param {string} name
 * @return {name}
 */
const entry = (name) =>
  `-   [${name}](https://amp.dev/documentation/components/${name})\n`;

/**
 * Generates Markdown list by finding matching extensions.
 * @return {string}
 */
const generateList = () =>
  getStdout(
    ['grep -lr', `"${grepJsContent}"`, ...globby.sync(grepJsFiles)].join(' ')
  )
    .trim()
    .split('\n')
    .reduce((list, path) => {
      const name = path.substr('extensions/'.length).split('/').shift();
      return list + (excludeGeneric.includes(name) ? '' : entry(name));
    }, '');

/**
 * Returns a RegExp that matches the existing list.
 * @return {RegExp}
 */
const getListRegExp = () =>
  new RegExp(
    `(${entry('NAME')
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\NAME/g, `((?!${excludeGeneric.join('|')})[a-z0-9-]+)`)})+`,
    'gim'
  );

/**
 * Diffs an existing file with content that might replace it.
 * @param {string} filepath
 * @param {string} content
 * @return {!Promise<string>}
 */
const diffTentative = (filepath, content) =>
  tempy.write.task(content, (temporary) =>
    getStdout(
      `git -c color.ui=always diff -U1 ${filepath} ${temporary}`
    ).replace(new RegExp(temporary, 'g'), `/${filepath}`)
  );

/**
 * Checks or updates 3rd party video player list.
 */
async function checkVideoInterfaceList() {
  const content = await readFile(filepath, 'utf-8');
  const output = content.replace(getListRegExp(), generateList());

  if (output === content) {
    return;
  }

  log(
    bold(
      argv.write
        ? blue(`Writing to ${filepath}:`)
        : yellow(`${filepath} requires changes:`)
    )
  );

  logWithoutTimestamp(await diffTentative(filepath, output));

  if (!argv.write) {
    throw new Error(
      `You should apply these changes by running:\n\tgulp check-video-interface-list --write\n`
    );
  }

  await writeFile(filepath, output);
}

module.exports = {
  checkVideoInterfaceList,
};

checkVideoInterfaceList.description = `Checks or updates 3rd party video player list on ${filepath}`;

checkVideoInterfaceList.flags = {
  'write': '  Write to file',
};
