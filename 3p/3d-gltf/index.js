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

import {dict} from '../../src/utils/object';
import {listenParent, nonSensitiveDataPostMessage} from '../messaging';
import {loadScript} from '../3p';
import {parseJson} from '../../src/json';
import {user} from '../../src/log';

import GltfViewer from './viewer';

const seq = (taskA, taskB) => cb => taskA(() => taskB(cb));
const parallel = (taskA, taskB) => cb => {
  let n = 0;
  const finish = () => {
    n++;
    if (n === 2) {
      cb();
    }
  };
  taskA(finish);
  taskB(finish);
};

const loadThree = (global, cb) => {
  const loadScriptCb = url => cb => loadScript(global, url, cb);
  const loadThreeExample = examplePath =>
    loadScriptCb(
      'https://cdn.jsdelivr.net/npm/three@0.91/examples/js/' + examplePath
    );

  seq(
    loadScriptCb('https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js'),
    parallel(
      loadThreeExample('loaders/GLTFLoader.js'),
      loadThreeExample('controls/OrbitControls.js')
    )
  )(cb);
};

/**
 * @param {!Window} global
 */
export function gltfViewer(global) {
  const dataReceived = parseJson(global.name)['attributes']._context;

  loadThree(global, () => {
    const viewer = new GltfViewer(dataReceived, {
      onload: () => {
        nonSensitiveDataPostMessage('loaded');
      },
      onprogress: e => {
        if (!e.lengthComputable) {
          return;
        }
        nonSensitiveDataPostMessage(
          'progress',
          dict({
            'total': e.total,
            'loaded': e.loaded,
          })
        );
      },
      onerror: err => {
        user().error('3DGLTF', err);
        nonSensitiveDataPostMessage(
          'error',
          dict({
            'error': (err || '').toString(),
          })
        );
      },
    });
    listenParent(global, 'action', msg => {
      viewer.actions[msg['action']](msg['args']);
    });
    nonSensitiveDataPostMessage('ready');
  });
}
