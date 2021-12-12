import {writeScript} from '#3p/3p';

/**
 * @param {!Window} global
 */
export function adsensor(global) {
  writeScript(
    global,
    'https://wfpscripts.webspectator.com/amp/adsensor-amp.js'
  );
}
