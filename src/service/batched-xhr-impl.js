import {map} from '#core/types/object';

import {Xhr} from './xhr-impl';

import {getService, registerServiceBuilder} from '../service-helpers';
import {getSourceOrigin, removeFragment, resolveRelativeUrl} from '../url';

/**
 * A wrapper around the Xhr service which batches the result of GET requests
 *
 * @package Visible for type.
 * @visibleForTesting
 */
export class BatchedXhr extends Xhr {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    super(win);

    /** @const {!{[key: string]: !Promise<!Response>}} */
    this.fetchPromises_ = map();
  }

  /**
   * Fetch and batch the requests if possible.
   *
   * @param {string} input URL
   * @param {?FetchInitDef=} opt_init Fetch options object.
   * @return {!Promise<!Response>}
   * @override
   */
  fetch(input, opt_init) {
    const accept =
      (opt_init && opt_init.headers && opt_init.headers['Accept']) || '';
    const isBatchable =
      !opt_init || !opt_init.method || opt_init.method === 'GET';
    const key = this.getMapKey_(input, accept);
    const isBatched = !!this.fetchPromises_[key];

    if (isBatchable && isBatched) {
      return this.fetchPromises_[key].then((response) => response.clone());
    }

    const fetchPromise = super.fetch(input, opt_init);

    if (isBatchable) {
      this.fetchPromises_[key] = fetchPromise.then(
        (response) => {
          delete this.fetchPromises_[key];
          return response.clone();
        },
        (err) => {
          delete this.fetchPromises_[key];
          throw err;
        }
      );
    }

    return fetchPromise;
  }

  /**
   * Creates a map key for a fetch.
   *
   * @param {string} input URL
   * @param {string} responseType
   * @return {string}
   * @private
   */
  getMapKey_(input, responseType) {
    const absoluteUrl = resolveRelativeUrl(
      input,
      getSourceOrigin(this.win.location)
    );
    return removeFragment(absoluteUrl) + responseType;
  }
}

/**
 * @param {!Window} window
 * @return {!BatchedXhr}
 */
export function batchedXhrServiceForTesting(window) {
  installBatchedXhrService(window);
  return getService(window, 'batched-xhr');
}

/**
 * @param {!Window} window
 */
export function installBatchedXhrService(window) {
  registerServiceBuilder(window, 'batched-xhr', BatchedXhr);
}
