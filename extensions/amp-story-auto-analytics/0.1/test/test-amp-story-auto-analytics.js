/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-story-auto-analytics';
import {createElementWithAttributes} from '#core/dom';

describes.realWin(
  'amp-story-auto-analytics',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-auto-analytics'],
    },
  },
  (env) => {
    let win;
    let autoAnalyticsEl;

    beforeEach(() => {
      win = env.win;
      autoAnalyticsEl = createElementWithAttributes(
        win.document,
        'amp-story-auto-analytics',
        {
          'gtag-id': 'ANALYTICS-ID',
        }
      );
      win.document.body.appendChild(autoAnalyticsEl);
    });

    it('should contain the analytics ID in the script when built', async () => {
      await autoAnalyticsEl.whenBuilt();
      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        'ANALYTICS-ID'
      );
    });

    it('should set the type to gtag', async () => {
      await autoAnalyticsEl.whenBuilt();
      expect(autoAnalyticsEl.querySelector('amp-analytics[type="gtag"]')).to
        .exist;
    });

    it('should add linker config', async () => {
      await autoAnalyticsEl.whenBuilt();
      const config = {
        'linkers': {
          'ampStoryAutoAnalyticsLinker': {
            'ids': {
              'cid': '${clientId}',
            },
            'enabled': true,
            'proxyOnly': false,
          },
        },
      };

      const strConfig = JSON.stringify(config);
      const configContents = strConfig.substr(1, strConfig.length - 2);

      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        configContents
      );
    });

    it('should add cookieWriter config', async () => {
      await autoAnalyticsEl.whenBuilt();
      const config = {
        'cookies': {
          'ampStoryAutoAnalyticsCookies': {
            'value': 'LINKER_PARAM(ampStoryAutoAnalyticsLinker, cid)',
          },
        },
      };

      const strConfig = JSON.stringify(config);
      const configContents = strConfig.substr(1, strConfig.length - 2);

      expect(autoAnalyticsEl.querySelector('script').textContent).to.contain(
        configContents
      );
    });
  }
);
