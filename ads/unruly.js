/* eslint-disable no-unused-vars */


import {loadScript} from '../3p/3p';

export function unruly(global, data, scriptLoader = loadScript) {
  global.unruly = global.unruly || {};
  global.unruly.native = {
    siteId: data.siteid,
  };

  scriptLoader(global, 'https://video.unrulymedia.com/amp-demo/native-loader.js');

}
