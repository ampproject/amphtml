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
import {openWindowDialog} from '../../../src/dom';
import {user} from '../../../src/log';
import {xhrFor} from '../../../src/xhr';

import {Util} from './util';

// Popup options
const POP = 'status=no,resizable=yes,scrollbars=yes,' +
  'personalbar=no,directories=no,location=no,toolbar=no,' +
  'menubar=no,width=900,height=500,left=0,top=0';

/**
 * Pinterest Pin Widget
 * @attr data-url: the source url for the Pin
 */
export class PinWidget {

  /** @param {!Element} rootElement */
  constructor(rootElement) {
    user().assert(rootElement.getAttribute('data-url'),
      'The data-url attribute is required for Pin widgets');
    this.element = rootElement;
    this.xhr = xhrFor(rootElement.ownerDocument.defaultView);
  }

  /**
   * Override the default href click handling to log and open popup
   * @param {Event} event: the HTML event object
   */
  handleClick(event) {
    event.preventDefault();
    const el = event.target;
    const shouldPop = el.getAttribute('data-pin-pop') || false;
    const href = el.getAttribute('data-pin-href');
    const log = el.getAttribute('data-pin-log');
    if (href) {
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

  fetchPin() {
    const baseUrl = 'https://widgets.pinterest.com/v3/pidgets/pins/info/?';
    const query = `pin_ids=${this.pinId}&sub=www&base_scheme=https`;
    return this.xhr.fetchJson(baseUrl + query, {
      requireAmpResponseSourceOrigin: false,
    }).then(response => {
      try {
        return response.data[0];
      } catch (e) { return null; }
    });
  }

  renderPin(pin) {
    // start setting our class name
    let className = '-amp-pinterest-embed-pin';
    let imgUrl = assertHttpsUrl(pin.images['237x'].url);

    // large widgets may come later
    if (this.width === 'medium' || this.width === 'large') {
      className = className + '-medium';
      imgUrl = imgUrl.replace(/237/, '345');
      Util.log('&type=pidget&pin_count_medium=1');
    } else {
      Util.log('&type=pidget&pin_count=1');
    }

    const structure = Util.make(this.element.ownerDocument, {'span': {}});
    // TODO(dvoytenko, #6794): Remove old `-amp-fill-content` form after the new
    // form is in PROD for 1-2 weeks.
    structure.className = className +
        ' -amp-fill-content i-amphtml-fill-content';

    const container = Util.make(this.element.ownerDocument, {'span': {
      'className': '-amp-pinterest-embed-pin-inner',
      'data-pin-log': 'embed_pin',
    }});

    const img = Util.make(this.element.ownerDocument, {'img': {
      'src': imgUrl,
      'className': '-amp-pinterest-embed-pin-image',
      'data-pin-no-hover': true,
      'data-pin-href': 'https://www.pinterest.com/pin/' + pin.id + '/',
      'data-pin-log': 'embed_pin_img',
    }});
    container.appendChild(img);

    // repin button
    const repin = Util.make(this.element.ownerDocument, {'span': {
      'className': '-amp-pinterest-rect -amp-pinterest-en-red' +
        ' -amp-pinterest-embed-pin-repin',
      'data-pin-log': 'embed_pin_repin',
      'data-pin-pop': '1',
      'data-pin-href': 'https://www.pinterest.com/pin/' + pin.id +
        '/repin/x/?amp=1&guid=' + Util.guid,
    }});
    container.appendChild(repin);

    // text container
    const text = Util.make(this.element.ownerDocument, {'span': {
      'className': '-amp-pinterest-embed-pin-text',
    }});

    // description
    if (pin.description) {
      const description = Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-text-block ' +
          '-amp-pinterest-embed-pin-description',
        'textContent': Util.filter(pin.description),
      }});
      text.appendChild(description);
    }

    // attribution
    if (pin.attribution) {
      const attribution = Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-text-block' +
          ' -amp-pinterest-embed-pin-attribution',
      }});
      attribution.appendChild(Util.make(this.element.ownerDocument, {'img': {
        'className': '-amp-pinterest-embed-pin-text-icon-attrib',
        'src': pin.attribution.provider_icon_url,
      }}));
      attribution.appendChild(Util.make(this.element.ownerDocument, {'span': {
        'textContent': ' by ',
      }}));
      attribution.appendChild(Util.make(this.element.ownerDocument, {'span': {
        'data-pin-href': pin.attribution.url,
        'textContent': Util.filter(pin.attribution.author_name),
      }}));
      text.appendChild(attribution);
    }

    // likes and repins
    if (pin.repin_count || pin.like_count) {
      const stats = Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-text-block' +
          ' -amp-pinterest-embed-pin-stats',
      }});
      if (pin.repin_count) {
        const repinCount = Util.make(this.element.ownerDocument, {'span': {
          'className': '-amp-pinterest-embed-pin-stats-repins',
          'textContent': String(pin.repin_count),
        }});
        stats.appendChild(repinCount);
      }

      if (pin.like_count) {
        const likeCount = Util.make(this.element.ownerDocument, {'span': {
          'className': '-amp-pinterest-embed-pin-stats-likes',
          'textContent': String(pin.like_count),
        }});
        stats.appendChild(likeCount);
      }
      text.appendChild(stats);
    }

    // pinner
    if (pin.pinner) {

      const pinner = Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-text-block' +
          ' -amp-pinterest-embed-pin-pinner',
      }});

      // avatar
      pinner.appendChild(Util.make(this.element.ownerDocument, {'img': {
        'className': '-amp-pinterest-embed-pin-pinner-avatar',
        'alt': Util.filter(pin.pinner.full_name),
        'title': Util.filter(pin.pinner.full_name),
        'src': pin.pinner.image_small_url,
        'data-pin-href': pin.pinner.profile_url,
      }}));

      // name
      pinner.appendChild(Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-pinner-name',
        'textContent': Util.filter(pin.pinner.full_name),
        'data-pin-href': pin.pinner.profile_url,
      }}));

      // board
      pinner.appendChild(Util.make(this.element.ownerDocument, {'span': {
        'className': '-amp-pinterest-embed-pin-board-name',
        'textContent': Util.filter(pin.board.name),
        'data-pin-href': 'https://www.pinterest.com/' + pin.board.url,
      }}));

      text.appendChild(pinner);
    }

    container.appendChild(text);
    structure.appendChild(container);

    // listen for clicks
    structure.addEventListener('click', this.handleClick.bind(this));

    // done
    return structure;
  }

  render() {
    this.pinUrl = this.element.getAttribute('data-url');
    this.width = this.element.getAttribute('data-width');

    this.pinId = '';
    try {
      this.pinId = this.pinUrl.split('/pin/')[1].split('/')[0];
    } catch (err) { return; }

    return this.fetchPin()
      .then(this.renderPin.bind(this));
  }

};
