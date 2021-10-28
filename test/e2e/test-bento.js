describes.endtoend(
  'Bento',
  {
    environments: ['single'],
    fixture: 'bento/minimal.html',
  },
  async function (env) {
    it('attaches shadow root', async () => {
      // Set timeout lower than default in order to fail early, since the root
      // is attached as soon as possible.
      // (Feel free to increase if flaky.)
      this.timeout(100);
      await env.controller.switchToShadowRoot(
        await env.controller.findElement('bento-timeago')
      );

      await expect(await env.controller.findElement('time')).ok;
    });
  }
);
