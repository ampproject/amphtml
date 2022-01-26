import {deepEquals} from '#core/types/object/json';

import {getData} from '#utils/event-helper';

import {ENDPOINTS} from './constants';

import {TwoStepsResponse} from '../../amp-skimlinks/0.1/link-rewriter/two-steps-response';

export class Linkmate {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   * @param {!../../../src/service/xhr-impl.Xhr} xhr
   * @param {!Object} linkmateOptions
   * @param {!Object} win
   */
  constructor(ampDoc, xhr, linkmateOptions, win) {
    /** @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = xhr;

    /** @private {?boolean} */
    this.requestExclusiveLinks_ = linkmateOptions.exclusiveLinks;

    /** @private {?number} */
    this.publisherID_ = linkmateOptions.publisherID;

    /** @private {string} */
    this.linkAttribute_ = linkmateOptions.linkAttribute;

    /** @private {?Array<!HTMLElement>} */
    this.anchorList_ = null;

    /** @private {?Array<JsonObject>}*/
    this.linkmateResponse_ = null;

    /** @private {?Array<JsonObject>}*/
    this.win_ = win;
  }

  /**
   * Callback used by LinkRewriter. Whenever there is a change in the anchors
   * on the page we want make a new API call.
   * @param {!Array<!HTMLElement>} anchorList
   * @return {!../../amp-skimlinks/0.1/link-rewriter/two-steps-response.TwoStepsResponse}
   * @public
   */
  runLinkmate(anchorList) {
    // If we already have an API response and the anchor list has
    // changed since last API call then map any new anchors to existing
    // API response
    let syncMappedLinks = null;
    const anchorListChanged =
      this.anchorList_ && !deepEquals(this.anchorList_, anchorList);

    if (this.linkmateResponse_ && anchorListChanged) {
      syncMappedLinks = this.mapLinks_();
    }

    // If we don't have an API response or the anchor list has changed since
    // last API call then build a new payload and post to API
    if (!this.linkmateResponse_ || anchorListChanged) {
      const asyncMappedLinks = this.postToLinkmate_(anchorList).then((res) => {
        this.linkmateResponse_ = getData(res)[0]['smart_links'];
        this.anchorList_ = anchorList;
        return this.mapLinks_();
      });

      return new TwoStepsResponse(syncMappedLinks, asyncMappedLinks);
    } else {
      // If we didn't need to make an API call return the synchronous response
      this.anchorList_ = anchorList;
      return new TwoStepsResponse(syncMappedLinks, null);
    }
  }

  /**
   * Build the payload for the Linkmate API call and POST.
   * @param {!Array<!HTMLElement>} anchorList
   * @private
   * @return {?Promise}
   */
  postToLinkmate_(anchorList) {
    const linksPayload = this.buildLinksPayload_(anchorList);
    const editPayload = this.getEditInfo_();

    const payload = {
      'article': editPayload,
      'links': linksPayload,
    };

    const fetchUrl = ENDPOINTS.LINKMATE_ENDPOINT.replace(
      '.pub_id.',
      this.publisherID_.toString()
    );
    const postOptions = {
      method: 'POST',
      ampCors: false,
      headers: {'Content-Type': 'application/json'},
      body: payload,
    };

    return this.xhr_.fetchJson(fetchUrl, postOptions).then((res) => res.json());
  }

  /**
   * Build the links portion for Linkmate payload. We need to check each link
   * if it has #donotlink to comply with business rules.
   * @param {!Array<!HTMLElement>} anchorList
   * @return {!Array<Object>}
   * @private
   */
  buildLinksPayload_(anchorList) {
    // raw links needs to be stored as a global somewhere
    // for later association with the response
    const postLinks = [];
    anchorList.forEach((anchor) => {
      const link = anchor.getAttribute(this.linkAttribute_);
      // If a link is already a Narrativ link.
      if (/shop-links.co/.test(link)) {
        // Check if amp flag is there. Add if necessary. Don't add to payload.
        if (!/\?amp=true$/.test(link)) {
          anchor[this.linkAttribute_] = `${
            anchor[this.linkAttribute_]
          }?amp=true`;
        }
        return;
      }

      if (!/#donotlink$/.test(link)) {
        const exclusive =
          this.requestExclusiveLinks_ || /#locklink$/.test(link);
        const linkObj = {
          'raw_url': link,
          'exclusive_match_requested': exclusive,
          'link_source': 'linkmate',
        };

        postLinks.push(linkObj);
      }
    });

    return postLinks;
  }

  /**
   * This is just article information used in the edit part of Linkmate payload.
   * @return {!JsonObject}
   * @private
   */
  getEditInfo_() {
    return {
      'name': this.getEditName_(),
      'url': this.getLocationHref_(),
    };
  }

  /**
   * Retrieve edit name.
   * @return {string}
   * @private
   */
  getEditName_() {
    let editName = null;
    if (this.win_.document.getElementsByTagName('title').length > 0) {
      editName = this.win_.document.getElementsByTagName('title')[0].text;
    }
    return editName;
  }

  /**
   * Retrieve url of the current doc.
   * @return {string}
   * @private
   */
  getLocationHref_() {
    return this.win_.location.href;
  }

  /**
   * The API response returns unique links. Map those unique links to as many
   * urls in the anchorList as possible. Set the replacement url as a shop-link.
   * @return {!../../amp-skimlinks/0.1/link-rewriter/link-rewriter.AnchorReplacementList}
   * @public
   */
  mapLinks_() {
    const mappings = [];
    this.anchorList_.forEach((anchor) => {
      this.linkmateResponse_.forEach((smartLink) => {
        if (
          anchor.getAttribute(this.linkAttribute_) === smartLink['url'] &&
          smartLink['auction_id']
        ) {
          mappings.push({
            anchor,
            replacementUrl: `https://shop-links.co/${smartLink['auction_id']}/?amp=true`,
          });
        }
      });
    });

    return mappings;
  }
}
