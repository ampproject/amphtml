/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {BrowserController, RequestBank} from '../../testing/test-helper';
import {Deferred} from '../../src/utils/promise';
import {poll} from '../../testing/iframe';

// TODO(torch2424, #20541): These tests fail on firefox and Edge.
describe
  .configure()
  .skipFirefox()
  .skipEdge()
  .run('amp-recaptcha-input', function() {
    describes.integration(
      'with form and amp-mustache',
      {
        /* eslint-disable max-len */
        body: `
    <form
      method="POST"
      action-xhr="/recaptcha/submit"
      target="_top">

      <fieldset>
        <input name="clientId" type="hidden" value="CLIENT_ID(poll)" data-amp-replace="CLIENT_ID">
        <label>
          <span>Search for</span>
          <input type="search" name="term" required>
        </label>
        <input name="submit-button" type="submit" value="Search">
        <amp-recaptcha-input layout="nodisplay"
          name="recaptcha-token"
          data-sitekey="6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE"
          data-action="recaptcha-example">
        </amp-recaptcha-input>
      </fieldset>

      <div class="loading-spinner">
        <div class="donut">
        </div>
      </div>

      <div submit-success>
        <template type="amp-mustache">
          <div id="submit-success"></div>
          <h1>You searched for: {{term}}</h1>
          <p>message: {{message}}</p>
          <p>recaptcha-token: {{recaptcha-token}}</p>
        </template>
      </div>

      <div submit-error>
        <template type="amp-mustache">
          <div id="submit-error"></div>
          <h1>Error! Please check the JS Console in your dev tools.</h1>
          <p>{{error}}</p>
        </template>
      </div>

    </form>
    `,
        css: `
      form.amp-form-submit-success [submit-success] {
        color: green;
      }
      form.amp-form-submit-error [submit-error] {
        color: red;
      }
      form.amp-form-submit-success.hide-inputs > input {
        display: none;
      }

      @keyframes donut-spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

      .donut {
        display: inline-block;
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-left-color: #7983ff;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: donut-spin 1.2s linear infinite;
      }

      .loading-spinner {
        display: none;
        text-align: center;
        margin: 5px;
      }

      form.amp-form-submitting > .loading-spinner {
        display: block;
      }
    `,
        /* eslint-enable max-len */
        extensions: ['amp-recaptcha-input', 'amp-form', 'amp-mustache:0.2'],
        experiments: ['amp-recaptcha-input'],
      },
      env => {
        let doc;

        beforeEach(() => {
          doc = env.win.document;

          const browserController = new BrowserController(env.win);
          return browserController.waitForElementLayout('amp-recaptcha-input');
        });

        it('should be able to create the bootstrap frame', function() {
          return waitForBootstrapFrameToBeCreated(doc).then(frame => {
            expect(frame.src.includes('recaptcha')).to.be.true;
            expect(frame.getAttribute('data-amp-3p-sentinel')).to.be.equal(
              'amp-recaptcha'
            );
            expect(frame.getAttribute('name')).to.be.equal(
              JSON.stringify({
                'sitekey': '6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE',
                'sentinel': 'amp-recaptcha',
              })
            );
          });
        });

        it('should load the 3p recaptcha frame', function() {
          return waitForBootstrapFrameOnLoad(doc).then(frame => {
            expect(frame).to.be.ok;
          });
        });

        it(
          'should create a hidden input, ' +
            'with the value resolved from the recaptcha mock, ' +
            ' on submit',
          function() {
            return submitForm(doc).then(hiddenInput => {
              expect(hiddenInput).to.be.ok;
              expect(hiddenInput.name).to.be.equal('recaptcha-token');
              expect(hiddenInput.value).to.be.equal('recaptcha-mock');
            });
          }
        );

        it('should show submit-success on successful submit/response', function() {
          return submitForm(doc).then(() => {
            return poll(
              'submit-success',
              () => {
                return doc.querySelector('div[id="submit-success"]');
              },
              undefined,
              5000
            );
          });
        });
      }
    );

    const recaptchaRequestId = {
      GET: 'request bank GET',
      POST: 'request bank POST',
    };
    describes.integration(
      recaptchaRequestId.GET,
      {
        /* eslint-disable max-len */
        body: `
    <form
      method="GET"
      action-xhr="${RequestBank.getUrl(recaptchaRequestId.GET)}"
      target="_top">

      <fieldset>
        <input name="clientId" type="hidden" value="CLIENT_ID(poll)" data-amp-replace="CLIENT_ID">
        <label>
          <span>Search for</span>
          <input type="search" name="term" required>
        </label>
        <input name="submit-button" type="submit" value="Search">
        <amp-recaptcha-input layout="nodisplay"
          name="recaptcha-token"
          data-sitekey="6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE"
          data-action="recaptcha-example">
        </amp-recaptcha-input>
      </fieldset>
    </form>
  `,
        /* eslint-enable max-len */
        extensions: ['amp-recaptcha-input', 'amp-form'],
        experiments: ['amp-recaptcha-input'],
      },
      env => {
        let doc;

        beforeEach(() => {
          doc = env.win.document;

          const browserController = new BrowserController(env.win);
          return browserController.waitForElementLayout('amp-recaptcha-input');
        });

        it('should make a request with correct parameters', function() {
          return submitForm(doc).then(() => {
            return RequestBank.withdraw(recaptchaRequestId.GET).then(req => {
              expect(req.url).to.include('term=recaptcha-search');
              expect(req.url).to.include('recaptcha-token=recaptcha-mock');
              expect(req.headers.host).to.be.ok;
            });
          });
        });
      }
    );

    describes.integration(
      recaptchaRequestId.POST,
      {
        /* eslint-disable max-len */
        body: `
    <form
      method="POST"
      action-xhr="${RequestBank.getUrl(recaptchaRequestId.POST)}"
      target="_top">

      <fieldset>
        <input name="clientId" type="hidden" value="CLIENT_ID(poll)" data-amp-replace="CLIENT_ID">
        <label>
          <span>Search for</span>
          <input type="search" name="term" required>
        </label>
        <input name="submit-button" type="submit" value="Search">
        <amp-recaptcha-input layout="nodisplay"
          name="recaptcha-token"
          data-sitekey="6LebBGoUAAAAAHbj1oeZMBU_rze_CutlbyzpH8VE"
          data-action="recaptcha-example">
        </amp-recaptcha-input>
      </fieldset>
    </form>
  `,
        /* eslint-enable max-len */
        extensions: ['amp-recaptcha-input', 'amp-form'],
        experiments: ['amp-recaptcha-input'],
      },
      env => {
        let doc;

        beforeEach(() => {
          doc = env.win.document;

          const browserController = new BrowserController(env.win);
          return browserController.waitForElementLayout('amp-recaptcha-input');
        });

        it('should make a request with correct parameters', function() {
          return submitForm(doc).then(() => {
            return RequestBank.withdraw(recaptchaRequestId.POST).then(req => {
              expect(req.body).to.be.ok;
              expect(req.body.term).to.be.equal('recaptcha-search');
              expect(req.body['recaptcha-token']).to.be.equal('recaptcha-mock');
              expect(req.headers.host).to.be.ok;
            });
          });
        });
      }
    );
  });

function waitForBootstrapFrameToBeCreated(doc) {
  return poll(
    'create bootstrap frame',
    () => {
      return doc.querySelector('iframe.i-amphtml-recaptcha-iframe');
    },
    undefined,
    5000
  );
}

function waitForBootstrapFrameOnLoad(doc) {
  let bootstrapFrame = undefined;
  return waitForBootstrapFrameToBeCreated(doc)
    .then(frame => {
      bootstrapFrame = frame;

      // Create a promise for when the iframe is loaded
      const onLoadDeferred = new Deferred();
      frame.onload = onLoadDeferred.resolve;

      // Reset the frame src to ensure we get the load event
      frame.src = frame.src + '?reload=true';

      return onLoadDeferred.promise;
    })
    .then(() => {
      return bootstrapFrame;
    });
}

function submitForm(doc) {
  return waitForBootstrapFrameOnLoad(doc)
    .then(() => {
      const searchInputElement = doc.querySelector('input[type="search"]');
      const submitElement = doc.querySelector('input[type="submit"]');

      searchInputElement.value = 'recaptcha-search';
      submitElement.click();

      return poll(
        'Polling for hidden input',
        () => {
          return doc.querySelector('input[hidden]');
        },
        undefined,
        5000
      );
    })
    .then(() => {
      return doc.querySelector('input[hidden]');
    });
}
