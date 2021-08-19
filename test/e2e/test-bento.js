describes.endtoend(
  'Bento',
  {
    environments: ['single'],
    fixture: 'bento/minimal.html',
  },
  async function (env) {
    it('attaches shadow root without v0.js', async () => {
      // Set timeout lower than default in order to fail early, since the root
      // is attached as soon as possible.
      // (Free to increase if flaky.)
      this.timeout(100);

      const shadowRoot = await env.controller.evaluate(
        () =>
          new Promise((resolve) => {
            function getShadowRoot() {
              const {shadowRoot} = document.body.firstElementChild;
              if (shadowRoot) {
                resolve(shadowRoot);
              } else {
                setTimeout(getShadowRoot, 15);
              }
            }
            getShadowRoot();
          })
      );
      await expect(shadowRoot).ok;
    });
  }
);
