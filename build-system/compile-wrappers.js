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
exports.mainBinary =
  'var global=self;self.AMP=self.AMP||[];' +
  'try{(function(_){\n<%= contents %>})(AMP._=AMP._||{})}catch(e){' +
  'setTimeout(function(){' +
  'var s=document.body.style;' +
  's.opacity=1;' +
  's.visibility="visible";' +
  's.animation="none";' +
  's.WebkitAnimation="none;"},1000);throw e};';

exports.extension = function(
  name,
  loadPriority,
  intermediateDeps,
  opt_splitMarker
) {
  opt_splitMarker = opt_splitMarker || '';
  let deps = '';
  if (intermediateDeps) {
    deps = 'i:';
    function quote(s) {
      return `"${s}"`;
    }
    if (intermediateDeps.length == 1) {
      deps += quote(intermediateDeps[0]);
    } else {
      deps += `[${intermediateDeps.map(quote).join(',')}]`;
    }
    deps += ',';
  }
  let priority = '';
  if (loadPriority) {
    if (loadPriority != 'high') {
      throw new Error('Unsupported loadPriority: ' + loadPriority);
    }
    priority = 'p:"high",';
  }
  return (
    `(self.AMP=self.AMP||[]).push({n:"${name}",${priority}${deps}` +
    `v:"${VERSION}",f:(function(AMP,_){${opt_splitMarker}\n` +
    '<%= contents %>\n})});'
  );
};

exports.none = '<%= contents %>';
