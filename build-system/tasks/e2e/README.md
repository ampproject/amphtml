# End-to-end Tests

AMP contibutors embrace testing to maintain confidence that their code is executing correctly during development and maintenance of features and fixes. End-to-end (or E2E) tests aim to closely reproduce how a user would interact with a document as possible.

* [What is an end-to-end test?](#what-is-an-end-to-end-test)
* [Choosing which features to test](#choosing-which-features-to-test)
* [Writing E2E tests](#writing-e2e-tests)
* [Debugging E2E tests](#debugging-e2e-tests)

This document is a usage guide. For full test command documentation, consult the following resource:

* [Information on executing tests](../../../contributing/TESTING.md)


## What is an end-to-end test?

Let's compare the test types available to AMP contributors:

* Unit tests
* Integration tests
* End-to-end tests

Unit tests are useful for testing individual behaviors of a feature or fix. They are cheap to execute since they use mocks heavily to eliminate dependencies that need to also be executed during testing. These should be the most common type of test for a feature. These should fail rarely for reasons other than bugs.

Integration tests allow AMP contributors to verify that components are able to work together through their contracts. These are slightly more time-consuming to run because initializing dependencies can make test execution take longer to complete, and having more code machinery running during the test means the surface for mistakes is larger. These may fail intermittently without becoming problematic. These should be less numerous than unit tests, and they are not a replacement for unit tests.

End-to-end tests are able to test a full page as the user's browser would load it. Nothing is mocked, and the AMP framework runs from beginning to end. These provide the most realistic view of how a component behaves in the wild. However because the full AMP framework and browser stack are running, these tests are the most time consuming. They can also be prone to flakes due to the large number of moving parts involved in the test, such as the browser itself and the web driver framework. These should be the least numerous tests, verifying the most important user flows of a component, but not a majority of a component.

Test Type | Execution time (order of magnitude)
--|--
Unit | ~10ms each
Integration | ~100ms each
End-to-end | ~1000ms each


## Choosing which features to test

End-to-end tests should verify the most important user flows of a component. Prioritize tests for behaviors that would make the page appear very obviously broken if there was a failure. For example:

* The component's initial render
* Primary user interactions
  * e.g. clicking the next button on a carousel
* Features with heavy usage by a large number of AMP publishers
  * e.g. loading more content at the bottom of an amp page
* Important behaviors that are frequently broken
  * e.g. browser updates often break video autoplay behavior


## Writing E2E tests

AMP uses an abstraction layer that is implemented using major end-to-end testing frameworks like Selenium. The structure of the tests is similar to existing integration tests for AMP, using `describes.endtoend`.

Create your test JS files by adding them to `test/e2e` or `extensions/**/test-e2e`. For examples, see `extensions/amp-base-carousel/0.1/test-e2e/*.js`.

End-to-end tests for a specific extension can be saved in the extension's `test-e2e` directory e.g. `extensions/amp-foo/0.1/test-e2e/test-amp-foo.js`

End-to-end tests for a core AMP runtime feature, a combination of AMP components, or an important third party AMP page can be saved in the `test/e2e` directory e.g. `test/e2e/foo-bar-baz/test-foo-bar-baz.js`.

```js
// extensions/amp-foo/0.1/test-e2e/test-amp-foo-basic.js

describes.endtoend('amp-foo', {
  testUrl: 'http://localhost:8000/test/manual/amp-foo/amp-foo-basic.amp.html',
  experiments: ['amp-foo'],
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
    const fooBars = await controller.findElements('.i-amphtml-foo-bar');
    await expect(fooBars).to.have.length(2);
    await expect(controller.getElementText(fooBars[0])).to.equal('baz');

    /* ... */
  });
});
```

AMP E2E tests have a few differences from AMP integration and unit tests.

1. `async`/`await`
2. asynchronous `expect`
3. implicit polling

### async/await

While many legacy integration and unit tests use `Promise`s, your end-to-end tests should always use `async`/`await`. E2E tests are inherently asynchronous, and using Promises would become verbose quickly.

### asynchronous expect

Another change is that `expect` is now asynchronous, so we always put `await` before calls to `expect`. While it is not necessary in all cases, you should always use `await` with `expect` to maintain consistency and to ensure that you do not inadvertently forget to add it. Otherwise, tests will not behave correctly (and may be flaky) when the `expect` is working on an asynchronous operation.

```js
it('should render correctly', async() => {
  const fooBars = await controller.findElements('.i-amphtml-foo-bar');

  // OK: asynchronous `expect` with `await`
  await expect(controller.getElementText(fooBars[0])).to.equal('baz');

  // OK: synchronous `expect` with `await`
  const text = 'baz';
  await expect(text).to.equal('baz');

  // NOT OK: the test might erroneously end before the `expect` completes
  expect(controller.getElementText(fooBars[0])).to.equal('baz');

  // NOT OK: the test might erroneously end before the `expect` completes
  const text = await controller.getElementText(fooBars[0]);
  expect(text).to.equal('baz');
});
```

### implicit polling

With an asynchronous `expect`, the test can wait for the actual to match the expected value. For example, the code above will still work even if the test begins before the component is able to update the `fooBars[0]` element's text to `'baz'`.

To enable implicit polling, the AMP E2E framework implements `ControllerPromises` that allow code that is aware of them to request an updated value from the test controller. `expect` will implicitly wait if it is passed a `ControllerPromise` directly. If a `ControllerPromise` is `await`ed, the value will be retrieved immediately without polling, and so they should not be `await`ed if polling is desired.

```js
it('should render correctly', async() => {
  const fooBars = await controller.findElements('.i-amphtml-foo-bar');

  // OK: waits for the text to equal 'baz'
  await expect(controller.getElementText(fooBars[0])).to.equal('baz');

  // OK: waits for the text to equal 'baz'
  const text = controller.getElementText(fooBars[0]);
  await expect(text).to.equal('baz');

  // Avoid: expects the value to immediately equal 'baz'
  await expect(await controller.getElementText(fooBars[0])).to.equal('baz');

  // Avoid: expects the value to immediately equal 'baz'
  const text = await controller.getElementText(fooBars[0]);
  await expect(text).to.equal('baz');
});
```


## Debugging E2E tests

E2E test code runs in `node` and the code under test runs in the browser with the Web Driver in between. This indirection adds a level of difficulty to debugging, but the following commands work well to resolve any confusion or issues that arise while writing and debugging tests.

### node inspect

```sh
node --inspect-brk $(which gulp) e2e # --nobuild --testnames --files=extensions/amp-foo/0.1/test-e2e/test-amp-foo-basic.js
```

Open Chrome DevTools and click the Node logo in the top left.

Click the "Play"/"Continue execution" button to continue execution. Execution will stop at `debugger` statements like they would in the browser.

### mocha only

`it.only` and `describe.only` make it easy to execute individual tests or groups of tests.

### E2E repl (experimental)

Add `repl(/* mochaThis */ this)` to a test to pause execution at that line without using a breakpoint or `debugger` statement.

`debugger` statements can be troublesome because they stop all code execution. When the debugger is paused, synchronous calls in the console return values, but asynchronous calls return `Promise (unresolved)` which makes debugging expected values difficult at breakpoints. `repl` stops execution from continuing, but allows Promises to resolve normally.

```diff
-  it('should render correctly', async() => {
+  it('should render correctly', async function() {
     const fooBars = await controller.findElements('.i-amphtml-foo-bar');
     await expect(fooBars).to.have.length(2);
+    await repl(this);
     await expect(controller.getElementText(fooBars[0])).to.equal('baz');

     /* ... */
   });
```

In the Node debugger, the `repl` global provides a reference to the test controller at `repl.controller`. To continue a test after using `repl`, call `repl.continue()` which will resolve the Promise returned by the `repl(this)` call and allow execution to continue past the `await`.

### watch mode

Debug tests in `watch` mode with the `--watch` flag. This will allow you to make changes to test files without having to rerun the `gulp e2e` task.
