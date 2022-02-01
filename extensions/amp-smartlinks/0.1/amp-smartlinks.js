import {CommonSignals_Enum} from '#core/constants/common-signals';

import {Services} from '#service';

import {getData} from '#utils/event-helper';

import {ENDPOINTS} from './constants';
import {Linkmate} from './linkmate';
import {getConfigOptions} from './linkmate-options';

import {CustomEventReporterBuilder} from '../../../src/extension-analytics';
import {LinkRewriterManager} from '../../amp-skimlinks/0.1/link-rewriter/link-rewriter-manager';

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
      .then((referrer) => {
        this.referrer_ = referrer;
        this.ampDoc_.whenFirstVisible().then(() => {
          this.runSmartlinks_();
        });
      });
  }

  /**
   * Wait for the config promise to resolve and then proceed to functionality
   * @private
   */
  runSmartlinks_() {
    this.getLinkmateOptions_().then((config) => {
      if (!config) {
        return;
      }

      this.linkmateOptions_.linkmateExpected = config['linkmate_enabled'];
      this.linkmateOptions_.publisherID = config['publisher_id'];

      this.postPageImpression_();
      this.linkmate_ = new Linkmate(
        /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */
        (this.ampDoc_),
        /** @type {!../../../src/service/xhr-impl.Xhr} */
        (this.xhr_),
        /** @type {!Object} */
        (this.linkmateOptions_),
        /** @type {!Object} */
        (this.win)
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
        .then((res) => res.json())
        .then((res) => {
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
    this.signals().signal(CommonSignals_Enum.LOAD_START);
    const payload = this.buildPageImpressionPayload_();

    const builder = new CustomEventReporterBuilder(this.element);

    builder.track('page-impression', ENDPOINTS.PAGE_IMPRESSION_ENDPOINT);

    builder.setTransportConfig({
      'beacon': true,
      'image': false,
      'xhrpost': true,
      'useBody': true,
    });

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
      (anchorList) => {
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
    return {
      'events': [{'is_amp': true}],
      'organization_id': this.linkmateOptions_.publisherID,
      'organization_type': 'publisher',
      'user': {
        'page_session_uuid': this.generateUUID_(),
        'source_url': this.getLocationHref_(),
        'previous_url': this.referrer_,
        'user_agent': this.ampDoc_.win.navigator.userAgent,
      },
    };
  }

  /**
   * Retrieve url of the current doc.
   * @return {string}
   * @private
   */
  getLocationHref_() {
    return this.win.location.href;
  }

  /**
   * Generate a unique UUID for this session.
   * @return {string}
   * @private
   */
  generateUUID_() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (
        c ^
        (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
      ).toString(16)
    );
  }
}

AMP.extension('amp-smartlinks', '0.1', (AMP) => {
  AMP.registerElement('amp-smartlinks', AmpSmartlinks);
});
