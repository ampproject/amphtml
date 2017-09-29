/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {ICONS} from './icons';
import {Services} from '../../../src/services';
import {isObject} from '../../../src/types';
import {createElementWithAttributes, escapeHtml} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';


const LINK_SHARE_TEMPLATE =
    `<div class="i-amphtml-story-share-icon">
      ${ICONS.link}
    </div>
    <span class="i-amphtml-story-share-name">Get link</span>`;


/**
 * Maps share provider type to visible name.
 * If the name only needs to be capitalized (e.g. `facebook` to `Facebook`) it
 * does not need to be included here.
 * @const {!JsonObject}
 */
const SHARE_PROVIDER_NAME = dict({
  'gplus': 'Google+',
  'linkedin': 'LinkedIn',
  'whatsapp': 'WhatsApp',
});


/**
 * @param {string} type
 * @param {!JsonObject=} opt_params
 * @return {string}
 */
// TODO(alanorozco): article metadata
function shareProviderHtml(type, opt_params) {
  const params = !opt_params ? '' :
      Object.keys(opt_params)
          .map(field =>
              `data-param-${escapeHtml(field)}=` +
              `"${escapeHtml(opt_params[field])}"`)
          .join(' ');

  const name = SHARE_PROVIDER_NAME[type] || type;

  // `email` should have an icon different than the default in amp-social-share,
  // so it is special-cased
  const icon = type == 'email' ? ICONS.mail : '';

  return (
      `<amp-social-share
          type="${type}"
          width="48"
          height="48"
          class="i-amphtml-story-share-icon"
          ${params}>
          ${icon}
      </amp-social-share>
      <span class="i-amphtml-story-share-name">${name}</span>`
  );
}


export class BookendShareWidget {
  /** @param {!Window} win */
  constructor(win) {
    /** @private {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;
  }

  /** @param {!Window} win */
  static create(win) {
    return new BookendShareWidget(win);
  }

  /** @return {!Element} */
  build() {
    dev().assert(!this.root_, 'Already built.');

    this.root_ = createElementWithAttributes(this.win_.document, 'ul', {
      'class': 'i-amphtml-story-share-list',
    });

    this.add_(this.buildItem_(LINK_SHARE_TEMPLATE));

    this.maybeAddNativeShare_();

    return this.root_;
  }

  /** @private */
  maybeAddNativeShare_() {
    // TODO(alanorozco): Implement
  }

  /**
   * @param {!Array<!JsonObject>} providers
   * @public
   */
  // TODO(alanorozco): Set story metadata in share config
  setProviders(providers) {
    const fragment = this.win_.document.createDocumentFragment();

    this.loadRequiredExtensions_();

    Object.keys(providers).forEach(type => {
      if (isObject(providers[type])) {
        fragment.appendChild(
            this.buildProvider_(type,
                /** @type {!JsonObject} */ (providers[type])));
        return;
      }

      // Bookend config API requires real boolean, not just truthy
      if (providers[type] === true) {
        fragment.appendChild(this.buildProvider_(type));
        return;
      }

      user().warn('AMP-STORY',
          'Invalid amp-story bookend share configuration for %s. ' +
          'Value must be `true` or a params object.',
          type);
    });

    this.add_(fragment);
  }

  /** @private */
  loadRequiredExtensions_() {
    Services.extensionsFor(this.win_).loadExtension('amp-social-share');
  }

  /**
   * @param {string} type
   * @param {!JsonObject=} opt_params
   * @return {!Element}
   * @private
   */
  buildProvider_(type, opt_params) {
    return this.buildItem_(shareProviderHtml(type, opt_params));
  }

  /**
   * @param {string} html
   * @return {!Element}
   * @private
   */
  buildItem_(html) {
    const el = this.win_.document.createElement('li');
    el./*OK*/innerHTML = html;
    return el;
  }

  /**
   * @param {!Node} node
   * @private
   */
  add_(node) {
    dev().assert(this.root_).appendChild(node);
  }
}
