import {loadScript, validateData} from '../3p/3p';

export function byplay(global, data) {
  validateData(data, ['vastUrl']);

  global.BYPLAY_VAST_URL = data.vastUrl;

  loadScript(global, 'https://cdn.byplay.net/amp-byplay-v2.js');
}
