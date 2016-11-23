/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {dev, user} from '../log';
import {documentInfoForDoc} from '../document-info';
import {getServiceForDoc, installServiceInEmbedScope} from '../service';
import {parseUrl} from '../url';
import {isExperimentOn} from '../experiments';
import {
  installVarSubstitutionServiceForDoc,
  installVarSubstitutionForEmbed,
} from './var-substitution-impl';
import {varSubstitutionForDoc} from '../var-substitution';

/** @private @const {string} */
const TAG = 'UrlReplacements';
const ORIGINAL_HREF_PROPERTY = 'amp-original-href';

/**
 * This class replaces substitution variables with their values.
 * Document new values in ../spec/amp-var-substitutions.md
 * @package For export
 */
export class UrlReplacements {
  /** @param {!./ampdoc-impl.AmpDoc} ampdoc */
  constructor(ampdoc) {
    /** @const {!./ampdoc-impl.AmpDoc} */
    this.ampdoc = ampdoc;

    /** @private @const @type {!./var-substitution-impl.VarSubstitution} */
    this.varSub_ = varSubstitutionForDoc(ampdoc);
  }

  /**
   * Synchronously expands the provided URL by replacing all known variables with
   * their resolved values. Optional `opt_bindings` can be used to add new
   * variables or override existing ones.  Any async bindings are ignored.
   * @param {string} url
   * @param {!Object<string, (./variable-source.ResolverReturnDef|!./variable-source.SyncResolverDef)>=} opt_bindings
   * @param {!Object<string, ./variable-source.ResolverReturnDef>=} opt_collectVars
   * @param {!Object<string, boolean>=} opt_whiteList Optional white list of names
   *     that can be substituted.
   * @return {string}
   */
  expandSync(url, opt_bindings, opt_collectVars, opt_whiteList) {
    return /** @type {string} */ (
        this.ensureProtocolMatches_(url, this.varSub_.expandSync(
            url, opt_bindings, opt_collectVars, opt_whiteList)));
  }

  /**
   * Expands the provided URL by replacing all known variables with their
   * resolved values. Optional `opt_bindings` can be used to add new variables
   * or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<string>}
   */
  expandAsync(url, opt_bindings) {
    return /** @type {!Promise<string>} */ (
        this.varSub_.expandAsync(url, opt_bindings).then(
            replacement => this.ensureProtocolMatches_(url, replacement)));
  }

  /**
   * Replaces values in the link of an anchor tag if
   * - the link opts into it (via data-amp-replace argument)
   * - the destination is the source or canonical origin of this doc.
   * @param {!Element} element An anchor element.
   * @return {string|undefined} Replaced string for testing
   */
  maybeExpandLink(element) {
    if (!isExperimentOn(this.ampdoc.win, 'link-url-replace')) {
      return;
    }
    dev().assert(element.tagName == 'A');
    const whitelist = element.getAttribute('data-amp-replace');
    if (!whitelist) {
      return;
    }
    const docInfo = documentInfoForDoc(this.ampdoc);
    // ORIGINAL_HREF_PROPERTY has the value of the href "pre-replacement".
    // We set this to the original value before doing any work and use it
    // on subsequent replacements, so that each run gets a fresh value.
    const href = dev().assertString(
        element[ORIGINAL_HREF_PROPERTY] || element.getAttribute('href'));
    const url = parseUrl(href);
    if (url.origin != parseUrl(docInfo.canonicalUrl).origin &&
        url.origin != parseUrl(docInfo.sourceUrl).origin) {
      user().warn('URL', 'Ignoring link replacement', href,
          ' because the link does not go to the document\'s' +
          ' source or canonical origin.');
      return;
    }
    if (element[ORIGINAL_HREF_PROPERTY] == null) {
      element[ORIGINAL_HREF_PROPERTY] = href;
    }
    const supportedReplacements = {
      'CLIENT_ID': true,
      'QUERY_PARAM': true,
    };
    const requestedReplacements = {};
    whitelist.trim().split(/\s*,\s*/).forEach(replacement => {
      if (supportedReplacements.hasOwnProperty(replacement)) {
        requestedReplacements[replacement] = true;
      } else {
        user().warn('URL', 'Ignoring unsupported link replacement',
            replacement);
      }
    });
    return element.href = this.expandSync(
        href,
        /* opt_bindings */ undefined,
        /* opt_collectVars */ undefined,
        requestedReplacements);
  }

  /**
   * Collects all substitutions in the provided URL and expands them to the
   * values for known variables. Optional `opt_bindings` can be used to add
   * new variables or override existing ones.
   * @param {string} url
   * @param {!Object<string, *>=} opt_bindings
   * @return {!Promise<!Object<string, *>>}
   */
  collectVars(url, opt_bindings) {
    return this.varSub_.collectVars(url, opt_bindings);
  }


  /**
   * Ensures that the protocol of the original url matches the protocol of the
   * replacement url. Returns the replacement if they do, the original if they
   * do not.
   * @param {string} url
   * @param {string} replacement
   * @return {string}
   */
  ensureProtocolMatches_(url, replacement) {
    const newProtocol = parseUrl(replacement, /* opt_nocache */ true).protocol;
    const oldProtocol = parseUrl(url, /* opt_nocache */ true).protocol;
    if (newProtocol != oldProtocol) {
      user().error(TAG, 'Illegal replacement of the protocol: ', url);
      return url;
    }
    user().assert(newProtocol !== `javascript:`, 'Illegal javascript link ' +
        'protocol: %s', url);

    return replacement;
  }

  /**
   * @return {?./variable-source.VariableSource}
   */
  getVariableSource() {
    return this.varSub_.getVariableSource();
  }
}


/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {!UrlReplacements}
 */
export function installUrlReplacementsServiceForDoc(ampdoc) {
  return getServiceForDoc(ampdoc, 'url-replace', doc => {
    installVarSubstitutionServiceForDoc(ampdoc);
    return new UrlReplacements(doc);
  });
}

/**
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!Window} embedWin
 * @param {!./variable-source.VariableSource} varSource
 */
export function installUrlReplacementsForEmbed(ampdoc, embedWin, varSource) {
  installVarSubstitutionForEmbed(ampdoc, embedWin, varSource);
  installServiceInEmbedScope(embedWin, 'url-replace',
      new UrlReplacements(ampdoc));
}
