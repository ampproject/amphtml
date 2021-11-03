import {Keys_Enum} from '#core/constants/key-codes';
import {measureIntersection} from '#core/dom/layout/intersection';
import {getWin} from '#core/window';

import {Services} from '#service';

import {user, userAssert} from '#utils/log';

import {Util} from './util';

import {openWindowDialog} from '../../../src/open-window-dialog';
import {assertAbsoluteHttpOrHttpsUrl, assertHttpsUrl} from '../../../src/url';

// Popup options
const POP =
  'status=no,resizable=yes,scrollbars=yes,' +
  'personalbar=no,directories=no,location=no,toolbar=no,' +
  'menubar=no,width=900,height=500,left=0,top=0';

// Matches the height padding caused by .-amp-pinterest-embed-pin
const EMBED_PIN_PADDING = 10;

/**
 * Pinterest Pin Widget
 * data-url: the source url for the Pin
 */
export class PinWidget {
  /** @param {!Element} rootElement */
  constructor(rootElement) {
    userAssert(
      rootElement.getAttribute('data-url'),
      'The data-url attribute is required for Pin widgets'
    );
    this.element = rootElement;
    this.xhr = Services.xhrFor(getWin(rootElement));
    this.pinId = '';
    this.alt = '';
    this.pinUrl = '';
    this.width = '';
    this.layout = '';

    /** @private {!Element} */
    this.heightOwnerElement_ = null;
  }

  /**
   * Handle keypress if Enter or Space for accessibility.
   * @param {Event} event
   */
  handleKeyDown(event) {
    if (event.key == Keys_Enum.ENTER || event.key == Keys_Enum.SPACE) {
      this.handleClick(event);
    }
  }
  /**
   * Override the default href click handling to log and open popup
   * @param {Event} event
   */
  handleClick(event) {
    event.preventDefault();
    const el = event.target;
    const shouldPop = el.getAttribute('data-pin-pop') || false;
    const href = el.getAttribute('data-pin-href');
    const log = el.getAttribute('data-pin-log');
    if (href) {
      assertAbsoluteHttpOrHttpsUrl(href);
      if (shouldPop) {
        openWindowDialog(window, href, '_pinit', POP);
      } else {
        openWindowDialog(window, `${href}?amp=1&guid=${Util.guid}`, '_blank');
      }
    }
    if (log) {
      Util.log('&type=' + log);
    }
  }

  /** @return {!Promise<!JsonObject>}  */
  fetchPin() {
    const baseUrl = 'https://widgets.pinterest.com/v3/pidgets/pins/info/?';
    const query = `pin_ids=${this.pinId}&sub=www&base_scheme=https`;
    return this.xhr
      .fetchJson(baseUrl + query, {})
      .then((res) => res.json())
      .then((json) => {
        try {
          return /** @type {JsonObject} */ (json)['data'][0];
        } catch (e) {
          return null;
        }
      });
  }

  /**
   * @param {!JsonObject} pin
   * @return {*} TODO(#23582): Specify return type
   */
  renderPin(pin) {
    // start setting our class name
    let className = '-amp-pinterest-embed-pin';
    let imgUrl = assertHttpsUrl(pin['images']['237x']['url'], this.element);

    // large widgets may come later
    if (this.width === 'medium' || this.width === 'large') {
      className = className + '-medium';
      imgUrl = imgUrl.replace(/237/, '345');
      Util.log('&type=pidget&pin_count_medium=1');
    } else {
      Util.log('&type=pidget&pin_count=1');
    }

    // Apply a CSS class when the layout is responsive
    if (this.layout === 'responsive') {
      className += ' -amp-pinterest-embed-pin-responsive';
    }

    const structure = Util.make(this.element.ownerDocument, {'span': {}});
    structure.className = className + ' i-amphtml-fill-content';

    this.heightOwnerElement_ = Util.make(this.element.ownerDocument, {
      'span': {
        'className': '-amp-pinterest-embed-pin-inner',
        'data-pin-log': 'embed_pin',
      },
    });

    // If no alternate text is set, set it to the title gotten from the pin data
    if (!this.alt && pin['attribution']) {
      this.alt = pin['attribution']['title'];
    }

    const img = Util.make(this.element.ownerDocument, {
      'img': {
        'src': imgUrl,
        'className': '-amp-pinterest-embed-pin-image',
        'data-pin-no-hover': true,
        'data-pin-href': 'https://www.pinterest.com/pin/' + pin['id'] + '/',
        'data-pin-log': 'embed_pin_img',
        'alt': this.alt,
      },
    });
    this.heightOwnerElement_.appendChild(img);

    // repin button
    const repin = Util.make(this.element.ownerDocument, {
      'span': {
        'className':
          '-amp-pinterest-rect -amp-pinterest-en-red' +
          ' -amp-pinterest-embed-pin-repin -amp-pinterest-save-button-tall',
        'data-pin-log': 'embed_pin_repin',
        'data-pin-pop': '1',
        'data-pin-href':
          'https://www.pinterest.com/pin/' +
          pin['id'] +
          '/repin/x/?amp=1&guid=' +
          Util.guid,
        'textContent': 'Save',
        'role': 'button',
        'aria-label': 'Repin this image: ' + this.alt,
        'tabindex': '0',
      },
    });
    this.heightOwnerElement_.appendChild(repin);

    // text container
    const text = Util.make(this.element.ownerDocument, {
      'span': {
        'className': '-amp-pinterest-embed-pin-text',
      },
    });

    // description
    if (pin['description']) {
      const description = Util.make(this.element.ownerDocument, {
        'span': {
          'className':
            '-amp-pinterest-embed-pin-text-block ' +
            '-amp-pinterest-embed-pin-description',
          'textContent': Util.filter(pin['description']),
        },
      });
      text.appendChild(description);
    }

    // attribution
    if (pin['attribution']) {
      const attribution = Util.make(this.element.ownerDocument, {
        'span': {
          'className':
            '-amp-pinterest-embed-pin-text-block' +
            ' -amp-pinterest-embed-pin-attribution',
        },
      });
      attribution.appendChild(
        Util.make(this.element.ownerDocument, {
          'img': {
            'className': '-amp-pinterest-embed-pin-text-icon-attrib',
            'src': pin['attribution']['provider_icon_url'],
            'alt': 'from ' + pin['attribution']['provider_name'],
          },
        })
      );
      attribution.appendChild(
        Util.make(this.element.ownerDocument, {
          'span': {
            'textContent': ' by ',
          },
        })
      );
      attribution.appendChild(
        Util.make(this.element.ownerDocument, {
          'span': {
            'data-pin-href': pin['attribution']['url'],
            'textContent': Util.filter(pin['attribution']['author_name']),
          },
        })
      );
      text.appendChild(attribution);
    }

    // likes and repins
    if (pin['repin_count'] || pin['like_count']) {
      const stats = Util.make(this.element.ownerDocument, {
        'span': {
          'className':
            '-amp-pinterest-embed-pin-text-block' +
            ' -amp-pinterest-embed-pin-stats',
        },
      });
      if (pin['repin_count']) {
        const repinCount = Util.make(this.element.ownerDocument, {
          'span': {
            'className': '-amp-pinterest-embed-pin-stats-repins',
            'textContent': String(pin['repin_count']),
          },
        });
        stats.appendChild(repinCount);
      }

      if (pin['like_count']) {
        const likeCount = Util.make(this.element.ownerDocument, {
          'span': {
            'className': '-amp-pinterest-embed-pin-stats-likes',
            'textContent': String(pin['like_count']),
          },
        });
        stats.appendChild(likeCount);
      }
      text.appendChild(stats);
    }

    // pinner
    if (pin['pinner']) {
      const pinner = Util.make(this.element.ownerDocument, {
        'span': {
          'className':
            '-amp-pinterest-embed-pin-text-block' +
            ' -amp-pinterest-embed-pin-pinner',
        },
      });

      // avatar
      pinner.appendChild(
        Util.make(this.element.ownerDocument, {
          'img': {
            'className': '-amp-pinterest-embed-pin-pinner-avatar',
            'alt': Util.filter(pin['pinner']['full_name']),
            'title': Util.filter(pin['pinner']['full_name']),
            'src': pin['pinner']['image_small_url'],
            'data-pin-href': pin['pinner']['profile_url'],
          },
        })
      );

      // name
      pinner.appendChild(
        Util.make(this.element.ownerDocument, {
          'span': {
            'className': '-amp-pinterest-embed-pin-pinner-name',
            'textContent': Util.filter(pin['pinner']['full_name']),
            'data-pin-href': pin['pinner']['profile_url'],
          },
        })
      );

      // board
      pinner.appendChild(
        Util.make(this.element.ownerDocument, {
          'span': {
            'className': '-amp-pinterest-embed-pin-board-name',
            'textContent': Util.filter(pin['board']['name']),
            'data-pin-href': 'https://www.pinterest.com/' + pin['board']['url'],
          },
        })
      );

      text.appendChild(pinner);
    }

    this.heightOwnerElement_.appendChild(text);
    structure.appendChild(this.heightOwnerElement_);

    // listen for clicks
    structure.addEventListener('click', this.handleClick.bind(this));
    // Handle Space and Enter while selected for a11y
    structure.addEventListener('keypress', this.handleKeyDown.bind(this));

    // done
    return structure;
  }

  /**
   * Renders the pin widget.
   *
   * @return {!Promise}
   */
  render() {
    this.pinUrl = this.element.getAttribute('data-url');
    this.width = this.element.getAttribute('data-width');
    this.layout = this.element.getAttribute('layout');
    this.alt = this.element.getAttribute('alt');

    this.pinId = '';
    try {
      this.pinId = this.pinUrl.split('/pin/')[1].split('/')[0];
    } catch (err) {
      return Promise.reject(
        user().createError('Invalid pinterest url: %s', this.pinUrl)
      );
    }

    return this.fetchPin().then(this.renderPin.bind(this));
  }

  /**
   * Determine the height of the contents to allow resizing after first layout.
   *
   * @return {!Promise<?number>}
   */
  height() {
    return measureIntersection(this.heightOwnerElement_).then(
      (entry) => entry.boundingClientRect.height + EMBED_PIN_PADDING
    );
  }
}
