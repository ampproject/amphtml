import * as Preact from '#core/dom/jsx';
import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {AdvancementMode} from './story-analytics';
import {EventType, dispatch} from './events';
import {LocalizedStringId_Enum} from '#service/localization/strings';
import {Services} from '#service';
import {dev, devAssert} from '#utils/log';
import {localize} from './amp-story-localization-service';

/** @struct @typedef {{className: string, triggers: (string|undefined)}} */
let ButtonState_1_0_Def; // eslint-disable-line local/camelcase

/** @const {!Object<string, !ButtonState_1_0_Def>} */
const BackButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  PREVIOUS_PAGE: {
    className: 'i-amphtml-story-back-prev',
    triggers: EventType.PREVIOUS_PAGE,
    label: LocalizedStringId_Enum.AMP_STORY_PREVIOUS_PAGE,
  },
};

/** @const {!Object<string, !ButtonState_1_0_Def>} */
const ForwardButtonStates = {
  HIDDEN: {className: 'i-amphtml-story-button-hidden'},
  NEXT_PAGE: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId_Enum.AMP_STORY_NEXT_PAGE,
  },
  NEXT_STORY: {
    className: 'i-amphtml-story-fwd-next',
    triggers: EventType.NEXT_PAGE,
    label: LocalizedStringId_Enum.AMP_STORY_NEXT_STORY,
  },
  REPLAY: {
    className: 'i-amphtml-story-fwd-replay',
    triggers: EventType.REPLAY,
    label: LocalizedStringId_Enum.AMP_STORY_REPLAY,
  },
};

/**
 * @return {!Element}
 */
const renderPaginationButton = () => (
  <div class="i-amphtml-story-button-container">
    <button class="i-amphtml-story-button-move"></button>
  </div>
);

/**
 * Desktop navigation buttons.
 */
class PaginationButton {
  /**
   * @param {!Document} doc
   * @param {!ButtonState_1_0_Def} initialState
   * @param {!./amp-story-store-service.AmpStoryStoreService} storeService
   * @param {!Window} win
   */
  constructor(doc, initialState, storeService, win) {
    /** @private {!ButtonState_1_0_Def} */
    this.state_ = initialState;

    /** @public @const {!Element} */
    this.element = renderPaginationButton();

    /** @private @const {!Element} */
    this.buttonElement_ = dev().assertElement(
      this.element.querySelector('button')
    );

    this.element.classList.add(initialState.className);
    if (initialState.label) {
      this.buttonElement_.setAttribute(
        'aria-label',
        localize(doc, initialState.label)
      );
    }
    this.element.addEventListener('click', (e) => this.onClick_(e));

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = storeService;

    /** @private @const {!Window} */
    this.win_ = win;
  }

  /** @param {!ButtonState_1_0_Def} state */
  updateState(state) {
    if (state === this.state_) {
      return;
    }
    this.element.classList.remove(this.state_.className);
    this.element.classList.add(state.className);
    state.label
      ? this.buttonElement_.setAttribute(
          'aria-label',
          localize(this.win_.document, state.label)
        )
      : this.buttonElement_.removeAttribute('aria-label');

    this.state_ = state;
  }

  /**
   * @return {!ButtonState_1_0_Def}
   */
  getState() {
    return this.state_;
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
      return;
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
      ForwardButtonStates.NEXT_PAGE,
      this.storeService_,
      win
    );

    /** @private @const {!PaginationButton} */
    this.backButton_ = new PaginationButton(
      doc,
      BackButtonStates.HIDDEN,
      this.storeService_,
      win
    );

    this.forwardButton_.element.classList.add('next-container');
    this.backButton_.element.classList.add('prev-container');

    /** @private {?ButtonState_1_0_Def} */
    this.backButtonStateToRestore_ = null;

    /** @private {?ButtonState_1_0_Def} */
    this.forwardButtonStateToRestore_ = null;

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
      (isVisible) => {
        this.onSystemUiIsVisibleStateUpdate_(isVisible);
      }
    );
  }

  /**
   * @param {number} pageIndex
   * @private
   */
  onCurrentPageIndexUpdate_(pageIndex) {
    const totalPages = this.storeService_.get(StateProperty.PAGE_IDS).length;

    if (pageIndex === 0) {
      this.backButton_.updateState(BackButtonStates.HIDDEN);
    }

    if (pageIndex > 0) {
      this.backButton_.updateState(BackButtonStates.PREVIOUS_PAGE);
    }

    if (pageIndex < totalPages - 1) {
      this.forwardButton_.updateState(ForwardButtonStates.NEXT_PAGE);
    }

    if (pageIndex === totalPages - 1) {
      const viewer = Services.viewerForDoc(this.ampStory_.element);
      if (viewer.hasCapability('swipe')) {
        this.forwardButton_.updateState(ForwardButtonStates.NEXT_STORY);
      } else {
        this.forwardButton_.updateState(ForwardButtonStates.REPLAY);
      }
    }
  }

  /**
   * Reacts to system UI visibility state updates.
   * @param {boolean} isVisible
   * @private
   */
  onSystemUiIsVisibleStateUpdate_(isVisible) {
    if (isVisible) {
      this.backButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */ (
          devAssert(this.backButtonStateToRestore_)
        )
      );
      this.forwardButton_.updateState(
        /** @type {!ButtonState_1_0_Def} */ (
          devAssert(this.forwardButtonStateToRestore_)
        )
      );
    } else {
      this.backButtonStateToRestore_ = this.backButton_.getState();
      this.backButton_.updateState(BackButtonStates.HIDDEN);
      this.forwardButtonStateToRestore_ = this.forwardButton_.getState();
      this.forwardButton_.updateState(ForwardButtonStates.HIDDEN);
    }
  }
}
