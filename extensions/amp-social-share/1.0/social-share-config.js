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
 * @return {SocialShareConfigDef|undefined}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * The SocialShareConfigDef contains the configuration data for pre-configured
 * types (i.e. 'twitter', 'facebook') for the Amp Social Share component.  The
 * config data contains the following properties:
 *   shareEndpoint {string} - The base API endpoint for sharing to the
 *     specified social media type.
 *   defaultParams {Object} - Parameters to be appended to the end of the
 *     shareEndpoint as query parameters.  The values in this object are used
 *     as binding keys which are resolved by the AMP framework.
 *   defaultColor {string} - Default color code for this social media type.
 *   defaultBackgroundColor {string} - Default background color code for this
 *     social media type.
 *   bindings {?Array<string>} - Used for email, allows passing in an
 *     attribute that be used in the endpoint, but not as a search param
 *
 * @typedef {{
 *   shareEndpont: string,
 *   defaultParams: Object<string, string>,
 *   defaultColor: string,
 *   defaultBackgroundColor: string,
 *   bindings: (!Array<string>|undefined),
 * }}
 */
let SocialShareConfigDef;

/**
 * @type {Object<string, SocialShareConfigDef>}
 */
const BUILTINS = {
  'twitter': {
    shareEndpoint: 'https://twitter.com/intent/tweet',
    defaultParams: dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '1da1f2',
  },
  'facebook': {
    shareEndpoint: 'https://www.facebook.com/dialog/share',
    defaultParams: dict({
      'href': 'CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '32529f',
  },
  'pinterest': {
    shareEndpoint: 'https://www.pinterest.com/pin/create/button/',
    defaultParams: dict({
      'url': 'CANONICAL_URL',
      'description': 'TITLE',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: 'e60023',
  },
  'linkedin': {
    shareEndpoint: 'https://www.linkedin.com/shareArticle',
    defaultParams: dict({
      'url': 'CANONICAL_URL',
      'mini': 'true',
    }),
    'defaultColor': 'ffffff',
    'defaultBackgroundColor': '0077b5',
  },
  'email': {
    shareEndpoint: 'mailto:RECIPIENT',
    defaultParams: dict({
      'subject': 'TITLE',
      'body': 'CANONICAL_URL',
      'recipient': '',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
    bindings: ['recipient'],
  },
  'tumblr': {
    shareEndpoint: 'https://www.tumblr.com/share/link',
    defaultParams: dict({
      'name': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '3c5a77',
  },
  'whatsapp': {
    shareEndpoint: 'https://api.whatsapp.com/send',
    defaultParams: dict({
      'text': 'TITLE - CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '25d366',
  },
  'line': {
    shareEndpoint: 'https://social-plugins.line.me/lineit/share',
    defaultParams: dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '52b448',
  },
  'sms': {
    shareEndpoint: 'sms:',
    defaultParams: dict({
      'body': 'TITLE - CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: 'ca2b63',
  },
  'system': {
    shareEndpoint: 'navigator-share:',
    defaultParams: dict({
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    }),
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
  },
};
