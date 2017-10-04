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
import {createElementWithAttributes} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {dict} from './../../../src/utils/object';


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
 * @param {!Document} doc
 * @return {!DocumentFragment}
 */
function buildLinkShareItem(doc) {
  const fragment = doc.createDocumentFragment();
  const root = doc.createElement('li');

  const iconEl = createElementWithAttributes(doc, 'div',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-share-icon',
      }));

  const nameEl = createElementWithAttributes(doc, 'span',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-share-name',
      }));

  // constant value, no XSS risk
  iconEl./*OK*/innerHTML = ICONS.link;

  // TODO(alanorozco): i18n
  nameEl.textContent = 'Get Link';

  root.appendChild(iconEl);
  root.appendChild(nameEl);

  fragment.appendChild(root);

  return fragment;
}


/**
 * @param {!Document} doc
 * @param {string} type
 * @param {!JsonObject=} opt_params
 * @return {!DocumentFragment}
 */
function buildProvider(doc, type, opt_params) {
  const fragment = doc.createDocumentFragment();
  const root = doc.createElement('li');

  const shareEl = createElementWithAttributes(doc, 'amp-social-share',
      /** @type {!JsonObject} */({
        type,
        width: 48,
        height: 48,
        class: 'i-amphtml-story-share-icon',
      }));

  if (opt_params) {
    Object.keys(opt_params).forEach(field =>
        shareEl.setAttribute(`data-param-${field}`, opt_params[field]));
  }

  if (type == 'email') {
    // constant value, no XSS risk
    shareEl./*OK*/innerHTML = ICONS.mail;
  }

  const nameEl = createElementWithAttributes(doc, 'span',
      /** @type {!JsonObject} */({
        class: 'i-amphtml-story-share-name',
      }));

  nameEl.textContent = SHARE_PROVIDER_NAME[type] || type;

  root.appendChild(shareEl);
  root.appendChild(nameEl);

  fragment.appendChild(root);

  return fragment;
}


/**
 * Social share widget for story bookend.
 */
export class BookendShareWidget {
  /** @param {!Window} win */
  constructor(win) {
    /** @private {?../../../src/service/ampdoc-impl.AmpDoc} */
    this.ampdoc_ = null;

    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.root_ = null;
  }

  /** @param {!Window} win */
  static create(win) {
    return new BookendShareWidget(win);
  }

  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @return {!Element}
   */
  build(ampdoc) {
    dev().assert(!this.root_, 'Already built.');

    this.ampdoc_ = ampdoc;

    this.root_ = createElementWithAttributes(this.win_.document, 'ul',
        /** @type {!JsonObject} */({
          'class': 'i-amphtml-story-share-list',
        }));

    this.add_(buildLinkShareItem(this.win_.document));

    this.maybeAddNativeShare_();

    return this.root_;
  }

  /** @private */
  maybeAddNativeShare_() {
    // TODO(alanorozco): Implement
  }

  /**
   * @param {!Object<string, (!JsonObject|boolean)>} providers
   * @public
   */
  // TODO(alanorozco): Set story metadata in share config
  setProviders(providers) {
    const fragment = this.win_.document.createDocumentFragment();

    this.loadRequiredExtensions_();

    Object.keys(providers).forEach(type => {
      if (isObject(providers[type])) {
        fragment.appendChild(buildProvider(this.win_.document, type,
            /** @type {!JsonObject} */ (providers[type])));
        return;
      }

      // Bookend config API requires real boolean, not just truthy
      if (providers[type] === true) {
        fragment.appendChild(buildProvider(this.win_.document, type));
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
    const ampdoc = /** @type {!../../../src/service/ampdoc-impl.AmpDoc} */ (
      dev().assert(this.ampdoc_));
    Services.extensionsFor(this.win_)
        .installExtensionForDoc(ampdoc, 'amp-social-share');
  }

  /**
   * @param {!Node} node
   * @private
   */
  add_(node) {
    dev().assert(this.root_).appendChild(node);
  }
}
