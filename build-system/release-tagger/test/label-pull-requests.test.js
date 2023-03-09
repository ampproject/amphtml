const test = require('ava');
const sinon = require('sinon');
const {addLabels, removeLabels} = require('../label-pull-requests');

test.beforeEach((t) => {
  t.context.octokitRest = {
    rest: {
      issues: {
        getLabel: sinon.stub(),
      },
      repos: {
        compareCommits: sinon.stub(),
        getReleaseByTag: sinon.stub(),
      },
    },
    hook: {
      error: sinon.stub(),
    },
  };

  t.context.octokitGraphQl = sinon.stub();
});

test('label', async (t) => {
  t.context.octokitRest.rest.issues.getLabel.resolves({
    data: {
      'node_id': 1,
    },
  });
  t.context.octokitRest.rest.repos.getReleaseByTag
    .onFirstCall()
    .resolves({
      data: {
        id: 2,
        'target_commitish': '3abcdef',
      },
    })
    .onSecondCall()
    .resolves({
      data: {
        id: 1,
        'target_commitish': '1abcdef',
      },
    });
  t.context.octokitRest.rest.repos.compareCommits.resolves({
    data: {commits: [{sha: '1abcdef'}, {sha: '2abcdef'}, {sha: '3abcdef'}]},
  });

  t.context.octokitGraphQl.resolves({
    pr0: {
      nodes: [
        {
          id: 'MDEx01',
          title: 'Bunch of changes',
          number: 1,
          url: 'https://github.com/ampproject/amphtml/pull/1',
          author: {login: 'testauthor'},
          mergeCommit: {
            commitUrl: 'https://github.com/ampproject/amphtml/commit/1abcdef',
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
            commitUrl: 'https://github.com/ampproject/amphtml/commit/2abcdef',
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
            commitUrl: 'https://github.com/ampproject/amphtml/commit/3abcdef',
            oid: '3abcdef',
            abbreviatedOid: '3abc',
          },
        },
      ],
    },
  });

  await addLabels(
    '2107280123000',
    '2107210123000',
    'stable',
    t.context.octokitRest,
    t.context.octokitGraphQl
  );

  t.true(
    t.context.octokitGraphQl.calledWith({
      query:
        'query {pr0: search(query:"repo:ampproject/amphtml sha:1abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}} pr1: search(query:"repo:ampproject/amphtml sha:2abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}} pr2: search(query:"repo:ampproject/amphtml sha:3abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}}}',
    })
  );
  t.true(
    t.context.octokitGraphQl.calledWith({
      query:
        'mutation {pr0: addLabelsToLabelable(input:{labelIds:"1", labelableId:"MDEx01", clientMutationId:"MDEx01"}){clientMutationId} pr1: addLabelsToLabelable(input:{labelIds:"1", labelableId:"MDEx02", clientMutationId:"MDEx02"}){clientMutationId} pr2: addLabelsToLabelable(input:{labelIds:"1", labelableId:"MDEx03", clientMutationId:"MDEx03"}){clientMutationId}}',
    })
  );
});

test('unlabel', async (t) => {
  t.context.octokitRest.rest.issues.getLabel.resolves({
    data: {
      'node_id': 1,
    },
  });
  t.context.octokitRest.rest.repos.getReleaseByTag
    .onFirstCall()
    .resolves({
      data: {
        id: 2,
        'target_commitish': '3abcdef',
      },
    })
    .onSecondCall()
    .resolves({
      data: {
        id: 1,
        'target_commitish': '1abcdef',
      },
    });
  t.context.octokitRest.rest.repos.compareCommits.resolves({
    data: {commits: [{sha: '1abcdef'}, {sha: '2abcdef'}, {sha: '3abcdef'}]},
  });

  t.context.octokitGraphQl.resolves({
    pr0: {
      nodes: [
        {
          id: 'MDEx01',
          title: 'Bunch of changes',
          number: 1,
          url: 'https://github.com/ampproject/amphtml/pull/1',
          author: {login: 'testauthor'},
          mergeCommit: {
            commitUrl: 'https://github.com/ampproject/amphtml/commit/1abcdef',
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
            commitUrl: 'https://github.com/ampproject/amphtml/commit/2abcdef',
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
            commitUrl: 'https://github.com/ampproject/amphtml/commit/3abcdef',
            oid: '3abcdef',
            abbreviatedOid: '3abc',
          },
        },
      ],
    },
  });

  await removeLabels(
    '2107280123000',
    '2107210123000',
    'beta-percent',
    t.context.octokitRest,
    t.context.octokitGraphQl
  );

  t.true(
    t.context.octokitGraphQl.calledWith({
      query:
        'query {pr0: search(query:"repo:ampproject/amphtml sha:1abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}} pr1: search(query:"repo:ampproject/amphtml sha:2abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}} pr2: search(query:"repo:ampproject/amphtml sha:3abcdef", type:ISSUE first:100){nodes { ... on PullRequest { id title number url author { login } files(first:100) { nodes { path }} mergeCommit { commitUrl oid abbreviatedOid }}}}}',
    })
  );
  t.true(
    t.context.octokitGraphQl.calledWith({
      query:
        'mutation {pr0: removeLabelsFromLabelable(input:{labelIds:"1", labelableId:"MDEx01", clientMutationId:"MDEx01"}){clientMutationId} pr1: removeLabelsFromLabelable(input:{labelIds:"1", labelableId:"MDEx02", clientMutationId:"MDEx02"}){clientMutationId} pr2: removeLabelsFromLabelable(input:{labelIds:"1", labelableId:"MDEx03", clientMutationId:"MDEx03"}){clientMutationId}}',
    })
  );
});
