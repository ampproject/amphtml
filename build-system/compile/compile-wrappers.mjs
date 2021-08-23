import {VERSION} from './internal-version.mjs';

const removeWhitespace = (str) => str.replace(/\s+/g, '');

// If there is a sync JS error during initial load,
// at least try to unhide the body.
// If "AMP" is already an object then that means another runtime has already
// been initialized and the current runtime must exit early. This can occur
// if multiple AMP libraries are included in the html or when both the module
// and nomodule runtimes execute in older browsers such as safari < 11.
export const mainBinary =
  'var global=self;self.AMP=self.AMP||[];' +
  'try{(function(_){' +
  'if(self.AMP&&!Array.isArray(self.AMP))return;' +
  '\n<%= contents %>})(AMP._=AMP._||{})}catch(e){' +
  'setTimeout(function(){' +
  'var s=document.body.style;' +
  's.opacity=1;' +
  's.visibility="visible";' +
  's.animation="none";' +
  's.WebkitAnimation="none;"},1000);throw e};';

/** @type {'high'} */
let ExtensionLoadPriorityDef;

/**
 * Wrapper that either registers the extension or schedules it for execution
 * by the main binary
 * @param {string} name
 * @param {string} version
 * @param {boolean} latest
 * @param {boolean=} isModule
 * @param {ExtensionLoadPriorityDef=} loadPriority
 * @return {string}
 */
export function extension(name, version, latest, isModule, loadPriority) {
  const payload = extensionPayload(
    name,
    version,
    latest,
    isModule,
    loadPriority
  );
  return `(self.AMP=self.AMP||[]).push(${payload});`;
}

/**
 * Wrap in a structure that allows lazy execution and provides extension
 * metadata.
 * The returned code corresponds to an object. A bundle is not complete until
 * this object is wrapped in a loader like `AMP.push`.
 * @see {@link extension}
 * @see {@link bento}
 * @param {string} name
 * @param {string} version
 * @param {boolean} latest
 * @param {boolean=} isModule
 * @param {ExtensionLoadPriorityDef=} loadPriority
 * @return {string}
 */
function extensionPayload(name, version, latest, isModule, loadPriority) {
  let priority = '';
  if (loadPriority) {
    if (loadPriority != 'high') {
      throw new Error('Unsupported loadPriority: ' + loadPriority);
    }
    priority = 'p:"high",';
  }
  // Use a numeric value instead of boolean. "m" stands for "module"
  const m = isModule ? 1 : 0;
  return (
    '{' +
    `m:${m},` +
    `v:"${VERSION}",` +
    `n:"${name}",` +
    `ev:"${version}",` +
    `l:${latest},` +
    priority +
    `f:(function(AMP,_){<%= contents %>})` +
    '}'
  );
}

/**
 * Anonymous function to load a Bento extension's payload (p).
 *
 * The provided AMP.registerElement function has the same signature as
 * `Extensions.addElement` on extensions-impl.js. In order:
 * - `name` (n): the name of the custom element tag
 * - `Ctor` (c): the constructor function (class) for the custom element
 * - `style` (s): optional string to install CSS for the custom element
 * @see {@link bento}
 * TODO(alanorozco): It would be cleaner if we used a "bento-foo" literal for
 * the tag name instead of replacing the prefix in "amp-foo".
 * TODO(alanorozco): `/amp.js` is relevant only for unminified builds. We add
 * this only so that tests can pass during CI. Eventually, we'll create separate
 * binaries and the script check should not be present at all.
 */
const bentoLoaderFn = removeWhitespace(`
function (payload) {
  self.AMP
    ? self.AMP.push(payload)
    : document.head.querySelector('script[src$="v0.js"],script[src$="v0.mjs"],script[src$="/amp.mjs"],script[src$="/amp.js"]')
    ? (self.AMP = [payload])
    : payload.f({
        registerElement: function (n, b, s) {
          if (s)
            document.head.appendChild(
              document.createElement("style")
            ).textContent = s;
          customElements.define(
            n.replace(/^amp-/, 'bento-'),
            b.CustomElement(b)
          );
        },
      });
}
`);

/**
 * Wraps to load an extension's payload (p) as a Bento component.
 *
 * It tries to use AMP's loading mechanism (`(self.AMP = self.AMP || []).push`)
 * when detecting the runtime either by a global, or the presence of a `script`
 * tag.
 *
 * On Bento documents, the extension's function (f) is executed immediately.
 * In this case, a barebones `AMP.registerElement` is also provided.
 * It uses a CustomElement implementation provided by the extension class
 * itself, and installs extension-specific CSS as soon as possible.
 * @param {string} name
 * @param {string} version
 * @param {boolean} latest
 * @param {boolean=} isModule
 * @param {ExtensionLoadPriorityDef=} loadPriority
 * @return {string}
 */
export function bento(name, version, latest, isModule, loadPriority) {
  const payload = extensionPayload(
    name,
    version,
    latest,
    isModule,
    loadPriority
  );
  return `(${bentoLoaderFn})(${payload});`;
}

export const none = '<%= contents %>';
