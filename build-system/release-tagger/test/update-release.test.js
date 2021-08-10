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

const nock = require('nock');
const test = require('ava');
const {main: updateRelease} = require('../update-release');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('publish', async (t) => {
  const scope = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107210123000')
    .reply(200, {id: 1})

    // https://docs.github.com/en/rest/reference/repos#update-a-release
    .patch('/repos/ampproject/amphtml/releases/1', {prerelease: false})
    .reply(200, {id: 1});

  await updateRelease('2107210123000', 'publish');
  t.true(scope.isDone());
});

test('rollback', async (t) => {
  const scope = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107210123000')
    .reply(200, {
      id: 1,
      body: 'This is a test release body',
    })

    // https://docs.github.com/en/rest/reference/repos#update-a-release
    .patch('/repos/ampproject/amphtml/releases/1', {
      prerelease: true,
      body: '#### :back: This release was rolled back.\nThis is a test release body',
    })
    .reply(200, {id: 1});

  await updateRelease('2107210123000', 'rollback');
  t.true(scope.isDone());
});
