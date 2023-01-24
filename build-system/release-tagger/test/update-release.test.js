const nock = require('nock');
const test = require('ava');
const {publishRelease, rollbackRelease} = require('../update-release');

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

  await publishRelease('2107210123000');
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

  await rollbackRelease('2107210123000');
  t.true(scope.isDone());
});
