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

const BBPromise = require('bluebird');
const colors = require('ansi-colors');
const exec = require('child_process').execSync;
const fs = BBPromise.promisifyAll(require('fs-extra'));
const log = require('fancy-log');
const m = require('./');
const test = require('ava');

test('sync - build out correct CODEOWNERS', t => {
  const owners = {
    '*': [
      'username1',
      '@username2',
      {'ampproject/group': ['*.protoascii']},
    ],
    ads: ['username3', '@username1'],
    'some/deeply/nested/dir': ['username5', {'ampproject/group2': ['some.js']}],
  };
  t.plan(1);
  const result = m.buildCodeownersFile(owners);
  const expected = `* @username1 @username2
*.protoascii @ampproject/group
ads/ @username3 @username1
some/deeply/nested/dir/ @username5
some/deeply/nested/dir/some.js @ampproject/group2
`;
  t.is(expected, result);
});

// TODO(erwinm, #11042): remove skip when we need to enforce sync
test.skip('CODEOWNERS must be in sync with OWNERS.yaml', t => {
  t.plan(1);
  const tmppath = '/tmp/amphtml/CODEOWNERS';
  fs.ensureDirSync('/tmp/amphtml');
  // Run through exec instead of directly invoking `generate` through
  // the module import since this changes the `process.cwd` to be
  // ../gen-codeowners
  exec(`gulp gen-codeowners --target ${tmppath}`);
  const realFile = fs.readFileSync(`${process.cwd()}/../../../CODEOWNERS`);
  const testFile = fs.readFileSync(tmppath);
  const isInSync = testFile.toString() === realFile.toString();
  t.true(isInSync,
      'CODEOWNERS is out of sync. Please re-generate CODEOWNERS by ' +
      'running `gulp gen-codeowners`');
  if (!isInSync) {
    log(colors.red('CODEOWNERS is out of sync. Please re-generate ' +
        'CODEOWNERS by running `gulp gen-codeowners`'));
  }
  fs.removeSync(tmppath);
});
