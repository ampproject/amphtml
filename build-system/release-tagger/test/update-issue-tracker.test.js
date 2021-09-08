const nock = require('nock');
const test = require('ava');
const {createOrUpdateTracker} = require('../update-issue-tracker');

test.before(() => nock.disableNetConnect());
test.after(() => {
  nock.cleanAll();
  nock.enableNetConnect();
});

test('create', async (t) => {
  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'search(query:\\"repo:ampproject/amphtml ' +
        'in:title Release 2109080123000\\", type: ISSUE, first: 1) ' +
        '{ nodes { ... on Issue { number title body }}}}"}'
    )
    .reply(200, {data: {search: {}}});

  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/issues#create-an-issue
    .post('/repos/ampproject/amphtml/issues', {
      title: '🚄 Release 2109080123000',
      labels: ['Type: Release'],
      body:
        '### AMP Version\n\n[2109080123000]' +
        '(https://github.com/ampproject/amphtml/releases/tag/2109080123000)\n\n' +
        '### Promotions\n\n' +
        '- [x] <!-- tag=2109080123000 channel=beta-opt-in -->' +
        '2109080123000 promoted to Experimental and Beta (opt-in) channels (testtime)\n' +
        '- [ ] <!-- tag=2109080123000 channel=beta-percent -->' +
        '2109080123000 promoted to Experimental and Beta (1% traffic) channels (PROMOTE_TIME)\n' +
        '- [ ] <!-- tag=2109080123000 channel=stable -->' +
        '2109080123000 promoted to Stable channel (PROMOTE_TIME)\n' +
        '- [ ] <!-- tag=2109080123000 channel=lts -->' +
        '(optional) 2109080123000 promoted to LTS channel (PROMOTE_TIME)\n\n' +
        '/cc @ampproject/release-on-duty',
    })
    .reply(201);

  await createOrUpdateTracker(
    '2109080123000',
    '2109010123000',
    'beta-opt-in',
    'testtime'
  );
  t.true(graphql.isDone());
  t.true(rest.isDone());
});

test('mark task complete', async (t) => {
  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'search(query:\\"repo:ampproject/amphtml ' +
        'in:title Release 2109080123000\\", type: ISSUE, first: 1) ' +
        '{ nodes { ... on Issue { number title body }}}}"}'
    )
    .reply(200, {
      data: {
        search: {
          nodes: [
            {
              number: 1,
              title: '🚄 Release 2109080123000',
              body:
                '### AMP Version\n\n[2109080123000]' +
                '(https://github.com/ampproject/amphtml/releases/tag/2109080123000)\n\n' +
                '### Promotions\n\n' +
                '- [x] <!-- tag=2109080123000 channel=beta-opt-in -->' +
                '2109080123000 promoted to Experimental and Beta (opt-in) channels (optintime)\n' +
                '- [ ] <!-- tag=2109080123000 channel=beta-percent -->' +
                '2109080123000 promoted to Experimental and Beta (1% traffic) channels (PROMOTE_TIME)\n' +
                '- [ ] <!-- tag=2109080123000 channel=stable -->' +
                '2109080123000 promoted to Stable channel (PROMOTE_TIME)\n' +
                '- [ ] <!-- tag=2109080123000 channel=lts -->' +
                '(optional) 2109080123000 promoted to LTS channel (PROMOTE_TIME)\n\n' +
                '/cc @ampproject/release-on-duty',
            },
          ],
        },
      },
    });

  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/issues#update-an-issue
    .patch('/repos/ampproject/amphtml/issues/1', {
      title: '🚄 Release 2109080123000',
      body:
        '### AMP Version\n\n[2109080123000]' +
        '(https://github.com/ampproject/amphtml/releases/tag/2109080123000)\n\n' +
        '### Promotions\n\n' +
        '- [x] <!-- tag=2109080123000 channel=beta-opt-in -->' +
        '2109080123000 promoted to Experimental and Beta (opt-in) channels (optintime)\n' +
        '- [x] <!-- tag=2109080123000 channel=beta-percent -->' +
        '2109080123000 promoted to Experimental and Beta (1% traffic) channels (testtime)\n' +
        '- [ ] <!-- tag=2109080123000 channel=stable -->' +
        '2109080123000 promoted to Stable channel (PROMOTE_TIME)\n' +
        '- [ ] <!-- tag=2109080123000 channel=lts -->' +
        '(optional) 2109080123000 promoted to LTS channel (PROMOTE_TIME)\n\n' +
        '/cc @ampproject/release-on-duty',
    })
    .reply(200);

  await createOrUpdateTracker(
    '2109080123000',
    '2109010123000',
    'beta-percent',
    'testtime'
  );
  t.true(graphql.isDone());
  t.true(rest.isDone());
});

test('add cherrypick tasks', async (t) => {
  const graphql = nock('https://api.github.com/graphql')
    .post(
      '',
      '{"query":"query {' +
        'search(query:\\"repo:ampproject/amphtml ' +
        'in:title Release 2109080123000\\", type: ISSUE, first: 1) ' +
        '{ nodes { ... on Issue { number title body }}}}"}'
    )
    .reply(200, {
      data: {
        search: {
          nodes: [
            {
              number: 1,
              title: '🚄 Release 2109080123000',
              body:
                '### AMP Version\n\n[2109080123000]' +
                '(https://github.com/ampproject/amphtml/releases/tag/2109080123000)\n\n' +
                '### Promotions\n\n' +
                '- [x] <!-- tag=2109080123000 channel=beta-opt-in -->' +
                '2109080123000 promoted to Experimental and Beta (opt-in) channels (optintime)\n' +
                '- [x] <!-- tag=2109080123000 channel=beta-percent -->' +
                '2109080123000 promoted to Experimental and Beta (1% traffic) channels (percenttime)\n' +
                '- [x] <!-- tag=2109080123000 channel=stable -->' +
                '2109080123000 promoted to Stable channel (stabletime)\n' +
                '- [ ] <!-- tag=2109080123000 channel=lts -->' +
                '(optional) 2109080123000 promoted to LTS channel (PROMOTE_TIME)\n\n' +
                '/cc @ampproject/release-on-duty',
            },
          ],
        },
      },
    });

  const rest = nock('https://api.github.com')
    // https://docs.github.com/en/rest/reference/issues#update-an-issue
    .patch('/repos/ampproject/amphtml/issues/1', {
      title: '🚄 Release 2109080123001',
      body:
        '### AMP Version\n\n[2109080123001]' +
        '(https://github.com/ampproject/amphtml/releases/tag/2109080123001)\n\n' +
        '### Promotions\n\n' +
        '- [x] <!-- tag=2109080123000 channel=beta-opt-in -->' +
        '2109080123000 promoted to Experimental and Beta (opt-in) channels (optintime)\n' +
        '- [x] <!-- tag=2109080123000 channel=beta-percent -->' +
        '2109080123000 promoted to Experimental and Beta (1% traffic) channels (percenttime)\n' +
        '- [x] <!-- tag=2109080123000 channel=stable -->' +
        '2109080123000 promoted to Stable channel (stabletime)\n' +
        '🌸 2109080123000 was cherry-picked to create 2109080123001\n' +
        '- [x] <!-- tag=2109080123001 channel=stable -->' +
        '2109080123001 promoted to Stable channel (testtime)\n' +
        '- [ ] <!-- tag=2109080123001 channel=lts -->' +
        '(optional) 2109080123001 promoted to LTS channel (PROMOTE_TIME)\n\n' +
        '/cc @ampproject/release-on-duty',
    })
    .reply(200);

  await createOrUpdateTracker(
    '2109080123001',
    '2109080123000',
    'stable',
    'testtime'
  );
  t.true(graphql.isDone());
  t.true(rest.isDone());
});
