/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {getData} from './../../../src/event-helper';

import {ENDPOINTS, SMARTLINKS_REWRITER_ID} from './constants';
import {LinkRewriterManager} from './link-rewriter/link-rewriter-manager';
import {Linkmate} from './linkmate';
import {getConfigOptions} from './linkmate-options';


export class AmpSmartlinks extends AMP.BaseElement {
  /**
   * @param {!AmpElement} element
   */
  constructor(element) {
    super(element);

    /** @private {?../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = null;

    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = null;

    /** @private {?./link-rewriter/link-rewriter-manager.LinkRewriterManager} */
    this.linkRewriterService_ = null;

    /** @private {?./link-rewriter/link-rewriter.LinkRewriter} */
    this.smartLinkRewriter_ = null;

    /** @private {?Object} */
    this.linkmateOptions_ = null;

    /** @private {?function({JsonObject})} */
    this.fetchLinkmateConfig_ = null;

    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = null;

    /** @private {?./linkmate.Linkmate} */
    this.linkmate_ = null;

    /** @private {?string} */
    this.referrer_ = null;
  }

  /** @override */
  buildCallback() {
    this.xhr_ = Services.xhrFor(this.win);
    this.ampDoc_ = this.getAmpDoc();

    this.viewer_ = Services.viewerForDoc(this.ampDoc_);

    this.linkmateOptions_ = getConfigOptions(this.element);
    this.fetchLinkmateConfig_ = this.getLinkmateOptions_;

    this.linkRewriterService_ = new LinkRewriterManager(this.ampDoc_);

    return this.ampDoc_.whenBodyAvailable()
        .then(() => this.viewer_.getReferrerUrl())
        .then(referrer => {
          this.referrer_ = referrer;
          this.runSmartlinks_();
        });
  }

  /**
   * Wait for the config promise to resolve and then proceed to functionality
   * @private
   */
  runSmartlinks_() {
    this.fetchLinkmateConfig_().then(config => {
      this.linkmateOptions_.linkmateExpected = config['linkmate_enabled'];
      this.linkmateOptions_.publisherID = config['publisher_id'];

      this.postPageImpression_();
      this.linkmate_ = new Linkmate(
          this.ampDoc_,
          this.xhr_,
          this.linkmateOptions_
      );
    });

    this.smartLinkRewriter_ = this.initLinkRewriter_();

    // We have a valid linkmate class, the config specified linkmate to run
    // and our API is expecting linkmate to run
    if (this.linkmate_ && this.linkmateOptions_.linkmateEnabled &&
      this.linkmateOptions_.linkmateExpected) {
      this.smartLinkRewriter_.getAnchorReplacementList();
    }
  }

  /**
   * API call to retrieve the Narrativ config for this extension.
   * @return {?Promise}
   * @private
   */
  getLinkmateOptions_() {
    const fetchUrl = ENDPOINTS.NRTV_CONFIG_ENDPOINT.replace(
        '.nrtv_slug.', this.linkmateOptions_.nrtvSlug
    );

    return this.xhr_.fetchJson(fetchUrl, {
      method: 'GET',
      ampCors: false,
    })
        .then(res => res.json())
        .then(res => {
          return getData(res)[0]['amp_config'];
        });
  }

  /**
   * API call to indicate a page load event happened
   * @private
   */
  postPageImpression_() {
    const payload = this.buildPageImpressionPayload_();

    this.xhr_.fetchJson(ENDPOINTS.PAGE_IMPRESSION_ENDPOINT, {
      method: 'POST',
      ampCors: false,
      headers: dict({'Content-Type': 'application/json'}),
      body: payload,
    });
  }

  /**
   * Initialize and register a Narrativ LinkRewriter instance
   * @return {!./link-rewriter/link-rewriter.LinkRewriter}
   * @private
   */
  initLinkRewriter_() {
    const options = {linkSelector: this.linkmateOptions_.linkSelector};

    return this.linkRewriterService_.registerLinkRewriter(
        SMARTLINKS_REWRITER_ID,
        anchorList => {
          return this.linkmate_.runLinkmate(anchorList);
        },
        options
    );
  }

  /**
   * Build the payload for our page load event.
   * @return {!JsonObject}
   * @private
   */
  buildPageImpressionPayload_() {
    return /** @type {!JsonObject} */ ({
      'events': [{'is_amp': true}],
      'organization_id': this.linkmateOptions_.publisherID,
      'organization_type': 'publisher',
      'user': {
        'page_session_uuid': this.generateUUID_(),
        'source_url': this.ampDoc_.getUrl(),
        'previous_url': this.referrer_,
        'user_agent': this.ampDoc_.win.navigator.userAgent,
      },
    });
  }

  /**
   * Generate a unique UUID for this session.
   * @return {string}
   * @private
   */
  generateUUID_() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4)
          .toString(16)
    );
  }
}

AMP.extension('amp-smartlinks', '0.1', AMP => {
  AMP.registerElement('amp-smartlinks', AmpSmartlinks);
});
