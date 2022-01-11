/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param {string} gtagId
 * @return {!Object}
 */
export const buildGtagConfig = (gtagId) => ({
  'vars': {
    'gtag_id': gtagId,
  },
  'triggers': {
    'storyPageCount': {
      'on': 'story-content-loaded',
      'vars': {
        'event_name': 'custom',
        'event_action': 'story_page_count',
        'event_category': '${title}',
        'event_label': '${storyPageCount}',
        'send_to': [gtagId],
      },
      'storySpec': {
        // Makes sure the event is only fired once.
        'repeat': false,
      },
    },
    'storyEnd': {
      'on': 'story-last-page-visible',
      'vars': {
        'event_name': 'custom',
        'event_action': 'story_complete',
        'event_category': '${title}',
        'event_label': '${title}',
        'send_to': [gtagId],
      },
      'storySpec': {
        // Makes sure the event is only fired once.
        'repeat': false,
      },
    },
    'storyPageIndex': {
      'on': 'story-page-visible',
      'vars': {
        'event_name': 'custom',
        'event_action': 'story_pages_viewed',
        'event_category': '${title}',
        'event_label': '${storyPageIndex}',
        'send_to': [gtagId],
      },
      'storySpec': {
        // Makes sure the event is only fired once.
        'repeat': false,
      },
    },
  },
  // Linkers stitch sessions between cache and origin together using cid.
  'linkers': {
    'ampStoryAutoAnalyticsLinker': {
      'ids': {
        'cid': '${clientId}',
      },
      'enabled': true,
      // Makes sure URL is decorated from origin to cache. (Default is cache to
      // origin only).
      'proxyOnly': false,
    },
  },
  // CookieWriter config is used to extract the url params and store them into
  // cookies.
  'cookies': {
    'ampStoryAutoAnalyticsCookies': {
      // Reads URL linker params and stores them as cookies.
      'value': 'LINKER_PARAM(ampStoryAutoAnalyticsLinker, cid)',
    },
  },
});
