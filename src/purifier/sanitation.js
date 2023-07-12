import {isAmp4Email} from '#core/document/format';
import {map} from '#core/types/object';

import {isUrlAttribute} from '../url-rewrite';

/** @const {string} */
export const BIND_PREFIX = 'data-amp-bind-';

/** @const {string} */
export const DIFF_KEY = 'i-amphtml-key';

/** @const {string} */
export const DIFF_IGNORE = 'i-amphtml-ignore';

/**
 * Map of AMP element tag name to attributes that, if changed, require
 * replacement of the original element.
 * @const {!{[key: string]: !Array<string>}}
 */
export const DIFFABLE_AMP_ELEMENTS = {
  'AMP-IMG': ['src', 'srcset', 'layout', 'width', 'height'],
};

/**
 * Most AMP elements don't support ad hoc mutation and should be replaced
 * instead of DOM diff'ed. Some AMP elements can be manually diff'ed.
 *
 * Both of these cases require a special attribute to enable special handling in
 * the diffing algorithm. This function sets the appropriate attribute.
 *
 * @param {!Element} element
 * @param {function(): string} generateKey
 */
export function markElementForDiffing(element, generateKey) {
  const isAmpElement = element.tagName.startsWith('AMP-');
  // Don't DOM diff nodes with bindings because amp-bind scans newly rendered
  // elements and discards _all_ old elements _before_ diffing, so preserving
  // old elements would cause loss of functionality.
  //
  // Alternatively, we could do diffing _before_ bindings are updated and
  // more precisely add/remove bindings from nodes that set-dom diffs, but...
  // 1. Would result in content flashing unless we clone the old DOM tree.
  // 2. Need to change set-dom e.g. handle changed bind attribute values.
  const hasBinding = element.hasAttribute('i-amphtml-binding');

  if (!hasBinding && DIFFABLE_AMP_ELEMENTS[element.tagName]) {
    // Nodes marked with "ignore" will not be touched (old element stays).
    // We want this to allow manual diffing afterwards.
    element.setAttribute(DIFF_IGNORE, '');
  } else if (hasBinding || isAmpElement) {
    // Diff'ed node pairs with unique "key" will always be replaced.
    if (!element.hasAttribute(DIFF_KEY)) {
      element.setAttribute(DIFF_KEY, generateKey());
    }
  }
}

/**
 * @const {!{[key: string]: boolean}}
 * @see https://github.com/ampproject/amphtml/blob/main/docs/spec/amp-html-format.md
 */
export const DENYLISTED_TAGS = {
  'applet': true,
  'audio': true,
  'base': true,
  'embed': true,
  'frame': true,
  'frameset': true,
  'iframe': true,
  'img': true,
  'link': true,
  'meta': true,
  'object': true,
  'style': true,
  'video': true,
};

/**
 * AMP elements allowed in AMP4EMAIL, modulo:
 * - amp-list and amp-state, which cannot be nested.
 * - amp-lightbox and amp-image-lightbox, which are deprecated.
 * @const {!{[key: string]: boolean}}
 * @see https://github.com/ampproject/amphtml/blob/main/docs/spec/email/amp-email-components.md
 */
export const EMAIL_ALLOWLISTED_AMP_TAGS = {
  'amp-accordion': true,
  'amp-anim': true,
  'amp-bind-macro': true,
  'amp-carousel': true,
  'amp-fit-text': true,
  'amp-img': true,
  'amp-layout': true,
  'amp-selector': true,
  'amp-sidebar': true,
  'amp-timeago': true,
};

/**
 * Allowlist of tags allowed in triple mustache in non-email format, e.g.
 * {{{name}}}.
 * Very restrictive by design since the triple mustache renders unescaped HTML
 * which, unlike double mustache, won't be processed by the AMP Validator.
 * @const {!Array<string>}
 */
export const TRIPLE_MUSTACHE_ALLOWLISTED_TAGS = [
  'a',
  'amp-img',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'header',
  'hr',
  'i',
  'ins',
  'li',
  'main',
  'mark',
  'nav',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'u',
  'ul',
];

/**
 * Same as `TRIPLE_MUSTACHE_ALLOWLISTED_TAGS` except for the email format. The
 * email format has a different threat model and needs to evolve the allowlist
 * independently from other formats, as certain tags can be considered safe in
 * other formats but not in the email format.
 * @const {!Array<string>}
 */
export const EMAIL_TRIPLE_MUSTACHE_ALLOWLISTED_TAGS = [
  'a',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'h1',
  'h2',
  'h3',
  'header',
  'hr',
  'i',
  'ins',
  'li',
  'main',
  'mark',
  'nav',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'u',
  'ul',
];
/**
 * Tag-agnostic attribute allowlisted used by both Caja and DOMPurify.
 * @const {!Array<string>}
 */
export const ALLOWLISTED_ATTRS = [
  // AMP-only attributes that don't exist in HTML.
  'amp-fx',
  'fallback',
  'heights',
  'layout',
  'min-font-size',
  'max-font-size',
  'on',
  'option',
  'placeholder',
  // Attributes related to amp-form.
  'submitting',
  'submit-success',
  'submit-error',
  'validation-for',
  'verify-error',
  'visible-when-invalid',
  // HTML attributes that are scrubbed by Caja but we handle specially.
  'href',
  'style',
  // Attributes for amp-bind that exist in "[foo]" form.
  'text',
  // Attributes for amp-subscriptions.
  'subscriptions-action',
  'subscriptions-actions',
  'subscriptions-decorate',
  'subscriptions-dialog',
  'subscriptions-display',
  'subscriptions-section',
  'subscriptions-service',
  // Attributes for amp-subscriptions-google.
  'subscriptions-google-rtc',
  // Attributes for amp-nested-menu.
  'amp-nested-submenu',
  'amp-nested-submenu-open',
  'amp-nested-submenu-close',
  // A global attribute used for structured data.
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/itemprop
  'itemprop',
];

/**
 * Attributes that are only allowlisted for specific, non-AMP elements.
 * @const {!{[key: string]: !Array<string>}}
 */
export const ALLOWLISTED_ATTRS_BY_TAGS = {
  'a': ['rel', 'target'],
  'div': ['template'],
  'form': ['action-xhr', 'verify-xhr', 'custom-validation-reporting', 'target'],
  'input': ['mask-output'],
  'template': ['type'],
  'textarea': ['autoexpand'],
};

/** @const {!Array<string>} */
export const ALLOWLISTED_TARGETS = ['_top', '_blank'];

// Extended from IS_SCRIPT_OR_DATA in https://github.com/cure53/DOMPurify/blob/master/src/regexp.js.
const DENYLISTED_PROTOCOLS = /^(?:\w+script|data|blob):/i;

// Same as DENYLISTED_PROTOCOLS modulo those handled by DOMPurify.
const EXTENDED_DENYLISTED_PROTOCOLS = /^(?:blob):/i;

// From https://github.com/cure53/DOMPurify/blob/master/src/regexp.js.
const ATTR_WHITESPACE =
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;

/** @const {!{[key: string]: !{[key: string]: !RegExp}}} */
const DENYLISTED_TAG_SPECIFIC_ATTR_VALUES = Object.freeze({
  'input': {
    'type': /(?:image|button)/i,
  },
});

/**
 * Rules in addition to DENYLISTED_TAG_SPECIFIC_ATTR_VALUES for AMP4EMAIL.
 * @const {!{[key: string]: !{[key: string]: !RegExp}}}
 */
const EMAIL_DENYLISTED_TAG_SPECIFIC_ATTR_VALUES = Object.freeze({
  'input': {
    'type': /(?:button|file|image|password)/i,
  },
});

/** @const {!Array<string>} */
const DENYLISTED_FIELDS_ATTR = Object.freeze([
  'form',
  'formaction',
  'formmethod',
  'formtarget',
  'formnovalidate',
  'formenctype',
]);

/** @const {!{[key: string]: !Array<string>}} */
const DENYLISTED_TAG_SPECIFIC_ATTRS = Object.freeze({
  'input': DENYLISTED_FIELDS_ATTR,
  'textarea': DENYLISTED_FIELDS_ATTR,
  'select': DENYLISTED_FIELDS_ATTR,
});

/**
 * Rules in addition to denylistED_TAG_SPECIFIC_ATTRS for AMP4EMAIL.
 * @const {!{[key: string]: !Array<string>}}
 */
const EMAIL_DENYLISTED_TAG_SPECIFIC_ATTRS = Object.freeze({
  'amp-anim': ['controls'],
  'form': ['name'],
});

/**
 * Test for invalid `style` attribute values.
 *
 * !important avoids overriding AMP styles, while `position:fixed|sticky` is a
 * FixedLayer limitation (it only scans the style[amp-custom] stylesheet
 * for potential fixed/sticky elements). Note that the latter can be
 * circumvented with CSS comments -- not a big deal.
 *
 * @const {!RegExp}
 */
const INVALID_INLINE_STYLE_REGEX =
  /!important|position\s*:\s*fixed|position\s*:\s*sticky/i;

/**
 * Whether the attribute/value is valid.
 * @param {string} tagName Lowercase tag name.
 * @param {string} attrName Lowercase attribute name.
 * @param {?string} attrValue Sometimes null when called by Caja.
 * @param {!Document} doc
 * @param {boolean} opt_purify If true, skips some attribute sanitizations
 *     that are already covered by DOMPurify.
 * @return {boolean}
 */
export function isValidAttr(
  tagName,
  attrName,
  attrValue,
  doc,
  opt_purify = false
) {
  const attrValueWithoutWhitespace = attrValue
    ? attrValue.replace(ATTR_WHITESPACE, '')
    : '';

  if (!opt_purify) {
    // "on*" attributes are not allowed.
    if (attrName.startsWith('on') && attrName != 'on') {
      return false;
    }

    // No attributes with "<script" or "</script" in them.
    const normalized = attrValueWithoutWhitespace.toLowerCase();
    if (
      normalized.indexOf('<script') >= 0 ||
      normalized.indexOf('</script') >= 0
    ) {
      return false;
    }

    // Don't allow protocols like "javascript:".
    if (DENYLISTED_PROTOCOLS.test(attrValueWithoutWhitespace)) {
      return false;
    }
  }

  // Don't allow certain protocols that are otherwise "safe".
  // DOMPurify (opt_purify) already sanitizes javascript: etc., but
  // allows them in special cases (data URIs in images, data-* attrs).
  // So, just handle the other "extended" protocols here to avoid
  // banning "javascript:" in known-safe ARIA attributes, for example.
  if (EXTENDED_DENYLISTED_PROTOCOLS.test(attrValueWithoutWhitespace)) {
    return false;
  }

  // Don't allow certain inline style values.
  if (attrName == 'style') {
    return !INVALID_INLINE_STYLE_REGEX.test(attrValue);
  }

  // Don't allow CSS class names with internal AMP prefix.
  if (attrName == 'class' && attrValue && /(^|\W)i-amphtml-/i.test(attrValue)) {
    return false;
  }

  // Don't allow '__amp_source_origin' in URLs.
  if (isUrlAttribute(attrName) && /__amp_source_origin/.test(attrValue)) {
    return false;
  }

  const isEmail = isAmp4Email(doc);

  // Remove denylisted attributes from specific tags e.g. input[formaction].
  const attrDenylist = Object.assign(
    map(),
    DENYLISTED_TAG_SPECIFIC_ATTRS,
    isEmail ? EMAIL_DENYLISTED_TAG_SPECIFIC_ATTRS : {}
  )[tagName];
  if (attrDenylist && attrDenylist.indexOf(attrName) != -1) {
    return false;
  }

  // Remove denylisted values for specific attributes for specific tags
  // e.g. input[type=image].
  const attrValueDenylist = Object.assign(
    map(),
    DENYLISTED_TAG_SPECIFIC_ATTR_VALUES,
    isEmail ? EMAIL_DENYLISTED_TAG_SPECIFIC_ATTR_VALUES : {}
  )[tagName];
  if (attrValueDenylist) {
    const denylistedValuesRegex = attrValueDenylist[attrName];
    if (
      denylistedValuesRegex &&
      attrValue.search(denylistedValuesRegex) != -1
    ) {
      return false;
    }
  }

  return true;
}
