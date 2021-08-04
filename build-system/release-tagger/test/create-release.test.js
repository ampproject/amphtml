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
const {main: createRelease} = require('../create-release');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('create', async (t) => {
  const pr1 =
    '<a href="https://github.com/ampproject/amphtml/commit/1abcdef">' +
    '<code>1abc</code></a> Bunch of changes ' +
    '(<a href="https://github.com/ampproject/amphtml/pull/1">#1</a>)';
  const pr2 =
    '<a href="https://github.com/ampproject/amphtml/commit/2abcdef">' +
    '<code>2abc</code></a> `README` updates ' +
    '(<a href="https://github.com/ampproject/amphtml/pull/2">#2</a>)';
  const pr3 =
    '<a href="https://github.com/ampproject/amphtml/commit/3abcdef">' +
    '<code>3abc</code></a> Update packages ' +
    '(<a href="https://github.com/ampproject/amphtml/pull/3">#3</a>)';

  const rest = nock('https://api.github.com')
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
    })
    // https://docs.github.com/en/rest/reference/repos#create-a-release
    .post('/repos/ampproject/amphtml/releases', {
      name: '2107280123000',
      'tag_name': '2107280123000',
      'target_commitish': '3abcdef',
      prerelease: true,
      body:
        '#### *Baseline release: [2107210123000]' +
        '(https://github.com/ampproject/amphtml/releases/2107210123000)*\n\n' +
        '#### Raw notes\n' +
        `${pr1}\n${pr2}\n${pr3}\n\n` +
        '#### Breakdown by component\n' +
        `<details><summary>ads (1)</summary>${pr1}</details>` +
        `<details><summary>amp-bind (1)</summary>${pr1}</details>` +
        `<details><summary>build-system (1)</summary>${pr2}</details>` +
        `<details><summary>package updates (1)</summary>${pr3}</details>` +
        `<details><summary>src (1)</summary>${pr1}</details>` +
        `<details><summary>third_party (2)</summary>${pr1}<br />${pr2}</details>` +
        `<details><summary>validator (1)</summary>${pr1}</details>`,
    })
    .reply(200, {});

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
              id: 'MDExOlB1bGxSZXF1ZXN0Mjk4OTg2MDI4',
              title: 'Bunch of changes',
              number: 1,
              url: 'https://github.com/ampproject/amphtml/pull/1',
              author: {login: 'testauthor'},
              files: {
                nodes: [
                  {
                    'path': 'ads/readme.md',
                  },
                  {
                    'path': 'extensions/amp-bind/readme.md',
                  },
                  {
                    'path': 'src/readme.md',
                  },
                  {
                    'path': 'third_party/tasks/e2e/readme.md',
                  },
                  {
                    'path': 'validator/readme.md',
                  },
                ],
              },
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
              id: 'MDExOlB1bGxSZXF1ZXN0MzAyMTU2MjIy',
              title: '`README` updates',
              number: 2,
              url: 'https://github.com/ampproject/amphtml/pull/2',
              author: {login: 'testauthor'},
              files: {
                nodes: [
                  {
                    'path': 'build-system/tasks/e2e/readme.md',
                  },
                  {
                    'path': 'third_party/tasks/e2e/readme.md',
                  },
                ],
              },
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
              id: 'MDExOlB1bGxSZXF1ZXN0MzAyMTU4NDIw',
              title: 'Update packages',
              number: 3,
              url: 'https://github.com/ampproject/amphtml/pull/3',
              author: {login: 'renovate-bot'},
              files: {
                nodes: [
                  {
                    'path': 'extensions/amp-bind/readme.md',
                  },
                  {
                    'path': 'extensions/amp-story/readme.md',
                  },
                ],
              },
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
    });

  await createRelease('2107280123000', '2107210123000');
  t.true(rest.isDone());
  t.true(graphql.isDone());
});
