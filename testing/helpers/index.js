/**
 * A private encapsulation of the test env variable.
 */
let env_;

/** @typedef {typeof setTimeout} SetTimeoutFunctionType */

/**
 * Sets up the helper environment.
 * @param {*} env
 */
export function configureHelpers(env) {
  env_ = env;
}

/**
 * Returns a Promise that resolves after the specified number of milliseconds.
 *
 * Pass an optional alternative `setTimeout` function when using fake timers in
 * your test environment, and you want to perform the sleep in that env.
 * @param {number} ms
 * @param {SetTimeoutFunctionType} setTimeoutFunc
 * @return {Promise<void>}
 */
export function sleep(ms, setTimeoutFunc = setTimeout) {
  return new Promise((resolve) => {
    setTimeoutFunc(resolve, ms);
  });
}

/**
 * A convenience method to flush the event queue by calling `await macroTask()`
 * in your test.
 *
 * Pass an optional alternative `setTimeout` function when using fake timers in
 * your test environment, and you want to perform the sleep in that env.
 * @param {SetTimeoutFunctionType} setTimeoutFunc
 * @return {Promise<void>}
 */
export function macroTask(setTimeoutFunc = setTimeout) {
  return sleep(0, setTimeoutFunc);
}

/**
 * Returns a Promise that resolves after the next browser frame has been rendered.
 * @param {Window=} win
 * @return {Promise<void>}
 */
export function afterRenderPromise(win = env_?.win) {
  const requestAnimationFrame =
    win?.requestAnimationFrame ??
    /** @type {(cb: () => void) => Promise<void>} */
    (
      async (cb) => {
        await macroTask();
        cb();
      }
    );
  return new Promise(async (resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

/**
 * Returns a Promise that resolves upon the next frame being rendered after ms have passed.
 * @param {number} ms
 * @return {Promise<void>}
 */
export async function awaitFrameAfter(ms) {
  await sleep(ms);
  await afterRenderPromise();
}

const VOID_ELEMENTS = new Set([
  'AREA',
  'BASE',
  'BR',
  'COL',
  'EMBED',
  'HR',
  'IMG',
  'INPUT',
  'LINK',
  'META',
  'PARAM',
  'SOURCE',
  'TRACK',
  'WBR',
]);

/**
 * Returns true of node is a void element.
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
 *
 * @param {Node} node
 * @return {boolean}
 */
function isVoidElement(node) {
  return (
    node.nodeType === Node.ELEMENT_NODE && VOID_ELEMENTS.has(node.nodeName)
  );
}

/**
 * Returns the outerHTML for an element, but with lexicographically sorted attributes.
 * @param {Element} node
 * @return {string}
 */
export function getDeterministicOuterHTML(node) {
  const tag = node.localName;
  const attributes = Array.from(node.attributes)
    .map(({name, value}) => `${name}="${value}"`)
    .sort()
    .join(' ');
  const start = `<${tag} ${attributes}>`;
  const contents = Array.from(node.childNodes).map((childNode) => {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      return getDeterministicOuterHTML(/** @type {Element} */ (childNode));
    }
    return childNode.textContent;
  });

  if (!contents && isVoidElement(node)) {
    return start;
  }
  return start + contents + `</${tag}>`;
}

/**
 * @param {string} hyphenCase camel cased string
 * @return {string} camelCased string
 */
export function hypenCaseToCamelCase(hyphenCase) {
  return hyphenCase.replace(/-./g, (match) => match.slice(1).toUpperCase());
}
