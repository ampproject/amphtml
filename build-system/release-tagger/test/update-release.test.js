const test = require('ava');
const sinon = require('sinon');
const {publishRelease, rollbackRelease} = require('../update-release');

test.beforeEach((t) => {
  t.context.octokitRest = {
    rest: {
      repos: {
        getReleaseByTag: sinon.stub(),
        updateRelease: sinon.stub(),
      },
    },
    hook: {
      error: sinon.stub(),
    },
  };

  t.context.octokitGraphQl = sinon.stub();
});

test('publish', async (t) => {
  t.context.octokitRest.rest.repos.getReleaseByTag.resolves({data: {id: 1}});
  t.context.octokitRest.rest.repos.updateRelease.resolves({data: {id: 1}});

  await publishRelease(
    '2107210123000',
    true,
    t.context.octokitRest,
    t.context.octokitGraphQl
  );
  t.true(
    t.context.octokitRest.rest.repos.updateRelease.calledWith({
      owner: 'ampproject',
      repo: 'amphtml',
      'release_id': 1,
      prerelease: false,
      'make_latest': true,
    })
  );
});

test('rollback', async (t) => {
  t.context.octokitRest.rest.repos.getReleaseByTag.resolves({
    data: {
      id: 1,
      body: 'This is a test release body',
    },
  });
  t.context.octokitRest.rest.repos.updateRelease.resolves({data: {id: 1}});

  await rollbackRelease(
    '2107210123000',
    t.context.octokitRest,
    t.context.octokitGraphQl
  );
  t.true(
    t.context.octokitRest.rest.repos.updateRelease.calledOnceWith({
      owner: 'ampproject',
      repo: 'amphtml',
      'release_id': 1,
      prerelease: true,
      body: '#### :back: This release was rolled back.\nThis is a test release body',
    })
  );
});
