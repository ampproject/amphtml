const nock = require('nock');
const test = require('ava');
const {getExtensions} = require('../../npm-publish/utils');
const {makeRelease} = require('../make-release');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('create', async (t) => {
  const pr1 =
    '<a href="https://github.com/ampproject/amphtml/commit/1abcdef">' +
    '<code>1abc</code></a> - Bunch of changes';
  const pr2 =
    '<a href="https://github.com/ampproject/amphtml/commit/2abcdef">' +
    '<code>2abc</code></a> - `README` updates';
  const pr3 =
    '<a href="https://github.com/ampproject/amphtml/commit/3abcdef">' +
    '<code>3abc</code></a> - Update packages';

  const packages = getExtensions().map((e) => e.extension);

  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/git#get-a-reference
    .get('/repos/ampproject/amphtml/git/ref/tags%2F2107280123000')
    .reply(200, {
      id: 2,
      object: {sha: '3abcdef'},
    })
    // https://docs.github.com/en/rest/reference/git#get-a-reference
    .get('/repos/ampproject/amphtml/git/ref/tags%2F2107210123000')
    .reply(200, {
      id: 1,
      object: {sha: '1abcdef'},
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
        '<h2>Changelog</h2>\n<p>\n' +
        '<a href="https://github.com/ampproject/amphtml/compare/' +
        '2107210123000...2107280123000">\n' +
        '<code>2107210123000...2107280123000</code>\n</a>\n</p>\n\n' +
        '<h2>npm packages @ 1.2107280123.0</h2>\n\n\n' +
        `<b>Packages not changed:</b> <i>${packages.join(', ')}</i>\n\n` +
        '<h2>Changes by component</h2>\n' +
        `<details><summary>ads (1)</summary>${pr1}</details>` +
        `<details><summary>amp-test1 (1)</summary>${pr1}</details>` +
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
                    'path': 'extensions/amp-test1/readme.md',
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
                    'path': 'extensions/amp-test1/readme.md',
                  },
                  {
                    'path': 'extensions/amp-test2/readme.md',
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

  await makeRelease('2107280123000', '2107210123000', 'beta-percent');
  t.true(rest.isDone());
  t.true(graphql.isDone());
});

test('cherry-pick', async (t) => {
  const pr1 =
    '<a href="https://github.com/ampproject/amphtml/commit/2abcdef">' +
    '<code>2abc</code></a> - Cherry pick fix';

  const packages = getExtensions().map((e) => e.extension);

  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/git#get-a-reference
    .get('/repos/ampproject/amphtml/git/ref/tags%2F2107280123001')
    .reply(200, {
      id: 2,
      object: {sha: '2abcdef'},
    })
    // https://docs.github.com/en/rest/reference/git#get-a-reference
    .get('/repos/ampproject/amphtml/git/ref/tags%2F2107210123000')
    .reply(200, {
      id: 1,
      object: {sha: '1abcdef'},
    })
    // https://docs.github.com/en/rest/reference/repos#compare-two-commits
    .get('/repos/ampproject/amphtml/compare/1abcdef...2abcdef')
    .reply(200, {
      commits: [{sha: '2abcdef'}],
    })
    // https://docs.github.com/en/rest/reference/repos#create-a-release
    .post('/repos/ampproject/amphtml/releases', {
      name: '2107280123001',
      'tag_name': '2107280123001',
      'target_commitish': '2abcdef',
      prerelease: false,
      body:
        '<h2>🌸 Cherry-picked release 🌸</h2>\n' +
        '<a href="https://github.com/ampproject/amphtml/releases/tag/2107280123000">' +
        '2107280123000</a> was patched and published as <b>2107280123001</b>. ' +
        'Refer to the <a href="https://amp-release-calendar.appspot.com">' +
        'release calendar</a> for additional channel information.\n\n' +
        '<h2>Changelog</h2>\n<p>\n' +
        '<a href="https://github.com/ampproject/amphtml/compare/' +
        '2107210123000...2107280123001">\n' +
        '<code>2107210123000...2107280123001</code>\n</a>\n</p>\n\n' +
        '<h2>npm packages @ 1.2107280123.1</h2>\n\n\n' +
        `<b>Packages not changed:</b> <i>${packages.join(', ')}</i>\n\n` +
        '<h2>Changes by component</h2>\n' +
        '<details><summary>ads (0)</summary></details>' +
        '<details><summary>build-system (0)</summary></details>' +
        '<details><summary>package updates (0)</summary></details>' +
        `<details><summary>src (1)</summary>${pr1}</details>` +
        '<details><summary>third_party (0)</summary></details>' +
        '<details><summary>validator (0)</summary></details>',
    })
    .reply(200, {});

  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'pr0: search(query:\\"repo:ampproject/amphtml sha:2abcdef\\", ' +
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
              title: 'Cherry pick fix',
              number: 2,
              url: 'https://github.com/ampproject/amphtml/pull/2',
              author: {login: 'testauthor'},
              files: {
                nodes: [
                  {
                    'path': 'src/readme.md',
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
      },
    });

  await makeRelease('2107280123001', '2107210123000', 'stable');
  t.true(rest.isDone());
  t.true(graphql.isDone());
});
