import * as ampToolboxCacheUrl from '@ampproject/toolbox-cache-url';

import * as urls from '../../../src/config/urls';

export class AmpCacheUrlService {
  /**
   * Create cache url service
   */
  constructor() {}

  /**
   *
   * @param {string} url
   * @param {string=} cacheDomain the cache domain name (eg: cdn.approject.org)
   * @return {!Promise<string>}
   */
  createCacheUrl(url, cacheDomain = urls.cdn) {
    return ampToolboxCacheUrl.createCacheUrl(
      cacheDomain.replace(/https?:\/\//, ''),
      url
    );
  }
}

AMP.extension('amp-cache-url', '0.1', (AMP) => {
  AMP.registerServiceForDoc('cache-url', AmpCacheUrlService);
});
