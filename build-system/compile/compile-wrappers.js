const fs = require('fs-extra');
const json5 = require('json5');
const {VERSION} = require('./internal-version');

const latestVersions = json5.parse(
  fs.readFileSync(
    require.resolve('./bundles.legacy-latest-versions.jsonc'),
    'utf8'
  )
);

// If there is a sync JS error during initial load,
// at least try to unhide the body.
// If "AMP" is already an object then that means another runtime has already
// been initialized and the current runtime must exit early. This can occur
// if multiple AMP libraries are included in the html or when both the module
// and nomodule runtimes execute in older browsers such as safari < 11.
exports.mainBinary =
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
 * @param {boolean=} isModule
 * @param {ExtensionLoadPriorityDef=} loadPriority
 * @return {string}
 */
function extension(name, version, isModule, loadPriority) {
  const payload = extensionPayload(name, version, isModule, loadPriority);
  return `(self.AMP=self.AMP||[]).push(${payload});`;
}

exports.extension = extension;

/**
 * Wrap in a structure that allows lazy execution and provides extension
 * metadata.
 * The returned code corresponds to an object. A bundle is not complete until
 * this object is wrapped in a loader like `AMP.push`.
 * @see {@link extension}
 * @see {@link bento}
 * @param {string} name
 * @param {string} version
 * @param {boolean=} isModule
 * @param {ExtensionLoadPriorityDef=} loadPriority
 * @return {string}
 */
function extensionPayload(name, version, isModule, loadPriority) {
  let priority = '';
  if (loadPriority) {
    if (loadPriority != 'high') {
      throw new Error('Unsupported loadPriority: ' + loadPriority);
    }
    priority = 'p:"high",';
  }
  // Use a numeric value instead of boolean. "m" stands for "module"
  const m = isModule ? 1 : 0;
  const latest = latestVersions[name] === version;
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

exports.none = '<%= contents %>';
