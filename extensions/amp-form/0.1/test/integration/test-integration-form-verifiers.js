import {poll} from '#testing/iframe';

const RENDER_TIMEOUT = 15000;

const describeChrome = describes.sandboxed.configure().ifChrome();

// TODO(cvializ, #19647): Broken on SL Chrome 71.
describeChrome.skip('amp-form verifiers', {}, function () {
  const {testServerPort} = window.ampTestRuntimeConfig;
  const baseUrl = `http://localhost:${testServerPort}`;

  this.timeout(RENDER_TIMEOUT);

  describes.integration(
    'verify-error template',
    {
      extensions: ['amp-form', 'amp-mustache'],
      body: `
<form
  target="_top"
  method="POST"
  id="form"
  action-xhr="${baseUrl}/form/verify-error"
  verify-xhr="${baseUrl}/form/verify-error"
>
  <input type="email" name="email" id="email">
  <input type="submit" id="submit" value="submit">
  <div verify-error>
    <template type="amp-mustache">
      <div><p id="message">Mistakes were rendered</p></div>
    </template>
  </div>
</form>
`,
    },
    (env) => {
      let win, doc;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
      });

      it('should render when the verifier runs', function () {
        const email = doc.getElementById('email');
        email.value = 'x@x';

        const waitForMessage = poll(
          'message to be rendered',
          () => doc.getElementById('message'),
          undefined,
          RENDER_TIMEOUT,
          win
        );
        email.dispatchEvent(new Event('change', {bubbles: true}));

        return waitForMessage;
      });
    }
  );

  describes.integration(
    'verify-error action',
    {
      extensions: ['amp-form'],
      body: `
<form
  target="_top"
  method="POST"
  id="form"
  action-xhr="${baseUrl}/form/verify-error"
  verify-xhr="${baseUrl}/form/verify-error"
  on="verify-error:message.show"
>
  <input type="email" name="email" id="email">
  <input type="submit" id="submit" value="submit">
</form>
<span id="message" hidden>Mistakes were triggered</span>
`,
    },
    (env) => {
      this.timeout(RENDER_TIMEOUT);

      let win, doc;

      beforeEach(() => {
        win = env.win;
        doc = win.document;
      });

      it('should trigger when the verifier runs', function () {
        const email = doc.getElementById('email');
        const message = doc.getElementById('message');
        const waitForMessage = poll(
          'message to be shown',
          () => !message.hidden,
          undefined,
          RENDER_TIMEOUT,
          win
        );

        email.value = 'x@x';
        email.dispatchEvent(new Event('change', {bubbles: true}));

        return waitForMessage;
      });
    }
  );
});
