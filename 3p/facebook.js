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

import {dashToUnderline} from '../src/string';
import {loadScript} from './3p';
import {setStyle} from '../src/style';
import {user} from '../src/log';

/**
 * Produces the Facebook SDK object for the passed in callback.
 *
 * Note: Facebook SDK fails to render multiple plugins when the SDK is only
 * loaded in one frame. To Allow the SDK to render them correctly we load the
 * script per iframe.
 *
 * @param {!Window} global
 * @param {function(!Object)} cb
 */
function getFacebookSdk(global, cb, locale) {
  loadScript(global, 'https://connect.facebook.net/' + locale + '/sdk.js', () => {
    cb(global.FB);
  });
}

/**
 * Create DOM element for the Facebook embedded content plugin.
 * Reference: https://developers.facebook.com/docs/plugins/embedded-posts
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPostContainer(global, data) {
  const c = global.document.getElementById('c');
  const shouldAlignCenter = data.alignCenter || false;
  if (shouldAlignCenter) {
    setStyle(c, 'text-align', 'center');
  }
  const container = global.document.createElement('div');
  const embedAs = data.embedAs || 'post';
  user().assert(['post', 'video'].indexOf(embedAs) !== -1,
      'Attribute data-embed-as  for <amp-facebook> value is wrong, should be' +
      ' "post" or "video" was: %s', embedAs);
  container.className = 'fb-' + embedAs;
  container.setAttribute('data-href', data.href);
  return container;
}

/**
 * Create DOM element for the Facebook embedded page plugin.
 * Reference: https://developers.facebook.com/docs/plugins/page-plugin
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getPageContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'fb-page';
  container.setAttribute('data-href', data.href);
  container.setAttribute('data-tabs', data.tabs);
  container.setAttribute('data-hide-cover', data.hideCover);
  container.setAttribute('data-show-facepile', data.showFacePile);
  container.setAttribute('data-hide-cta', data.hideCta);
  container.setAttribute('data-small-header', data.smallHeader);
  container.setAttribute(
      'data-adapt-container-width', data.adaptContainerWidth);
  return container;
}

/**
 * Create DOM element for the Facebook comments plugin:
 * Reference: https://developers.facebook.com/docs/plugins/comments
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getCommentsContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'fb-comments';
  container.setAttribute('data-href', data.href);
  container.setAttribute('data-numposts', data.numposts || 10);
  container.setAttribute('data-colorscheme', data.colorscheme || 'light');
  container.setAttribute('data-width', '100%');
  return container;
}

/**
 * Create DOM element for the Facebook like-button plugin:
 * Reference: https://developers.facebook.com/docs/plugins/like-button
 * @param {!Window} global
 * @param {!Object} data The element data
 * @return {!Element} div
 */
function getLikeContainer(global, data) {
  const container = global.document.createElement('div');
  container.className = 'fb-like';
  container.setAttribute('data-action', data.action || 'like');
  container.setAttribute('data-colorscheme', data.colorscheme || 'light');
  container.setAttribute('data-href', data.href);
  container.setAttribute('data-kd_site', data.kd_site || 'false');
  container.setAttribute('data-layout', data.layout || 'standard');
  container.setAttribute('data-ref', data.ref || '');
  container.setAttribute('data-share', data.share || 'false');
  container.setAttribute('data-show_faces', data.show_faces || 'false');
  container.setAttribute('data-size', data.size || 'small');
  return container;
}

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function facebook(global, data) {
  const extension = global.context.tagName;
  let container;

  if (extension === 'AMP-FACEBOOK-PAGE') {
    container = getPageContainer(global, data);
  } else if (extension === 'AMP-FACEBOOK-LIKE') {
    container = getLikeContainer(global, data);
  } else if (extension === 'AMP-FACEBOOK-COMMENTS') {
    container = getCommentsContainer(global, data);
  } else /*AMP-FACEBOOK */ {
    container = getPostContainer(global, data);
  }

  global.document.getElementById('c').appendChild(container);

  getFacebookSdk(global, FB => {
    // Dimensions are given by the parent frame.
    delete data.width;
    delete data.height;

    FB.Event.subscribe('xfbml.resize', event => {
      context.updateDimensions(
          parseInt(event.width, 10),
          parseInt(event.height, 10) + /* margins */ 20);
    });

    FB.init({xfbml: true, version: 'v2.5'});
  }, data.locale ? data.locale : dashToUnderline(window.navigator.language));
}
