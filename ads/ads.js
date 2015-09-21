/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview Registers all known ad network factories and then executes
 * one of them.
 */

import '../src/polyfills';
import {a9} from './a9';
import {adreactor} from './adreactor';
import {adsense} from './adsense';
import {adtech} from './adtech';
import {doubleclick} from './doubleclick';
import {twitter} from './twitter';
import {register, run} from '../src/3p';

register('ad', 'a9', a9);
register('ad', 'adreactor', adreactor);
register('ad', 'adsense', adsense);
register('ad', 'adtech', adtech);
register('ad', 'doubleclick', doubleclick);

// TODO(malteubl) Move somewhere else since this is not an ad.
register('ad', 'twitter', twitter);

/**
 * Visible for testing.
 * Draws an ad to the window. Expects the data to include the ad type.
 * @param {!Window} win
 * @param {!Object} data
 */
export function drawAd(win, data) {
  var type = data.type;
  run('ad', type, win, data);
}

/**
 * Returns the "master frame" for all widgets of a given type.
 * This frame should be used to e.g. fetch scripts that can
 * be reused across frames.
 * @param {string} type
 * @return {!Window}
 */
function masterSelection(type) {
  // The master has a special name.
  var masterName = 'frame_' + type + '_master';
  var master;
  try {
    // Try to get the master from the parent. If it does not
    // exist yet we get a security exception that we catch
    // and ignore.
    master = window.parent.frames[masterName];
  } catch (expected) {
    /* ignore */
  }
  if (!master) {
    // No master yet, rename ourselves to be master. Yaihh.
    window.name = masterName;
    master = window;
  }
  return master;
}

/**
 * Draws an optionally synchronously to the DOM.
 */
window.drawAd = function() {
  var fragment = location.hash;
  var data = fragment ? JSON.parse(fragment.substr(1)) : {};
  window.context = data._context;
  window.context.master = masterSelection(data.type);
  window.context.isMaster = window.context.master == window;
  delete data._context;
  drawAd(window, data);
};
