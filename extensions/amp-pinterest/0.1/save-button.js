import {getWin} from '#core/window';

import {Services} from '#service';

import {dev, userAssert} from '#utils/log';

import {Util} from './util';

import {openWindowDialog} from '../../../src/open-window-dialog';

// Popup options
const POP =
  'status=no,resizable=yes,scrollbars=yes,' +
  'personalbar=no,directories=no,location=no,toolbar=no,' +
  'menubar=no,width=900,height=500,left=0,top=0';

/**
 * Pinterest Save Button
 * data-url: the source url for the Pin
 * data-media: the url of the Pin image/media
 * data-description: the description of the Pin
 *
 * OPTIONAL
 * data-color: the button color from [red, white, gray]
 * data-count: the position of the Pin count from [beside, above]
 * data-lang:  the language of the button from [en, ja]
 * data-round: should the button be round (true if set)
 * data-tall:  should the button be tall  (true if set)
 */
export class SaveButton {
  /** @param {!Element} rootElement */
  constructor(rootElement) {
    userAssert(
      rootElement.getAttribute('data-url'),
      'The data-url attribute is required for Save buttons'
    );
    userAssert(
      rootElement.getAttribute('data-media'),
      'The data-media attribute is required for Save buttons'
    );
    userAssert(
      rootElement.getAttribute('data-description'),
      'The data-description attribute is required for Save buttons'
    );
    this.element = rootElement;
    this.xhr = Services.xhrFor(getWin(rootElement));
    this.color = rootElement.getAttribute('data-color');
    this.count = rootElement.getAttribute('data-count');
    this.lang = rootElement.getAttribute('data-lang');
    const hasOneToOneDimensions =
      rootElement.hasAttribute('height') &&
      rootElement.hasAttribute('width') &&
      rootElement.getAttribute('height') === rootElement.getAttribute('width');
    this.round =
      rootElement.getAttribute('data-round') || hasOneToOneDimensions;
    this.tall = rootElement.getAttribute('data-tall');
    this.description = rootElement.getAttribute('data-description');
    /** @type {?string} */
    this.media = null;
    /** @type {?string} */
    this.url = null;
    /** @type {?string} */
    this.href = null;
  }

  /**
   * Override the default href click handling to log and open popup
   * @param {Event} event The HTML event object
   */
  handleClick(event) {
    event.preventDefault();
    openWindowDialog(window, dev().assertString(this.href), '_pinit', POP);
    Util.log('&type=button_pinit');
  }

  /**
   * Fetch the remote Pin count for the source URL
   * @return {Promise}
   */
  fetchCount() {
    const url = `https://widgets.pinterest.com/v1/urls/count.json?return_jsonp=false&url=${this.url}`;
    return this.xhr.fetchJson(url, {}).then((res) => res.json());
  }

  /**
   * Pretty print the Pin count with english suffixes
   * @param {number|string} count The Pin count for the source URL
   * @return {string}
   */
  formatPinCount(count) {
    if (count > 999) {
      if (count < 1000000) {
        count = parseInt(count / 1000, 10) + 'K+';
      } else {
        if (count < 1000000000) {
          count = parseInt(count / 1000000, 10) + 'M+';
        } else {
          count = '++';
        }
      }
    }
    return String(count);
  }

  /**
   * Render helper for the optional count bubble
   * @param {string} count The data-count attribute
   * @param {string} heightClass The height class to apply for spacing
   * @return {Element}
   */
  renderCount(count, heightClass) {
    Util.log('&type=pidget&button_count=1');
    return Util.make(this.element.ownerDocument, {
      'span': {
        class: `-amp-pinterest-bubble-${this.count}${heightClass}`,
        textContent: this.formatPinCount(count),
      },
    });
  }

  /**
   * Render the follow button
   * @param {JsonObject} count Optional Pin count for the source URL
   * @return {Element}
   */
  renderTemplate(count) {
    const CLASS = {
      shape: this.round ? '-round' : '',
      height: this.tall ? '-tall' : '',
      lang: this.lang === 'ja' ? '-ja' : '-en',
      color: ['gray', 'white'].indexOf(this.color) !== -1 ? this.color : 'red',
    };

    const clazz = [
      `-amp-pinterest${CLASS.shape}${CLASS.height}`,
      'i-amphtml-fill-content',
    ];

    let countBubble = null;
    if (!this.round) {
      clazz.push(`-amp-pinterest-save-button${CLASS.height}`);
      clazz.push(`-amp-pinterest${CLASS.lang}-${CLASS.color}${CLASS.height}`);
      if (count) {
        clazz.push(`-amp-pinterest-count-pad-${this.count}${CLASS.height}`);
        countBubble = this.renderCount(count['count'], CLASS.height);
      }
    }

    const text = this.lang === 'ja' ? '保存' : 'Save';

    const textContent = this.round ? '' : text;

    const saveButton = Util.make(this.element.ownerDocument, {
      'a': {
        class: clazz.join(' '),
        href: this.href,
        textContent,
        ...(!textContent && {
          'aria-label': text,
        }),
      },
    });

    if (countBubble) {
      saveButton.appendChild(countBubble);
    }
    saveButton.onclick = this.handleClick.bind(this);
    return saveButton;
  }

  /**
   * Prepare the render data, create the node and add handlers
   * @return {!Promise}
   */
  render() {
    this.description = encodeURIComponent(this.description);
    this.media = encodeURIComponent(this.element.getAttribute('data-media'));
    this.url = encodeURIComponent(this.element.getAttribute('data-url'));

    const query = [
      'amp=1',
      `guid=${Util.guid}`,
      `url=${this.url}`,
      `media=${this.media}`,
      `description=${this.description}`,
    ].join('&');
    this.href = `https://www.pinterest.com/pin/create/button/?${query}`;

    let promise;
    if (this.count === 'above' || this.count === 'beside') {
      promise = this.fetchCount();
    } else {
      promise = Promise.resolve();
    }
    return promise.then(this.renderTemplate.bind(this));
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
