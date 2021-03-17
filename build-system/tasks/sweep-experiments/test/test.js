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
const tempy = require('tempy');
const test = require('ava').default;
const {findConfigBitCommitsForTesting: findConfigBitCommits} = require('..');
const {writeFile, ensureFile} = require('fs-extra');
const {exec} = require('../../../common/exec');

async function writeDir(dir, files) {
  for (const filename in files) {
    const fullpath = `${dir}/${filename}`;
    await ensureFile(fullpath);
    await writeFile(fullpath, files[filename]);
  }
  return files;
}

const gitInit = (cwd) =>
  exec(
    [
      'git init',
      'git config user.name "John Doe"',
      'git config user.email johndoe@example.com',
    ].join(' && '),
    {cwd}
  );

test('findConfigBitCommits: one', (t) =>
  tempy.directory.task(async (dir) => {
    gitInit(dir);

    await writeDir(dir, {
      'prod-config.json': JSON.stringify(
        {
          'foo': 0,
          'foobar': 1,
          'foobarbaz': 0,
        },
        null,
        2
      ),
    });

    exec('git add .', {cwd: dir});
    exec('git commit --date=1998-01-01 -m "Start"', {cwd: dir});

    const cutoffDateFormatted = new Date().toISOString();

    const result = findConfigBitCommits(
      cutoffDateFormatted,
      'prod-config.json',
      'foobar',
      1,
      dir
    );

    t.is(result.length, 1);

    const [{authorDate, hash, subject}] = result;

    t.regex(authorDate, /^1998-01-01T/);
    t.regex(hash, /^[a-z0-9]+$/i);
    t.is(subject, 'Start');
  }));

test('findConfigBitCommits: none', (t) =>
  tempy.directory.task(async (dir) => {
    gitInit(dir);

    await writeDir(dir, {
      'prod-config.json': JSON.stringify(
        {
          'foo': 0,
          'foobarbaz': 0,
        },
        null,
        2
      ),
    });

    exec('git add .', {cwd: dir});
    exec('git commit -m --date=1999-01-01 "Start"', {cwd: dir});

    const cutoffDateFormatted = new Date('2000-01-01').toISOString();

    await writeDir(dir, {
      'prod-config.json': JSON.stringify(
        {
          'foo': 0,
          'foobar': 1,
          'foobarbaz': 0,
        },
        null,
        2
      ),
    });

    exec('git add .', {cwd: dir});
    exec(`git commit -m "This change should not be returned"`, {cwd: dir});

    const result = findConfigBitCommits(
      cutoffDateFormatted,
      'prod-config.json',
      'foobar',
      1,
      dir
    );

    t.is(result.length, 0);
  }));

test('findConfigBitCommits: re-formats issue number on subject', (t) =>
  tempy.directory.task(async (dir) => {
    gitInit(dir);

    await writeDir(dir, {
      'prod-config.json': JSON.stringify(
        {
          'foo': 0,
          'foobar': 1,
          'foobarbaz': 0,
        },
        null,
        2
      ),
    });

    exec('git add .', {cwd: dir});
    exec('git commit --date=1998-01-01 -m "#123 foo #45682"', {cwd: dir});

    const cutoffDateFormatted = new Date().toISOString();

    const result = findConfigBitCommits(
      cutoffDateFormatted,
      'prod-config.json',
      'foobar',
      1,
      dir
    );

    t.is(result.length, 1);

    const [{subject}] = result;

    t.is(subject, 'https://go.amp.dev/issue/123 foo https://go.amp.dev/issue/45682');
  }));
