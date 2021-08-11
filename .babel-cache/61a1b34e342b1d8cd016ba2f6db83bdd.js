function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}function _createClass(Constructor, protoProps, staticProps) {if (protoProps) _defineProperties(Constructor.prototype, protoProps);if (staticProps) _defineProperties(Constructor, staticProps);return Constructor;} /**
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

import { Action, getStoreService } from "./amp-story-store-service";
import { CommonSignals } from "../../../src/core/constants/common-signals";
import { Services } from "../../../src/service";
import { createElementWithAttributes } from "../../../src/core/dom";
import { dict } from "../../../src/core/types/object";
import { lastChildElement } from "../../../src/core/dom/query";
import { userAssert } from "../../../src/log";

/**
 * Property used for storing id of custom slot. This custom slot can be used to
 * replace the default "items" and "update" slot.
 * @const {string}
 */
var AMP_LIVE_LIST_CUSTOM_SLOT_ID = 'AMP_LIVE_LIST_CUSTOM_SLOT_ID';

export var LiveStoryManager = /*#__PURE__*/function () {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  function LiveStoryManager(ampStory) {_classCallCheck(this, LiveStoryManager);
    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    /** @private @const {!../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = this.ampStory_.getAmpDoc();

    /** @private @const {!Element} */
    this.storyEl_ = ampStory.element;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.ampStory_.win);
  }

  /**
   * Initializes an amp-live-list component with the story-specific
   * configuration and appends it to the DOM.
   */_createClass(LiveStoryManager, [{ key: "build", value:
    function build() {var _this = this;
      var liveListEl = createElementWithAttributes(
      this.ampStory_.win.document,
      'amp-live-list',
      dict({
        'id': 'i-amphtml-' + this.storyEl_.id + '-dynamic-list',
        'data-poll-interval':
        this.storyEl_.getAttribute('data-poll-interval') || 15000,
        'sort': 'ascending',
        'disable-scrolling': '',
        'disable-pagination': '',
        'auto-insert': '' }));


      liveListEl[AMP_LIVE_LIST_CUSTOM_SLOT_ID] = userAssert(
      this.storyEl_.id,
      'amp-story must contain id to use the live story functionality');


      this.ampStory_.element.
      signals().
      whenSignal(CommonSignals.LOAD_END).
      then(function () {
        Services.extensionsFor(_this.ampdoc_.win).installExtensionForDoc(
        _this.ampdoc_,
        'amp-live-list');

        _this.storyEl_.insertBefore(liveListEl, _this.storyEl_.firstElementChild);
      });
    }

    /**
     * Updates the client amp-story with the changes from the server document.
     */ }, { key: "update", value:
    function update() {
      var lastNewPageEl = lastChildElement(this.storyEl_, function (page) {return (
          page.classList.contains('amp-live-list-item-new'));});


      var storyPages = this.storyEl_.querySelectorAll('amp-story-page');
      var pageIds = Array.prototype.map.call(storyPages, function (el) {return el.id;});

      this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
      this.storeService_.dispatch(Action.ADD_NEW_PAGE_ID, lastNewPageEl.id);
    } }]);return LiveStoryManager;}();
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/live-story-manager.js