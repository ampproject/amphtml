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

import {Layout} from '../../../src/layout';
import {Services} from '../../../src/services';
import {StateProperty} from './amp-story-store-service';
import {copyChildren, removeChildren} from '../../../src/dom';
import {dev} from '../../../src/log';
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';
import {throttle} from '../../../src/utils/rate-limit';


/**
 * Story access template.
 * @const {!./simple-template.ElementDef}
 */
const TEMPLATE = {
  tag: 'div',
  attrs: dict({'class': 'i-amphtml-story-access-overflow'}),
  children: [
    {
      tag: 'div',
      attrs: dict({'class': 'i-amphtml-story-access-container'}),
      children: [
        {
          tag: 'div',
          attrs: dict({'class': 'i-amphtml-story-access-content'}),
        },
      ],
    },
  ],
};

/**
 * The <amp-story-access> custom element.
 */
export class AmpStoryAccess extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @const @private {!../../../src/service/action-impl.ActionService} */
    this.actions_ = Services.actionServiceForDoc(this.element);

    /** @private {?Element} */
    this.scrollableEl_ = null;

    /** @private @const {!./amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = Services.storyStoreService(this.win);
  }

  /** @override */
  buildCallback() {
    const drawerEl = renderAsElement(this.win.document, TEMPLATE);
    const contentEl = dev().assertElement(
        drawerEl.querySelector('.i-amphtml-story-access-content'));

    copyChildren(this.element, contentEl);
    removeChildren(this.element);

    this.element.appendChild(drawerEl);

    // Allow <amp-access> actions in STAMP (defaults to no actions allowed).
    this.actions_.addToWhitelist('SCRIPT.login');

    // TODO(gmajoulet): allow wildcard actions to enable login namespaces.
    // this.actions_.addToWhitelist('SCRIPT.login.*');

    this.initializeListeners_();
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.NODISPLAY;
  }

  /** @override */
  prerenderAllowed() {
    return false;
  }

  /**
   * @private
   */
  initializeListeners_() {
    this.storeService_.subscribe(StateProperty.ACCESS_STATE, isAccess => {
      this.onAccessStateChange_(isAccess);
    });

    this.scrollableEl_ =
        this.element.querySelector('.i-amphtml-story-access-overflow');
    this.scrollableEl_.addEventListener(
        'scroll', throttle(this.win, () => this.onScroll_(), 100));
  }

  /**
   * Reacts to access state updates, and shows/hides the UI accordingly.
   * @param {boolean} isAccess
   * @private
   */
  onAccessStateChange_(isAccess) {
    this.mutateElement(() => {
      this.element.classList.toggle('i-amphtml-story-access-visible', isAccess);
    });
  }

  /**
   * Toggles the fullbleed UI on scroll.
   * @private
   */
  onScroll_() {
    let isFullBleed;

    // Toggles the fullbleed UI as soon as the scrollable container, which has a
    // 88px margin top, reaches the top of the screen.
    const measurer =
        () => isFullBleed = this.scrollableEl_./*OK*/scrollTop > 88;
    const mutator = () => {
      this.element
          .classList.toggle('i-amphtml-story-access-fullbleed', isFullBleed);
    };

    this.element.getResources()
        .measureMutateElement(this.element, measurer, mutator);
  }
}
