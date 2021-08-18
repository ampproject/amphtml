const READY_MESSAGE = 'e2e repl ready';
const CONTINUE_MESSAGE = 'cleaning up repl';

const REPL_INFINITE_TIMEOUT = 86400000; // milliseconds in a day

/**
 * Adds a REPL-like debugging experience to E2E tests.
 * Usage:
 * 1. In a test, add `await repl(this);` where `this` is mocha's this context.
 *    This will cause the test to wait indefinitely when you want to execute
 *    commands in the DevTools console.
 *    You may have to change `async() => {}` to `async function() {}`
 * 2. Run amp with Node debugging enabled:
 *   `node --inspect-brk $(which amp) e2e ...`
 * 3. Open Chrome DevTools and open the Node debugger
 * 4. Wait for the `READY_MESSAGE` to appear in the console
 * 5. You are now free to execute code in the console using the controller API.
 *   `console.log(await repl.controller.getTitle())`
 * 6. When you're done, call `repl.continue()`
 *
 * @param {!Object} global
 * @param {!Object} env
 */
function installRepl(global, env) {
  let replPromise = null;
  let replResolve = null;

  /**
   * Usage: in a test, await repl();
   * @param {*} mochaThis
   * @return {!Promise}
   */
  global.repl = function (mochaThis) {
    mochaThis.timeout(REPL_INFINITE_TIMEOUT);

    const {controller} = env;
    global.repl.controller = controller;
    global.repl.env = env;
    global.repl.continue = replContinue;

    if (!replPromise) {
      replPromise = new Promise((resolve) => {
        replResolve = resolve;
      });
    }

    console./*OK*/ log(READY_MESSAGE);

    return replPromise;
  };

  /**
   * Continues execution while debugging.
   */
  function replContinue() {
    if (!replResolve) {
      return;
    }

    replResolve();
    replResolve = null;
    replPromise = null;
    delete global.repl.controller;
    delete global.repl.env;
    delete global.repl.continue;

    console./*OK*/ log(CONTINUE_MESSAGE);
  }
}

/**
 * Ends the debugging session.
 */
function uninstallRepl() {
  delete global.repl;
}

module.exports = {
  installRepl,
  uninstallRepl,
};
