/* eslint-disable import/no-deprecated */

import {loadScript} from '#3p/3p';
import {listenParent, nonSensitiveDataPostMessage} from '#3p/messaging';

import {dict} from '#core/types/object';
import {parseJson} from '#core/types/object/json';

import GltfViewer from './viewer';

import {user} from '../../src/log';

const seq = (taskA, taskB) => (cb) => taskA(() => taskB(cb));
const parallel = (taskA, taskB) => (cb) => {
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
  const loadScriptCb = (url) => (cb) => loadScript(global, url, cb);
  const loadThreeExample = (examplePath) =>
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
      onprogress: (e) => {
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
      onerror: (err) => {
        user().error('3DGLTF', err);
        nonSensitiveDataPostMessage(
          'error',
          dict({
            'error': (err || '').toString(),
          })
        );
      },
    });
    listenParent(global, 'action', (msg) => {
      viewer.actions[msg['action']](msg['args']);
    });
    nonSensitiveDataPostMessage('ready');
  });
}
