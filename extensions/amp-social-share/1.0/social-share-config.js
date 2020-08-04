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

/**
 * Get social share configurations by supported type.
 * @param  {?string} type
 * @return {?SocialShareConfigDef}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * @typedef {{
 *   shareEndpont:           string,
 *   defaultParams:          Object<string, string>,
 *   defaultColor:           string,
 *   defaultBackgroundColor: string,
 *   bindings:               ?Array<string>,
 * }}
 */
let SocialShareConfigDef;

/**
 * This object contains the configuration data for pre-configured types (i.e.
 * 'twitter', 'facebook') for the Amp Social Share component.  The config data
 * contains the following properties:
 *   {string} shareEndpoint - The base API endpoint for sharing to the
 *     specified social media type.
 *   {Object} defaultParams - Parameters to be appended to the end of the
 *     shareEndpoint as query parameters.  The values in this object are used
 *     as binding keys which are resolved by the AMP framework.
 *   {string} defaultColor - Default color code for this social media type.
 *   {string} defaultBackgroundColor - Default background color code for this
 *     social media type.
 *   {?Array<string>} bindings - Used for email, allows passing in an
 *     attribute that be used in endpoint, but not as a search param
 * @type {Object<?string, SocialShareConfigDef>}
 */
const BUILTINS = {
  'twitter': {
    shareEndpoint: 'https://twitter.com/intent/tweet',
    defaultParams: {
      text: 'TITLE',
      url: 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '1da1f2',
  },
  'facebook': {
    shareEndpoint: 'https://www.facebook.com/dialog/share',
    defaultParams: {
      href: 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '32529f',
  },
  'pinterest': {
    shareEndpoint: 'https://www.pinterest.com/pin/create/button/',
    defaultParams: {
      url: 'CANONICAL_URL',
      description: 'TITLE',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: 'e60023',
  },
  'linkedin': {
    shareEndpoint: 'https://www.linkedin.com/shareArticle',
    defaultParams: {
      url: 'CANONICAL_URL',
      mini: 'true',
    },
    'defaultColor': 'ffffff',
    'defaultBackgroundColor': '0077b5',
  },
  'email': {
    shareEndpoint: 'mailto:RECIPIENT',
    defaultParams: {
      subject: 'TITLE',
      body: 'CANONICAL_URL',
      recipient: '',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
    bindings: ['recipient'],
  },
  'tumblr': {
    shareEndpoint: 'https://www.tumblr.com/share/link',
    defaultParams: {
      name: 'TITLE',
      url: 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '3c5a77',
  },
  'whatsapp': {
    shareEndpoint: 'https://api.whatsapp.com/send',
    defaultParams: {
      text: 'TITLE - CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '25d366',
  },
  'line': {
    shareEndpoint: 'https://social-plugins.line.me/lineit/share',
    defaultParams: {
      text: 'TITLE',
      url: 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '52b448',
  },
  'sms': {
    shareEndpoint: 'sms:',
    defaultParams: {
      body: 'TITLE - CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: 'ca2b63',
  },
  'system': {
    shareEndpoint: 'navigator-share:',
    defaultParams: {
      text: 'TITLE',
      url: 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
  },
};
