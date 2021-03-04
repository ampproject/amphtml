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
const test = require('ava');
const {
  collectWork,
  findConfigBitCommits,
  removeFromExperimentsConfig,
  removeFromJsonConfig,
  removeFromRuntimeSource,
  gitCommitSingleExperiment,
  sweepExperimentsForTesting,
} = require('../');
const {
  readFile,
  readJson,
  writeFile,
  readJsonSync,
  ensureFile,
} = require('fs-extra');
const {exec, getStdout} = require('../../../common/exec');

const testTempDir = (name, cb, ava = test) =>
  ava(name, (t) => tempy.directory.task((dir) => cb(t, dir)));

testTempDir.only = (name, cb) => testTempDir(name, cb, test.only);

async function writeDir(dir, files) {
  for (const filename in files) {
    const fullpath = `${dir}/${filename}`;
    await ensureFile(fullpath);
    await writeFile(fullpath, files[filename]);
  }
  return files;
}

testTempDir('removeFromExperimentsConfig', async (t, dir) => {
  const original = `
    export const anything = [
      {
        id: 'foo',
        spec: 'https://github.com/ampproject/amphtml/issues/foo',
        cleanupIssue: 'https://github.com/ampproject/amphtml/issues/foo',
      },
      {
        id: 'bar',
        spec: 'https://github.com/ampproject/amphtml/issues/bar',
        cleanupIssue: 'https://github.com/ampproject/amphtml/issues/bar',
      },
      {
        id: 'baz',
        spec: 'https://github.com/ampproject/amphtml/issues/baz',
        cleanupIssue: 'https://github.com/ampproject/amphtml/issues/baz',
      },
    ];

    foo();`;
  const expectedRemoved = `
    export const anything = [{
      id: 'foo',
      spec: 'https://github.com/ampproject/amphtml/issues/foo',
      cleanupIssue: 'https://github.com/ampproject/amphtml/issues/foo',
    }, {
      id: 'baz',
      spec: 'https://github.com/ampproject/amphtml/issues/baz',
      cleanupIssue: 'https://github.com/ampproject/amphtml/issues/baz',
    }];

    foo();`;
  const shouldRemoveId = 'bar';

  const experimentsConfigPath = `${dir}/experiments-config.js`;
  await writeFile(experimentsConfigPath, original);

  const experimentsRemovedJson = `${dir}/experiments-removed.json`;
  await writeFile(experimentsRemovedJson, '[]');

  const modifiedFiles = removeFromExperimentsConfig(
    shouldRemoveId,
    experimentsRemovedJson,
    experimentsConfigPath
  );

  t.deepEqual(await readJson(experimentsRemovedJson), [
    {
      id: 'bar',
      spec: 'https://github.com/ampproject/amphtml/issues/bar',
      cleanupIssue: 'https://github.com/ampproject/amphtml/issues/bar',
    },
  ]);

  t.deepEqual(modifiedFiles, [experimentsConfigPath]);
  t.is(await readFile(experimentsConfigPath, 'utf-8'), expectedRemoved);
});

testTempDir('removeFromJsonConfig', async (t, dir) => {
  const filename = `${dir}/prod-config.json`;
  const original = {
    'allow-doc-opt-in': ['removed', 'kept'],
    'allow-url-opt-in': ['removed'],
    abc: 1,
    onetwothree: 0,
    removed: 0,
  };
  const expected = {
    'allow-doc-opt-in': ['kept'],
    'allow-url-opt-in': [],
    abc: 1,
    onetwothree: 0,
  };

  const modifiedFiles = removeFromJsonConfig(original, filename, 'removed');
  t.deepEqual(modifiedFiles, [filename]);
  t.deepEqual(await readJsonSync(filename), expected);
});

testTempDir('removeFromRuntimeSource', async (t, dir) => {
  const written = await writeDir(dir, {
    'nothing-to-remove.js': `
      nothingToRemove();
    `,
    'removed-import.js': `
      import {isExperimentOn} from 'foo';
      console.log(isExperimentOn(window, 'remove-pls'));
    `,
    'kept-import.js': `
      import {isExperimentOn} from 'foo';
      isExperimentOn(window, 'remove-pls');
      isExperimentOn(window, 'another-experiment');
    `,
    'removed-toggleExperiment.js': `
      import {toggleExperiment} from 'foo';
      toggleExperiment(window, 'remove-pls');
    `,
    'removed-toggleExperiment-true.js': `
      import {toggleExperiment} from 'foo';
      toggleExperiment(window, 'remove-pls', true);
    `,
    'removed-toggleExperiment-false.js': `
      import {toggleExperiment} from 'foo';
      toggleExperiment(window, 'remove-pls', false);
    `,
  });

  const expected = {
    'nothing-to-remove.js': `
      nothingToRemove();
    `,
    'removed-import.js': `
      console.log(/* isExperimentOn(window, 'remove-pls') // launched: true */
      true);
    `,
    'kept-import.js': `
      import {isExperimentOn} from 'foo';
      /* isExperimentOn(window, 'remove-pls') // launched: true */
      true;
      isExperimentOn(window, 'another-experiment');
    `,
    'removed-toggleExperiment.js': `
      /* toggleExperiment(window, 'remove-pls') // launched: true */
      !true;
    `,
    'removed-toggleExperiment-true.js': '',
    'removed-toggleExperiment-false.js': `
      /* toggleExperiment(window, 'remove-pls', false) // launched: true */
      false;
    `,
  };

  removeFromRuntimeSource('remove-pls', 1.0, [dir]);

  for (const filename in expected) {
    const fullpath = `${dir}/${filename}`;
    t.is(
      (await readFile(fullpath, 'utf-8')).trim(),
      expected[filename].trim(),
      filename
    );
  }

  t.is(Object.keys(written).length, Object.keys(expected).length);
});

const gitInit = (dir) =>
  exec(
    [
      'git init',
      'git config user.name "John Doe"',
      'git config user.email johndoe@example.com',
    ].join(' && '),
    {
      cwd: dir,
    }
  );

testTempDir('gitCommitSingleExperiment', async (t, dir) => {
  gitInit(dir);

  const written = await writeDir(dir, {'foo.js': 'content'});

  gitCommitSingleExperiment(
    'my-experiment',
    {
      percentage: 0.5,
      previousHistory: [
        {
          hash: 'abc123',
          authorDate: '1999-12-31',
          subject: 'Previous subject 1999',
        },
        {
          hash: 'abc123',
          authorDate: '2000-01-01',
          subject: 'Previous subject 2000',
        },
      ],
    },
    Object.keys(written),
    dir
  );

  const expected = new RegExp(
    `^${`
commit\\s+[^\n]+
Author:\\s+John Doe <johndoe@example.com>
Date:\\s+[^\n]+
\\s+\\(1999-12-31, abc123\\) \`my-experiment\`: 0.5
\\s*
\\s+Previous history on prod-config.json:
\\s*
\\s+- abc123 - 1999-12-31 - Previous subject 1999
\\s+- abc123 - 2000-01-01 - Previous subject 2000
`.trim()}
$`,
    'm'
  );

  t.regex(getStdout('git log', {cwd: dir}), expected);
});

testTempDir('findConfigBitCommits', async (t, dir) => {
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

  const {authorDate, hash, subject} = result[0];

  t.regex(authorDate, /^1998-01-01T/);
  t.regex(hash, /^[a-z0-9]+$/i);
  t.is(subject, 'Start');
});

testTempDir('findConfigBitCommits: none', async (t, dir) => {
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
});

testTempDir('collectWork', async (t, dir) => {
  gitInit(dir);

  let prodConfig = {
    'swg-special-excluded': 1,
    'only-on-prod': 0,
    'matching-on': 1,
    'matching-off': 0,
    'not-matching': 0,
  };

  let canaryConfig = {
    'swg-special-excluded': 1,
    'only-on-canary': 0,
    'matching-on': 1,
    'matching-off': 0,
    'not-matching': 1,
  };

  const writeConfig = () =>
    writeDir(dir, {
      'build-system/global-configs/prod-config.json': JSON.stringify(
        prodConfig,
        null,
        2
      ),
      'build-system/global-configs/canary-config.json': JSON.stringify(
        canaryConfig,
        null,
        2
      ),
    });

  await writeConfig();

  exec('git add .', {cwd: dir});
  exec('git commit --date=1998-01-01 -m "Introduce config"', {cwd: dir});

  // TODO(alanorozco): We need to insert at beginning because the commit lookup
  // string includes a trailing space. This is bad, fix.

  prodConfig = {'introduced-later': 1, ...prodConfig};
  canaryConfig = {'introduced-later': 1, ...canaryConfig};

  await writeConfig();

  exec('git add .', {cwd: dir});
  exec('git commit --date=1999-01-01 -m "Add introduced-later"', {cwd: dir});

  const cutoffDateFormatted = new Date().toISOString();

  const result = collectWork(
    prodConfig,
    canaryConfig,
    cutoffDateFormatted,
    /* removeExperiment */ undefined,
    dir
  );

  const {exclude, include} = result;

  t.is(Object.keys(exclude).length, 1);
  t.true('swg-special-excluded' in exclude);
  t.like(exclude['swg-special-excluded'], {percentage: 1});

  t.is(Object.keys(include).length, 3);
  t.like(include['matching-off'], {percentage: 0});
  t.like(include['matching-on'], {percentage: 1});
  t.like(include['introduced-later'], {percentage: 1});

  for (const {previousHistory} of [
    exclude['swg-special-excluded'],
    include['matching-off'],
    include['matching-on'],
  ]) {
    t.is(previousHistory.length, 1);
    const {hash, authorDate, subject} = previousHistory[0];
    t.truthy(hash);
    t.truthy(authorDate);
    t.is(subject, 'Introduce config');
  }

  t.is(include['introduced-later'].previousHistory.length, 1);
  const {hash, authorDate, subject} = include[
    'introduced-later'
  ].previousHistory[0];
  t.truthy(hash);
  t.truthy(authorDate);
  t.is(subject, 'Add introduced-later');
});

testTempDir.only('sweep-experiments', async (t, dir) => {
  t.timeout(999999999); // see below

  gitInit(dir);

  const prodConfig = {
    'allow-doc-opt-in': ['removed'],
    'allow-url-opt-in': ['removed'],
    'removed': 1,
    'not-removed': 0,
  };

  const canaryConfig = {
    'allow-doc-opt-in': ['removed', 'kept'],
    'allow-url-opt-in': ['removed'],
    'removed': 1,
    'not-removed': 1,
    'also-not-removed': 0,
  };

  await writeDir(dir, {
    'build-system/global-configs/prod-config.json': JSON.stringify({}, null, 2),
    'build-system/global-configs/canary-config.json': JSON.stringify(
      {},
      null,
      2
    ),
  });
  exec('git add .', {cwd: dir});
  exec('git commit --date=1998-12-31 -m "empty config"', {cwd: dir});

  await writeDir(dir, {
    'build-system/global-configs/prod-config.json': JSON.stringify(
      prodConfig,
      null,
      2
    ),
    'build-system/global-configs/canary-config.json': JSON.stringify(
      canaryConfig,
      null,
      2
    ),
    'extensions/uses-is-experiment-on.js': `
      import {isExperimentOn} from 'wherever';
      isExperimentOn(window, 'removed');
      isExperimentOn(window, 'not-removed');
    `,
    'test/uses-toggle-experiment.js': `
      import {toggleExperiment} from 'wherever';
      toggleExperiment(window, 'removed', true);
    `,
  });

  exec('git add .', {cwd: dir});
  exec('git commit --date=1999-12-31 -m "code written long ago"', {cwd: dir});

  // const whenDoesThisBreak = new Date();
  // whenDoesThisBreak.setSeconds(whenDoesThisBreak.getSeconds() + 1);

  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });

  t.is(
    getStdout(
      `git log --until=2021-03-01T08:00:00.812Z -S \'"removed": 1,\'  --format="%h %aI %s" ${dir}/build-system/global-configs/prod-config.json`,
      // `git log -S \'"removed": 1,\'  --format="%h %aI %s" ${dir}/build-system/global-configs/prod-config.json`,
      {cwd: dir}
    ),
    'foo'
  );
  // t.is(getStdout('git log', {cwd: dir}), '');

  await sweepExperimentsForTesting(
    {
      'days_ago': -1,
    },
    dir
  );

  t.is(
    await readFile(`${dir}/extensions/uses-is-experiment-on.js`, 'utf-8'),
    ''
  );
});
