import {TickLabel_Enum} from '#core/constants/enums';
import {isArray, isFiniteNumber} from '#core/types';
import {asyncStringReplace} from '#core/types/string';
import {base64UrlEncodeFromString} from '#core/types/string/base64';

import {getActiveExperimentBranches, getExperimentBranch} from '#experiments';

import {Services} from '#service';

import {dev, devAssert, user, userAssert} from '#utils/log';

import {cookieReader} from './cookie-reader';
import {linkerReaderServiceFor} from './linker-reader';
import {SESSION_VALUES, sessionServicePromiseForDoc} from './session-manager';

import {
  getConsentMetadata,
  getConsentPolicyInfo,
  getConsentPolicyState,
} from '../../../src/consent';
import {isInFie} from '../../../src/iframe-helper';
import {
  getServiceForDoc,
  getServicePromiseForDoc,
  registerServiceBuilderForDoc,
} from '../../../src/service-helpers';

/** @const {string} */
const TAG = 'amp-analytics/variables';

/** @const {RegExp} */
const VARIABLE_ARGS_REGEXP = /^(?:([^\s]*)(\([^)]*\))|[^]+)$/;

const EXTERNAL_CONSENT_POLICY_STATE_STRING = {
  1: 'sufficient',
  2: 'insufficient',
  3: 'not_required',
  4: 'unknown',
};

/** @typedef {{name: string, argList: string}} */
let FunctionNameArgsDef;

/**
 * The structure that contains all details needed to expand a template
 * @struct
 * @const
 * @package For type.
 */
export class ExpansionOptions {
  /**
   * @param {!{[key: string]: *}} vars
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   */
  constructor(vars, opt_iterations, opt_noEncode) {
    /** @const {!{[key: string]: string|Array<string>}} */
    this.vars = vars;
    /** @const {number} */
    this.iterations = opt_iterations === undefined ? 2 : opt_iterations;
    /** @const {boolean} */
    this.noEncode = !!opt_noEncode;
    this.freezeVars = {};
  }

  /**
   * Freeze special variable name so that they don't get expanded.
   * For example ${extraUrlParams}
   * @param {string} str
   */
  freezeVar(str) {
    this.freezeVars[str] = true;
  }

  /**
   * @param {string} name
   * @return {*}
   */
  getVar(name) {
    let value = this.vars[name];
    if (value == null) {
      value = '';
    }
    return value;
  }
}

/**
 * @param {string} value
 * @param {string} s
 * @param {string=} opt_l
 * @return {string}
 */
function substrMacro(value, s, opt_l) {
  const start = Number(s);
  let {length} = value;
  userAssert(
    isFiniteNumber(start),
    'Start index ' + start + 'in substr macro should be a number'
  );
  if (opt_l) {
    length = Number(opt_l);
    userAssert(
      isFiniteNumber(length),
      'Length ' + length + ' in substr macro should be a number'
    );
  }

  return value.substr(start, length);
}

/**
 * @param {string} value
 * @param {string} defaultValue
 * @return {string}
 */
function defaultMacro(value, defaultValue) {
  if (!value || !value.length) {
    return defaultValue;
  }
  return value;
}

/**
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_newSubStr pattern to be substituted in
 * @return {string}
 */
function replaceMacro(string, matchPattern, opt_newSubStr) {
  if (!matchPattern) {
    user().warn(TAG, 'REPLACE macro must have two or more arguments');
  }
  if (!opt_newSubStr) {
    opt_newSubStr = '';
  }
  const regex = new RegExp(matchPattern, 'g');
  return string.replace(regex, opt_newSubStr);
}

/**
 * Applies the match function to the given string with the given regex
 * @param {string} string input to be replaced
 * @param {string} matchPattern string representation of regex pattern
 * @param {string=} opt_matchingGroupIndexStr the matching group to return.
 *                  Index of 0 indicates the full match. Defaults to 0
 * @return {string} returns the matching group given by opt_matchingGroupIndexStr
 */
function matchMacro(string, matchPattern, opt_matchingGroupIndexStr) {
  if (!matchPattern) {
    user().warn(TAG, 'MATCH macro must have two or more arguments');
  }

  let index = 0;
  if (opt_matchingGroupIndexStr) {
    index = parseInt(opt_matchingGroupIndexStr, 10);

    // if given a non-number or negative number
    if ((index != 0 && !index) || index < 0) {
      user().error(TAG, 'Third argument in MATCH macro must be a number >= 0');
      index = 0;
    }
  }

  const regex = new RegExp(matchPattern);
  const matches = string.match(regex);
  return matches && matches[index] ? matches[index] : '';
}

/**
 * This macro function allows arithmetic operations over other analytics variables.
 *
 * @param {string} leftOperand
 * @param {string} rightOperand
 * @param {string} operation
 * @param {string} round If this flag is truthy the result will be rounded
 * @return {number}
 */
function calcMacro(leftOperand, rightOperand, operation, round) {
  const left = Number(leftOperand);
  const right = Number(rightOperand);
  userAssert(!isNaN(left), 'CALC macro - left operand must be a number');
  userAssert(!isNaN(right), 'CALC macro - right operand must be a number');
  let result = 0;
  switch (operation) {
    case 'add':
      result = left + right;
      break;
    case 'subtract':
      result = left - right;
      break;
    case 'multiply':
      result = left * right;
      break;
    case 'divide':
      userAssert(right, 'CALC macro - cannot divide by 0');
      result = left / right;
      break;
    default:
      user().error(TAG, 'CALC macro - Invalid operation');
  }
  return stringToBool(round) ? Math.round(result) : result;
}

/**
 * If given an experiment name returns the branch id if a branch is selected.
 * If no branch name given, it returns a comma separated list of active branch
 * experiment ids and their names or an empty string if none exist.
 * @param {!Window} win
 * @param {string=} opt_expName
 * @return {string}
 */
function experimentBranchesMacro(win, opt_expName) {
  if (opt_expName) {
    return getExperimentBranch(win, opt_expName) || '';
  }
  const branches = getActiveExperimentBranches(win);
  return Object.keys(branches)
    .map((expName) => `${expName}:${branches[expName]}`)
    .join(',');
}

/**
 * Provides support for processing of advanced variable syntax like nested
 * expansions macros etc.
 */
export class VariableService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @private {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = ampdoc;

    /** @private {!JsonObject} */
    this.macros_ = {};

    /** @const @private {!./linker-reader.LinkerReader} */
    this.linkerReader_ = linkerReaderServiceFor(this.ampdoc_.win);

    /** @const @private {!Promise<SessionManager>} */
    this.sessionManagerPromise_ = sessionServicePromiseForDoc(this.ampdoc_);

    this.register_('$DEFAULT', defaultMacro);
    this.register_('$SUBSTR', substrMacro);
    this.register_('$TRIM', (value) => value.trim());
    this.register_('$TOLOWERCASE', (value) => value.toLowerCase());
    this.register_('$TOUPPERCASE', (value) => value.toUpperCase());
    this.register_('$NOT', (value) => String(!value));
    this.register_('$BASE64', (value) => base64UrlEncodeFromString(value));
    this.register_('$HASH', this.hashMacro_.bind(this));
    this.register_('$IF', (value, thenValue, elseValue) =>
      stringToBool(value) ? thenValue : elseValue
    );
    this.register_('$REPLACE', replaceMacro);
    this.register_('$MATCH', matchMacro);
    this.register_('$CALC', calcMacro);
    this.register_(
      '$EQUALS',
      (firstValue, secValue) => firstValue === secValue
    );
    this.register_('LINKER_PARAM', (name, id) =>
      this.linkerReader_.get(name, id)
    );

    // Returns the IANA timezone code
    this.register_('TIMEZONE_CODE', () => {
      let tzCode = '';
      if (
        'Intl' in this.ampdoc_.win &&
        'DateTimeFormat' in this.ampdoc_.win.Intl
      ) {
        // It could be undefined (i.e. IE11)
        tzCode = new this.ampdoc_.win.Intl.DateTimeFormat().resolvedOptions()
          .timeZone;
      }

      return tzCode;
    });

    // Returns a promise resolving to viewport.getScrollTop.
    this.register_('SCROLL_TOP', () =>
      Math.round(Services.viewportForDoc(this.ampdoc_).getScrollTop())
    );

    // Returns a promise resolving to viewport.getScrollLeft.
    this.register_('SCROLL_LEFT', () =>
      Math.round(Services.viewportForDoc(this.ampdoc_).getScrollLeft())
    );

    this.register_('EXPERIMENT_BRANCHES', (opt_expName) =>
      experimentBranchesMacro(this.ampdoc_.win, opt_expName)
    );

    // Returns the content of a meta tag in the ampdoc
    this.register_('AMPDOC_META', (meta, defaultValue = '') => {
      return this.ampdoc_.getMetaByName(meta) ?? defaultValue;
    });
  }

  /**
   * @param {!Element} element
   * @return {!JsonObject} contains all registered macros
   */
  getMacros(element) {
    const type = element.getAttribute('type');
    const elementMacros = {
      'COOKIE': (name) =>
        cookieReader(this.ampdoc_.win, dev().assertElement(element), name),
      'CONSENT_STATE': getConsentStateStr(element),
      'CONSENT_STRING': getConsentPolicyInfo(element),
      'CONSENT_METADATA': (key) =>
        getConsentMetadataValue(
          element,
          userAssert(key, 'CONSENT_METADATA macro must contain a key')
        ),
      'SESSION_ID': () =>
        this.getSessionValue_(type, SESSION_VALUES.SESSION_ID),
      'SESSION_TIMESTAMP': () =>
        this.getSessionValue_(type, SESSION_VALUES.CREATION_TIMESTAMP),
      'SESSION_COUNT': () => this.getSessionValue_(type, SESSION_VALUES.COUNT),
      'SESSION_EVENT_TIMESTAMP': () =>
        this.getSessionValue_(type, SESSION_VALUES.EVENT_TIMESTAMP),
      'SESSION_ENGAGED': () =>
        this.getSessionValue_(type, SESSION_VALUES.ENGAGED),
    };
    const perfMacros = isInFie(element)
      ? {}
      : {
          'FIRST_CONTENTFUL_PAINT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.FIRST_CONTENTFUL_PAINT_VISIBLE
            ),
          'FIRST_VIEWPORT_READY': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.FIRST_VIEWPORT_READY
            ),
          'MAKE_BODY_VISIBLE': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.MAKE_BODY_VISIBLE
            ),
          'LARGEST_CONTENTFUL_PAINT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.LARGEST_CONTENTFUL_PAINT_VISIBLE
            ),
          'FIRST_INPUT_DELAY': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.FIRST_INPUT_DELAY
            ),
          'CUMULATIVE_LAYOUT_SHIFT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.CUMULATIVE_LAYOUT_SHIFT
            ),
          'INTERACTION_TO_NEXT_PAINT': () =>
            Services.performanceFor(this.ampdoc_.win).getMetric(
              TickLabel_Enum.INTERACTION_TO_NEXT_PAINT
            ),
        };
    const merged = {
      ...this.macros_,
      ...elementMacros,
      ...perfMacros,
    };
    return /** @type {!JsonObject} */ (merged);
  }

  /**
   *
   * @param {string} vendorType
   * @param {!SESSION_VALUES} key
   * @return {!Promise<number>}
   */
  getSessionValue_(vendorType, key) {
    return this.sessionManagerPromise_.then((sessionManager) => {
      return sessionManager.getSessionValue(vendorType, key);
    });
  }

  /**
   * TODO (micajuineho): If we add new synchronous macros, we
   * will need to split this method and getMacros into sync and
   * async version (currently all macros are async).
   * @param {string} name
   * @param {*} macro
   */
  register_(name, macro) {
    devAssert(!this.macros_[name], 'Macro "' + name + '" already registered.');
    this.macros_[name] = macro;
  }

  /**
   * Converts templates from ${} format to MACRO() and resolves any platform
   * level macros when encountered.
   * @param {string} template The template to expand.
   * @param {!ExpansionOptions} options configuration to use for expansion.
   * @param {!Element} element amp-analytics element.
   * @param {!JsonObject=} opt_bindings
   * @param {!Object=} opt_allowlist
   * @return {!Promise<string>} The expanded string.
   */
  expandTemplate(template, options, element, opt_bindings, opt_allowlist) {
    return asyncStringReplace(template, /\${([^{}]*)}/g, (match, key) => {
      if (options.iterations < 0) {
        user().error(
          TAG,
          'Maximum depth reached while expanding variables. ' +
            'Please ensure that the variables are not recursive.'
        );
        return match;
      }

      if (!key) {
        return '';
      }

      // Split the key to name and args
      // e.g.: name='SOME_MACRO', args='(arg1, arg2)'
      const {argList, name} = getNameArgs(key);
      if (options.freezeVars[name]) {
        // Do nothing with frozen params
        return match;
      }

      let value = options.getVar(name);
      const urlReplacements = Services.urlReplacementsForDoc(element);

      if (typeof value == 'string') {
        value = this.expandValueAndReplaceAsync_(
          value,
          options,
          element,
          urlReplacements,
          opt_bindings,
          opt_allowlist,
          argList
        );
      } else if (isArray(value)) {
        // Treat each value as a template and expand
        for (let i = 0; i < value.length; i++) {
          value[i] =
            typeof value[i] == 'string'
              ? this.expandValueAndReplaceAsync_(
                  value[i],
                  options,
                  element,
                  urlReplacements,
                  opt_bindings,
                  opt_allowlist
                )
              : value[i];
        }
        value = Promise.all(/** @type {!Array<string>} */ (value));
      }

      return Promise.resolve(value).then((value) =>
        !options.noEncode
          ? encodeVars(/** @type {string|?Array<string>} */ (value))
          : value
      );
    });
  }

  /**
   * @param {string} value
   * @param {!ExpansionOptions} options
   * @param {!Element} element amp-analytics element.
   * @param {!../../../src/service/url-replacements-impl.UrlReplacements} urlReplacements
   * @param {!JsonObject=} opt_bindings
   * @param {!Object=} opt_allowlist
   * @param {string=} opt_argList
   * @return {Promise<string>}
   */
  expandValueAndReplaceAsync_(
    value,
    options,
    element,
    urlReplacements,
    opt_bindings,
    opt_allowlist,
    opt_argList
  ) {
    return this.expandTemplate(
      value,
      new ExpansionOptions(
        options.vars,
        options.iterations - 1,
        true /* noEncode */
      ),
      element,
      opt_bindings,
      opt_allowlist
    ).then((val) =>
      urlReplacements.expandStringAsync(
        opt_argList ? val + opt_argList : val,
        opt_bindings || this.getMacros(element),
        opt_allowlist
      )
    );
  }

  /**
   * @param {string} value
   * @return {!Promise<string>}
   */
  hashMacro_(value) {
    return Services.cryptoFor(this.ampdoc_.win).sha384Base64(value);
  }
}

/**
 * @param {string|?Array<string>} raw The values to URI encode.
 * @return {string} The encoded value.
 */
export function encodeVars(raw) {
  if (raw == null) {
    return '';
  }

  if (isArray(raw)) {
    return raw.map(encodeVars).join(',');
  }
  // Separate out names and arguments from the value and encode the value.
  const {argList, name} = getNameArgs(String(raw));
  return encodeURIComponent(name) + argList;
}

/**
 * Returns an array containing two values: name and args parsed from the key.
 *
 * case 1) 'SOME_MACRO(abc,def)' => name='SOME_MACRO', argList='(abc,def)'
 * case 2) 'randomString' => name='randomString', argList=''
 * @param {string} key The key to be parsed.
 * @return {!FunctionNameArgsDef}
 */
export function getNameArgs(key) {
  if (!key) {
    return {name: '', argList: ''};
  }
  const match = key.match(VARIABLE_ARGS_REGEXP);
  userAssert(match, 'Variable with invalid format found: ' + key);

  return {name: match[1] || match[0], argList: match[2] || ''};
}

/**
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 */
export function installVariableServiceForTesting(ampdoc) {
  registerServiceBuilderForDoc(
    ampdoc,
    'amp-analytics-variables',
    VariableService
  );
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!VariableService}
 */
export function variableServiceForDoc(elementOrAmpDoc) {
  return getServiceForDoc(elementOrAmpDoc, 'amp-analytics-variables');
}

/**
 * @param {!Element|!ShadowRoot|!../../../src/service/ampdoc-impl.AmpDoc} elementOrAmpDoc
 * @return {!Promise<!VariableService>}
 */
export function variableServicePromiseForDoc(elementOrAmpDoc) {
  return /** @type {!Promise<!VariableService>} */ (
    getServicePromiseForDoc(elementOrAmpDoc, 'amp-analytics-variables')
  );
}

/**
 * @param {string} key
 * @return {{name, argList}|!FunctionNameArgsDef}
 * @visibleForTesting
 */
export function getNameArgsForTesting(key) {
  return getNameArgs(key);
}

/**
 * Get the resolved consent state value to send with analytics request
 * @param {!Element} element
 * @return {!Promise<?string>}
 */
function getConsentStateStr(element) {
  return getConsentPolicyState(element).then((consent) => {
    if (!consent) {
      return null;
    }
    return EXTERNAL_CONSENT_POLICY_STATE_STRING[consent];
  });
}

/**
 * Get the associated value from the resolved consent metadata object
 * @param {!Element} element
 * @param {string} key
 * @return {!Promise<?Object>}
 */
function getConsentMetadataValue(element, key) {
  // Get the metadata using the default policy id
  return getConsentMetadata(element).then((consentMetadata) => {
    if (!consentMetadata) {
      return null;
    }
    return consentMetadata[key];
  });
}

/**
 * Converts string to boolean
 * @param {string} str
 * @return {boolean}
 */
export function stringToBool(str) {
  return (
    str !== 'false' &&
    str !== '' &&
    str !== '0' &&
    str !== 'null' &&
    str !== 'NaN' &&
    str !== 'undefined'
  );
}
