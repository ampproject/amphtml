const attachesShadowRoot = {
  'without v0.js': 'bento/minimal.html',
  'without v0.js nor custom-elements-polyfill.js': 'bento/no-ce-polyfill.html',
};

for (const [name, fixture] of Object.entries(attachesShadowRoot)) {
  const config = {
    environments: ['single'],
    fixture,
  };
  describes.endtoend('Bento', config, async function (env) {
    it(`attaches shadow root ${name}`, async () => {
      // Set timeout lower than default in order to fail early, since the root
      // is attached as soon as possible.
      // (Feel free to increase if flaky.)
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
  });
}
