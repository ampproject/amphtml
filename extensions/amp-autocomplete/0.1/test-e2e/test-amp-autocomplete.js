describes.endtoend('amp-autocomplete', {
  testUrl: 'http://localhost:8000/test/manual/amp-autocomplete/amp-autocomplete.amp.html',
  experiments: ['amp-autocomplete'],
  // By default, the browser opens at 800x600
  // initialRect: {width: 800, height: 600},

  // By default, E2E tests run in all three environments
  // environments: ['single', 'viewer-demo', 'shadow-demo']
}, env => {
  let controller;

  beforeEach(() => {
    controller = env.controller;
  });

  it('should render correctly', async() => {
    const autocompleteElement = await controller.findElements('amp-autocomplete');
    await expect(autocompleteElement).not.to.be.null;
  });
});