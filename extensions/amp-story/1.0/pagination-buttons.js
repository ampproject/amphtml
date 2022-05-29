import {toggleAttribute} from '#core/dom';
import * as Preact from '#core/dom/jsx';

import {Services} from '#service';
import {LocalizedStringId_Enum} from '#service/localization/strings';

import {devAssert} from '#utils/log';

import {localizeTemplate} from './amp-story-localization-service';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {EventType, dispatch} from './events';
import {AdvancementMode} from './story-analytics';

/** @struct @typedef {{className: string, triggers: string, label: LocalizedStringId_Enum}} */
let PaginationButtonStateDef;

/** @const {PaginationButtonStateDef} */
const BUTTON_STATE_PREVIOUS_PAGE = {
  className: 'i-amphtml-story-back-prev',
  triggers: EventType.PREVIOUS_PAGE,
  label: LocalizedStringId_Enum.AMP_STORY_PREVIOUS_PAGE,
};

/** @const {PaginationButtonStateDef} */
const BUTTON_STATE_NEXT_PAGE = {
  className: 'i-amphtml-story-fwd-next',
  triggers: EventType.NEXT_PAGE,
  label: LocalizedStringId_Enum.AMP_STORY_NEXT_PAGE,
};

/** @const {PaginationButtonStateDef} */
const BUTTON_STATE_NEXT_STORY = {
  className: 'i-amphtml-story-fwd-next',
  triggers: EventType.NEXT_PAGE,
  label: LocalizedStringId_Enum.AMP_STORY_NEXT_STORY,
};

/** @const {PaginationButtonStateDef} */
const BUTTON_STATE_REPLAY = {
  className: 'i-amphtml-story-fwd-replay',
  triggers: EventType.REPLAY,
  label: LocalizedStringId_Enum.AMP_STORY_REPLAY,
};

/**
 * @param {PaginationButtonStateDef} initialState
 * @param {function(Event)} onClick
 * @return {!Element}
 */
const renderPaginationButton = (initialState, onClick) => (
  <div
    onClick={onClick}
    class={`i-amphtml-story-button-container ${initialState.className}`}
  >
    <button
      class="i-amphtml-story-button-move"
      i-amphtml-i18n-aria-label={initialState.label}
    ></button>
  </div>
);

/**
 * Desktop navigation buttons.
 */
class PaginationButton {
  /**
   * @param {!Document} doc
   * @param {!PaginationButtonStateDef} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  constructor(doc, initialState, storeService, win) {
    /** @private {!PaginationButtonStateDef} */
    this.state_ = initialState;

    /** @const {!Document} */
    this.doc_ = doc;

    /** @const {!Element} */
    this.element = renderPaginationButton(initialState, (e) =>
      this.onClick_(e)
    );
    localizeTemplate(this.element, doc);

    /** @private @const {!Element} */
    this.buttonElement_ = devAssert(this.element.firstElementChild);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private @const {!../../../src/service/mutator-interface.MutatorInterface} */
    this.mutator_ = Services.mutatorForDoc(doc);
  }

  /** @param {!PaginationButtonStateDef} state */
  updateState(state) {
    if (state === this.state_) {
      return;
    }

    this.mutator_.mutateElement(this.element, () => {
      this.element.classList.remove(this.state_.className);
      this.element.classList.add(state.className);
      this.state_ = state;
    });
    Services.localizationForDoc(this.doc_)
      .getLocalizedStringAsync(state.label)
      .then((str) => this.buttonElement_.setAttribute('aria-label', str));
  }

  /**
   * @return {!PaginationButtonStateDef}
   */
  getState() {
    return this.state_;
  }

  /** @param {boolean} isEnabled */
  setEnabled(isEnabled) {
    this.mutator_.mutateElement(this.element, () => {
      this.element.classList.toggle(
        'i-amphtml-story-button-hidden',
        !isEnabled
      );
      const button = this.element.querySelector('button');
      toggleAttribute(button, 'disabled', !isEnabled);
    });
  }

  /**
   * @param {!Event} e
   * @private
   */
  onClick_(e) {
    e.preventDefault();

    this.storeService_.dispatch(
      Action.SET_ADVANCEMENT_MODE,
      AdvancementMode.MANUAL_ADVANCE
    );

    if (this.state_.triggers) {
      dispatch(
        this.win_,
        this.element,
        devAssert(this.state_.triggers),
        /* payload */ undefined,
        {bubbles: true}
      );
      return;
    }
    if (this.state_.action) {
      this.storeService_.dispatch(this.state_.action, this.state_.data);
    }
  }
}

/** Pagination buttons layer. */
export class PaginationButtons {
  /**
   * @param {!./amp-story.AmpStory} ampStory
   */
  constructor(ampStory) {
    /** @private @const {!./amp-story.AmpStory} */
    this.ampStory_ = ampStory;

    const {win} = this.ampStory_;
    const doc = win.document;
    this.storeService_ = getStoreService(win);

    /** @private @const {!PaginationButton} */
    this.forwardButton_ = new PaginationButton(
      doc,
      BUTTON_STATE_NEXT_PAGE,
      this.storeService_,
      win
    );

    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(
      doc,
      BUTTON_STATE_PREVIOUS_PAGE,
      this.storeService_,
      win
    );

    this.forwardButton_.element.classList.add('next-container');
    this.backButton_.element.classList.add('prev-container');

    this.initializeListeners_();

    this.ampStory_.element.appendChild(this.forwardButton_.element);
    this.ampStory_.element.appendChild(this.backButton_.element);
  }

  /** @private */
  initializeListeners_() {
    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      (pageIndex) => {
        this.onCurrentPageIndexUpdate_(pageIndex);
      }
    );

    this.storeService_.subscribe(
      StateProperty.PAGE_IDS,
      () => {
        const currentPageIndex = Number(
          this.storeService_.get(StateProperty.CURRENT_PAGE_INDEX)
        );
        this.onCurrentPageIndexUpdate_(currentPageIndex);
      },
      true /** callToInitialize */
    );

    this.storeService_.subscribe(
      StateProperty.SYSTEM_UI_IS_VISIBLE_STATE,
      (isVisible) => this.onSystemUiIsVisibleStateUpdate_(isVisible)
    );
  }

  /**
   * @param {number} pageIndex
   * @private
   */
  onCurrentPageIndexUpdate_(pageIndex) {
    const totalPages = this.storeService_.get(StateProperty.PAGE_IDS).length;

    // Hide back button if no previous page.
    this.backButton_.setEnabled(pageIndex > 0);

    if (pageIndex < totalPages - 1) {
      this.forwardButton_.updateState(BUTTON_STATE_NEXT_PAGE);
    } else {
      const viewer = Services.viewerForDoc(this.ampStory_.element);
      if (viewer.hasCapability('swipe')) {
        this.forwardButton_.updateState(BUTTON_STATE_NEXT_STORY);
      } else {
        this.forwardButton_.updateState(BUTTON_STATE_REPLAY);
      }
    }
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    this.backButton_.setEnabled(isVisible);
    this.forwardButton_.setEnabled(isVisible);
  }
}
