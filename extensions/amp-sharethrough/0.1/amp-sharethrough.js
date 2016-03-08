/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {isLayoutSizeDefined} from '../../../src/layout';
import {AmpMustache} from '../../../build/all/v0/amp-mustache-0.1.max';
import {xhrFor} from '../../../src/xhr';

/** @private @const */
/**
 * @type {string} The address where ads are fetched from
 */
const serverUrl = 'https://btlr.sharethrough.com/';
/**
 * @type {string} The address where analytics are posted
 */
const analyticsUrl = 'https://b.sharethrough.com/butler';

/**
 * @param {!Window} win Destination window for the new element.
 * @this {undefined}  // Make linter happy
 * @return {undefined}
 */
export class AmpSharethrough extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /**
   * Prefetches and preconnects URLs related to the ad.
   * @override
   */
  preconnectCallback(onLayout) {
    this.preconnect.url(serverUrl, onLayout);
    this.preconnect.url(analyticsUrl, onLayout);
  }

  /** @override */
  layoutCallback() {
    const pkey = AMP.assert(this.element.getAttribute('data-native-key'),
      'The data-native-key attribute is required for <amp-sharethrough> %s',
      this.element);

    const url = `${serverUrl}v4?placement_key=${pkey}`;

    return xhrFor(this.getWin()).fetchJson(url)
      .then(data => {
        if (data.creatives.length > 0) {

          const creative = data.creatives[0].creative;
          const rawTemplate = data.placement.placementAttributes.template;

          const templateElement = document.createElement('div');
          templateElement./*REVIEW*/innerHTML = this.unencodeHTML(rawTemplate);

          const template = new AmpMustache(templateElement);
          template.compileCallback();
          const result = template.render(creative);
          const idSelector = `${creative.creative_key}-${pkey}`;
          result.setAttribute('id', idSelector);

          this.element.appendChild(result);
          this.element.appendChild(this.analyticsHTML(idSelector));
          this.element.appendChild(this.pixelHTML(creative.creative_key, pkey));
        }
      }, err => {
        console./*OK*/error(this.getName_(),
          'Error loading data from exchange using url: ', url, err);
      });
  }

  unencodeHTML(html) {
    return html.replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  analyticsHTML(idSelector) {
    const analyticsElement = document.createElement('amp-analytics');
    analyticsElement./*REVIEW*/innerHTML = '<script type="application/json">'
    + '{'
    + '  "requests": {'
    + '    "event": "' + analyticsUrl + '?ckey=${ckey}&type=${eventLabel}"'
    + '  },'
    + '  "triggers": {'
    + '    "trackAdVisible": {'
    + '      "on": "visible",'
    + '      "selector": "#' + idSelector + '",'
    + '      "request": "event",'
    + '      "vars": {'
    + '        "ckey": "creative_key",'
    + '        "eventLabel": "visible"'
    + '      }'
    + '    }'
    + '  }'
    + '}'
    + '</script>';
    return analyticsElement;
  }

  pixelHTML(ckey, pkey) {
    const pixelElement = document.createElement('amp-pixel');
    pixelElement.setAttribute('src',
      `${analyticsUrl}?ckey=${ckey}&pkey=${pkey}&type=rendered`);
    return pixelElement;
  }
}

AMP.registerElement('amp-sharethrough', AmpSharethrough);

