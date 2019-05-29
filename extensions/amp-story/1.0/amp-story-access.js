/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {
  Action,
  StateProperty,
  getStoreService,
} from './amp-story-store-service';
import {Layout} from '../../../src/layout';
import {assertHttpsUrl} from '../../../src/url';
import {
  closest,
  closestAncestorElementBySelector,
  copyChildren,
  removeChildren,
} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';
import {isArray, isObject} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {setImportantStyles} from '../../../src/style';

/** @const {string} */
const TAG = 'amp-story-access';

/**
 * @enum {string}
 */
export const Type = {
  BLOCKING: 'blocking',
  NOTIFICATION: 'notification',
};

/**
 * Story access blocking type template.
 * @param {!Element} element
 * @return {!Element}
 */
const getBlockingTemplate = element => {
  return htmlFor(element)`
      <div class="i-amphtml-story-access-overflow">
        <div class="i-amphtml-story-access-container">
          <div class="i-amphtml-story-access-header">
            <div class="i-amphtml-story-access-logo"></div>
          </div>
          <div class="i-amphtml-story-access-content"></div>
        </div>
      </div>`;
};

/**
 * Story access notification type template.
 * @param {!Element} element
 * @return {!Element}
 */
const getNotificationTemplate = element => {
  return htmlFor(element)`
      <div class="i-amphtml-story-access-overflow">
        <div class="i-amphtml-story-access-container">
          <div class="i-amphtml-story-access-content">
            <span class="i-amphtml-story-access-close-button" role="button">
              &times;
            </span>
          </div>
        </div>
      </div>`;
};

/**
 * The <amp-story-access> custom element.
 */
export class AmpStoryAccess extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.containerEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = getStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    // Defaults to blocking paywall.
    if (!this.element.hasAttribute('type')) {
      this.element.setAttribute('type', Type.BLOCKING);
    }

    const drawerEl = this.renderDrawerEl_();

    this.containerEl_ = dev().assertElement(
      drawerEl.querySelector('.i-amphtml-story-access-container')
    );
    const contentEl = dev().assertElement(
      drawerEl.querySelector('.i-amphtml-story-access-content')
    );

    copyChildren(this.element, contentEl);
    removeChildren(this.element);

    this.element.appendChild(drawerEl);

    this.whitelistActions_();

    this.initializeListeners_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.ACCESS_STATE, isAccess => {
      this.onAccessStateChange_(isAccess);
    });

    this.storeService_.subscribe(
      StateProperty.CURRENT_PAGE_INDEX,
      currentPageIndex => {
        this.onCurrentPageIndexChange_(currentPageIndex);
      },
      true /** callToInitialize */
    );

    this.element.addEventListener('click', event => this.onClick_(event));
  }

  /**
   * Reacts to access state updates, and shows/hides the UI accordingly.
   * @param {boolean} isAccess
   * @private
   */
  onAccessStateChange_(isAccess) {
    if (this.getType_() === Type.BLOCKING) {
      this.toggle_(isAccess);
    }
  }

  /**
   * Reacts to story active page index update, and maybe display the
   * "notification" story-access.
   * @param {number} currentPageIndex
   */
  onCurrentPageIndexChange_(currentPageIndex) {
    if (this.getType_() === Type.NOTIFICATION) {
      // Only show the notification if on the first page of the story.
      // Note: this can be overriden by an amp-access attribute that might
      // show/hide the notification based on the user's authorizations.
      this.toggle_(currentPageIndex === 0);
    }
  }

  /**
   * Handles click events and maybe closes the paywall.
   * @param {!Event} event
   * @private
   */
  onClick_(event) {
    const el = dev().assertElement(event.target);

    if (el.classList.contains('i-amphtml-story-access-close-button')) {
      return this.toggle_(false);
    }

    // Closes the menu if click happened outside of the main container.
    if (!closest(el, el => el === this.containerEl_, this.element)) {
      this.storeService_.dispatch(Action.TOGGLE_ACCESS, false);
    }
  }

  /**
   * @param {boolean} show
   * @private
   */
  toggle_(show) {
    this.mutateElement(() => {
      this.element.classList.toggle('i-amphtml-story-access-visible', show);
    });
  }

  /**
   * Returns the element's type.
   * @return {string}
   * @private
   */
  getType_() {
    return this.element.getAttribute('type').toLowerCase();
  }

  /**
   * Renders and returns an empty drawer element element that will contain the
   * publisher provided DOM, depending on the type of <amp-story-access>.
   * Blocking template gets a header containing the publisher's logo, and
   * notification template gets a "dismiss" button.
   * @return {!Element|undefined}
   * @private
   */
  renderDrawerEl_() {
    switch (this.getType_()) {
      case Type.BLOCKING:
        const drawerEl = getBlockingTemplate(this.element);

        const logoSrc = this.getLogoSrc_();

        if (logoSrc) {
          const logoEl = dev().assertElement(
            drawerEl.querySelector('.i-amphtml-story-access-logo')
          );
          setImportantStyles(logoEl, {'background-image': `url(${logoSrc})`});
        }

        return drawerEl;
        break;
      case Type.NOTIFICATION:
        return getNotificationTemplate(this.element);
        break;
      default:
        user().error(
          TAG,
          'Unknown "type" attribute, expected one of: ' +
            'blocking, notification.'
        );
    }
  }

  /**
   * Retrieves the publisher-logo-src set on the <amp-story> element, and
   * validates it's a valid https or relative URL.
   * @return {?string}
   * @private
   */
  getLogoSrc_() {
    const storyEl = dev().assertElement(
      closestAncestorElementBySelector(this.element, 'AMP-STORY')
    );
    const logoSrc = storyEl && storyEl.getAttribute('publisher-logo-src');

    logoSrc
      ? assertHttpsUrl(logoSrc, storyEl, 'publisher-logo-src')
      : user().warn(
          TAG,
          'Expected "publisher-logo-src" attribute on <amp-story>'
        );

    return logoSrc;
  }

  /**
   * Whitelists the <amp-access> actions.
   * Depending on the publisher configuration, actions can be:
   *   - login
   *   - login-<namespace>
   *   - login-<namespace>-<type>
   *
   * Publishers can provide one (object) or multiple (array) configurations,
   * identified by their "namespace" property.
   * Each configuration can have one or multiple login URLs, called "type".
   * All the namespace/type pairs have to be whitelisted.
   * @private
   */
  whitelistActions_() {
    const accessEl = dev().assertElement(
      this.win.document.getElementById('amp-access'),
      'Cannot find the amp-access configuration'
    );

    // Configuration validation is handled by the amp-access extension.
    let accessConfig = /** @type {!Array|!Object} */ (parseJson(
      accessEl.textContent
    ));

    if (!isArray(accessConfig)) {
      accessConfig = [accessConfig];

      // If there is only one configuration and the publisher provided a
      // namespace, we want to allow actions with or without namespace.
      if (accessConfig[0].namespace) {
        accessConfig.push(
          Object.assign({}, accessConfig[0], {namespace: undefined})
        );
      }
    }

    const actions = [];

    accessConfig.forEach(config => {
      const {login, namespace} = /** @type {{login, namespace}} */ (config);

      if (isObject(login)) {
        const types = Object.keys(login);
        types.forEach(type =>
          actions.push(this.getActionObject_(namespace, type))
        );
      } else {
        actions.push(this.getActionObject_(namespace));
      }
    });

    this.storeService_.dispatch(Action.ADD_TO_ACTIONS_WHITELIST, actions);
  }

  /**
   * Whitelists an action for the given namespace / type pair.
   * @param {string=} namespace
   * @param {string=} type
   * @private
   */
  getActionObject_(namespace = undefined, type = undefined) {
    const method = ['login', namespace, type].filter(s => !!s).join('-');
    return {tagOrTarget: 'SCRIPT', method};
  }
}
