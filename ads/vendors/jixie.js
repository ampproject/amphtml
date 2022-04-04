import {loadScript} from '#3p/3p';

/**
 * @param {!Window} global
 */
export function jixie(global) {
  // For flexibility, all validations are performed in the
  // Jixie side based on the data on the page for the amp-ad
  loadScript(global, 'https://scripts.jixie.media/jxamp.min.js');
}
