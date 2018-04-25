import {dict} from '../../src/utils/object';
import {getData} from '../../src/event-helper';
import {loadScript} from '../3p';
import {parseJson} from '../../src/json';

import makeViewer from './viewer';

const loadThree = (global, cb) => {
  loadScript(
      global,
      'https://cdnjs.cloudflare.com/ajax/libs/three.js/91/three.js',
      cb
  );
};


export function gltfViewer(global) {
  const dataReceived = parseJson(global.name)['attributes']._context;

  loadThree(global, () => {
    const viewer = makeViewer(dataReceived, {
      onload: () => {
        global.parent.postMessage(JSON.stringify(dict({
          'notify': 'loaded',
        })), '*');
      },
      onprogress: e => {
        if (!e.lengthComputable) {
          return;
        }
        global.parent.postMessage(JSON.stringify(dict({
          'notify': 'progress',
          'total': e.total,
          'loaded': e.loaded,
        })), '*');
      },
      onerror: err => {
        console.error(err);
        global.parent.postMessage(JSON.stringify(dict({
          'notify': 'error',
          'error': (err || '').toString(),
        })), '*');
      },
    });
    global.addEventListener('message', e => {
      const msg = parseJson(getData(e));
      if (viewer) {
        viewer[msg['action']](msg['args']);
      } else {
        console.warn(
            `cannot perform action=${msg['action']}, viewer is not started`
        );
      }
    }, false);

    global.parent.postMessage(JSON.stringify(dict({
      'action': 'ready',
    })), '*');
  });
}
