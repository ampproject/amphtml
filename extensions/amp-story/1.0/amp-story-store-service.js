import {EmbedMode_Enum, parseEmbedMode} from './embed-mode';
import {Observable} from '#core/data-structures/observable';
import {Services} from '#service';
import {deepEquals} from '#core/types/object/json';
import {dev} from '#utils/log';
import {hasOwn} from '#core/types/object';
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
export const UiType_Enum = {
  MOBILE: 0,
  DESKTOP_FULLBLEED: 2, // Desktop UI if landscape mode is enabled.
  DESKTOP_ONE_PANEL: 4, // Desktop UI with one panel and space around story.
  VERTICAL: 3, // Vertical scrolling versions, for search engine bots indexing.
};

/**
 * States in which an embedded component could be found in.
 * @enum {number}
 */
export const EmbeddedComponentState_Enum = {
  HIDDEN: 0, // Component is present in page, but hasn't been interacted with.
  FOCUSED: 1, // Component has been clicked, a tooltip should be shown.
  EXPANDED: 2, // Component is in expanded mode.
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
 *    canInsertAutomaticAd: boolean,
 *    canShowAudioUi: boolean,
 *    canShowNavigationOverlayHint: boolean,
 *    canShowPaginationButtons: boolean,
 *    canShowPreviousPageHelp: boolean,
 *    canShowSharingUis: boolean,
 *    canShowStoryUrlInfo: boolean,
 *    canShowSystemLayerButtons: boolean,
 *    viewerCustomControls: !Array<!Object>,
 *    accessState: boolean,
 *    adState: boolean,
 *    pageAttachmentState: boolean,
 *    affiliateLinkState: !Element,
 *    desktopState: boolean,
 *    educationState: boolean,
 *    gyroscopeEnabledState: string,
 *    infoDialogState: boolean,
 *    interactiveEmbeddedComponentState: !InteractiveComponentDef,
 *    interactiveReactState: !Map<string, !InteractiveReactData>,
 *    keyboardActiveState: boolean,
 *    mutedState: boolean,
 *    pageAudioState: boolean,
 *    pageHasElementsWithPlaybackState: boolean,
 *    panningMediaState: !Map<string, ../../amp-story-panning-media/0.1/amp-story-panning-media.panningMediaPositionDef> ,
 *    pausedState: boolean,
 *    previewState: boolean,
 *    rtlState: boolean,
 *    shareMenuState: boolean,
 *    storyHasAudioState: boolean,
 *    storyHasPlaybackUiState: boolean,
 *    storyHasBackgroundAudioState: boolean,
 *    supportedBrowserState: boolean,
 *    systemUiIsVisibleState: boolean,
 *    uiState: !UIType,
 *    viewportWarningState: boolean,
 *    actionsAllowlist: !Array<{tagOrTarget: string, method: string}>,
 *    consentId: ?string,
 *    currentPageId: string,
 *    currentPageIndex: number,
 *    pageIds: !Array<string>,
 *    newPageAvailableId: string,
 *    pageSize: {width: number, height: number},
 * }}
 */
export let State;

/** @const @enum {string} */
export const StateProperty_Enum = {
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
  ACCESS_STATE: 'accessState', // amp-access paywall.
  AD_STATE: 'adState',
  PAGE_ATTACHMENT_STATE: 'pageAttachmentState',
  AFFILIATE_LINK_STATE: 'affiliateLinkState',
  EDUCATION_STATE: 'educationState',
  GYROSCOPE_PERMISSION_STATE: 'gyroscopePermissionState',
  INFO_DIALOG_STATE: 'infoDialogState',
  INTERACTIVE_COMPONENT_STATE: 'interactiveEmbeddedComponentState',
  // State of interactive components (polls, quizzes) on the story.
  INTERACTIVE_REACT_STATE: 'interactiveReactState',
  KEYBOARD_ACTIVE_STATE: 'keyboardActiveState',
  MUTED_STATE: 'mutedState',
  PAGE_HAS_AUDIO_STATE: 'pageAudioState',
  PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE: 'pageHasElementsWithPlaybackState',
  PANNING_MEDIA_STATE: 'panningMediaState',
  PAUSED_STATE: 'pausedState',
  // Story preview state.
  PREVIEW_STATE: 'previewState',
  RTL_STATE: 'rtlState',
  SHARE_MENU_STATE: 'shareMenuState',
  SUPPORTED_BROWSER_STATE: 'supportedBrowserState',
  // Any page has audio, or amp-story has a `background-audio` attribute.
  STORY_HAS_AUDIO_STATE: 'storyHasAudioState',
  // amp-story has a `background-audio` attribute.
  STORY_HAS_BACKGROUND_AUDIO_STATE: 'storyHasBackgroundAudioState',
  // Any page has elements with playback.
  STORY_HAS_PLAYBACK_UI_STATE: 'storyHasPlaybackUiState',
  SYSTEM_UI_IS_VISIBLE_STATE: 'systemUiIsVisibleState',
  UI_STATE: 'uiState',

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
};

/** @const @enum {string} */
export const Action_Enum = {
  ADD_INTERACTIVE_REACT: 'addInteractiveReact',
  ADD_TO_ACTIONS_ALLOWLIST: 'addToActionsAllowlist',
  CHANGE_PAGE: 'setCurrentPageId',
  SET_CONSENT_ID: 'setConsentId',
  SET_ADVANCEMENT_MODE: 'setAdvancementMode',
  SET_NAVIGATION_PATH: 'setNavigationPath',
  SET_PAGE_IDS: 'setPageIds',
  TOGGLE_ACCESS: 'toggleAccess',
  TOGGLE_AD: 'toggleAd',
  TOGGLE_AFFILIATE_LINK: 'toggleAffiliateLink',
  TOGGLE_EDUCATION: 'toggleEducation',
  TOGGLE_INFO_DIALOG: 'toggleInfoDialog',
  TOGGLE_INTERACTIVE_COMPONENT: 'toggleInteractiveComponent',
  TOGGLE_KEYBOARD_ACTIVE_STATE: 'toggleKeyboardActiveState',
  TOGGLE_MUTED: 'toggleMuted',
  TOGGLE_PAGE_ATTACHMENT_STATE: 'togglePageAttachmentState',
  TOGGLE_PAGE_HAS_AUDIO: 'togglePageHasAudio',
  TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK: 'togglePageHasElementWithPlayblack',
  TOGGLE_PAUSED: 'togglePaused',
  TOGGLE_RTL: 'toggleRtl',
  TOGGLE_SHARE_MENU: 'toggleShareMenu',
  TOGGLE_SUPPORTED_BROWSER: 'toggleSupportedBrowser',
  TOGGLE_STORY_HAS_AUDIO: 'toggleStoryHasAudio',
  TOGGLE_STORY_HAS_BACKGROUND_AUDIO: 'toggleStoryHasBackgroundAudio',
  TOGGLE_STORY_HAS_PLAYBACK_UI: 'toggleStoryHasPlaybackUi',
  TOGGLE_SYSTEM_UI_IS_VISIBLE: 'toggleSystemUiIsVisible',
  TOGGLE_UI: 'toggleUi',
  SET_GYROSCOPE_PERMISSION: 'setGyroscopePermission',
  ADD_NEW_PAGE_ID: 'addNewPageId',
  SET_PAGE_SIZE: 'updatePageSize',
  ADD_PANNING_MEDIA_STATE: 'addPanningMediaState',
  SET_VIEWER_CUSTOM_CONTROLS: 'setCustomControls',
};

/**
 * Functions to compare a data structure from the previous to the new state and
 * detect a mutation, when a simple equality test would not work.
 * @private @const {!Object<string, !function(*, *):boolean>}
 */
const stateComparisonFunctions = {
  [StateProperty_Enum.ACTIONS_ALLOWLIST]: (old, curr) =>
    old.length !== curr.length,
  [StateProperty_Enum.INTERACTIVE_COMPONENT_STATE]:
    /**
     * @param {InteractiveComponentDef} old
     * @param {InteractiveComponentDef} curr
     */
    (old, curr) => old.element !== curr.element || old.state !== curr.state,
  [StateProperty_Enum.NAVIGATION_PATH]: (old, curr) =>
    old.length !== curr.length,
  [StateProperty_Enum.PAGE_IDS]: (old, curr) => old.length !== curr.length,
  [StateProperty_Enum.PAGE_SIZE]: (old, curr) =>
    old === null ||
    curr === null ||
    old.width !== curr.width ||
    old.height !== curr.height,
  [StateProperty_Enum.PANNING_MEDIA_STATE]: (old, curr) =>
    old === null || curr === null || !deepEquals(old, curr, 2),
  [StateProperty_Enum.INTERACTIVE_REACT_STATE]: (old, curr) =>
    !deepEquals(old, curr, 3),
};

/**
 * Returns the new sate.
 * @param  {!State} state Immutable state
 * @param  {!Action} action
 * @param  {*} data
 * @return {!State} new state
 */
const actions = (state, action, data) => {
  switch (action) {
    case Action_Enum.ADD_INTERACTIVE_REACT:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.INTERACTIVE_REACT_STATE]: {
          ...state[StateProperty_Enum.INTERACTIVE_REACT_STATE],
          [data['interactiveId']]: data,
        },
      });
    case Action_Enum.ADD_NEW_PAGE_ID:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.NEW_PAGE_AVAILABLE_ID]: data,
      });
    case Action_Enum.ADD_PANNING_MEDIA_STATE:
      const updatedState = {
        ...state[StateProperty_Enum.PANNING_MEDIA_STATE],
        ...data,
      };
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PANNING_MEDIA_STATE]: updatedState,
      });
    case Action_Enum.ADD_TO_ACTIONS_ALLOWLIST:
      const newActionsAllowlist = [].concat(
        state[StateProperty_Enum.ACTIONS_ALLOWLIST],
        data
      );
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.ACTIONS_ALLOWLIST]: newActionsAllowlist,
      });
    // Triggers the amp-acess paywall.
    case Action_Enum.TOGGLE_ACCESS:
      // Don't change the PAUSED_STATE if ACCESS_STATE is not changed.
      if (state[StateProperty_Enum.ACCESS_STATE] === data) {
        return state;
      }

      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.ACCESS_STATE]: !!data,
        [StateProperty_Enum.PAUSED_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_PAGE_ATTACHMENT_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAGE_ATTACHMENT_STATE]: !!data,
      });
    // Triggers the ad UI.
    case Action_Enum.TOGGLE_AD:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.AD_STATE]: !!data,
      });
    // Expands or collapses the affiliate link.
    case Action_Enum.TOGGLE_AFFILIATE_LINK:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.AFFILIATE_LINK_STATE]: data,
      });
    case Action_Enum.TOGGLE_EDUCATION:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.EDUCATION_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_INTERACTIVE_COMPONENT:
      data = /** @type {InteractiveComponentDef} */ (data);
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAUSED_STATE]:
          data.state === EmbeddedComponentState_Enum.EXPANDED ||
          data.state === EmbeddedComponentState_Enum.FOCUSED,
        [StateProperty_Enum.SYSTEM_UI_IS_VISIBLE_STATE]:
          data.state !== EmbeddedComponentState_Enum.EXPANDED,
        [StateProperty_Enum.INTERACTIVE_COMPONENT_STATE]: data,
      });
    // Shows or hides the info dialog.
    case Action_Enum.TOGGLE_INFO_DIALOG:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.INFO_DIALOG_STATE]: !!data,
        [StateProperty_Enum.PAUSED_STATE]: !!data,
      });
    // Shows or hides the audio controls.
    case Action_Enum.TOGGLE_STORY_HAS_AUDIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.STORY_HAS_AUDIO_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_STORY_HAS_BACKGROUND_AUDIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.STORY_HAS_BACKGROUND_AUDIO_STATE]: !!data,
      });
    // Shows or hides the play/pause controls.
    case Action_Enum.TOGGLE_STORY_HAS_PLAYBACK_UI:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.STORY_HAS_PLAYBACK_UI_STATE]: !!data,
      });
    // Mutes or unmutes the story media.
    case Action_Enum.TOGGLE_MUTED:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.MUTED_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_PAGE_HAS_AUDIO:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAGE_HAS_AUDIO_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_PAGE_HAS_ELEMENT_WITH_PLAYBACK:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_PAUSED:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAUSED_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_RTL:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.RTL_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_KEYBOARD_ACTIVE_STATE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.KEYBOARD_ACTIVE_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_SUPPORTED_BROWSER:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.SUPPORTED_BROWSER_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_SHARE_MENU:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAUSED_STATE]: !!data,
        [StateProperty_Enum.SHARE_MENU_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_SYSTEM_UI_IS_VISIBLE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.SYSTEM_UI_IS_VISIBLE_STATE]: !!data,
      });
    case Action_Enum.TOGGLE_UI:
      if (
        state[StateProperty_Enum.UI_STATE] === UiType_Enum.VERTICAL &&
        data !== UiType_Enum.VERTICAL
      ) {
        dev().error(TAG, 'Cannot switch away from UIType.VERTICAL');
        return state;
      }
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.UI_STATE]: data,
      });
    case Action_Enum.SET_GYROSCOPE_PERMISSION:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.GYROSCOPE_PERMISSION_STATE]: data,
      });
    case Action_Enum.SET_CONSENT_ID:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.CONSENT_ID]: data,
      });
    case Action_Enum.CHANGE_PAGE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.CURRENT_PAGE_ID]: data.id,
        [StateProperty_Enum.CURRENT_PAGE_INDEX]: data.index,
      });
    case Action_Enum.SET_ADVANCEMENT_MODE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.ADVANCEMENT_MODE]: data,
      });
    case Action_Enum.SET_NAVIGATION_PATH:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.NAVIGATION_PATH]: data,
      });
    case Action_Enum.SET_PAGE_IDS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAGE_IDS]: data,
      });
    case Action_Enum.SET_PAGE_SIZE:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.PAGE_SIZE]: data,
      });
    case Action_Enum.SET_VIEWER_CUSTOM_CONTROLS:
      return /** @type {!State} */ ({
        ...state,
        [StateProperty_Enum.VIEWER_CUSTOM_CONTROLS]: data,
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

    /** @private {!Object<string, !Observable>} */
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
      [StateProperty_Enum.CAN_INSERT_AUTOMATIC_AD]: true,
      [StateProperty_Enum.CAN_SHOW_AUDIO_UI]: true,
      [StateProperty_Enum.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: true,
      [StateProperty_Enum.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
      [StateProperty_Enum.CAN_SHOW_PAGINATION_BUTTONS]: true,
      [StateProperty_Enum.CAN_SHOW_SHARING_UIS]: true,
      [StateProperty_Enum.CAN_SHOW_STORY_URL_INFO]: true,
      [StateProperty_Enum.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: true,
      [StateProperty_Enum.VIEWER_CUSTOM_CONTROLS]: [],
      [StateProperty_Enum.ACCESS_STATE]: false,
      [StateProperty_Enum.AD_STATE]: false,
      [StateProperty_Enum.AFFILIATE_LINK_STATE]: null,
      [StateProperty_Enum.EDUCATION_STATE]: false,
      [StateProperty_Enum.GYROSCOPE_PERMISSION_STATE]: '',
      [StateProperty_Enum.INFO_DIALOG_STATE]: false,
      [StateProperty_Enum.INTERACTIVE_COMPONENT_STATE]: {
        state: EmbeddedComponentState_Enum.HIDDEN,
      },
      [StateProperty_Enum.INTERACTIVE_REACT_STATE]: {},
      [StateProperty_Enum.KEYBOARD_ACTIVE_STATE]: false,
      [StateProperty_Enum.MUTED_STATE]: true,
      [StateProperty_Enum.PAGE_ATTACHMENT_STATE]: false,
      [StateProperty_Enum.PAGE_HAS_AUDIO_STATE]: false,
      [StateProperty_Enum.PAGE_HAS_ELEMENTS_WITH_PLAYBACK_STATE]: false,
      [StateProperty_Enum.PANNING_MEDIA_STATE]: {},
      [StateProperty_Enum.PAUSED_STATE]: false,
      [StateProperty_Enum.RTL_STATE]: false,
      [StateProperty_Enum.SHARE_MENU_STATE]: false,
      [StateProperty_Enum.SUPPORTED_BROWSER_STATE]: true,
      [StateProperty_Enum.STORY_HAS_AUDIO_STATE]: false,
      [StateProperty_Enum.STORY_HAS_BACKGROUND_AUDIO_STATE]: false,
      [StateProperty_Enum.STORY_HAS_PLAYBACK_UI_STATE]: false,
      [StateProperty_Enum.SYSTEM_UI_IS_VISIBLE_STATE]: true,
      [StateProperty_Enum.UI_STATE]: UiType_Enum.MOBILE,
      // amp-story only allows actions on a case-by-case basis to preserve UX
      // behaviors. By default, no actions are allowed.
      [StateProperty_Enum.ACTIONS_ALLOWLIST]: [],
      [StateProperty_Enum.CONSENT_ID]: null,
      [StateProperty_Enum.CURRENT_PAGE_ID]: '',
      [StateProperty_Enum.CURRENT_PAGE_INDEX]: 0,
      [StateProperty_Enum.ADVANCEMENT_MODE]: '',
      [StateProperty_Enum.NEW_PAGE_AVAILABLE_ID]: '',
      [StateProperty_Enum.NAVIGATION_PATH]: [],
      [StateProperty_Enum.PAGE_IDS]: [],
      [StateProperty_Enum.PAGE_SIZE]: null,
      [StateProperty_Enum.PREVIEW_STATE]: false,
    });
  }

  // @TODO(gmajoulet): These should get their own file if they start growing.
  /**
   * Retrieves the embed mode config, that will override the default state.
   * @return {!Object<StateProperty, *>} Partial state
   * @protected
   */
  getEmbedOverrides_() {
    const embedMode = parseEmbedMode(this.win_.location.hash);
    switch (embedMode) {
      case EmbedMode_Enum.NAME_TBD:
        return {
          [StateProperty_Enum.CAN_INSERT_AUTOMATIC_AD]: false,
          [StateProperty_Enum.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
          [StateProperty_Enum.CAN_SHOW_PAGINATION_BUTTONS]: false,
          [StateProperty_Enum.CAN_SHOW_PREVIOUS_PAGE_HELP]: true,
          [StateProperty_Enum.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
          [StateProperty_Enum.MUTED_STATE]: false,
        };
      case EmbedMode_Enum.NO_SHARING:
        return {
          [StateProperty_Enum.CAN_SHOW_SHARING_UIS]: false,
        };
      case EmbedMode_Enum.PREVIEW:
        return {
          [StateProperty_Enum.PREVIEW_STATE]: true,
          [StateProperty_Enum.CAN_INSERT_AUTOMATIC_AD]: false,
          [StateProperty_Enum.CAN_SHOW_NAVIGATION_OVERLAY_HINT]: false,
          [StateProperty_Enum.CAN_SHOW_PAGINATION_BUTTONS]: false,
          [StateProperty_Enum.CAN_SHOW_PREVIOUS_PAGE_HELP]: false,
          [StateProperty_Enum.CAN_SHOW_SYSTEM_LAYER_BUTTONS]: false,
        };
      case EmbedMode_Enum.NO_SHARING_NOR_AUDIO_UI:
        return {
          [StateProperty_Enum.CAN_SHOW_AUDIO_UI]: false,
          [StateProperty_Enum.CAN_SHOW_SHARING_UIS]: false,
          [StateProperty_Enum.CAN_SHOW_STORY_URL_INFO]: false,
        };
      default:
        return {};
    }
  }
}
