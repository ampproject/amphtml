/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {AmpA4A} from '../../amp-a4a/0.1/amp-a4a';
import {NETWORKS} from './vendors';
import {assertAbsoluteHttpOrHttpsUrl} from '../../../src/url';
import {startsWith} from '../../../src/string';

/**
 * This is a minimalistic AmpA4A implementation that primarily gets an Ad
 * through a source URL and extracts the Cloudflare generated signature
 * from a HTTP header.  This is then given to A4A to validate against
 * the cloudflare signing key.  Also see AmpAdNetworkFakeImpl for
 * additional guidance on other implementation details.
 */
export class AmpAdNetworkCloudflareImpl extends AmpA4A {

  /**
   * Validate the tag parameters.  If invalid, ad ad will not be displayed.
   * @override
   */
  isValidElement() {
    const el = this.element;
    if (!(this.isAmpAdElement() && el.hasAttribute('data-cf-network'))) {
      return false;
    }

    const network = NETWORKS[el.getAttribute('data-cf-network')];
    if (!network) {
      return false;
    }

    const src = el.getAttribute('src') || network.src;
    if (!(src && startsWith(src, network.base))) {
      return false;
    }
    assertAbsoluteHttpOrHttpsUrl(src);

    return true;
  }

  /** @override */
  getSigningServiceNames() {
    // this specifies verification for Cloudflare signing
    return ['cloudflare'];
  }

  /**
   * Handle variable replacements
   *
   * @param {string} str input string to process
   * @param {?Object<string, string>} values to use in the replacements
   * @return {string} result with replaced tokens
   */
  replacements(str, values) {
    // allow injection of width and height as parameters
    str = str.replace(/SLOT_WIDTH/g, values.slotWidth);
    str = str.replace(/SLOT_HEIGHT/g, values.slotHeight);

    return str;
  }

  /** @override */
  getAdUrl() {
    const rect = this.getIntersectionElementLayoutBox();
    const el = this.element;

    const network = NETWORKS[el.getAttribute('data-cf-network')];
    const a4a = el.getAttribute('data-cf-a4a') !== 'false';
    const base = network.base;

    // Get URL for ad creative
    let url = el.getAttribute('src') || network.src;

    // optionally convert to a4a endpoint
    if (a4a && url.substr(base.length, 6) != '/_a4a/') {
      url = base + '/_a4a' + url.slice(base.length);
    }

    // compute replacement values
    const values = {
      slotWidth: (rect.width || 0).toString(),
      slotHeight: (rect.height || 0).toString(),
    };

    // encode for safety
    url = encodeURI(this.replacements(url, values));

    // include other data attributes as query parameters
    let pre = url.indexOf('?') < 0 ? '?' : '&';
    for (let i = 0; i < el.attributes.length; i++) {
      const attrib = el.attributes[i];
      if (attrib.specified && startsWith(attrib.name, 'data-')
          && !startsWith(attrib.name, 'data-cf-')) {
        url += pre + encodeURIComponent(attrib.name.substring(5)) +
          '=' + encodeURIComponent(this.replacements(attrib.value, values));
        pre = '&';
      }
    }

    return url;
  }
}


AMP.extension('amp-ad-network-cloudflare-impl', '0.1', AMP => {
  AMP.registerElement('amp-ad-network-cloudflare-impl',
      AmpAdNetworkCloudflareImpl);
});
