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
import {user} from '../../../src/log';

/**
 * Get social share configurations by supported type.
 * @param  {!string}
 * @return {!Object}
 */
export function getSocialConfig(type) {
  user.assert(type in BUILTINS,
    'Unknown social share type ' + type);
  return BUILTINS[type];
}

/**
 * @type {Object<string, Object>}
 */
const BUILTINS = {
  'twitter': {
    'url': 'https://twitter.com/intent/tweet',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'url': {
        'param': 'url',
        'required': false,
        'type': 'url',
        'maxlength': 1024,
      },
      'text': {
        'param': 'text',
        'required': false,
        'type': 'text',
        'maxlength': 140,
      },
      'attribution': {
        'param': 'via',
        'required': false,
        'type': 'text',
        'maxlength': 20,
      },
    },
  },
  'facebook': {
    'url': 'https://www.facebook.com/dialog/share',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'url': {
        'param': 'href',
        'required': false,
        'type': 'url',
        'maxlength': 1024,
      },
      'attribution': {
        'param': 'app_id',
        'required': true,
        'type': 'text',
        'maxlength': 128,
      },
    },
  },
  'pinterest': {
    'url': 'https://www.pinterest.com/pin/create/button/',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'url': {
        'param': 'url',
        'required': false,
        'type': 'url',
        'maxlength': 1024,
      },
      'text': {
        'param': 'description',
        'required': false,
        'type': 'text',
        'maxlength': 140,
      },
      'image': {
        'param': 'media',
        'required': false,
        'type': 'url',
        'maxlength': 1024,
      },
    },
  },
  'linkedin': {
    'url': 'https://www.linkedin.com/shareArticle',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'url': {
        'param': 'url',
        'required': true,
        'type': 'url',
        'maxlength': 1024,
      },
      'text': {
        'param': 'title',
        'required': false,
        'type': 'text',
        'maxlength': 200,
      },
      'attribution': {
        'param': 'source',
        'required': false,
        'type': 'text',
        'maxlength': 200,
      },
      'mini': {
        'param': 'mini',
        'required': false,
        'type': 'fixed',
        'value': 'true',
      },
    },
  },
  'gplus': {
    'url': 'https://plus.google.com/share',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'url': {
        'param': 'url',
        'required': true,
        'type': 'url',
        'maxlength': 1024,
      },
    },
  },
  'email': {
    'url': 'mailto:',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'text': {
        'param': 'subject',
        'required': true,
        'type': 'text',
        'maxlength': 1024,
      },
      'url': {
        'param': 'body',
        'required': true,
        'type': 'url',
        'maxlength': 1024,
      },
    },
  },
  'whatsapp': {
    'url': 'whatsapp://send',
    'text': '\u00A0', // Use a nbsp to ensure the anchor isn't collapsed
    'params': {
      'text': {
        'param': 'text',
        'required': true,
        'type': 'text',
        'maxlength': 500,
      },
    },
  },
};
