import {tryResolve} from '#core/data-structures/promise';

import {userAssert} from '#utils/log';

import {Util} from './util';

import {openWindowDialog} from '../../../src/open-window-dialog';
import {assertHttpsUrl} from '../../../src/url';

// Popup options
const POP_FOLLOW = `status=no,resizable=yes,scrollbars=yes,
  personalbar=no,directories=no,location=no,toolbar=no,
  menubar=no,width=1040,height=640,left=0,top=0`;

/**
 * Pinterest Follow Button
 * data-href:  the url of the user's profile to follow
 * data-label: the text to display (user's full name)
 */
export class FollowButton {
  /** @param {!Element} rootElement */
  constructor(rootElement) {
    userAssert(
      rootElement.getAttribute('data-href'),
      'The data-href attribute is required for follow buttons'
    );
    userAssert(
      rootElement.getAttribute('data-label'),
      'The data-label attribute is required for follow buttons'
    );
    this.element = rootElement;
    this.label = rootElement.getAttribute('data-label');
    this.href = assertHttpsUrl(
      rootElement.getAttribute('data-href'),
      rootElement
    );
  }

  /**
   * Override the default href click handling to log and open popup
   * @param {Event} event
   */
  handleClick(event) {
    event.preventDefault();
    openWindowDialog(window, this.href, 'pin' + Date.now(), POP_FOLLOW);
    Util.log(`&type=button_follow&href=${this.href}`);
  }

  /**
   * Render the follow button
   * @return {Element}
   */
  renderTemplate() {
    const followButton = Util.make(this.element.ownerDocument, {
      'a': {
        class: '-amp-pinterest-follow-button',
        href: this.href,
        textContent: this.label,
      },
    });
    followButton.appendChild(Util.make(this.element.ownerDocument, {'i': {}}));
    followButton.onclick = this.handleClick.bind(this);
    return followButton;
  }

  /**
   * Prepare the render data, create the node and add handlers
   * @return {!Promise}
   */
  render() {
    // Add trailing slash?
    if (this.href.substr(-1) !== '/') {
      this.href += '/';
    }
    this.href += `pins/follow/?guid=${Util.guid}`;

    return tryResolve(() => this.renderTemplate());
  }

  /**
   * Determine the height of the contents to allow resizing after first layout.
   *
   * @return {!Promise<?number>}
   */
  height() {
    return Promise.resolve(null);
  }
}
