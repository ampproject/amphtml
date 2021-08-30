import {getService, registerServiceBuilder} from '../../../src/service-helpers';
import {hasOwn} from '#core/types/object';
import {parseLinker} from './linker';
import {parseQueryString} from '#core/types/string/url';
import {removeParamsFromSearch} from '../../../src/url';

import {user} from '../../../src/log';

const TAG = 'amp-analytics/linker-reader';

export class LinkerReader {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!Object<string, ?Object<string, string>>} */
    this.linkerParams_ = {};
  }

  /**
   * Get the LINKER_PARAM(name, id) value from url and clean the value
   * @param {string} name
   * @param {string} id
   * @return {?string}
   */
  get(name, id) {
    if (!name || !id) {
      user().error(TAG, 'LINKER_PARAM requires two params, name and id');
      return null;
    }

    if (!hasOwn(this.linkerParams_, name)) {
      this.linkerParams_[name] = this.parseAndCleanQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      return this.linkerParams_[name][id];
    }

    return null;
  }

  /**
   * Parse the url get the key value pair for the linker name
   * and remove the LINKER_PARAM from window location
   * @param {string} name
   * @return {?Object<string, string>}
   */
  parseAndCleanQueryString_(name) {
    const params = parseQueryString(this.win_.location.search);
    if (!hasOwn(params, name)) {
      // Linker param not found.
      return null;
    }
    const value = params[name];
    this.removeLinkerParam_(this.win_.location, name);
    return parseLinker(value);
  }

  /**
   * Remove the linker param from the current url
   * @param {!Location} url
   * @param {string} name
   */
  removeLinkerParam_(url, name) {
    if (!this.win_.history.replaceState) {
      // Can't replace state. Ignore
      return;
    }
    const searchUrl = url.search;
    const removedLinkerParamSearchUrl = removeParamsFromSearch(searchUrl, name);
    const newHref =
      url.origin +
      url.pathname +
      removedLinkerParamSearchUrl +
      (url.hash || '');
    this.win_.history.replaceState(null, '', newHref);
  }
}

/**
 * @param {!Window} win
 */
export function installLinkerReaderService(win) {
  registerServiceBuilder(win, 'amp-analytics-linker-reader', LinkerReader);
}

/**
 * @param {!Window} win
 * @return {!LinkerReader}
 */
export function linkerReaderServiceFor(win) {
  return getService(win, 'amp-analytics-linker-reader');
}
