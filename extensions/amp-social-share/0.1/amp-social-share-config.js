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

import {dict} from '../../../src/utils/object';

/**
 * Get social share configurations by supported type.
 * @param  {string} type
 * @return {!Object}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * @type {!JsonObject}
 */
const BUILTINS = dict({
  'twitter': {
    'shareEndpoint': 'https://twitter.com/intent/tweet',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
  },
  'facebook': {
    'shareEndpoint': 'https://www.facebook.com/dialog/share',
    'defaultParams': {
      'href': 'CANONICAL_URL',
    },
  },
  'pinterest': {
    'shareEndpoint': 'https://www.pinterest.com/pin/create/button/',
    'defaultParams': {
      'url': 'CANONICAL_URL',
      'description': 'TITLE',
    },
  },
  'linkedin': {
    'shareEndpoint': 'https://www.linkedin.com/shareArticle',
    'defaultParams': {
      'url': 'CANONICAL_URL',
      'mini': 'true',
    },
  },
  'email': {
    'bindings': ['recipient'],
    'shareEndpoint': 'mailto:RECIPIENT',
    'defaultParams': {
      'subject': 'TITLE',
      'body': 'CANONICAL_URL',
      'recipient': '',
    },
  },
  'tumblr': {
    'shareEndpoint': 'https://www.tumblr.com/share/link',
    'defaultParams': {
      'name': 'TITLE',
      'url': 'CANONICAL_URL',
    },
  },
  'whatsapp': {
    'shareEndpoint': 'https://api.whatsapp.com/send',
    'defaultParams': {
      'text': 'TITLE - CANONICAL_URL',
    },
  },
  'line': {
    'shareEndpoint': 'https://social-plugins.line.me/lineit/share',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
  },
  'sms': {
    'shareEndpoint': 'sms:',
    'defaultParams': {
      'body': 'TITLE - CANONICAL_URL',
    },
  },
  'system': {
    'shareEndpoint': 'navigator-share:',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
  },
});
