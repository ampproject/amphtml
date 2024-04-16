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
const BUILTINS = {
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
  'gplus': {
    'obsolete': true,
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
};
