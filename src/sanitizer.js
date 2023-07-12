import {isAmp4Email} from '#core/document/format';

import {
  ALLOWLISTED_ATTRS,
  ALLOWLISTED_ATTRS_BY_TAGS,
  ALLOWLISTED_TARGETS,
  BIND_PREFIX,
  DENYLISTED_TAGS,
  EMAIL_ALLOWLISTED_AMP_TAGS,
  EMAIL_TRIPLE_MUSTACHE_ALLOWLISTED_TAGS,
  TRIPLE_MUSTACHE_ALLOWLISTED_TAGS,
  isValidAttr,
} from '#purifier/sanitation';

import {user} from '#utils/log';

import {htmlSanitizer} from '#third_party/caja/html-sanitizer';

import {rewriteAttributeValue} from './url-rewrite';

/** @private @const {string} */
const TAG = 'sanitizer';

/**
 * Allowlist of supported self-closing tags for Caja. These are used for
 * correct parsing on Caja and are not necessary for DOMPurify which uses
 * the browser's HTML parser.
 * @const {!{[key: string]: boolean}}
 */
const SELF_CLOSING_TAGS = {
  'br': true,
  'col': true,
  'hr': true,
  'img': true,
  'input': true,
  'source': true,
  'track': true,
  'wbr': true,
  'area': true,
  'base': true,
  'command': true,
  'embed': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
};

/**
 * Regex to allow data-*, aria-* and role attributes.
 * Only needed in Caja. Internally supported by DOMPurify.
 * @const {!RegExp}
 */
const ALLOWLISTED_ATTR_PREFIX_REGEX = /^(data-|aria-)|^role$/i;

/**
 * Sanitizes the provided HTML.
 *
 * This function expects the HTML to be already pre-sanitized and thus it does
 * not validate all of the AMP rules - only the most dangerous security-related
 * cases, such as <SCRIPT>, <STYLE>, <IFRAME>.
 *
 * @param {string} html
 * @param {!Document} doc
 * @return {string}
 */
export function sanitizeHtml(html, doc) {
  const tagPolicy = htmlSanitizer.makeTagPolicy((parsed) =>
    parsed.getScheme() === 'https' ? parsed : null
  );
  const output = [];
  let ignore = 0;

  const emit = (content) => {
    if (ignore == 0) {
      output.push(content);
    }
  };

  // No Caja support for <script> or <svg>.
  const cajaDenylistedTags = {
    'script': true,
    'svg': true,
    ...DENYLISTED_TAGS,
  };

  const parser = htmlSanitizer.makeSaxParser({
    'startTag': function (tagName, attribs) {
      if (ignore > 0) {
        if (!SELF_CLOSING_TAGS[tagName]) {
          ignore++;
        }
        return;
      }
      const isAmpElement = tagName.startsWith('amp-');
      // Preprocess "binding" attributes, e.g. [attr], by stripping enclosing
      // brackets before custom validation and restoring them afterwards.
      const bindingAttribs = [];
      for (let i = 0; i < attribs.length; i += 2) {
        const attr = attribs[i];
        if (!attr) {
          continue;
        }
        const classicBinding = attr[0] == '[' && attr[attr.length - 1] == ']';
        const alternativeBinding = attr.startsWith(BIND_PREFIX);
        if (classicBinding) {
          attribs[i] = attr.slice(1, -1);
        }
        if (classicBinding || alternativeBinding) {
          bindingAttribs.push(i);
        }
      }

      if (cajaDenylistedTags[tagName]) {
        ignore++;
      } else if (isAmpElement) {
        // Enforce AMP4EMAIL tag allowlist at runtime.
        if (isAmp4Email(doc) && !EMAIL_ALLOWLISTED_AMP_TAGS[tagName]) {
          ignore++;
        }
      } else {
        // Ask Caja to validate the element as well.
        // Use the resulting properties.
        const savedAttribs = attribs.slice(0);
        const scrubbed = /** @type {!JsonObject} */ (
          tagPolicy(tagName, attribs)
        );
        if (!scrubbed) {
          ignore++;
        } else {
          attribs = scrubbed['attribs'];
          // Restore some of the attributes that AMP is directly responsible
          // for, such as "on".
          for (let i = 0; i < attribs.length; i += 2) {
            const attrName = attribs[i];
            if (ALLOWLISTED_ATTRS.includes(attrName)) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (attrName.search(ALLOWLISTED_ATTR_PREFIX_REGEX) == 0) {
              attribs[i + 1] = savedAttribs[i + 1];
            } else if (
              ALLOWLISTED_ATTRS_BY_TAGS[tagName] &&
              ALLOWLISTED_ATTRS_BY_TAGS[tagName].includes(attrName)
            ) {
              attribs[i + 1] = savedAttribs[i + 1];
            }
          }
        }
        // `<A>` has special target rules:
        // - Default target is "_top";
        // - Allowed targets are "_blank", "_top";
        // - All other targets are rewritted to "_top".
        if (tagName == 'a') {
          let index = -1;
          let hasHref = false;
          for (let i = 0; i < savedAttribs.length; i += 2) {
            if (savedAttribs[i] == 'target') {
              index = i + 1;
            } else if (savedAttribs[i] == 'href') {
              // Only allow valid `href` values.
              hasHref = attribs[i + 1] != null;
            }
          }
          let origTarget = index != -1 ? savedAttribs[index] : null;
          if (origTarget != null) {
            origTarget = origTarget.toLowerCase();
            if (ALLOWLISTED_TARGETS.indexOf(origTarget) != -1) {
              attribs[index] = origTarget;
            } else {
              attribs[index] = '_top';
            }
          } else if (hasHref) {
            attribs.push('target', '_top');
          }
        }
      }
      if (ignore > 0) {
        if (SELF_CLOSING_TAGS[tagName]) {
          ignore--;
        }
        return;
      }
      // Filter out bindings with empty attribute values.
      const hasBindings = bindingAttribs.some((i) => !!attribs[i + 1]);
      if (hasBindings) {
        // Set a custom attribute to identify elements with bindings.
        // This is an optimization that avoids the need for a DOM scan later.
        attribs.push('i-amphtml-binding', '');
      }
      emit('<');
      emit(tagName);
      for (let i = 0; i < attribs.length; i += 2) {
        const attrName = attribs[i];
        const attrValue = attribs[i + 1];
        if (!isValidAttr(tagName, attrName, attrValue, doc, false)) {
          user().error(
            TAG,
            `Removing "${attrName}" attribute with invalid ` +
              `value in <${tagName} ${attrName}="${attrValue}">.`
          );
          continue;
        }
        emit(' ');
        if (bindingAttribs.includes(i) && !attrName.startsWith(BIND_PREFIX)) {
          emit(`[${attrName}]`);
        } else {
          emit(attrName);
        }
        emit('="');
        if (attrValue) {
          // Rewrite attribute values unless this attribute is a binding.
          // Bindings contain expressions and shouldn't be rewritten.
          const rewrite = bindingAttribs.includes(i)
            ? attrValue
            : rewriteAttributeValue(tagName, attrName, attrValue);
          emit(htmlSanitizer.escapeAttrib(rewrite));
        }
        emit('"');
      }
      emit('>');
    },
    'endTag': function (tagName) {
      if (ignore > 0) {
        ignore--;
        return;
      }
      emit('</');
      emit(tagName);
      emit('>');
    },
    'pcdata': emit,
    'rcdata': emit,
    'cdata': emit,
  });
  parser(html);
  return output.join('');
}

/**
 * Sanitizes user provided HTML to mustache templates, used in amp-mustache.
 *
 * WARNING: This method should not be used elsewhere as we do not strip out
 * the style attribute in this method for the inline-style experiment.
 * We do so in sanitizeHtml which occurs after this initial sanitizing.
 *
 * @param {string} html
 * @param {!Document} doc
 * @return {string}
 */
export function sanitizeTagsForTripleMustache(html, doc) {
  return htmlSanitizer.sanitizeWithPolicy(html, (tagName, attribs) =>
    tripleMustacheTagPolicy(tagName, attribs, doc)
  );
}

/**
 * Tag policy for handling what is valid html in templates.
 * @param {string} tagName
 * @param {!Array<string>} attribs
 * @param {!Document} doc
 * @return {?{tagName: string, attribs: !Array<string>}}
 */
function tripleMustacheTagPolicy(tagName, attribs, doc) {
  if (tagName == 'template') {
    for (let i = 0; i < attribs.length; i += 2) {
      if (attribs[i] == 'type' && attribs[i + 1] == 'amp-mustache') {
        return {
          tagName,
          attribs: ['type', 'amp-mustache'],
        };
      }
    }
  }
  if (isAmp4Email(doc)) {
    if (!EMAIL_TRIPLE_MUSTACHE_ALLOWLISTED_TAGS.includes(tagName)) {
      return null;
    }
  } else if (!TRIPLE_MUSTACHE_ALLOWLISTED_TAGS.includes(tagName)) {
    return null;
  }
  return {
    tagName,
    attribs,
  };
}
