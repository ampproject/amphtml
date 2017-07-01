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

import {assertHttpsUrl} from '../../../src/url';
import {user} from '../../../src/log';
import {openWindowDialog} from '../../../src/dom';

import {Util} from './util';

// Popup options
const POP_FOLLOW = `status=no,resizable=yes,scrollbars=yes,
  personalbar=no,directories=no,location=no,toolbar=no,
  menubar=no,width=1040,height=640,left=0,top=0`;

/**
 * Pinterest Follow Button
 * @attr data-href:  the url of the user's profile to follow
 * @attr data-label: the text to display (user's full name)
 */
export class FollowButton {

  /** @param {!Element} rootElement */
  constructor(rootElement) {
    user().assert(rootElement.getAttribute('data-href'),
        'The data-href attribute is required for follow buttons');
    user().assert(rootElement.getAttribute('data-label'),
        'The data-label attribute is required for follow buttons');
    this.element = rootElement;
    this.label = rootElement.getAttribute('data-label');
    this.href = assertHttpsUrl(rootElement.getAttribute('data-href'));
  }

  /**
   * Override the default href click handling to log and open popup
   * @param {Event} event: the HTML event object
   */
  handleClick(event) {
    event.preventDefault();
    openWindowDialog(self, this.href, 'pin' + Date.now(),
        POP_FOLLOW);
    Util.log(`&type=button_follow&href=${this.href}`);
  }

  /**
   * Render the follow button
   * @returns {Element}
   */
  renderTemplate() {
    const followButton = Util.make(this.element.ownerDocument, {'a': {
      class: '-amp-pinterest-follow-button',
      href: this.href,
      textContent: this.label,
    }});
    followButton.appendChild(Util.make(this.element.ownerDocument, {'i': {}}));
    followButton.onclick = this.handleClick.bind(this);
    return followButton;
  }

  /**
   * Prepare the render data, create the node and add handlers
   * @returns {!Promise}
   */
  render() {
    // Add trailing slash?
    if (this.href.substr(-1) !== '/') {
      this.href += '/';
    }
    this.href += `pins/follow/?guid=${Util.guid}`;

    return Promise.resolve(this.renderTemplate());
  }
}
