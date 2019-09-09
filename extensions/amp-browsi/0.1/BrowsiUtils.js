import {Services} from '../../../src/services';

/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

export class BrowsiUtils {
  /**
   * @static
   * @return {string}
   */
  static getPvid() {
    return BrowsiUtils.pvid;
  }
  /**
   * @static
   * @return {string}
   */
  static generateToken() {
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    characters += characters.toUpperCase() + '_';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
  /**
   * @static
   * @param {string} url
   */
  static getRequest(url) {
    const Http = new XMLHttpRequest();
    Http.open('GET', url);
    Http.send();
    Http.onreadystatechange = () => {
      return Http.responseText;
    };
  }

  /**
   * @static
   * @param {!Element} ad
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {Object} additionalObj
   * @return {Object}
   */
  static buildAdData(ad, ampdoc, additionalObj) {
    const viewportService = Services.viewportForDoc(ampdoc);
    return viewportService.getClientRectAsync(ad).then(rect => {
      return Object.assign(
        {},
        {
          adUnit: ad.getAttribute('data-slot'),
          adType: ad.getAttribute('type'),
          adWidth: ad.getAttribute('width'),
          adHeight: ad.getAttribute('height'),
          adCWidth: rect.width,
          adCHeight: rect.height,
          adClasses: ad.getAttribute('class'),
        },
        additionalObj
      );
    });
  }
}

BrowsiUtils.pvid = BrowsiUtils.generateToken();
