import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function meg(global, data) {
  validateData(data, ['code']);
  const {code} = data;
  const lang = global.encodeURIComponent(global.navigator.language);
  const ref = global.encodeURIComponent(global.context.referrer);
  const params = ['lang=' + lang, 'ref=' + ref].join('&');
  const url = 'https://apps.meg.com/embedjs/' + code + '?' + params;
  global._megAdsLoaderCallbacks = {
    onSuccess: () => {
      global.context.renderStart();
    },
    onError: () => {
      global.context.noContentAvailable();
    },
  };
  loadScript(
    global,
    url,
    () => {
      // Meg has been loaded
    },
    () => {
      // Cannot load meg embed.js
      global.context.noContentAvailable();
    }
  );
}
