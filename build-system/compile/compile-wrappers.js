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

const {VERSION} = require('./internal-version');

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

/**
 * Wrapper that either registers the extension or schedules it for execution
 * by the main binary
 * @param {string} name
 * @param {string} version
 * @param {boolean} latest
 * @param {boolean=} isModule
 * @param {'high'=} loadPriority
 * @return {string}
 */
exports.extension = function (name, version, latest, isModule, loadPriority) {
  let priority = '';
  if (loadPriority) {
    if (loadPriority != 'high') {
      throw new Error('Unsupported loadPriority: ' + loadPriority);
    }
    priority = 'p:"high",';
  }
  // Use a numeric value instead of boolean. "m" stands for "module"
  const m = isModule ? 1 : 0;
  // The `function` is wrapped in `()` to avoid lazy parsing it, since it will
  // be immediately executed anyway.
  // See https://github.com/ampproject/amphtml/issues/3977
  // TODO(wg-performance): At some point in history, the build pipeline started
  // to strip out these parentheses. Is this optimization still relevant?
  return (
    `(self.AMP=self.AMP||[]).push({n:"${name}",ev:"${version}",l:${latest},` +
    `${priority}` +
    `v:"${VERSION}",m:${m},f:(function(AMP,_){\n` +
    '<%= contents %>\n})});'
  );
};

// TODO(alanorozco): Implement with Bento Auto-Envelope.
exports.bento = exports.extension;

exports.none = '<%= contents %>';
