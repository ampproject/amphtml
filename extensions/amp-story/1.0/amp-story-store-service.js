import {Observable} from '#core/data-structures/observable';
import {mangleObjectValues} from '#core/types/enum';
import {hasOwn} from '#core/types/object';
import {deepEquals} from '#core/types/object/json';

import {Services} from '#service';

import {dev} from '#utils/log';

import {EmbedMode, parseEmbedMode} from './embed-mode';

import {registerServiceBuilder} from '../../../src/service-helpers';

/** @type {string} */
const TAG = 'amp-story';

/**
 * Util function to retrieve the store service. Ensures we can retrieve the
 * service synchronously from the amp-story codebase without running into race
 * conditions.
 * @param  {!Window} win
 * @return {!AmpStoryStoreService}
 */
export const getStoreService = (win) => {
  let service = Services.storyStoreService(win);

  if (!service) {
    service = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', function () {
      return service;
    });
  }

  return service;
};

/**
 * Different UI experiences to display the story.
 * @const @enum {number}
 */
export const UIType_Enum = {
  MOBILE: 0,
  DESKTOP_FULLBLEED: 2, // Desktop UI if landscape mode is enabled.
  DESKTOP_ONE_PANEL: 4, // Desktop UI with one panel and space around story.
  VERTICAL: 3, // Vertical scrolling versions, for search engine bots indexing.
};

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
export const EmbeddedComponentState = {
  HIDDEN: 0, // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1, // Component has been clicked, a tooltip should be shown.
};

/**
 * Subscription states for the paywall-enabled stories.
 * @enum {number}
 */
export const SubscriptionsState = {
  DISABLED: 0,
  PENDING: 1,
  GRANTED: 2,
  BLOCKED: 3,
};

/**
 * @typedef {{
 *    element: !Element,
 *    state: !EmbeddedComponentState,
 *    clientX: number,
 *    clientY: number,
 * }}
 */
export let InteractiveComponentDef;

/**
 * @typedef {{
 *    option: ?../../amp-story-interactive/0.1/amp-story-interactive-abstract.OptionConfigType,
 *    interactiveId: string,
 *    type: ../../amp-story-interactive/0.1/amp-story-interactive-abstract.InteractiveType
 * }}
 */
export let InteractiveReactData;

/**
 * @typedef {{
 *   productId: string,
 *   productTitle: string,
 *   productBrand: string,
 *   productPrice: number,
 *   productPriceCurrency: string,
 *   productIcon: string,
 *   productTagText: ?string,
 *   productImages: !Array<string>,
 * }}
 */
export let ShoppingConfigDataDef;

/**
 * @typedef {{
 *  activeProductData: ShoppingConfigDataDef,
 *  items: !Map<string, !ShoppingConfigDataDef>,
 * }}
 */
export let ShoppingDataDef;

/**
 * @typedef {{
 *    canInsertAutomaticAd: boolean,
 *    canShowAudioUi: boolean,
 *    canShowNavigationOverlayHint: boolean,
 *    canShowPaginationButtons: boolean,
 *    canShowPreviousPageHelp: boolean,
 *    canShowSharingUis: boolean,
 *    canShowStoryUrlInfo: boolean,
 *    canShowSystemLayerButtons: boolean,
 *    viewerCustomControls: !Array<!Object>,
 *    adState: boolean,
 *    pageAttachmentState: boolean,
 *    desktopState: boolean,
 *    educationState: boolean,
 *    gyroscopeEnabledState: string,
 *    infoDialogState: boolean,
 *    interactiveEmbeddedComponentState: !InteractiveComponentDef,
 *    interactiveReactState: !Map<string, !InteractiveReactData>,
 *    keyboardActiveState: boolean,
 *    mutedState: boolean,
 *    pageAudioState: boolean,
 *    pageCaptionsState: boolean,
 *    captionsState: boolean,
 *    pageHasElementsWithPlaybackState: boolean,
 *    panningMediaState: !Map<string, ../../amp-story-panning-media/0.1/amp-story-panning-media.panningMediaPositionDef> ,
 *    pausedState: boolean,
 *    previewState: boolean,
 *    rtlState: boolean,
 *    shareMenuState: boolean,
 *    storyHasPlaybackUiState: boolean,
 *    storyHasBackgroundAudioState: boolean,
 *    systemUiIsVisibleState: boolean,
 *    uiState: !UIType_Enum,
 *    viewportWarningState: boolean,
 *    actionsAllowlist: !Array<{tagOrTarget: string, method: string}>,
 *    consentId: ?string,
 *    currentPageId: string,
 *    currentPageIndex: number,
 *    pageIds: !Array<string>,
 *    newPageAvailableId: string,
 *    pageSize: {width: number, height: number},
 *    subscriptionsDialogState: boolean,
 *    subscriptionsPageIndex: number,
 *    desktopAspectRatio: number,
 * }}
 */
export let State;

/** @const @enum {string|number} */
const StateProperty = mangleObjectValues({
  // Embed options.
  CAN_INSERT_AUTOMATIC_AD: 'canInsertAutomaticAd',
  CAN_SHOW_AUDIO_UI: 'canShowAudioUi',
  CAN_SHOW_NAVIGATION_OVERLAY_HINT: 'canShowNavigationOverlayHint',
  CAN_SHOW_PAGINATION_BUTTONS: 'canShowPaginationButtons',
  CAN_SHOW_PREVIOUS_PAGE_HELP: 'canShowPreviousPageHelp',
  CAN_SHOW_SHARING_UIS: 'canShowSharingUis',
  CAN_SHOW_STORY_URL_INFO: 'canShowStoryUrlInfo',
  CAN_SHOW_SYSTEM_LAYER_BUTTONS: 'canShowSystemLayerButtons',
  VIEWER_CUSTOM_CONTROLS: 'viewerCustomControls',

  // App States.
  AD_STATE: 'adState',
  PAGE_ATTACHMENT_STATE: 'pageAttachmentState',
  EDUCATION_STATE: 'educationState',
  GYROSCOPE_PERMISSION_STATE: 'gyroscopePermissionState',
  INFO_DIALOG_STATE: 'infoDialogState',
  INTERACTIVE_COMPONENT_STATE: 'interactiveEmbeddedComponentState',
  // State of interactive components (polls, quizzes) on the story.
  INTERACTIVE_REACT_STATE: 'interactiveReactState',
  KEYBOARD_ACTIVE_STATE: 'keyboardActiveState',
  MUTED_STATE: 'mutedState',
  PAGE_HAS_AUDIO_STATE: 'pageAudioState',
  PAGE_HAS_CAPTION_STATE: 'pageCaptionState',
  CAPTIONS_STATE: 'captionsState',
  PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE: 'pageHasElementsWithPlaybackState',
  PANNING_MEDIA_STATE: 'panningMediaState',
  PAUSED_STATE: 'pausedState',
  // Story preview state.
  PREVIEW_STATE: 'previewState',
  RTL_STATE: 'rtlState',
  SHARE_MENU_STATE: 'shareMenuState',
  SHOPPING_DATA: 'shoppingData',
  // amp-story has a `background-audio` attribute.
  STORY_HAS_BACKGROUND_AUDIO_STATE: 'storyHasBackgroundAudioState',
  // Any page has elements with playback.
  STORY_HAS_PLAYBACK_UI_STATE: 'storyHasPlaybackUiState',
  SYSTEM_UI_IS_VISIBLE_STATE: 'systemUiIsVisibleState',
  UI_STATE: 'uiState',
  DESKTOP_ASPECT_RATIO: 'desktopAspectRatio',

  // App data.
  ACTIONS_ALLOWLIST: 'actionsAllowlist',
  CONSENT_ID: 'consentId',
  CURRENT_PAGE_ID: 'currentPageId',
  CURRENT_PAGE_INDEX: 'currentPageIndex',
  ADVANCEMENT_MODE: 'advancementMode',
  NAVIGATION_PATH: 'navigationPath',
  NEW_PAGE_AVAILABLE_ID: 'newPageAvailableId',
  PAGE_IDS: 'pageIds',
  PAGE_SIZE: 'pageSize',

  // AMP Story paywall states.
  SUBSCRIPTIONS_DIALOG_UI_STATE: 'subscriptionsDialogUiState',
  SUBSCRIPTIONS_STATE: 'subscriptionsState',
  SUBSCRIPTIONS_PAGE_INDEX: 'subscriptionsPageIndex',
});

export {StateProperty};

/** @const @enum {string|number} */
const Action = mangleObjectValues({
  ADD_INTERACTIVE_REACT: 'addInteractiveReact',
  ADD_NEW_PAGE_ID: 'addNewPageId',
  ADD_PANNING_MEDIA_STATE: 'addPanningMediaState',
  ADD_SHOPPING_DATA: 'addShoppingData',
  ADD_TO_ACTIONS_ALLOWLIST: 'addToActionsAllowlist',
  CHANGE_PAGE: 'setCurrentPageId',
  SET_ADVANCEMENT_MODE: 'setAdvancementMode',
  SET_CONSENT_ID: 'setConsentId',
  SET_GYROSCOPE_PERMISSION: 'setGyroscopePermission',
  SET_NAVIGATION_PATH: 'setNavigationPath',
  SET_PAGE_IDS: 'setPageIds',
  SET_PAGE_SIZE: 'updatePageSize',
  SET_VIEWER_CUSTOM_CONTROLS: 'setCustomControls',
  SET_SUBSCRIPTIONS_PAGE_INDEX: 'setSubscriptionsPageIndex',
  SET_DESKTOP_ASPECT_RATIO: 'setDesktopAspectRatio',
  TOGGLE_AD: 'toggleAd',
  TOGGLE_EDUCATION: 'toggleEducation',
  TOGGLE_INFO_DIALOG: 'toggleInfoDialog',
  TOGGLE_INTERACTIVE_COMPONENT: 'toggleInteractiveComponent',
  TOGGLE_KEYBOARD_ACTIVE_STATE: 'toggleKeyboardActiveState',
  TOGGLE_MUTED: 'toggleMuted',
  TOGGLE_PAGE_ATTACHMENT_STATE: 'togglePageAttachmentState',
  TOGGLE_PAGE_HAS_AUDIO: 'togglePageHasAudio',
  TOGGLE_PAGE_HAS_CAPTIONS: 'togglePageHasCaptions',
  TOGGLE_CAPTIONS: 'toggleCaptions',
  TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK: 'togglePageHasElementWithPlayblack',
  TOGGLE_PAUSED: 'togglePaused',
  TOGGLE_RTL: 'toggleRtl',
  TOGGLE_SHARE_MENU: 'toggleShareMenu',
  TOGGLE_STORY_HAS_BACKGROUND_AUDIO: 'toggleStoryHasBackgroundAudio',
  TOGGLE_STORY_HAS_PLAYBACK_UI: 'toggleStoryHasPlaybackUi',
  TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE: 'toggleSubscriptionsDialogUiState',
  TOGGLE_SUBSCRIPTIONS_STATE: 'toggleSubscriptionsState',
  TOGGLE_SYSTEM_UI_IS_VISIBLE: 'toggleSystemUiIsVisible',
  TOGGLE_UI: 'toggleUi',
});

export {Action};

/**
 * Functions to compare a data structure from the previous to the new state and
 * detect a mutation, when a simple equality test would not work.
 * @private @const {!{[key: string]: !function(*, *):boolean}}
 */
const stateComparisonFunctions = {
  [StateProperty.ACTIONS_ALLOWLIST]: (old, curr) => old.length !== curr.length,
  [StateProperty.INTERACTIVE_COMPONENT_STATE]:
    /**
     * @param {InteractiveComponentDef} old
     * @param {InteractiveComponentDef} curr
     * @return {boolean}
     */
    (old, curr) => old.element !== curr.element || old.state !== curr.state,
  [StateProperty.NAVIGATION_PATH]: (old, curr) => old.length !== curr.length,
  [StateProperty.PAGE_IDS]: (old, curr) => old.length !== curr.length,
  [StateProperty.PAGE_SIZE]: (old, curr) =>
    old === null ||
    curr === null ||
    old.width !== curr.width ||
    old.height !== curr.height,
  [StateProperty.PANNING_MEDIA_STATE]: (old, curr) =>
    old === null || curr === null || !deepEquals(old, curr, 2),
  [StateProperty.SHOPPING_DATA]: (old, curr) =>
    old === null || curr === null || !deepEquals(old, curr, 2),
  [StateProperty.INTERACTIVE_REACT_STATE]: (old, curr) =>
    !deepEquals(old, curr, 3),
};

/**
 * Returns the new state.
 * @param  {!State} state Immutable state
 * @param  {!Action} action
 * @param  {*} data
 * @return {!State} new state
 */
const actions = (state, action, data) => {
  switch (action) {
    case Action.ADD_INTERACTIVE_REACT:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.INTERACTIVE_REACT_STATE]: {
          ...state[StateProperty.INTERACTIVE_REACT_STATE],
          [data['interactiveId']]: data,
        },
      });
    case Action.ADD_NEW_PAGE_ID:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.NEW_PAGE_AVAILABLE_ID]: data,
      });
    case Action.ADD_PANNING_MEDIA_STATE:
      const updatedState = {
        ...state[StateProperty.PANNING_MEDIA_STATE],
        ...data,
      };
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PANNING_MEDIA_STATE]: updatedState,
      });
    case Action.ADD_SHOPPING_DATA:
      const updatedShoppingData = {
        ...state[StateProperty.SHOPPING_DATA],
        ...data,
      };
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.SHOPPING_DATA]: updatedShoppingData,
      });
    case Action.ADD_TO_ACTIONS_ALLOWLIST:
      const newActionsAllowlist = [].concat(
        state[StateProperty.ACTIONS_ALLOWLIST],
        data
      );
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.ACTIONS_ALLOWLIST]: newActionsAllowlist,
      });
    case Action.TOGGLE_PAGE_ATTACHMENT_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_ATTACHMENT_STATE]: !!data,
      });
    // Triggers the ad UI.
    case Action.TOGGLE_AD:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.AD_STATE]: !!data,
      });
    case Action.TOGGLE_EDUCATION:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.EDUCATION_STATE]: !!data,
      });
    case Action.TOGGLE_INTERACTIVE_COMPONENT:
      data = /** @type {InteractiveComponentDef} */ (data);
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAUSED_STATE]:
          data.state === EmbeddedComponentState.FOCUSED,
        [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: true,
        [StateProperty.INTERACTIVE_COMPONENT_STATE]: data,
      });
    // Shows or hides the info dialog.
    case Action.TOGGLE_INFO_DIALOG:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.INFO_DIALOG_STATE]: !!data,
        [StateProperty.PAUSED_STATE]: !!data,
      });
    // Shows or hides the play/pause controls.
    case Action.TOGGLE_STORY_HAS_PLAYBACK_UI:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.STORY_HAS_PLAYBACK_UI_STATE]: !!data,
      });
    case Action.TOGGLE_STORY_HAS_BACKGROUND_AUDIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE]: !!data,
      });
    // Mutes or unmutes the story media.
    case Action.TOGGLE_MUTED:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.MUTED_STATE]: !!data,
      });
    case Action.TOGGLE_PAGE_HAS_AUDIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_HAS_AUDIO_STATE]: !!data,
      });
    case Action.TOGGLE_PAGE_HAS_CAPTIONS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_HAS_CAPTIONS_STATE]: !!data,
      });
    case Action.TOGGLE_CAPTIONS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.CAPTIONS_STATE]: !!data,
      });
    case Action.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE]: !!data,
      });
    case Action.TOGGLE_PAUSED:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAUSED_STATE]: !!data,
      });
    case Action.TOGGLE_RTL:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.RTL_STATE]: !!data,
      });
    case Action.TOGGLE_KEYBOARD_ACTIVE_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.KEYBOARD_ACTIVE_STATE]: !!data,
      });
    case Action.TOGGLE_SHARE_MENU:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAUSED_STATE]: !!data,
        [StateProperty.SHARE_MENU_STATE]: !!data,
      });
    case Action.TOGGLE_SYSTEM_UI_IS_VISIBLE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: !!data,
      });
    case Action.TOGGLE_UI:
      if (
        state[StateProperty.UI_STATE] === UIType_Enum.VERTICAL &&
        data !== UIType_Enum.VERTICAL
      ) {
        dev().error(TAG, 'Cannot switch away from UIType_Enum.VERTICAL');
        return state;
      }
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.UI_STATE]: data,
      });
    case Action.SET_GYROSCOPE_PERMISSION:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.GYROSCOPE_PERMISSION_STATE]: data,
      });
    case Action.SET_CONSENT_ID:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.CONSENT_ID]: data,
      });
    case Action.CHANGE_PAGE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.CURRENT_PAGE_ID]: data.id,
        [StateProperty.CURRENT_PAGE_INDEX]: data.index,
      });
    case Action.SET_ADVANCEMENT_MODE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.ADVANCEMENT_MODE]: data,
      });
    case Action.SET_NAVIGATION_PATH:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.NAVIGATION_PATH]: data,
      });
    case Action.SET_PAGE_IDS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_IDS]: data,
      });
    case Action.SET_PAGE_SIZE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.PAGE_SIZE]: data,
      });
    case Action.SET_VIEWER_CUSTOM_CONTROLS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.VIEWER_CUSTOM_CONTROLS]: data,
      });
    case Action.SET_SUBSCRIPTIONS_PAGE_INDEX:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.SUBSCRIPTIONS_PAGE_INDEX]: data,
      });
    case Action.TOGGLE_SUBSCRIPTIONS_DIALOG_UI_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE]: !!data,
        [StateProperty.PAUSED_STATE]: !!data,
      });
    case Action.TOGGLE_SUBSCRIPTIONS_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.SUBSCRIPTIONS_STATE]: data,
      });
    case Action.SET_DESKTOP_ASPECT_RATIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty.DESKTOP_ASPECT_RATIO]: data,
      });
    default:
      dev().error(TAG, 'Unknown action %s.', action);
      return state;
  }
};

/**
 * Store service.
 */
export class AmpStoryStoreService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {!{[key: string]: !Observable}} */
    this.listeners_ = {};

    /** @private {!State} */
    this.state_ = /** @type {!State} */ ({
      ...this.getDefaultState_(),
      ...this.getEmbedOverrides_(),
    });
  }

  /**
   * Retrieves a state property.
   * @param  {string} key Property to retrieve from the state.
   * @return {*}
   */
  get(key) {
    if (!hasOwn(this.state_, key)) {
      dev().error(TAG, 'Unknown state %s.', key);
      return;
    }
    return this.state_[key];
  }

  /**
   * Subscribes to a state property mutations.
   * @param  {string} key
   * @param  {!Function} listener
   * @param  {boolean=} callToInitialize Whether the listener should be
   *                                     triggered with current value.
   */
  subscribe(key, listener, callToInitialize = false) {
    if (!hasOwn(this.state_, key)) {
      dev().error(TAG, "Can't subscribe to unknown state %s.", key);
      return;
    }
    if (!this.listeners_[key]) {
      this.listeners_[key] = new Observable();
    }
    this.listeners_[key].add(listener);

    if (callToInitialize) {
      listener(this.get(key));
    }
  }

  /**
   * Dispatches an action and triggers the listeners for the updated state
   * properties.
   * @param  {!Action} action
   * @param  {*} data
   */
  dispatch(action, data) {
    const oldState = {...this.state_};
    this.state_ = actions(this.state_, action, data);

    let comparisonFn;
    Object.keys(this.listeners_).forEach((key) => {
      comparisonFn = stateComparisonFunctions[key];
      if (
        comparisonFn
          ? comparisonFn(oldState[key], this.state_[key])
          : oldState[key] !== this.state_[key]
      ) {
        this.listeners_[key].fire(this.state_[key]);
      }
    });
  }

  /**
   * Retrieves the default state, that could be overriden by an embed mode.
   * @return {!State}
   * @private
   */
  getDefaultState_() {
    // Compiler won't resolve the object keys and trigger an error for missing
    // properties, so we have to force the type.
    return /** @type {!State} */ ({
      [StateProperty.CAN_INSERT_AUTOMATIC_AD]: true,
      [StateProperty.CAN_SHOW_AUDIO_UI]: true,
      [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: true,
      [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
      [StateProperty.CAN_SHOW_PAGINATION_BUTTONS]: true,
      [StateProperty.CAN_SHOW_SHARING_UIS]: true,
      [StateProperty.CAN_SHOW_STORY_URL_INFO]: true,
      [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: true,
      [StateProperty.VIEWER_CUSTOM_CONTROLS]: [],
      [StateProperty.AD_STATE]: false,
      [StateProperty.EDUCATION_STATE]: false,
      [StateProperty.GYROSCOPE_PERMISSION_STATE]: '',
      [StateProperty.INFO_DIALOG_STATE]: false,
      [StateProperty.INTERACTIVE_COMPONENT_STATE]: {
        state: EmbeddedComponentState.HIDDEN,
      },
      [StateProperty.INTERACTIVE_REACT_STATE]: {},
      [StateProperty.KEYBOARD_ACTIVE_STATE]: false,
      [StateProperty.MUTED_STATE]: true,
      [StateProperty.PAGE_ATTACHMENT_STATE]: false,
      [StateProperty.PAGE_HAS_AUDIO_STATE]: false,
      [StateProperty.PAGE_HAS_CAPTIONS_STATE]: false,
      [StateProperty.CAPTIONS_STATE]: true,
      [StateProperty.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE]: false,
      [StateProperty.PANNING_MEDIA_STATE]: {},
      [StateProperty.PAUSED_STATE]: false,
      [StateProperty.RTL_STATE]: false,
      [StateProperty.SHARE_MENU_STATE]: false,
      [StateProperty.SHOPPING_DATA]: {},
      [StateProperty.STORY_HAS_BACKGROUND_AUDIO_STATE]: false,
      [StateProperty.STORY_HAS_PLAYBACK_UI_STATE]: false,
      [StateProperty.SYSTEM_UI_IS_VISIBLE_STATE]: true,
      [StateProperty.UI_STATE]: UIType_Enum.MOBILE,
      // amp-story only allows actions on a case-by-case basis to preserve UX
      // behaviors. By default, no actions are allowed.
      [StateProperty.ACTIONS_ALLOWLIST]: [],
      [StateProperty.CONSENT_ID]: null,
      [StateProperty.CURRENT_PAGE_ID]: '',
      [StateProperty.CURRENT_PAGE_INDEX]: 0,
      [StateProperty.ADVANCEMENT_MODE]: '',
      [StateProperty.NEW_PAGE_AVAILABLE_ID]: '',
      [StateProperty.NAVIGATION_PATH]: [],
      [StateProperty.PAGE_IDS]: [],
      [StateProperty.PAGE_SIZE]: null,
      [StateProperty.PREVIEW_STATE]: false,
      [StateProperty.SUBSCRIPTIONS_DIALOG_UI_STATE]: false,
      [StateProperty.SUBSCRIPTIONS_STATE]: SubscriptionsState.DISABLED,
      [StateProperty.SUBSCRIPTIONS_PAGE_INDEX]: -1,
      [StateProperty.DESKTOP_ASPECT_RATIO]: 0,
    });
  }

  // @TODO(gmajoulet): These should get their own file if they start growing.
  /**
   * Retrieves the embed mode config, that will override the default state.
   * @return {!{[key: StateProperty]: *}} Partial state
   * @protected
   */
  getEmbedOverrides_() {
    const embedMode = parseEmbedMode(this.win_.location.hash);
    switch (embedMode) {
      case EmbedMode.NAME_TBD:
        return {
          [StateProperty.CAN_INSERT_AUTOMATIC_AD]: false,
          [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
          [StateProperty.CAN_SHOW_PAGINATION_BUTTONS]: false,
          [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
          [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
          [StateProperty.MUTED_STATE]: false,
        };
      case EmbedMode.NO_SHARING:
        return {
          [StateProperty.CAN_SHOW_SHARING_UIS]: false,
        };
      case EmbedMode.PREVIEW:
        return {
          [StateProperty.PREVIEW_STATE]: true,
          [StateProperty.CAN_INSERT_AUTOMATIC_AD]: false,
          [StateProperty.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
          [StateProperty.CAN_SHOW_PAGINATION_BUTTONS]: false,
          [StateProperty.CAN_SHOW_PREVIOUS_PAGE_HELP]: false,
          [StateProperty.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
        };
      case EmbedMode.NO_SHARING_NOR_AUDIO_UI:
        return {
          [StateProperty.CAN_SHOW_AUDIO_UI]: false,
          [StateProperty.CAN_SHOW_SHARING_UIS]: false,
          [StateProperty.CAN_SHOW_STORY_URL_INFO]: false,
        };
      default:
        return {};
    }
  }
}
