describes.endtoend(
  'bento-timeago react e2e',
  {
    bentoComponentName: 'timeago',
    testFor: 'react',
    version: '1.0',
    fixture: 'dist/bento-timeago-e2e-build-react.html',
    environments: ['single'],
  },
  testSuite
);
describes.endtoend(
  'bento-timeago preact e2e',
  {
    bentoComponentName: 'timeago',
    testFor: 'preact',
    version: '1.0',
    fixture: 'dist/bento-timeago-e2e-build-preact.html',
    environments: ['single'],
  },
  testSuite
);

function testSuite(env) {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('render how long ago the time stamp was set', async () => {
    const timeago = await controller.findElement('time');
    await expect(controller.getElementText(timeago)).to.equal('just now');
  });
}
