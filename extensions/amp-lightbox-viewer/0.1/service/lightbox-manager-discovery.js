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

import {elementByTag, waitForBodyPromise} from '../../../../src/dom';
import {isExperimentOn} from '../../../../src/experiments';
import {dev} from '../../../../src/log';

const ELIGIBLE_TAGS = [
  'amp-img',
  'amp-anim',
  'amp-ad',
  'amp-dailymotion',
  'amp-jwplayer',
  'amp-kaltura-player',
  'amp-o2-player',
  'amp-pinterest',
  'amp-reach-player',
  'amp-vimeo',
  'amp-vine',
  'amp-youtube',
  'amp-video',
  'amp-twitter',
  'amp-facebook',
  'amp-instagram',
];

const ELIGIBLE_TAP_TAGS = {
  'amp-img': true,
  'amp-anim': true,
};

const DEFAULT_VIEWER_ID = 'amp-lightbox-viewer';
const VIEWER_TAG = 'amp-lightbox-viewer';

/**
 * Finds elements in the document that meet our heuristics for automatically
 * becoming lightboxable and adds `lightbox` attribute to them.
 * It may also install a tap handler on elements that meet our heuristics
 * to automatically open in lightbox on tap.
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise}
 */
export function autoDiscoverLightboxables(ampdoc) {

  // Extra safety check, manager should not call this if experiments are off
  dev().assert(isExperimentOn(ampdoc.win, 'amp-lightbox-viewer'));
  dev().assert(isExperimentOn(ampdoc.win, 'amp-lightbox-viewer-auto'));

  return maybeInstallLightboxViewer(ampdoc).then(viewerId => {
    const tagsQuery = ELIGIBLE_TAGS.join(',');
    const matches = ampdoc.getRootNode().querySelectorAll(tagsQuery);
    for (let i = 0; i < matches.length; i++) {
      const element = matches[i];
      if (element.hasAttribute('lightbox') || !meetsHeuristics(element)) {
        continue;
      }
      element.setAttribute('lightbox', '');

      // TODO(aghassemi): This is best to do via default action. E.g. we can add
      // a tap listener via Action service and invoke lightbox if conditions are
      // met.
      if (meetsHeuristicsForTap(element)) {
        element.setAttribute('on', 'tap:' + viewerId + '.activate');
      }
    }
  });
}

/**
 * Decides whether an element meets the heuristics to become lightboxable.
 * @param {!Element} element
 * @return {!boolean}
 */
function meetsHeuristics(element) {
  dev().assert(element);

  // TODO(aghassemi): This will become complicated soon, create a pluggable
  // system for this.

  if (element.getLayoutBox) {
    const layoutBox = element.getLayoutBox();
    if (layoutBox.left < 0 ||
        layoutBox.width < 50 ||
        layoutBox.height < 50
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Decides whether an already lightboxable element should automatically get
 * a tap handler to open in the lightbox.
 * @param {!Element} element
 * @return {!boolean}
 */
function meetsHeuristicsForTap(element) {
  dev().assert(element);
  dev().assert(element.hasAttribute('lightbox'));

  if (!ELIGIBLE_TAP_TAGS[element.tagName.toLowerCase()]) {
    return false;
  }
  if (element.hasAttribute('on')) {
    return false;
  }
  return true;
}

/**
 * Tries to find an existing amp-lightbox-viewer, if there is none, it adds a
 * default one.
 * @param {!../../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @return {!Promise<string>} Returns the id of the amp-lightbox-viewer.
 */
function maybeInstallLightboxViewer(ampdoc) {
  // TODO(aghassemi): Use the upcoming ampdoc.waitForBody
  return waitForBodyPromise(/** @type {!Document} */ (
      ampdoc.getRootNode())).then(() => {
        const existingViewer = elementByTag(ampdoc.getRootNode(), VIEWER_TAG);
        if (existingViewer) {
          if (!existingViewer.id) {
            existingViewer.id = DEFAULT_VIEWER_ID;
          }
          return existingViewer.id;
        }

        const viewer = ampdoc.getRootNode().createElement(VIEWER_TAG);
        viewer.setAttribute('layout', 'nodisplay');
        viewer.setAttribute('id', DEFAULT_VIEWER_ID);
        ampdoc.getRootNode().body.appendChild(viewer);

        return viewer.id;
      });
}
