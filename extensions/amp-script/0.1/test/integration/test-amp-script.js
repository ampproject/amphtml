import {BrowserController} from '#testing/helpers/service';
import {poll as classicPoll} from '#testing/iframe';

const TIMEOUT = 10000;

function poll(description, condition, opt_onError) {
  return classicPoll(description, condition, opt_onError, TIMEOUT);
}

describes.sandboxed('amp-script', {}, function () {
  this.timeout(TIMEOUT);

  let browser, doc, element;

  describes.integration(
    'container ',
    {
      body: `
      <amp-script layout=container src="/examples/amp-script/amp-script-demo.js">
        <button id="hello">Insert Hello World!</button>
        <button id="long">Long task</button>
      </amp-script>
    `,
      extensions: ['amp-script'],
    },
    (env) => {
      beforeEach(() => {
        browser = new BrowserController(env.win);
        doc = env.win.document;
        element = doc.querySelector('amp-script');
      });

      it('should say "hello world"', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => true);
        browser.click('button#hello');

        yield poll('mutations applied', () => {
          const h1 = doc.querySelector('h1');
          return h1 && h1.textContent == 'Hello World!';
        });
      });

      it('should terminate without gesture', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => false);
        browser.click('button#hello');

        // Give mutations time to apply.
        yield browser.wait(100);
        yield poll('terminated', () => {
          return element.classList.contains('i-amphtml-broken');
        });
      });

      it('should start long task', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => true);
        // TODO(dvoytenko): Find a way to test this with the race condition when
        // the resource is fetched before the first polling iteration.
        const stub = env.sandbox.stub(
          impl.getUserActivation(),
          'expandLongTask'
        );
        browser.click('button#long');
        yield poll('long task started', () => {
          return stub.callCount > 0;
        });
      });
    }
  );

  describes.integration(
    'sanitizer',
    {
      body: `
      <amp-script layout=container src="/examples/amp-script/amp-script-demo.js">
        <p>Number of mutations: <span id="mutationCount">0</span></p>
        <button id="script">Insert script</button>
        <button id="img">Insert img</button>
      </amp-script>
    `,
      extensions: ['amp-script'],
    },
    (env) => {
      beforeEach(() => {
        browser = new BrowserController(env.win);
        doc = env.win.document;
        element = doc.querySelector('amp-script');
      });

      it('should sanitize <script> injection', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => true);
        browser.click('button#script');

        yield poll('mutations applied', () => {
          const mc = doc.querySelector('#mutationCount');
          return mc && mc.textContent == '1';
        });

        const scripts = element.querySelectorAll('script');
        expect(scripts.length).to.equal(0);
      });

      it('should sanitize <img> injection', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => true);
        browser.click('button#img');

        yield poll('mutations applied', () => {
          const mc = doc.querySelector('#mutationCount');
          return mc && mc.textContent == '1';
        });

        const scripts = element.querySelectorAll('img');
        expect(scripts.length).to.equal(0);
      });
    }
  );

  describes.integration(
    'sandboxed',
    {
      body: `<amp-script sandboxed src="/examples/amp-script/export-functions.js"></amp-script>`,
      extensions: ['amp-script'],
    },
    (env) => {
      beforeEach(() => {
        browser = new BrowserController(env.win);
        doc = env.win.document;
        element = doc.querySelector('amp-script');
      });

      it('should let you call functions on it', async () => {
        const impl = await element.getImpl(true);
        const result = await impl.callFunction('getData');
        expect(result).deep.equal({data: true});
      });
    }
  );

  describes.integration(
    'defined-layout',
    {
      body: `
      <amp-script layout=fixed width=300 height=200
          src="/examples/amp-script/amp-script-demo.js">
        <button id="hello">Insert</button>
      </amp-script>
    `,
      extensions: ['amp-script'],
    },
    (env) => {
      beforeEach(() => {
        browser = new BrowserController(env.win);
        doc = env.win.document;
        element = doc.querySelector('amp-script');
      });

      it('should allow mutation without gesture', function* () {
        yield poll('<amp-script> to be hydrated', () =>
          element.classList.contains('i-amphtml-hydrated')
        );
        const impl = yield element.getImpl();

        // Give event listeners in hydration a moment to attach.
        yield browser.wait(100);

        env.sandbox
          .stub(impl.getUserActivation(), 'isActive')
          .callsFake(() => false);
        browser.click('button#hello');
        yield poll('mutations applied', () => {
          const h1 = doc.querySelector('h1');
          return h1 && h1.textContent == 'Hello World!';
        });
      });
    }
  );
});
