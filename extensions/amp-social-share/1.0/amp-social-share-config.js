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

import {dict} from '../../../src/utils/object';

/**
 * Get social share configurations by supported type.
 * @param  {string} type
 * @return {!SocialShareConfigDef}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * @typedef {{
 *   paramUrl: string,
 *   paramText:string,
 *   paramMini: string,
 *   paramRecipient: string,
 * }}
 */
let ShareEndpointArgsDef;

/**
 * @typedef {!Object<string, !JsonObject|string|function(!ShareEndpointArgsDef):string>}
 */
let SocialShareConfigDef;

/**
 * @type {!Object<string, !SocialShareConfigDef>}
 */
const BUILTINS = {
  'twitter': {
    'shareEndpointAmp': 'https://twitter.com/intent/tweet',
    'shareEndpointPreact': ({paramUrl, paramText}) =>
      `https://twitter.com/intent/tweet?text=${paramText}&url=${paramUrl}`,
    'defaultParams': dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
  },
  'facebook': {
    'shareEndpointAmp': 'https://www.facebook.com/dialog/share',
    'shareEndpointPreact': ({paramUrl}) =>
      `https://www.facebook.com/dialog/share?href=${paramUrl}`,
    'defaultParams': dict({
      'href': 'CANONICAL_URL',
    }),
  },
  'pinterest': {
    'shareEndpointAmp': 'https://www.pinterest.com/pin/create/button/',
    'shareEndpointPreact': ({paramUrl, paramText}) =>
      `https://www.pinterest.com/pin/create/button/?url=${paramUrl}&description=${paramText}`,
    'defaultParams': dict({
      'url': 'CANONICAL_URL',
      'description': 'TITLE',
    }),
  },
  'linkedin': {
    'shareEndpointAmp': 'https://www.linkedin.com/shareArticle',
    'shareEndpointPreact': ({paramUrl, paramMini}) =>
      `https://www.linkedin.com/shareArticle?url=${paramUrl}&mini=${paramMini}`,
    'defaultParams': dict({
      'url': 'CANONICAL_URL',
      'mini': 'true',
    }),
  },
  'email': {
    'bindings': ['recipient'],
    'shareEndpointAmp': 'mailto:RECIPIENT',
    'shareEndpointPreact': ({paramRecipient, paramText, paramUrl}) =>
      `mailto:${paramRecipient}?subject=${paramText}&body=${paramUrl}`,
    'defaultParams': dict({
      'subject': 'TITLE',
      'body': 'CANONICAL_URL',
      'recipient': '',
    }),
  },
  'tumblr': {
    'shareEndpointAmp': 'https://www.tumblr.com/share/link',
    'shareEndpointPreact': ({paramText, paramUrl}) =>
      `https://www.tumblr.com/share/link?name=${paramText}&url=${paramUrl}`,
    'defaultParams': dict({
      'name': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
  },
  'whatsapp': {
    'shareEndpointAmp': 'https://api.whatsapp.com/send',
    'shareEndpointPreact': ({paramText}) =>
      `https://api.whatsapp.com/send?text=${paramText}`,
    'defaultParams': dict({
      'text': 'TITLE - CANONICAL_URL',
    }),
  },
  'line': {
    'shareEndpointAmp': 'https://social-plugins.line.me/lineit/share',
    'shareEndpointPreact': ({paramText, paramUrl}) =>
      `https://social-plugins.line.me/lineit/share?text=${paramText}&url=${paramUrl}`,
    'defaultParams': dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
  },
  'sms': {
    'shareEndpointAmp': 'sms:',
    'shareEndpointPreact': ({paramText, paramUrl}) =>
      `sms:?body=${paramText} - ${paramUrl}`,
    'defaultParams': dict({
      'body': 'TITLE - CANONICAL_URL',
    }),
  },
  'system': {
    'shareEndpointAmp': 'navigator-share:',
    'shareEndpointPreact': ({paramText, paramUrl}) =>
      `navigator-share:?text=${paramText}&url=${paramUrl}`,
    'defaultParams': dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
  },
};
