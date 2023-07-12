import {CommonSignals_Enum} from '#core/constants/common-signals';
import * as Preact from '#core/dom/jsx';
import {lastChildElement} from '#core/dom/query';

import {Services} from '#service';

import {userAssert} from '#utils/log';

import {Action, getStoreService} from './amp-story-store-service';

/**
 * Property used for storing id of custom slot. This custom slot can be used to
 * replace the default "items" and "update" slot.
 * @const {string}
 */
const AMP_LIVE_LIST_CUSTOM_SLOT_ID = 'AMP_LIVE_LIST_CUSTOM_SLOT_ID';

export class LiveStoryManager {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  constructor(ampStory) {
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
   */
  build() {
    const liveListEl = (
      <amp-live-list
        id={'i-amphtml-' + this.storyEl_.id + '-dynamic-list'}
        data-poll-interval={
          this.storyEl_.getAttribute('data-poll-interval') || 15000
        }
        sort="ascending"
        disable-scrolling
        disable-pagination
        auto-insert
      />
    );
    liveListEl[AMP_LIVE_LIST_CUSTOM_SLOT_ID] = userAssert(
      this.storyEl_.id,
      'amp-story must contain id to use the live story functionality'
    );

    this.ampStory_.element
      .signals()
      .whenSignal(CommonSignals_Enum.LOAD_END)
      .then(() => {
        Services.extensionsFor(this.ampdoc_.win).installExtensionForDoc(
          this.ampdoc_,
          'amp-live-list'
        );
        this.storyEl_.insertBefore(liveListEl, this.storyEl_.firstElementChild);
      });
  }

  /**
   * Updates the client amp-story with the changes from the server document.
   */
  update() {
    const lastNewPageEl = lastChildElement(this.storyEl_, (page) =>
      page.classList.contains('amp-live-list-item-new')
    );

    const storyPages = this.storyEl_.querySelectorAll('amp-story-page');
    const pageIds = Array.prototype.map.call(storyPages, (el) => el.id);

    this.storeService_.dispatch(Action.SET_PAGE_IDS, pageIds);
    this.storeService_.dispatch(Action.ADD_NEW_PAGE_ID, lastNewPageEl.id);
  }
}
