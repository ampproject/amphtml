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

import {map} from '../../../src/utils/object';
import {parseSrcset} from '../../../src/srcset';
import {startsWith} from '../../../src/string';
import {user} from '../../../src/log';

const TAG = 'amp-bind';

/**
 * @typedef {{
 *   allowedProtocols: (!Object<string,boolean>|undefined),
 *   alternativeName: (string|undefined),
 * }}
 */
let PropertyRulesDef;

/**
 * Property rules that apply to any and all tags.
 * @private {Object<string, ?PropertyRulesDef>}
 */
const GLOBAL_PROPERTY_RULES = map({
  'text': null,
  'class': {
    blacklistedValueRegex: '(^|\\W)i-amphtml-',
  },
});

/**
 * Property rules that apply to all AMP elements.
 * @private {Object<string, Object<string, ?PropertyRulesDef>>}
 */
const AMP_PROPERTY_RULES = map({
  'width': null,
  'height': null,
});

/**
 * Maps tag names to property names to PropertyRulesDef.
 * If `ELEMENT_RULES[tag][property]` is null, then all values are valid
 * for that property in that tag.
 * @private {Object<string, Object<string, ?PropertyRulesDef>>}}
 */
const ELEMENT_RULES = createElementRules_();

/**
 * Map whose keys comprise all properties that contain URLs.
 * @private {Object<string, boolean>}
 */
const URL_PROPERTIES = map({
  'src': true,
  'srcset': true,
  'href': true,
});

/**
 * BindValidator performs runtime validation of Bind expression results.
 *
 * For performance reasons, the validation rules enforced are a subset
 * of the AMP validator's, selected with a focus on security and UX.
 */
export class BindValidator {
  /**
   * Returns true if (tag, property) binding is allowed.
   * Otherwise, returns false.
   * @note `tag` and `property` are case-sensitive.
   * @param {!string} tag
   * @param {!string} property
   * @return {boolean}
   */
  canBind(tag, property) {
    return (this.rulesForTagAndProperty_(tag, property) !== undefined);
  }

  /**
   * Returns true if `value` is a valid result for a (tag, property) binding.
   * Otherwise, returns false.
   * @param {!string} tag
   * @param {!string} property
   * @param {?string} value
   * @return {boolean}
   */
  isResultValid(tag, property, value) {
    let rules = this.rulesForTagAndProperty_(tag, property);

    // `alternativeName` is a reference to another property's rules.
    if (rules && rules.alternativeName) {
      rules = this.rulesForTagAndProperty_(tag, rules.alternativeName);
    }

    // If binding to (tag, property) is not allowed, return false.
    if (rules === undefined) {
      return false;
    }

    // If binding is allowed but have no specific rules, return true.
    if (rules === null) {
      return true;
    }

    // Validate URL(s) if applicable.
    if (value && URL_PROPERTIES[property]) {
      let urls;
      if (property === 'srcset') {
        let srcset;
        try {
          srcset = parseSrcset(value);
        } catch (e) {
          user().error(TAG, 'Failed to parse srcset: ', e);
          return false;
        }
        const sources = srcset.getSources();
        urls = sources.map(source => source.url);
      } else {
        urls = [value];
      }

      for (let i = 0; i < urls.length; i++) {
        if (!this.isUrlValid_(urls[i], rules)) {
          return false;
        }
      }
    }

    // @see validator/engine/validator.ParsedTagSpec.validateAttributes()
    const blacklistedValueRegex = rules.blacklistedValueRegex;
    if (value && blacklistedValueRegex) {
      const re = new RegExp(blacklistedValueRegex, 'i');
      if (re.test(value)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns true if a url's value is valid within a property rules spec.
   * @param {string} url
   * @param {!PropertyRulesDef} rules
   * @return {boolean}
   * @private
   */
  isUrlValid_(url, rules) {
    // @see validator/engine/validator.ParsedUrlSpec.validateUrlAndProtocol()
    const allowedProtocols = rules.allowedProtocols;
    if (allowedProtocols && url) {
      const re = /^([^:\/?#.]+):[\s\S]*$/;
      const match = re.exec(url);
      if (match !== null) {
        const protocol = match[1].toLowerCase().trimLeft();
        // hasOwnProperty() needed since nested objects are not prototype-less.
        if (!allowedProtocols.hasOwnProperty(protocol)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Returns the property rules object for (tag, property), if it exists.
   * Returns null if binding is allowed without constraints.
   * Returns undefined if binding is not allowed.
   * @return {(?PropertyRulesDef|undefined)}
   * @private
   */
  rulesForTagAndProperty_(tag, property) {
    const globalPropertyRules = GLOBAL_PROPERTY_RULES[property];
    if (globalPropertyRules !== undefined) {
      return globalPropertyRules;
    }
    const tagRules = ELEMENT_RULES[tag];
    // hasOwnProperty() needed since nested objects are not prototype-less.
    if (tagRules && tagRules.hasOwnProperty(property)) {
      return tagRules[property];
    }
    const ampPropertyRules = AMP_PROPERTY_RULES[property];
    if (startsWith(tag, 'AMP-') && ampPropertyRules !== undefined) {
      return ampPropertyRules;
    }
    return undefined;
  }
}

/**
 * @return {Object<string, Object<string, ?PropertyRulesDef>>}}
 * @private
 */
function createElementRules_() {
  // Initialize `rules` with tag-specific constraints.
  const rules = map({
    'AMP-BRIGHTCOVE': {
      'data-account': null,
      'data-embed': null,
      'data-player': null,
      'data-player-id': null,
      'data-playlist-id': null,
      'data-video-id': null,
    },
    'AMP-CAROUSEL': {
      'slide': null,
    },
    'AMP-IFRAME': {
      'src': null,
    },
    'AMP-IMG': {
      'alt': null,
      'attribution': null,
      'src': {
        'allowedProtocols': {
          'data': true,
          'http': true,
          'https': true,
        },
      },
      'srcset': {
        'alternativeName': 'src',
      },
    },
    'AMP-LIST': {
      'src': {
        'allowedProtocols': {
          'https': true,
        },
      },
    },
    'AMP-SELECTOR': {
      'selected': null,
    },
    'AMP-STATE': {
      'src': {
        'allowedProtocols': {
          'https': true,
        },
      },
    },
    'AMP-VIDEO': {
      'alt': null,
      'attribution': null,
      'controls': null,
      'loop': null,
      'poster': null,
      'preload': null,
      'src': {
        'allowedProtocols': {
          'https': true,
        },
      },
    },
    'AMP-YOUTUBE': {
      'data-videoid': null,
    },
    'A': {
      'href': {
        'allowedProtocols': {
          'ftp': true,
          'http': true,
          'https': true,
          'mailto': true,
          'fb-messenger': true,
          'intent': true,
          'skype': true,
          'sms': true,
          'snapchat': true,
          'tel': true,
          'tg': true,
          'threema': true,
          'twitter': true,
          'viber': true,
          'whatsapp': true,
        },
      },
    },
    'BUTTON': {
      'disabled': null,
      'type': null,
      'value': null,
    },
    'FIELDSET': {
      'disabled': null,
    },
    'INPUT': {
      'accept': null,
      'accesskey': null,
      'autocomplete': null,
      'checked': null,
      'disabled': null,
      'height': null,
      'inputmode': null,
      'max': null,
      'maxlength': null,
      'min': null,
      'minlength': null,
      'multiple': null,
      'pattern': null,
      'placeholder': null,
      'readonly': null,
      'required': null,
      'selectiondirection': null,
      'size': null,
      'spellcheck': null,
      'step': null,
      'type': {
        blacklistedValueRegex: '(^|\\s)(button|file|image|password|)(\\s|$)',
      },
      'value': null,
      'width': null,
    },
    'OPTION': {
      'disabled': null,
      'label': null,
      'selected': null,
      'value': null,
    },
    'OPTGROUP': {
      'disabled': null,
      'label': null,
    },
    'SELECT': {
      'autofocus': null,
      'disabled': null,
      'multiple': null,
      'required': null,
      'size': null,
    },
    'SOURCE': {
      'src': {
        'allowedProtocols': {
          'https': true,
        },
      },
      'type': null,
    },
    'TRACK': {
      'label': null,
      'src': {
        'allowedProtocols': {
          'https': true,
        },
      },
      'srclang': null,
    },
    'TEXTAREA': {
      'autocomplete': null,
      'autofocus': null,
      'cols': null,
      'disabled': null,
      'maxlength': null,
      'minlength': null,
      'placeholder': null,
      'readonly': null,
      'required': null,
      'rows': null,
      'selectiondirection': null,
      'selectionend': null,
      'selectionstart': null,
      'spellcheck': null,
      'wrap': null,
    },
  });
  return rules;
}
