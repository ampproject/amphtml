/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {poll} from '../../../../../testing/iframe';

const RENDER_TIMEOUT = 15000;

const describeChrome = describe.configure().ifChrome().skipSinglePass();

// TODO(cvializ, #19647): Broken on SL Chrome 71.
describeChrome.skip('amp-form verifiers', function() {
  const {testServerPort} = window.ampTestRuntimeConfig;
  const baseUrl = `http://localhost:${testServerPort}`;

  this.timeout(RENDER_TIMEOUT);

  describes.integration('verify-error template', {
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
  }, env => {

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should render when the verifier runs', function() {
      const email = doc.getElementById('email');
      email.value = 'x@x';

      const waitForMessage = poll('message to be rendered',
          () => doc.getElementById('message'), undefined, RENDER_TIMEOUT, win);
      email.dispatchEvent(new Event('change', {bubbles: true}));

      return waitForMessage;
    });
  });

  describes.integration('verify-error action', {
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
  }, env => {
    this.timeout(RENDER_TIMEOUT);

    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    it('should trigger when the verifier runs', function() {
      const email = doc.getElementById('email');
      const message = doc.getElementById('message');
      const waitForMessage = poll('message to be shown',
          () => !message.hidden, undefined, RENDER_TIMEOUT, win);

      email.value = 'x@x';
      email.dispatchEvent(new Event('change', {bubbles: true}));

      return waitForMessage;
    });
  });
});
