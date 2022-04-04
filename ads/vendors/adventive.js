import {loadScript, validateData, writeScript} from '#3p/3p';

import {hasOwn} from '#core/types/object';
import {endsWith} from '#core/types/string';

import {addParamsToUrl} from '../../src/url';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function adventive(global, data) {
  if (hasOwn(data, 'isDev')) {
    adventive_(global, data);
  } else {
    validateData(data, ['src'], ['isDev']);
    writeScript(global, `${data.src}&isAmp=1`);
  }
}

const adv = {
    addInstance: () => {},
    args: {},
    isLibLoaded: false,
    mode: {
      dev: false,
      live: false,
      localDev: false,
      preview: false,
      prod: false,
      testing: false,
    },
  },
  requiredData = ['pid'],
  optionalData = ['click', 'async', 'isDev'],
  sld = {true: 'adventivedev', false: 'adventive'},
  thld = {true: 'amp', false: 'ads'},
  cacheTime = 5;

/**
 * Future data:
 * - async
 * - click
 * - height
 * - isDev
 * - width
 * - pid
 *
 * Considerations:
 * - Recipe reuse for multi-placed Ads.
 * - Reduce request to only what is needed
 * - Mitigate risk of data corruption
 *
 * @todo implement multi-size handling for multi-slotted ads. @see doubleclick
 *
 * @param {!Window} global
 * @param {!Object} data
 */
function adventive_(global, data) {
  validateData(data, requiredData, optionalData);

  if (!hasOwn(global, 'adventive')) {
    global.adventive = adv;
  }
  const ns = global.adventive;
  if (!hasOwn(ns, 'context')) {
    ns.context = global.context;
  }

  if (!Object.isFrozen(ns.mode)) {
    updateMode(ns.mode, global.context.location.hostname);
  }

  const cb = callback.bind(this, data.pid, ns),
    url = getUrl(global.context, data, ns);
  url
    ? (hasOwn(data, 'async') ? loadScript : writeScript)(global, url, cb)
    : cb();
}

/**
 * @param {!Object} mode
 * @param {string} hostname
 */
function updateMode(mode, hostname) {
  mode.localDev = hostname === 'localhost';
  mode.dev = !mode.localDev && endsWith(hostname, `${sld[false]}.com`);
  mode.prod = !mode.localDev && endsWith(hostname, `${sld[true]}.com`);
  mode.preview = (mode.dev || mode.prod) && hostname.startsWith('/ad');
  mode.testing = (mode.dev || mode.prod) && hostname.startsWith('/testing');
  mode.live = (mode.testing || !mode.preview) && !mode.localDev;

  Object.freeze(mode);
}

/**
 * @param {string} id
 * @param {!Object} ns
 */
function callback(id, ns) {
  ns.addInstance(id);
}

/**
 * @param {!Object} context
 * @param {!Object} data
 * @param {!Object} ns
 * @return {string|boolean} if a search query is generated, a full url is
 *    provided, otherwise false
 */
function getUrl(context, data, ns) {
  const {mode} = ns,
    isDev = hasOwn(data, 'isDev'),
    sld_ = sld[!mode.dev],
    thld_ = thld[isDev && !mode.live],
    search = reduceSearch(ns, data.pid, data.click, context.referrer),
    url = search
      ? addParamsToUrl(`https://${thld_}.${sld_}.com/ad`, search)
      : false;
  return url;
}

/**
 * @todo determine if we can reduce the request to nothing & return false
 * @todo usage of RTC may be applicable here for macros
 * @todo check if click-macros can be offloaded to amp-analytics (i.e recipe)
 *
 * @param {!Object} ns
 * @param {string} placementId
 * @param {string} click
 * @param {string} referrer
 * @return {JsonObject} if no more data is needed, false, otherwise JSON
 *    representation of the url search query.
 */
function reduceSearch(ns, placementId, click, referrer) {
  const isRecipeLoaded = hasOwn(ns.args, 'placementId');
  let isRecipeStale = true;
  if (isRecipeLoaded) {
    const info = ns.args[placementId];
    isRecipeStale = Date.now() - info['requestTime'] > 60 * cacheTime;
  }
  const needsRequest = !isRecipeLoaded || isRecipeStale;

  return !needsRequest
    ? null
    : {
        'click': click,
        'referrer': referrer,
        'isAmp': '1',
        'lib': !ns.isLibLoaded ? '1' : '', // may be prefetchable via _config
        'pid': needsRequest ? placementId : '',
      };
}
