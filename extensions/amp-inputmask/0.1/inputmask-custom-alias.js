import {user} from '#utils/log';

/**
 * Installs an alias used by amp-inputmask that fixes a problem where
 * the user copy-pastes a value into a field with an inputmask that has a
 * literal prefix. e.g.
 * <paste> +1(234)567-8910 -> +1(123)456-7891
 * @param {!Object} Inputmask
 */
export function factory(Inputmask) {
  Inputmask.extendAliases(getAliasDefinition());
}

/**
 * Gets the alias definition for the custom mask.
 * @return {!Object}
 * @private visible for testing
 */
export function getAliasDefinition() {
  return {
    'custom': {
      'prefixes': [],
      /**
       * @param {!JsonObject} opts
       * @return {!Object}
       */
      'mask': function (opts) {
        const customMask = opts['customMask'];
        opts['prefixes'] = getPrefixSubsets(customMask);

        return customMask;
      },
      /**
       * @param {string} value
       * @param {!JsonObject} opts
       * @return {string}
       */
      'onBeforeMask': function (value, opts) {
        const prefixes = opts['prefixes'];
        const trimZeros = opts['trimZeros'] || 0;

        const processedValue = value
          .replace(new RegExp(`^0{0,${trimZeros}}`), '')
          .replace(/[\s]/g, '');

        return removePrefix(processedValue, prefixes);
      },
    },
  };
}

/**
 * A prefix is defined as non-mask characters at the beginning of a mask
 * definition.
 */
export const prefixRe = /^([^\*\[\]a\?9\\]+)[\*\[\]a\?9\\]/i;

/**
 * Gets a map of substrings of the mask prefixes.
 * e.g. +1(000)000-0000" -> ["+1(", "+1", "+", "1(", ...]
 * @param {!Array<string>|string} mask
 * @return {!Array<string>}
 * @private visible for testing
 */
export function getPrefixSubsets(mask) {
  const masks = typeof mask == 'string' ? [mask] : mask;

  const prefixes = {};
  for (let i = 0; i < masks.length; i++) {
    const prefix = getMaskPrefix(masks[i]);
    if (prefix.length == 0) {
      continue;
    }
    // The array of subprefixes grows with the factorial of prefix.length
    // so we cap it at 5! = 120
    if (prefix.length > 5) {
      user().warn(
        'AMP-INPUTMASK',
        'amp-inputmask does not support prefix trimming for masks ' +
          'that start with more than 5 non-mask characters.'
      );
      continue;
    }

    const stack = [prefix];
    while (stack.length) {
      const prefix = stack.pop();
      prefixes[prefix] = true;

      if (prefix.length > 1) {
        stack.push(prefix.slice(1));
        stack.push(prefix.slice(0, -1));
      }
    }
  }

  return Object.keys(prefixes);
}

/**
 * Gets any literal non-variable mask characters from the
 * beginning of the mask string
 * e.g. "+1(000)000-0000" -> "+1("
 * @param {string} mask
 * @return {string}
 * @private visible for testing
 */
export function getMaskPrefix(mask) {
  const processedMask = mask.replace(/[\s]/g, '');
  const match = prefixRe.exec(processedMask);
  const prefix = (match && match[1]) || '';

  return prefix;
}

/**
 * Remove a mask prefix from the input value
 * @param {string} value
 * @param {!Array<string>} prefixes
 * @return {string}
 * @private visible for testing
 */
export function removePrefix(value, prefixes) {
  const longestPrefix = prefixes
    .filter((prefix) => value.startsWith(prefix))
    .sort((a, b) => b.length - a.length)[0];

  if (longestPrefix) {
    return value.slice(longestPrefix.length);
  } else {
    return value;
  }
}
