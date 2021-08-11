function ownKeys(object, enumerableOnly) {var keys = Object.keys(object);if (Object.getOwnPropertySymbols) {var symbols = Object.getOwnPropertySymbols(object);if (enumerableOnly) {symbols = symbols.filter(function (sym) {return Object.getOwnPropertyDescriptor(object, sym).enumerable;});}keys.push.apply(keys, symbols);}return keys;}function _objectSpread(target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i] != null ? arguments[i] : {};if (i % 2) {ownKeys(Object(source), true).forEach(function (key) {_defineProperty(target, key, source[key]);});} else if (Object.getOwnPropertyDescriptors) {Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));} else {ownKeys(Object(source)).forEach(function (key) {Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));});}}return target;}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;} /**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import { dict } from "../../../src/core/types/object";
import { getHistoryState as getWindowHistoryState } from "../../../src/core/window/history";
import { parseJson } from "../../../src/core/types/object/json";

var EXPIRATION_DURATION_MILLIS = 10 * 60 * 1000; // 10 Minutes
var CREATION_TIME = 'time';
var STATE = 'state';
/** @visibleForTesting */
export var LOCAL_STORAGE_KEY = 'amp-story-state';

/** @enum {string} */
export var HistoryState = {
  ATTACHMENT_PAGE_ID: 'ampStoryAttachmentPageId',
  NAVIGATION_PATH: 'ampStoryNavigationPath' };


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
  var history = win.history;
  var state = getWindowHistoryState(history) || {};
  var newHistory = _objectSpread(_objectSpread({},
  state), {}, _defineProperty({},
  stateName, value));


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
  var history = win.history;
  var state = getWindowHistoryState(history);
  // We do get an early state but without a navigation path. In that case we
  // prefer localStorage.
  if (!state || !state[stateName]) {
    state = getLocalStorageState(win);
  }
  if (state) {
    return (/** @type {string|boolean|Array<string>|null} */(
      state[stateName] || null));

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
  var hash = win.location.hash;
  if (
  hash.indexOf('page=') != -1 ||
  hash.indexOf('ignoreLocalStorageHistory') != -1)
  {
    return undefined;
  }
  var container = getLocalStorageStateContainer(win);
  var holder = container && container[getDocumentKey(win)];
  return holder && holder[STATE];
}

/**
 * Set history state in localStorage.
 * State is keyed off of the URL-minus fragment of the Story.
 * @param {!Window} win
 * @param {*} state
 */
function setLocalStorageState(win, state) {var _container$getDocumen;
  var container = getLocalStorageStateContainer(win);
  container[getDocumentKey(win)] = (_container$getDocumen = {}, _defineProperty(_container$getDocumen,
  STATE, state), _defineProperty(_container$getDocumen,
  CREATION_TIME, Date.now()), _container$getDocumen);

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
  var container = readLocalStorage(win);
  if (!container) {
    return dict();
  }
  var now = Date.now();
  var expired = false;
  Object.keys(container).forEach(function (href) {
    var item = container[href];
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
// /Users/mszylkowski/src/amphtml/extensions/amp-story/1.0/history.js