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

import {CTX_ATTR_NAME, CTX_ATTR_VALUE} from './constants';
import {getDigidipOptions} from './digidip-options';

export class LinkShifter {
  /**
   * @param {!AmpElement} ampElement
   * @param {?../../../src/service/viewer-impl.Viewer} viewer
   * @param {?../../../src/service/ampdoc-impl.AmpDoc} ampDoc
   */
  constructor(ampElement, viewer, ampDoc) {
    /** @private {?../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = viewer;

    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampDoc_ = ampDoc;

    /** @private {?Event} */
    this.event_ = null;

    /** @private {?Object} */
    this.digidipOpts_ = getDigidipOptions(ampElement);

    /** @private {?RegExp} */
    this.regexDomainUrl_ = /^https?:\/\/(www\.)?([^\/:]*)(:\d+)?(\/.*)?$/;
  }

  /**
   * @param {!Event} event
   */
  clickHandler(event) {
    this.event_ = event;
    let htmlElement = event.srcElement;
    const trimmedDomain = this.viewer_.win.document.domain
        .replace(/(www\.)?(.*)/, '$2');

    this.event_.stopPropagation();

    // avoid firefox to trigger the event twice
    if ((this.event_.type !== 'contextmenu') && (this.event_.button === 2)) {
      return;
    }

    // check if the element or a parent element of it is a link in case we got
    // a element that is child of the link element that we need
    while (htmlElement && htmlElement.nodeName !== 'A') {
      htmlElement = htmlElement.parentNode;
    }

    // if we could not find a valid link element, there's nothing to do
    if (!htmlElement) {
      return;
    }

    // check if there is a ignore_attribute and and ignore_pattern defined
    // and check if the current element or it's parent has it
    if (this.checkIsIgnore_(htmlElement)) {
      return;
    }

    if (this.wasShifted_(htmlElement)) {
      return;
    }

    if (this.isInternalLink(htmlElement, trimmedDomain)) {
      return;
    }

    if (this.isOnBlackList_(htmlElement)) {
      return;
    }

    this.setDigidipUrl_(htmlElement);
  }

  /**
   * Check if the anchor element is placed in a section that
   * has being mark to ignore the anchors inside
   * @param {!Node} htmlElement
   */
  checkIsIgnore_(htmlElement) {
    const isIgnore = Boolean(
        this.digidipOpts_.elementIgnoreAttribute !== '' &&
        this.digidipOpts_.elementIgnorePattern !== '');

    if (!isIgnore) {
      return false;
    }

    if (this.digidipOpts_.elementIgnoreConsiderParents === '1') {
      const rootNode = htmlElement.getRootNode();
      let parentSearch = htmlElement;

      while (parentSearch && [rootNode].filter(subItem => {
        return subItem === parentSearch;
      }).length === 0 && parentSearch !== document) {
        if (this.hasPassCondition_(parentSearch)) {
          return true;
        }
        parentSearch = parentSearch.parentNode;
      }
    } else {
      if (this.hasPassCondition_(htmlElement)) {
        return true;
      }
    }

    if (this.digidipOpts_.elementClickhandler !== '') {
      // Note: Normally, this should not be necessary, because during the init
      // phase, we only subscribe to the events of the defined
      // element_clickhandler, but we had cases where the
      // respective element was not available at this
      // time. So following code is only for the 1% where
      // it doesn't work. :-(
      const selector = '#' + this.digidipOpts_.elementClickhandler;
      const elmTmpRootNode = htmlElement.getRootNode()
          .querySelectorAll(selector);

      if (elmTmpRootNode && this.containsNode_(elmTmpRootNode, htmlElement)) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {!Object} NodeList
   * @param {!Node} node
   * @return {boolean}
   * @private
   */
  containsNode_(NodeList, node) {
    let result = false;

    Object.keys(NodeList).forEach(key => {
      if (NodeList[key].contains(node)) {
        result = true;
      }
    });
    return result;
  }

  /**
   * Check if the element has set the condition to ignore
   * @param {!Node} htmlElement
   */
  hasPassCondition_(htmlElement) {
    let attributeValue = null;

    if (htmlElement.hasAttribute(this.digidipOpts_.elementIgnoreAttribute)) {
      attributeValue = htmlElement.getAttribute(
          this.digidipOpts_.elementIgnoreAttribute);

      const searchAttr = attributeValue.search(
          this.digidipOpts_.elementIgnorePattern);

      if (searchAttr !== -1) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if the anchor element was already shifted
   * @param {!Node} htmlElement
   * @return {boolean}
   * @private
   */
  wasShifted_(htmlElement) {
    const ctxAttrValue = CTX_ATTR_VALUE().toString();

    return (htmlElement.hasAttribute(CTX_ATTR_NAME)) &&
        (htmlElement.getAttribute(CTX_ATTR_NAME) === ctxAttrValue);
  }

  /**
   * Check if the anchor element leads to an internal link
   * @param {!Node} htmlElement
   * @param {?string} trimmedDomain
   * @return {boolean}
   */
  isInternalLink(htmlElement, trimmedDomain) {
    const href = htmlElement.getAttribute('href');

    if (!(href && this.regexDomainUrl_.test(href) &&
            RegExp.$2 !== trimmedDomain)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if the domain of the link is in a blacklist
   * @param {!Node} htmlElement
   * @return {boolean}
   * @private
   */
  isOnBlackList_(htmlElement) {
    const href = htmlElement.getAttribute('href');
    this.regexDomainUrl_.test(href);
    const targetHost = RegExp.$2;

    if (this.digidipOpts_.hostsIgnore.length > 0) {
      const targetTest = new RegExp(
          '(' + this.digidipOpts_.hostsIgnore.replace(/[\.]/g, '\\$&') + ')$',
          'i');
      if (targetTest.test(targetHost)) {
        return true;
      }
    }

    return false;
  }

  /**
   * set the digidip tracking link
   * @param {!Node} htmlElement
   */
  setDigidipUrl_(htmlElement) {
    const oldValHref = htmlElement['href'];
    const oldValTarget = htmlElement['target'];

    this.viewer_.getReferrerUrl().then(referrerUrl => {
      const urlParams = {
        ppRef: referrerUrl,
        currUrl: this.viewer_.getResolvedViewerUrl(),
      };

      htmlElement.href = this.getDigidipUrl(htmlElement, urlParams);

      if (this.digidipOpts_.newTab === '1') {
        htmlElement.target = '_blank';
      }

      // If the link has been "activated" via contextmenu,
      // we have to keep the shifting in mind
      if (this.event_.type === 'contextmenu') {
        htmlElement.setAttribute(CTX_ATTR_NAME, CTX_ATTR_VALUE());
      }

      this.viewer_.win.setTimeout(() => {
        htmlElement.href = oldValHref;

        if (oldValTarget === '') {
          htmlElement.removeAttribute('target');
        } else {
          htmlElement.target = oldValTarget;
        }

        if (htmlElement.hasAttribute(CTX_ATTR_NAME)) {
          htmlElement.removeAttribute(CTX_ATTR_NAME);
        }

      }, ((this.event_.type === 'contextmenu') ? 15000 : 500));
    });
  }

  /**
   * @param {!Node} htmlElement
   * @param {!Object} urlParams
   * @return {string}
   */
  getDigidipUrl(htmlElement, urlParams) {
    return this.getUrlVisit_() +
        encodeURIComponent(htmlElement.href) +
        (htmlElement.rev ?
          ('&ref=' + encodeURIComponent(htmlElement.rev)) : ''
        ) +
        (htmlElement.getAttribute('data-ddid') ?
          ('&wd_id=' +
                encodeURIComponent(htmlElement.getAttribute('data-ddid'))) : ''
        ) +
        (urlParams.ppRef ?
          ('&ppref=' + encodeURIComponent(urlParams.ppRef)) : ''
        ) +
        (urlParams.currUrl ?
          ('&currurl=' + encodeURIComponent(urlParams.currUrl)) : ''
        );
  }

  /**
   * @return {string}
   * @private
   */
  getUrlVisit_() {
    return 'http://' + this.digidipOpts_.publisherId +
        '.digidip.net/visit?url=';
  }
}
