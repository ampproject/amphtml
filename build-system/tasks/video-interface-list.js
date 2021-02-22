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
const fastGlob = require('fast-glob');
const log = require('fancy-log');
const tempy = require('tempy');
const {basename} = require('path');
const {getStdout} = require('../common/process');
const {green, red} = require('kleur/colors');
const {readFileSync, writeFileSync} = require('fs-extra');

const TASK = 'video-interface-list';

const filepath = 'spec/amp-video-interface.md';

const excludeGeneric = ['amp-video', 'amp-video-iframe'];

// File should have a section containing only entries.
// - [amp-whatever](https://amp.dev/documentation/components/amp-whatever)
const entry = (name) =>
  `-   [${name}](https://amp.dev/documentation/components/${name})`;

const find = () =>
  getStdout(
    [
      'grep -lr',
      '"@implements {.*VideoInterface}"',
      ...fastGlob.sync('extensions/**/*.js'),
    ].join(' ')
  )
    .trim()
    .split('\n')
    .map((path) => path.substr('extensions/'.length).split('/').shift())
    .filter((name) => !excludeGeneric.includes(name));

function getSectionRange(content) {
  const entryRegExp = new RegExp(
    entry('$NAME')
      .replace(/[\[\]\(\)]/g, (c) => `\\${c}`)
      .replace(/\$NAME/g, '([a-z0-9-]+)') + '[\ns]+',
    'gim'
  );

  let match;
  let sectionStart = -1;
  let sectionEnd = 0;
  while ((match = entryRegExp.exec(content)) !== null) {
    const [line, name] = match;
    const {index} = match;
    if (excludeGeneric.includes(name)) {
      continue;
    }
    if (sectionStart < 0) {
      sectionStart = index;
      sectionEnd = index;
    }
    if (sectionEnd < index) {
      break;
    }
    sectionEnd += line.length;
  }
  return [sectionStart, sectionEnd];
}

function expected(content) {
  const [sectionStart, sectionEnd] = getSectionRange(content);
  return (
    content.substr(0, sectionStart) +
    find().map(entry).join('\n') +
    '\n\n' +
    content.substr(sectionEnd)
  );
}

async function videoInterfaceList() {
  const content = readFileSync(filepath).toString();
  const output = expected(content);

  if (output !== content) {
    const temporary = tempy.file({name: basename(filepath)});

    writeFileSync(temporary, output);

    const diff = getStdout(`diff -u ${filepath} ${temporary}`)
      // we don't want to output the ugly temporary name
      .replace(temporary, filepath);

    log(
      (argv.write
        ? green(`Wrote ${filepath}:`)
        : red(`${filepath} requires changes:`)) +
        '\n' +
        diff
    );

    if (!argv.write) {
      throw new Error(`You should update this file:\n\tgulp ${TASK} --write\n`);
    }

    writeFileSync(filepath, output);
  }
}

module.exports = {
  [TASK]: videoInterfaceList,
};

videoInterfaceList.description = `Check or update list on ${filepath}`;

videoInterfaceList.flags = {
  'write': 'Write to file',
};
