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
const {main: labelPullRequests} = require('../label-pull-requests');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('label', async (t) => {
  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/issues#get-a-label
    .get('/repos/ampproject/amphtml/labels/PR%20Use%3A%20In%20Stable')
    .reply(200, {
      'node_id': 1,
    })
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107280123000')
    .reply(200, {
      id: 2,
      'target_commitish': '3abcdef',
    })
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107210123000')
    .reply(200, {
      id: 1,
      'target_commitish': '1abcdef',
    })
    // https://docs.github.com/en/rest/reference/repos#compare-two-commits
    .get('/repos/ampproject/amphtml/compare/1abcdef...3abcdef')
    .reply(200, {
      commits: [{sha: '1abcdef'}, {sha: '2abcdef'}, {sha: '3abcdef'}],
    });

  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'pr0: search(query:\\"repo:ampproject/amphtml sha:1abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr1: search(query:\\"repo:ampproject/amphtml sha:2abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr2: search(query:\\"repo:ampproject/amphtml sha:3abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}}}"}'
    )
    .reply(200, {
      data: {
        pr0: {
          nodes: [
            {
              id: 'MDEx01',
              title: 'Bunch of changes',
              number: 1,
              url: 'https://github.com/ampproject/amphtml/pull/1',
              author: {login: 'testauthor'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/1abcdef',
                oid: '1abcdef',
                abbreviatedOid: '1abc',
              },
            },
          ],
        },
        pr1: {
          nodes: [
            {
              id: 'MDEx02',
              title: '`README` updates',
              number: 2,
              url: 'https://github.com/ampproject/amphtml/pull/2',
              author: {login: 'testauthor'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/2abcdef',
                oid: '2abcdef',
                abbreviatedOid: '2abc',
              },
            },
          ],
        },
        pr2: {
          nodes: [
            {
              id: 'MDEx03',
              title: 'Update packages',
              number: 3,
              url: 'https://github.com/ampproject/amphtml/pull/3',
              author: {login: 'renovate-bot'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/3abcdef',
                oid: '3abcdef',
                abbreviatedOid: '3abc',
              },
            },
          ],
        },
      },
    })
    .post(
      '',
      '{"query":"mutation {' +
        'pr0: addLabelsToLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx01\\", clientMutationId:\\"MDEx01\\"})' +
        '{clientMutationId} ' +
        'pr1: addLabelsToLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx02\\", clientMutationId:\\"MDEx02\\"})' +
        '{clientMutationId} ' +
        'pr2: addLabelsToLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx03\\", clientMutationId:\\"MDEx03\\"})' +
        '{clientMutationId}}"}'
    )
    .reply(200, {data: {}});

  await labelPullRequests('2107280123000', '2107210123000', 'stable');
  t.true(rest.isDone());
  t.true(graphql.isDone());
});

test('unlabel', async (t) => {
  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/issues#get-a-label
    .get(
      '/repos/ampproject/amphtml/labels/PR%20Use%3A%20In%20Beta%20%2F%20Experimental'
    )
    .reply(200, {
      'node_id': 1,
    })
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107280123000')
    .reply(200, {
      id: 2,
      'target_commitish': '3abcdef',
    })
    // https://docs.github.com/en/rest/reference/repos#get-a-release-by-tag-name
    .get('/repos/ampproject/amphtml/releases/tags/2107210123000')
    .reply(200, {
      id: 1,
      'target_commitish': '1abcdef',
    })
    // https://docs.github.com/en/rest/reference/repos#compare-two-commits
    .get('/repos/ampproject/amphtml/compare/1abcdef...3abcdef')
    .reply(200, {
      commits: [{sha: '1abcdef'}, {sha: '2abcdef'}, {sha: '3abcdef'}],
    });

  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'pr0: search(query:\\"repo:ampproject/amphtml sha:1abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr1: search(query:\\"repo:ampproject/amphtml sha:2abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}} ' +
        'pr2: search(query:\\"repo:ampproject/amphtml sha:3abcdef\\", ' +
        'type:ISSUE first:100){nodes { ... on PullRequest { id title number ' +
        'url author { login } files(first:100) { nodes { path }} mergeCommit ' +
        '{ commitUrl oid abbreviatedOid }}}}}"}'
    )
    .reply(200, {
      data: {
        pr0: {
          nodes: [
            {
              id: 'MDEx01',
              title: 'Bunch of changes',
              number: 1,
              url: 'https://github.com/ampproject/amphtml/pull/1',
              author: {login: 'testauthor'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/1abcdef',
                oid: '1abcdef',
                abbreviatedOid: '1abc',
              },
            },
          ],
        },
        pr1: {
          nodes: [
            {
              id: 'MDEx02',
              title: '`README` updates',
              number: 2,
              url: 'https://github.com/ampproject/amphtml/pull/2',
              author: {login: 'testauthor'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/2abcdef',
                oid: '2abcdef',
                abbreviatedOid: '2abc',
              },
            },
          ],
        },
        pr2: {
          nodes: [
            {
              id: 'MDEx03',
              title: 'Update packages',
              number: 3,
              url: 'https://github.com/ampproject/amphtml/pull/3',
              author: {login: 'renovate-bot'},
              mergeCommit: {
                commitUrl:
                  'https://github.com/ampproject/amphtml/commit/3abcdef',
                oid: '3abcdef',
                abbreviatedOid: '3abc',
              },
            },
          ],
        },
      },
    })
    .post(
      '',
      '{"query":"mutation {' +
        'pr0: removeLabelsFromLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx01\\", clientMutationId:\\"MDEx01\\"})' +
        '{clientMutationId} ' +
        'pr1: removeLabelsFromLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx02\\", clientMutationId:\\"MDEx02\\"})' +
        '{clientMutationId} ' +
        'pr2: removeLabelsFromLabelable(input:{labelIds:\\"1\\", ' +
        'labelableId:\\"MDEx03\\", clientMutationId:\\"MDEx03\\"})' +
        '{clientMutationId}}"}'
    )
    .reply(200, {data: {}});

  await labelPullRequests('2107280123000', '2107210123000', 'beta', true);
  t.true(rest.isDone());
  t.true(graphql.isDone());
});
