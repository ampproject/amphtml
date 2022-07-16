import {parseJson} from '#core/types/object/json';
import {getHistoryState as getWindowHistoryState} from '#core/window/history';

const EXPIRATION_DURATION_MILLIS = 10 * 60 * 1000; // 10 Minutes
const CREATION_TIME = 'time';
const STATE = 'state';
/** @visibleForTesting */
export const LOCAL_STORAGE_KEY = 'amp-story-state';

/** @enum {string} */
export const HistoryState = {
  ATTACHMENT_PAGE_ID: 'ampStoryAttachmentPageId',
  NAVIGATION_PATH: 'ampStoryNavigationPath',
  SHOPPING_DATA: 'ampStoryShoppingData',
};

/**
 * Updates the value for a given state in the window history.
 * Also persists state in localStorage for 10 minutes, so that state is
 * persisted if Stories are shown within viewers that may recycle
 * iframes or webviews.
 * @param {!Window} win
 * @param {string} stateName
 * @param {string|boolean|Array<string>|null} value
 */
export function setHistoryState(win, stateName, value) {
  const {history} = win;
  const state = getWindowHistoryState(history) || {};
  const newHistory = {
    ...state,
    [stateName]: value,
  };

  history.replaceState(newHistory, '');
  setLocalStorageState(win, newHistory);
}

/**
 * Returns the value of a given state of the window history or localStorage.
 * See `setHistoryState` for an explanation of the use of localStorage.
 * @param {!Window} win
 * @param {string} stateName
 * @return {string|boolean|Array<string>|null}
 */
export function getHistoryState(win, stateName) {
  const {history} = win;
  let state = getWindowHistoryState(history);
  // We do get an early state but without a navigation path. In that case we
  // prefer localStorage.
  if (!state || !state[stateName]) {
    state = getLocalStorageState(win);
  }
  if (state) {
    return /** @type {string|boolean|Array<string>|null} */ (
      state[stateName] || null
    );
  }
  return null;
}

/**
 * Get history state from localStorage.
 * @param {!Window} win
 * @return {*}
 */
function getLocalStorageState(win) {
  // We definitely don't want to restore state from localStorage if the URL
  // is explicit about it.
  const {hash} = win.location;
  if (
    hash.indexOf('page=') != -1 ||
    hash.indexOf('ignoreLocalStorageHistory') != -1
  ) {
    return undefined;
  }
  const container = getLocalStorageStateContainer(win);
  const holder = container && container[getDocumentKey(win)];
  return holder && holder[STATE];
}

/**
 * Set history state in localStorage.
 * State is keyed off of the URL-minus fragment of the Story.
 * @param {!Window} win
 * @param {*} state
 */
function setLocalStorageState(win, state) {
  const container = getLocalStorageStateContainer(win);
  container[getDocumentKey(win)] = {
    [STATE]: state,
    [CREATION_TIME]: Date.now(),
  };
  writeLocalStorage(win, container);
}

/**
 * Gets a dictionary of all history states on the current origin.
 * If an entry is expired, removes it from the set and writes the new
 * set back to storage.
 * @param {!Window} win
 * @return {!JsonObject}
 */
function getLocalStorageStateContainer(win) {
  const container = readLocalStorage(win);
  if (!container) {
    return {};
  }
  const now = Date.now();
  let expired = false;
  Object.keys(container).forEach((href) => {
    const item = container[href];
    if (now > item[CREATION_TIME] + EXPIRATION_DURATION_MILLIS) {
      delete container[href];
      expired = true;
    }
  });
  if (expired) {
    writeLocalStorage(win, container);
  }
  return container;
}

/**
 * Returns the key under which we store state for the current document.
 * @param {!Window} win
 * @return {string}
 */
function getDocumentKey(win) {
  return win.location.href.replace(/\#.*/, '');
}

/**
 * @param {!Window} win
 * @return {?JsonObject}
 */
function readLocalStorage(win) {
  try {
    return parseJson(win.localStorage.getItem(LOCAL_STORAGE_KEY));
  } catch (e) {
    return null;
  }
}

/**
 * @param {!Window} win
 * @param {JsonObject} container
 */
function writeLocalStorage(win, container) {
  try {
    win.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(container));
  } catch (e) {}
}
