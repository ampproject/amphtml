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
const {createReleaseFunction} = require('../create-release');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('create', async (t) => {
  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107280123000')
    .reply(200, {
      id: 2,
      'target_commitish': 'abcde3',
    })
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107210123000')
    .reply(200, {
      id: 1,
      'target_commitish': 'abcde1',
    })
    // https://docs.github.com/en/rest/reference/repos#compare-two-commits
    .get('/repos/ampproject/amphtml/compare/abcde1...abcde3')
    .reply(200, {
      commits: [{sha: 'abcde1'}, {sha: 'abcde2'}, {sha: 'abcde3'}],
    })
    // https://docs.github.com/en/rest/reference/repos#create-a-release
    .post('/repos/ampproject/amphtml/releases', {
      name: '2107280123000',
      'tag_name': '2107280123000',
      'target_commitish': 'abcde3',
      body: '',
      prerelease: true,
    })
    .reply(200, {});

  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'pr0: search(query:\\"repo:ampproject/amphtml sha:abcde1\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr1: search(query:\\"repo:ampproject/amphtml sha:abcde2\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr2: search(query:\\"repo:ampproject/amphtml sha:abcde3\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}}}"}'
    )
    .reply(200, {data: {pr0: 'todo', pr1: 'todo', pr2: 'todo'}});

  await createReleaseFunction('2107280123000', '2107210123000');
  t.true(rest.isDone());
  t.true(graphql.isDone());
});
