/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {resourcesForDoc} from '../../../src/resources';

/**
 * Should be kept in sync with the disallowed_ancestors in
 * extensions/amp-ad/.../validator-amp-ad.protoascii.
 * @const {!Array<string>}
 */
const BLACKLISTED_ANCESTOR_TAGS = [
  'AMP-SIDEBAR',
  'AMP-APP-BANNER',
];


export class AncestorBlacklist {
  /**
   * @param {!../../../src/service/resources-impl.Resources} resources
   * @param {!Array<number>} blacklistedAnchorUids
   */
  constructor(resources, blacklistedAnchorUids) {
    /** @const @private {!../../../src/service/resources-impl.Resources} */
    this.resources_ = resources;

    /** @const @private {!Object<number, boolean>} */
    this.blacklistedAnchorUids_ = getBlacklistMap(blacklistedAnchorUids);
  }

  /**
   * @param {!Node} node
   */
  isOrDescendantOfBlacklistedElement(node) {
    const uid = this.resources_.getNodeUid(node);
    if (uid in this.blacklistedAnchorUids_) {
      return this.blacklistedAnchorUids_[uid];
    }
    const parent = node.parentNode;
    if (!parent) {
      return (this.blacklistedAnchorUids_[uid] = false);
    }
    return (this.blacklistedAnchorUids_[uid] =
        this.isOrDescendantOfBlacklistedElement(parent));
  }
}

/**
 * @param {!Window} win
 * @return {!AncestorBlacklist}
 */
export function getAncestorBlacklist(win) {
  const resources = resourcesForDoc(win.document);
  const blacklistUids = [];
  BLACKLISTED_ANCESTOR_TAGS.forEach(tagName => {
    const elements = [].slice.call(win.document.getElementsByTagName(tagName));
    elements.forEach(element => {
      blacklistUids.push(resources.getNodeUid(element));
    });
  });
  return new AncestorBlacklist(resources, blacklistUids);
}

/**
 * @param {!Array<number>} blacklistedAnchorUids
 * @return {!Object<number, boolean>}
 */
function getBlacklistMap(blacklistedAnchorUids) {
  const map = {};
  blacklistedAnchorUids.forEach(uid => {
    map[uid] = true;
  });
  return map;
}
