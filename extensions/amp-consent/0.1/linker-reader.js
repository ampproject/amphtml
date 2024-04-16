import {hasOwn} from '#core/types/object';
import {parseQueryString} from '#core/types/string/url';

import {user} from '#utils/log';

import {parseLinker} from './linker';

const TAG = 'amp-consent/linker-reader';

export class ConsentLinkerReader {
  /**
   * Creates an instance of ConsentLinkerReader.
   * @param {!Window} win
   */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {!{[key: string]: ?{[key: string]: string}}} */
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
      this.linkerParams_[name] = this.maybeParseQueryString_(name);
    }

    if (this.linkerParams_[name] && this.linkerParams_[name][id]) {
      return this.linkerParams_[name][id];
    }

    return null;
  }

  /**
   * Maybe parse the url if the key is found. Return the value
   * if found, null otherwise. Do no remove LINKER_PARAM from
   * window location.
   * @param {string} name
   * @return {?{[key: string]: string}}
   */
  maybeParseQueryString_(name) {
    const params = parseQueryString(this.win_.location.search);
    if (!hasOwn(params, name)) {
      // Linker param not found.
      return null;
    }
    const value = params[name];
    return parseLinker(value);
  }
}
