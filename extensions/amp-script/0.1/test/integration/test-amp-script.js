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

import {BrowserController} from '../../../../../testing/test-helper';
import {poll as classicPoll} from '../../../../../testing/iframe';

const TIMEOUT = 10000;

function poll(description, condition, opt_onError) {
  return classicPoll(description, condition, opt_onError, TIMEOUT);
}

describe.configure().skipSinglePass().run('amp-script', function() {
  this.timeout(TIMEOUT);

  let browser, doc, element;

  describes.integration('container ', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=container src="/examples/amp-script/hello-world.js">
        <button id="hello">Insert Hello World!</button>
        <button id="long">Long task</button>
      </amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);
      doc = env.win.document;
      element = doc.querySelector('amp-script');
    });

    it('should say "hello world"', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => true);
      browser.click('button#hello');

      yield poll('mutations applied', () => {
        const h1 = doc.querySelector('h1');
        return h1 && h1.textContent == 'Hello World!';
      });
    });

    it('should terminate without gesture', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => false);
      browser.click('button#hello');

      // Give mutations time to apply.
      yield browser.wait(100);
      yield poll('terminated', () => {
        return element.classList.contains('i-amphtml-broken');
      });
    });

    it('should start long task', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => true);
      // TODO(dvoytenko): Find a way to test this with the race condition when
      // the resource is fetched before the first polling iteration.
      const stub = sandbox.stub(impl.userActivation_, 'expandLongTask');
      browser.click('button#long');
      yield poll('long task started', () => {
        return stub.callCount > 0;
      });
    });
  });

  describes.integration('sanitizer', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=container src="/examples/amp-script/hello-world.js">
        <p>Number of mutations: <span id="mutationCount">0</span></p>
        <button id="script">Insert script</button>
        <button id="img">Insert img</button>
      </amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);
      doc = env.win.document;
      element = doc.querySelector('amp-script');
    });

    it('should sanitize <script> injection', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => true);
      browser.click('button#script');

      yield poll('mutations applied', () => {
        const mc = doc.querySelector('#mutationCount');
        return mc && mc.textContent == '1';
      });

      const scripts = element.querySelectorAll('script');
      expect(scripts.length).to.equal(0);
    });

    it('should sanitize <img> injection', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => true);
      browser.click('button#img');

      yield poll('mutations applied', () => {
        const mc = doc.querySelector('#mutationCount');
        return mc && mc.textContent == '1';
      });

      const scripts = element.querySelectorAll('img');
      expect(scripts.length).to.equal(0);
    });
  });

  describes.integration('fixed small', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=fixed width=300 height=200
          src="/examples/amp-script/hello-world.js">
        <button id="hello">Insert</button>
      </amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);
      doc = env.win.document;
      element = doc.querySelector('amp-script');
    });

    it('should allow without gesture for small size-defined', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => false);
      browser.click('button#hello');
      yield poll('mutations applied', () => {
        const h1 = doc.querySelector('h1');
        return h1 && h1.textContent == 'Hello World!';
      });
    });
  });

  describes.integration('fixed big', {
    /* eslint-disable max-len */
    body: `
      <amp-script layout=fixed width=300 height=301
          src="/examples/amp-script/hello-world.js">
        <button id="hello">Insert</button>
      </amp-script>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-script'],
    experiments: ['amp-script'],
  }, env => {
    beforeEach(() => {
      browser = new BrowserController(env.win);
      doc = env.win.document;
      element = doc.querySelector('amp-script');
    });

    it('should terminate without gesture for big size-defined', function*() {
      yield poll('<amp-script> to be hydrated',
          () => element.classList.contains('i-amphtml-hydrated'));
      const impl = yield element.getImpl();

      // Give event listeners in hydration a moment to attach.
      yield browser.wait(100);

      sandbox.stub(impl.userActivation_, 'isActive').callsFake(() => false);
      browser.click('button#hello');

      // Give mutations time to apply.
      yield browser.wait(100);
      yield poll('terminated', () => {
        return element.classList.contains('i-amphtml-broken');
      });
    });
  });
});
