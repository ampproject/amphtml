/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {addParamsToUrl} from '../../../src/url';
import {documentInfoFor} from '../../../src/document-info';
import {getAttributesAsParams} from '../../../src/dom';
import {getSocialConfig} from './amp-social-share-config';
import {isExperimentOn} from '../../../src/experiments';
import {listenForEventOnTagName} from '../../../src/event-helper';
import {isLayoutSizeDefined, getLengthNumeral} from '../../../src/layout';
import {user} from '../../../src/log';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {platformFor} from '../../../src/platform';
import {CSS} from '../../../build/amp-social-share-0.1.css';

/** @const */
const EXPERIMENT = 'amp-social-share';

/** @const */
const TAG = 'amp-social-share';

/** @const {number} */
const DEFAULT_WIDTH = 60;

/** {function()} */
let clickHandlerUnlistenCallback;

class AmpSocialShare extends AMP.BaseElement {

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  buildCallback() {
    this.isExperimentOn_ = isExperimentOn(this.getWin(), EXPERIMENT);
    if (!this.isExperimentOn_) {
      user.warn(TAG, `Experiment ${EXPERIMENT} disabled`);
      return;
    }
    /** @private @const {!Element} */
    this.type_ = user.assert(this.element.getAttribute('type'),
        'The type attribute is required. %s',
        this.element);

    /** @private @const {!Object} */
    this.typeConfig_ = getSocialConfig(this.type_) || {};

    /** @private @const {string} */
    this.shareEndpoint_ = this.element.getAttribute('data-share-endpoint') ||
        this.typeConfig_.shareEndpoint;
    user.assert(this.shareEndpoint_, 'Missing data-share-endpoint attribute ' +
        'for amp-social-share %s', this.element);

    /** @private @const {number} */
    this.width_ = getLengthNumeral(this.element.getAttribute('width'))
        || DEFAULT_WIDTH;

    /** @private @const {number} */
    this.height_ = getLengthNumeral(this.element.getAttribute('height'));

    /** @private @const {!Object} */
    this.params_ = Object.assign({}, this.typeConfig_.defaultParams || {});
    Object.assign(this.params_, getAttributesAsParams(
        this.element, attr => {
          const matches = attr.nodeName.match(/^data-param-(.+)/);
          return (matches && matches[1]) || null;
        }));

    const hrefWithVars = addParamsToUrl(this.shareEndpoint_, this.params_);
    urlReplacementsFor(this.getWin()).expand(hrefWithVars).then(href => {
      this.element.setAttribute('href', href);
    });
    this.element.setAttribute('role', 'link');

    // Install a global click listener only once for all amp-social-share.
    if (!clickHandlerUnlistenCallback) {
      this.addGlobalClickListener_();
    }
  }

  /**
   * Install a global click event listener to handle all amp-social-share targets.
   * @param win
   * @private
   */
  addGlobalClickListener_() {
    const win = this.getWin();
    clickHandlerUnlistenCallback = listenForEventOnTagName(
        win, 'amp-social-share', 'click', event => {
          const href = event.target.getAttribute('href');
          const type = event.target.getAttribute('type');
          const isDesktop = platformFor(win).isDesktop();
          if (isDesktop) {
            const pageViewId = documentInfoFor(win).pageViewId;
            const popupId = 'share-popup-' + type + pageViewId;
            const windowFeatures = 'resizable,scrollbars,width=640,height=480';
            this.getWin().open(href, popupId, windowFeatures);
          } else {
            this.getWin().open(href, '_blank');
          }
        });
  }

};

AMP.registerElement('amp-social-share', AmpSocialShare, CSS);
