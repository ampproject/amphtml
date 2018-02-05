/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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


import {parseJson} from '../src/json';
import {validateData, writeScript} from '../3p/3p';

/**
 * @const {Object<string, string>}
 */
const ADO_JS_PATHS = {
  'sync': '/files/js/ado.js',
  'buffered': '/files/js/ado.FIF.0.99.3.js',
};

/**
 * @param {string} str
 * @return {boolean}
 */
function isFalseString(str) {
  return /^(?:false|off)?$/i.test(str);
}

/**
 * @param {string} mode
 * @param {!Window} global
 */
function setupAdoConfig(mode, global) {
  if (global['ado']) {
    const config = {
      mode: (mode == 'sync') ? 'old' : 'new',
      protocol: 'https:',
      fif: {
        enabled: mode != 'sync',
      },
    };

    global['ado']['config'](config);
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
function setupPreview(global, data) {
  if (global.ado && data.aoPreview && !isFalseString(data.aoPreview)) {
    global.ado.preview({
      enabled: true,
      emiter: data['aoEmitter'],
      id: data['aoPreview'],
    });
  }
}

/**
 * @param {string} str
 * @returns (Object|undefined}
 * @throws {SyntaxError}
 */
function parseJSONObj(str) {
  return str.match(/^\s*{/) ? parseJson(str) : undefined;
}

/**
 * @param {string} keys
 * @return {string|undefined}
 */
function buildKeys(keys) {
  return keys || undefined;
}

/**
 * @param {string} vars
 * @return {Object|string|undefined}
 */
function buildVars(vars) {
  try {
    return parseJSONObj(vars);
  } catch (e) {
    return vars || undefined;
  }
}

/**
 * @param {string} clusters
 * @return {Object|undefined}
 */
function buildClusters(clusters) {
  try {
    return parseJSONObj(clusters);
  } catch (e) {
    // return undefined
  }
}

/** @type {number} */
let runSyncCount = 0;

/**
 * @param {!Window} global
 * @param {function()} cb
 */
function runSync(global, cb) {
  global['__aoPrivFnct' + ++runSyncCount] = cb;
  /*eslint no-useless-concat: 0*/
  global.document
      .write('<' + 'script>__aoPrivFnct' + runSyncCount + '();<' + '/script>');
}

/**
 * @param {string} mode
 * @param {!Window} global
 * @param {!Object} data
 */
function appendPlacement(mode, global, data) {
  const doc = global.document;
  const placement = doc.createElement('div');
  placement.id = data['aoId'];

  const dom = doc.getElementById('c');
  dom.appendChild(placement);

  const config = {
    id: data['aoId'],
    server: data['aoEmitter'],
    keys: buildKeys(data['aoKeys']),
    vars: buildVars(data['aoVars']),
    clusters: buildClusters(data['aoClusters']),
  };

  if (global.ado) {
    if (mode == 'sync') {
      runSync(global, function() {
        global['ado']['placement'](config);
      });

      runSync(global, function() {
        if (!config['_hasAd']) {
          window.context.noContentAvailable();
        }
      });
    } else {
      global['ado']['onAd'](data['aoId'], function(isAd) {
        if (!isAd) {
          window.context.noContentAvailable();
        }
      });
      global['ado']['placement'](config);
    }
  }
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adocean(global, data) {
  validateData(data, [
    'aoEmitter',
    'aoId',
  ], [
    'aoMode',
    'aoPreview',
    'aoKeys',
    'aoVars',
    'aoClusters',
  ]);

  const mode = (data['aoMode'] != 'sync') ? 'buffered' : 'sync';
  const adoUrl = 'https://' + data['aoEmitter'] + ADO_JS_PATHS[mode];

  writeScript(global, adoUrl, () => {
    setupAdoConfig(mode, global);
    setupPreview(global, data);

    appendPlacement(mode, global, data);
  });
}
