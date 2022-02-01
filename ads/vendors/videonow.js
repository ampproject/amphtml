import {loadScript, validateData} from '#3p/3p';

import {parseJson} from '#core/types/object/json';
import {tryDecodeUriComponent} from '#core/types/string/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function videonow(global, data) {
  const mandatoryAttributes = ['pid'];
  const optionalAttributes = ['kind', 'src'];

  let customTag = '';
  let logLevel = null;
  let vnModule = '';

  if (global && global.name) {
    const p = parseJson(global.name);
    if (
      p &&
      p['attributes'] &&
      p['attributes']['_context'] &&
      p['attributes']['_context']['location'] &&
      p['attributes']['_context']['location']['href']
    ) {
      const {href} = p['attributes']['_context']['location'];
      const logLevelParsed = /[?&]vn_debug\b(?:=(\d+))?/.exec(href);
      const vnModuleParsed = /vn_module=([^&]*)/.exec(href);
      const customTagParsed = /vn_init_module=([^&]*)/.exec(href);

      logLevel = (logLevelParsed && logLevelParsed[1]) || null;
      vnModule = (vnModuleParsed && vnModuleParsed[1]) || '';
      customTag = (customTagParsed && customTagParsed[1]) || '';
    }
  }
  validateData(data, mandatoryAttributes, optionalAttributes);

  const profileId = data.pid || 1;

  // production version by default
  let script =
    (customTag && tryDecodeUriComponent(customTag)) ||
    (data.src && tryDecodeUriComponent(data.src)) ||
    'https://cdn.videonow.ru/vn_init_module.js';

  script = addParam(script, 'amp', 1);
  script = addParam(script, 'profileId', profileId);
  if (logLevel !== null) {
    script = addParam(script, 'vn_debug', String(logLevel));
  }
  if (vnModule) {
    script = addParam(script, 'vn_module', vnModule);
  }

  loadScript(global, script);
}

/**
 * @param {string} script
 * @param {string} name
 * @param {string|number}value
 * @return {string}
 */
function addParam(script, name, value) {
  if (script.indexOf(name) < 0) {
    script += (~script.indexOf('?') ? '&' : '?') + name + '=' + value;
  }
  return script;
}
