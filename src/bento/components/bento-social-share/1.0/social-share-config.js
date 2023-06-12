/**
 * Get social share configurations by supported type.
 * @param  {string} type
 * @return {BentoSocialShareConfigDef|undefined}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * The BentoSocialShareDef.Config contains the configuration data for pre-configured
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
 *     attribute that can be used in the endpoint, but not as a search param
 *
 * @typedef {{
 *   shareEndpont: string,
 *   defaultParams: {[key: string]: string},
 *   defaultColor: string,
 *   defaultBackgroundColor: string,
 *   bindings: (!Array<string>|undefined),
 * }}
 */
let BentoSocialShareConfigDef;

/**
 * @type {{[key: string]: BentoSocialShareConfigDef}}
 */
const BUILTINS = {
  'twitter': {
    shareEndpoint: 'https://twitter.com/intent/tweet',
    defaultParams: {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '1da1f2',
  },
  'facebook': {
    shareEndpoint: 'https://www.facebook.com/dialog/share',
    defaultParams: {
      'href': 'CANONICAL_URL',
    },
    defaultColor: '1877f2',
    defaultBackgroundColor: 'ffffff',
  },
  'pinterest': {
    shareEndpoint: 'https://www.pinterest.com/pin/create/button/',
    defaultParams: {
      'url': 'CANONICAL_URL',
      'description': 'TITLE',
    },
    defaultColor: 'e60023',
    defaultBackgroundColor: 'ffffff',
  },
  'linkedin': {
    shareEndpoint: 'https://www.linkedin.com/shareArticle',
    defaultParams: {
      'url': 'CANONICAL_URL',
      'mini': 'true',
    },
    'defaultColor': 'ffffff',
    'defaultBackgroundColor': '0a66c2',
  },
  'email': {
    shareEndpoint: 'mailto:RECIPIENT',
    defaultParams: {
      'subject': 'TITLE',
      'body': 'CANONICAL_URL',
      'recipient': '',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
    bindings: ['recipient'],
  },
  'tumblr': {
    shareEndpoint: 'https://www.tumblr.com/share/link',
    defaultParams: {
      'name': 'TITLE',
      'url': 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '001935',
  },
  'whatsapp': {
    shareEndpoint: 'https://api.whatsapp.com/send',
    defaultParams: {
      'text': 'TITLE - CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '25d366',
  },
  'line': {
    shareEndpoint: 'https://social-plugins.line.me/lineit/share',
    defaultParams: {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '00b900',
  },
  'sms': {
    shareEndpoint: 'sms:',
    defaultParams: {
      'body': 'TITLE - CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
  },
  'system': {
    shareEndpoint: 'navigator-share:',
    defaultParams: {
      'text': 'TITLE',
      'url': 'CANONICAL_URL',
    },
    defaultColor: 'ffffff',
    defaultBackgroundColor: '000000',
  },
};
