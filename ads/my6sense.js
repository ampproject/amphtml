/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {validateData} from '../3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function my6sense(global, data) {
  validateData(data, ['widgetKey']);

  const widgetTag = global.document.createElement('script');
  widgetTag.src = `//web-clients.mynativeplatform.com/web-clients/bootloaders/${data['widgetKey']}/bootloader.js`;
  const url =
    data['url'] && data['url'] !== '[PAGE_URL]'
      ? data['url']
      : global.context.sourceUrl;
  widgetTag.setAttribute('async', 'true');
  widgetTag.setAttribute('data-version', '3');
  widgetTag.setAttribute('data-url', url);
  widgetTag.setAttribute('data-zone', data['zone'] || '[ZONE]');
  widgetTag.setAttribute('data-google-amp', 'true');
  widgetTag.setAttribute(
    'data-organic-clicks',
    data['organicClicks'] || '[ORGANIC_TRACKING_PIXEL]'
  );
  widgetTag.setAttribute(
    'data-paid-clicks',
    data['paidClicks'] || '[PAID_TRACKING_PIXEL]'
  );
  widgetTag.setAttribute('data-display-within-iframe', 'true');
  global.document.body.appendChild(widgetTag);
}
