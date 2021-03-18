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
const globby = require('globby');
const {getStdout} = require('../common/process');
const {readFile} = require('fs-extra');
const {writeDiffOrFail} = require('../common/diff');

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
 * @return {string}
 */
const entry = (name) =>
  `-   [${name}](https://amp.dev/documentation/components/${name}.md)\n`;

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
      const name = path.substr('extensions/'.length).split('/').shift() ?? '';
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
 * Checks or updates 3rd party video player list.
 */
async function checkVideoInterfaceList() {
  const current = await readFile(filepath, 'utf-8');
  const tentative = current.replace(getListRegExp(), generateList());
  if (current !== tentative) {
    await writeDiffOrFail('check-video-interface-list', filepath, tentative);
  }
}

module.exports = {
  checkVideoInterfaceList,
};

checkVideoInterfaceList.description = `Checks or updates 3rd party video player list on ${filepath}`;

checkVideoInterfaceList.flags = {
  'fix': 'Write to file',
};
