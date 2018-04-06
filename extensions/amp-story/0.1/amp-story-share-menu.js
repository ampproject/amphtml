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

import {Action, StateProperty} from './amp-story-store-service';
import {CSS} from '../../../build/amp-story-share-menu-0.1.css';
import {ScrollableShareWidget} from './amp-story-share';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {createShadowRootWithStyle} from './utils';
import {dev} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {getAmpdoc} from '../../../src/service';
import {renderAsElement} from './simple-template';


/** @const {string} Class to toggle the share menu. */
export const SHARE_MENU_VISIBLE = 'i-amphtml-story-share-menu-visible';

/** @const {string} Class for the share widget component container. */
const SHARE_WIDGET_CONTAINER_CLASS = 'i-amphtml-story-share-menu-container';

/**
 * Quick share template, used as a fallback if native sharing is not supported.
 * @private @const {!./simple-template.ElementDef}
 */
const TEMPLATE = {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-share-menu i-amphtml-story-system-reset'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': SHARE_WIDGET_CONTAINER_CLASS}),
      children: [],
    },
  ],
};


export class ShareMenu {
  /**
   * @param {!Window} win
   * @param {!Element} parentEl Element where to append the component
   */
  constructor(win, parentEl) {
    /** @private @const {!Window} */
    this.win_ = win;

    /** @private {?Element} */
    this.element_ = null;

    /** @private {?Element} */
    this.innerContainerEl_ = null;

    /** @private {boolean} */
    this.isBuilt_ = false;

    /** @private @const {!../../../src/service/platform-impl.Platform} */
    this.platform_ = Services.platformFor(this.win_);

    /** @private @const {!ScrollableShareWidget} */
    this.shareWidget_ = ScrollableShareWidget.create(this.win_);

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win_);

    /** @private @const {!Element} */
    this.parentEl_ = parentEl;

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(this.win_);
  }

  /**
   * Builds and appends the component in the story.
   */
  build() {
    if (this.isBuilt()) {
      return;
    }

    this.isBuilt_ = true;

    const root = this.win_.document.createElement('div');
    this.element_ = renderAsElement(this.win_.document, TEMPLATE);

    createShadowRootWithStyle(root, this.element_, CSS);

    const ampdoc = getAmpdoc(this.parentEl_);

    this.initializeListeners_();

    this.vsync_.run({
      measure: () => {
        this.innerContainerEl_ =
            this.element_
                ./*OK*/querySelector(`.${SHARE_WIDGET_CONTAINER_CLASS}`);
      },
      mutate: () => {
        this.parentEl_.appendChild(root);
        this.innerContainerEl_.appendChild(this.shareWidget_.build(ampdoc));
      },
    });
  }

  /**
   * Whether the element has been built.
   * @return {boolean}
   */
  isBuilt() {
    return this.isBuilt_;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.SHARE_MENU_STATE, isOpen => {
      this.onShareMenuStateUpdate_(isOpen);
    });

    this.element_.addEventListener(
        'click', event => this.onShareMenuClick_(event));
  }

  /**
   * @param {boolean} isOpen
   * @private
   */
  onShareMenuStateUpdate_(isOpen) {
    this.vsync_.mutate(() => {
      this.element_.classList.toggle(SHARE_MENU_VISIBLE, isOpen);
    });
  }

  /**
   * Handles click events and maybe closes the menu.
   * @param  {!Event} event
   */
  onShareMenuClick_(event) {
    const el = dev().assertElement(event.target);
    // Closes the menu if click happened outside of the menu main container.
    if (!closest(el, el => el === this.innerContainerEl_, this.element_)) {
      this.storeService_.dispatch(Action.TOGGLE_SHARE_MENU, false);
    }
  }
}
