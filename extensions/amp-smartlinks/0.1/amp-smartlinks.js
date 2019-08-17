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

import {CommonSignals} from '../../../src/common-signals';
import {CustomEventReporterBuilder} from '../../../src/extension-analytics.js';
import {Services} from '../../../src/services';
import {dict} from '../../../src/utils/object';
import {getData} from './../../../src/event-helper';

import {ENDPOINTS} from './constants';
import {LinkRewriterManager} from '../../amp-skimlinks/0.1/link-rewriter/link-rewriter-manager';
import {Linkmate} from './linkmate';
import {getConfigOptions} from './linkmate-options';

const TAG = 'amp-smartlinks';

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

    /** @private {?../../amp-skimlinks/0.1/link-rewriter/link-rewriter-manager.LinkRewriterManager} */
    this.linkRewriterService_ = null;

    /** @private {?../../amp-skimlinks/0.1/link-rewriter/link-rewriter.LinkRewriter} */
    this.smartLinkRewriter_ = null;

    /**
     * This will store config attributes from the extension options and an API
     * request. The attributes from options are:
     *  exclusiveLinks, linkAttribute, linkSelector, linkmateEnabled, nrtvSlug
     * The attributes from the API are:
     *  linkmateExpected, publisherID
     * @private {?Object} */
    this.linkmateOptions_ = null;

    /** @private {?./linkmate.Linkmate} */
    this.linkmate_ = null;

    /** @private {?string} */
    this.referrer_ = null;
  }

  /** @override */
  buildCallback() {
    this.ampDoc_ = this.getAmpDoc();
    this.xhr_ = Services.xhrFor(this.ampDoc_.win);
    const viewer = Services.viewerForDoc(this.ampDoc_);

    this.linkmateOptions_ = getConfigOptions(this.element);
    this.linkRewriterService_ = new LinkRewriterManager(this.ampDoc_);

    return this.ampDoc_
      .whenReady()
      .then(() => viewer.getReferrerUrl())
      .then(referrer => {
        this.referrer_ = referrer;
        viewer.whenFirstVisible().then(() => {
          this.runSmartlinks_();
        });
      });
  }

  /**
   * Wait for the config promise to resolve and then proceed to functionality
   * @private
   */
  runSmartlinks_() {
    this.getLinkmateOptions_().then(config => {
      this.linkmateOptions_.linkmateExpected = config['linkmate_enabled'];
      this.linkmateOptions_.publisherID = config['publisher_id'];

      this.postPageImpression_();
      this.linkmate_ = new Linkmate(
        /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */
        (this.ampDoc_),
        /** @type {!../../../src/service/xhr-impl.Xhr} */
        (this.xhr_),
        /** @type {!Object} */
        (this.linkmateOptions_)
      );
      this.smartLinkRewriter_ = this.initLinkRewriter_();

      // If the config specified linkmate to run and our API is expecting
      // linkmate to run
      if (
        this.linkmateOptions_.linkmateEnabled &&
        this.linkmateOptions_.linkmateExpected
      ) {
        this.smartLinkRewriter_.getAnchorReplacementList();
      }
    });
  }

  /**
   * API call to retrieve the Narrativ config for this extension.
   * API response will be a list containing nested json values. For the purpose
   * of this extension there will only ever be one value in the list:
   *  {amp_config: {linkmate_enabled: <!boolean>, publisher_id: <!number>}}
   * @return {?Promise<!JsonObject>}
   * @private
   */
  getLinkmateOptions_() {
    const fetchUrl = ENDPOINTS.NRTV_CONFIG_ENDPOINT.replace(
      '.nrtv_slug.',
      this.linkmateOptions_.nrtvSlug
    );

    try {
      return this.xhr_
        .fetchJson(fetchUrl, {
          method: 'GET',
          ampCors: false,
        })
        .then(res => res.json())
        .then(res => {
          return getData(res)[0]['amp_config'];
        });
    } catch (err) {
      return null;
    }
  }

  /**
   * API call to indicate a page load event happened
   * @private
   */
  postPageImpression_() {
    // When using layout='nodisplay' manually trigger CustomEventReporterBuilder
    this.signals().signal(CommonSignals.LOAD_START);
    const payload = this.buildPageImpressionPayload_();

    const builder = new CustomEventReporterBuilder(this.element);

    builder.track('page-impression', ENDPOINTS.PAGE_IMPRESSION_ENDPOINT);

    builder.setTransportConfig(
      dict({
        'beacon': true,
        'image': false,
        'xhrpost': true,
        'useBody': true,
      })
    );

    builder.setExtraUrlParams(payload);
    const reporter = builder.build();

    reporter.trigger('page-impression');
  }

  /**
   * Initialize and register a Narrativ LinkRewriter instance
   * @return {!../../amp-skimlinks/0.1/link-rewriter/link-rewriter.LinkRewriter}
   * @private
   */
  initLinkRewriter_() {
    const options = {linkSelector: this.linkmateOptions_.linkSelector};

    return this.linkRewriterService_.registerLinkRewriter(
      TAG,
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
    return /** @type {!JsonObject} */ (dict({
      'events': [{'is_amp': true}],
      'organization_id': this.linkmateOptions_.publisherID,
      'organization_type': 'publisher',
      'user': {
        'page_session_uuid': this.generateUUID_(),
        'source_url': this.ampDoc_.getUrl(),
        'previous_url': this.referrer_,
        'user_agent': this.ampDoc_.win.navigator.userAgent,
      },
    }));
  }

  /**
   * Generate a unique UUID for this session.
   * @return {string}
   * @private
   */
  generateUUID_() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }
}

AMP.extension('amp-smartlinks', '0.1', AMP => {
  AMP.registerElement('amp-smartlinks', AmpSmartlinks);
});
