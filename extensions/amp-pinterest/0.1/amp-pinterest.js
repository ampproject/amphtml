/**
 * Copyright 2015 The AMP HTML Authors.
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


/**
 * @fileoverview Shows a Pinterest widget.
 * Examples:
 * <code>
 *
 * <amp-pinterest height=20 width=40
 *   data-do="buttonPin"
 *   data-url="http://www.flickr.com/photos/kentbrew/6851755809/"
 *   data-media="http://farm8.staticflickr.com/7027/6851755809_df5b2051c9_z.jpg"
 *   data-description="Next stop: Pinterest">
 * </amp-pinterest>
 *
 * <amp-pinterest width=245 height=330
 *   data-do="embedPin"
 *   data-url="https://www.pinterest.com/pin/99360735500167749/">
 * </amp-pinterest>
 *
 * </code>
 */

import {assertHttpsUrl} from '../../../src/url';
import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';

// parameters for pop-up windows
const POP = 'status=no,resizable=yes,scrollbars=yes,' +
  'personalbar=no,directories=no,location=no,toolbar=no,' +
  'menubar=no,width=900,height=500,left=0,top=0';

// characters to be used in the creation of guids
const BASE60 = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ_abcdefghijkmnopqrstuvwxyz';

class AmpPinterest extends AMP.BaseElement {
  /** @override */
  createdCallback() {
    // preconnect to widget API
    this.preconnect.url('https://widgets.pinterest.com');
  }
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  /** @override */
  layoutCallback() {

    let height = this.element.getAttribute('height');

    let width = this.element.getAttribute('width');

    let pinDo = AMP.assert(this.element.getAttribute('data-do'),
      'The data-do attribute is required for <amp-pinterest> %s',
      this.element);

    let pinUrl = AMP.assert(this.element.getAttribute('data-url'),
      'The data-url attribute is required for <amp-pinterest> %s',
      this.element);

    // make a 12-digit base-60 number for performance tracking
    let guid = '';
    for (let i = 0; i < 12; i = i + 1) {
      guid = guid + BASE60.substr(Math.floor(Math.random() * 60), 1);
    }

    // open a new window
    let pop = function(url, shouldPop) {
      if (shouldPop) {
        // amp=1&guid=guid are already in the query before long fields
        window.open(url, '_pinit', POP);
      } else {
        // this is a straight window.open; append amp=1&guid=guid
        window.open(url + '?amp=1&guid=' + guid, '_blank');
      }
    };

    // log a string
    let log = function(str) {
      let call = new Image();
      let query = 'https://log.pinterest.com/?guid=' + guid;
      query = query + '&amp=1';
      // add optional string &foo=bar
      if (str) {
        query = query + str;
      }
      query = query + '&via=' + encodeURIComponent(window.location.href);
      call.src = query;
    };

    // load data from API via XHR
    let call = function(url) {
      return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              // all replies are JSON and should parse
              try {
                let data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (err) {
                reject(new Error('API reply was not JSON: ' + url));
              }
            } else {
              reject(new Error('API call failed: ' + url));
            }
          }
        };
        xhr.open("GET", url, true);
        xhr.send();
      });
    };

    // set a DOM property or text attribute
    let set = function(el, att, string) {
      if (typeof el[att] === 'string') {
        el[att] = string;
      } else {
        el.setAttribute(att, string);
      }
    };

    // create a DOM element
    let make = function(obj) {
      let el = false, tag, att;
      for (tag in obj) {
        el = document.createElement(tag);
        for (att in obj[tag]) {
          if (typeof obj[tag][att] === 'string') {
            set(el, att, obj[tag][att]);
          }
        }
        break;
      }
      return el;
    };

    // filter tags from API input
    let filter = function(str) {
      let decoded, ret;
      decoded = '';
      ret = '';
      try {
        decoded = decodeURIComponent(str);
      } catch (e) { }
      ret = decoded.replace(/</g, '&lt;');
      ret = ret.replace(/>/g, '&gt;');
      return ret;
    };

    // save our outside context so we can return properly after rendering
    let that = this;

    let makePin = function() {

      // make an embedded pin widget
      // pinId will be inferred from pinUrl

      let pinId = '';
      try {
        pinId = pinUrl.split('/pin/')[1].split('/')[0];
      } catch (err) {
        // fail silently
        return;
      }

      let width = that.element.getAttribute('data-width');

      let structure = make({'span': {}});

      let renderPin = function(r) {

        if (r && r.data && r.data[0] && !r.data[0].error) {
          let p = r.data[0];

          // start setting our class name
          let className = '-amp-pinterest-embed-pin';
          let imgUrl = assertHttpsUrl(p.images['237x'].url);

          // large widgets may come later
          if (width === 'medium' || width === 'large') {
            className = className + '-medium';
            imgUrl = imgUrl.replace(/237/, '345');
            log('&type=pidget&pin_count_medium=1');
          } else {
            log('&type=pidget&pin_count=1');
          }

          structure.className = className;

          let container = make({'span': {
            'className': '-amp-pinterest-embed-pin-inner',
            'data-pin-log': 'embed_pin'
          }});

          let img = make({'img': {
            'src': imgUrl,
            'className': '-amp-pinterest-embed-pin-image',
            'data-pin-no-hover': true,
            'data-pin-href': 'https://www.pinterest.com/pin/' + p.id + '/',
            'data-pin-log': 'embed_pin_img'
          }});
          container.appendChild(img);

          // repin button
          let repin = make({'span': {
            'className': '-amp-pinterest-rect -amp-pinterest-en-red' +
              ' -amp-pinterest-embed-pin-repin',
            'data-pin-log': 'embed_pin_repin',
            'data-pin-pop': '1',
            'data-pin-href': 'https://www.pinterest.com/pin/' + p.id +
              '/repin/x/?amp=1&guid=' + guid
          }});
          container.appendChild(repin);

          // text container
          let text = make({'span': {
            'className': '-amp-pinterest-embed-pin-text'
          }});

          // description
          if (p.description) {
            let description = make({'span': {
              'className': '-amp-pinterest-embed-pin-text-block ' +
                '-amp-pinterest-embed-pin-description',
              'textContent': filter(p.description)
            }});
            text.appendChild(description);
          }

          // attribution
          if (p.attribution) {
            let attribution = make({'span': {
              'className': '-amp-pinterest-embed-pin-text-block' +
                ' -amp-pinterest-embed-pin-attribution'
            }});
            attribution.appendChild(make({'img': {
              'className': '-amp-pinterest-embed-pin-text-icon-attrib',
              'src': p.attribution.provider_icon_url
            }}));
            attribution.appendChild(make({'span': {
              'textContent': ' by '
            }}));
            attribution.appendChild(make({'span': {
              'data-pin-href': p.attribution.url,
              'textContent': filter(p.attribution.author_name)
            }}));
            text.appendChild(attribution);
          }

          // likes and repins
          if (p.repin_count || p.like_count) {
            let stats = make({'span': {
              'className': '-amp-pinterest-embed-pin-text-block' +
                ' -amp-pinterest-embed-pin-stats'
            }});
            if (p.repin_count) {
              let repinCount = make({'span': {
                'className': '-amp-pinterest-embed-pin-stats-repins',
                'textContent': String(p.repin_count)
              }});
              stats.appendChild(repinCount);
            }

            if (p.like_count) {
              let likeCount = make({'span': {
                'className': '-amp-pinterest-embed-pin-stats-likes',
                'textContent': String(p.like_count)
              }});
              stats.appendChild(likeCount);
            }
            text.appendChild(stats);
          }

          // pinner
          if (p.pinner) {

            let pinner = make({'span': {
              'className': '-amp-pinterest-embed-pin-text-block' +
                ' -amp-pinterest-embed-pin-pinner'
            }});

            // avatar
            pinner.appendChild(make({'img': {
              'className': '-amp-pinterest-embed-pin-pinner-avatar',
              'alt': filter(p.pinner.full_name),
              'title': filter(p.pinner.full_name),
              'src': p.pinner.image_small_url,
              'data-pin-href': p.pinner.profile_url
            }}));

            // name
            pinner.appendChild(make({'span': {
              'className': '-amp-pinterest-embed-pin-pinner-name',
              'textContent': filter(p.pinner.full_name),
              'data-pin-href': p.pinner.profile_url
            }}));

            // board
            pinner.appendChild(make({'span': {
              'className': '-amp-pinterest-embed-pin-board-name',
              'textContent': filter(p.board.name),
              'data-pin-href': 'https://www.pinterest.com/' + p.board.url
            }}));

            text.appendChild(pinner);
          }

          container.appendChild(text);
          structure.appendChild(container);


          // listen for clicks
          structure.addEventListener('click', function(e) {
            let el = e.target;
            let logMe = el.getAttribute('data-pin-log');
            if (logMe) {
              log('&type=' + logMe);
            }
            let href = el.getAttribute('data-pin-href');
            if (href) {
              let popThis = el.getAttribute('data-pin-pop') || false;
              pop(href, popThis);
            }
            e.preventDefault();
          });

          // fill it
          that.applyFillContent(structure);
          // append it
          that.element.appendChild(structure);
          // done
          return loadPromise(img);
        }
      };

      let query = 'https://widgets.pinterest.com/v3/pidgets/pins/info/' +
        '?pin_ids=' + pinId +
        '&sub=www&base_scheme=https';
      return call(query).then(r => {
        return renderPin(r);
      });
    };

    let makeButton = function() {

      // render a Pin It button
      // required: media and description
      // optional: round, color, tall, lang, count

      let pinMedia =
        AMP.assert(that.element.getAttribute('data-media'),
        'The data-media attribute is required when <amp-pinterest> ' +
        'makes a Pin It button %s', that.element);

      let pinDescription =
         AMP.assert(that.element.getAttribute('data-description'),
        'The data-description attribute is required when <amp-pinterest> ' +
        'makes a Pin It button %s', that.element);

      // options
      let round = that.element.getAttribute('data-round');
      let color = that.element.getAttribute('data-color');
      let tall = that.element.getAttribute('data-tall');
      let lang = that.element.getAttribute('data-lang');
      let count = that.element.getAttribute('data-count');

      // pass a known guid when testing
      let theGuid = that.element.getAttribute('data-volkswagen-guid') || guid;

      // build our link
      let link = 'https://www.pinterest.com/pin/create/button/';
      link = link + '?amp=1&guid=' + theGuid;
      link = link + '&url=' + encodeURIComponent(pinUrl);
      link = link + '&media=' + encodeURIComponent(pinMedia);
      link = link + '&description=' +
        encodeURIComponent(pinDescription);

      // start building a link
      let a = make({'A': {
        'href': link
      }});

      // built it
      let render = function(r) {

        // shorten the pin count so it will fit in our bubble
        let prettyPinCount = function(n) {
          if (n > 999) {
            if (n < 1000000) {
              n = parseInt(n / 1000, 10) + 'K+';
            } else {
              if (n < 1000000000) {
                n = parseInt(n / 1000000, 10) + 'M+';
              } else {
                n = '++';
              }
            }
          }
          return n;
        };

        // start setting our class name
        let className = '';

        // first selector: set size and shape
        if (round) {

          // we're round
          className = '-amp-pinterest-round';
          if (tall) {
            // we're tall
            className = '-amp-pinterest-round-tall';
          }

        } else {

          // we're rectangular
          className = '-amp-pinterest-rect';
          if (tall) {
            // we're tall
            className = className + '-tall';
          }

          // second selector: set background image
          className = className + ' -amp-pinterest';
          if (lang !== 'ja') {
            // we're not Japanese
            lang = 'en';
          }

          className = className + '-' + lang;
          if (color !== 'red' && color !== 'white') {
            // if we're not red or white, we're gray
            color = 'gray';
          }
          className = className + '-' + color;

          // yes, we do this twice; once for container and once for bg image
          if (tall) {
            // we're tall
            className = className + '-tall';
          }
        }

        if (r) {

          let countBubble = document.createElement('SPAN');

          // position the count
          if (count === 'above') {
            className = className + ' -amp-pinterest-count-pad-above';
            countBubble.className = '-amp-pinterest-bubble-above';
          } else {
            className = className + ' -amp-pinterest-count-pad-beside';
            countBubble.className = '-amp-pinterest-bubble-beside';
          }

          // size the bubble
          if (tall) {
            className = className + '-tall';
            countBubble.className = countBubble.className + '-tall';
          }

          // fill with text; zero
          countBubble.appendChild(document.createTextNode(
            prettyPinCount(r.count - 0) || '0'
          ));

          // append the count
          a.appendChild(countBubble);

          log('&type=pidget&button_count=1');

        }

        // set our className
        a.className = className;


        // listen for clicks
        a.addEventListener('click', function(e) {
          log('&type=button_pinit');
          pop(this.href, true);
          e.preventDefault();
        });

        // fill it
        that.applyFillContent(a);
        // append it
        that.element.appendChild(a);
        // done
        return loadPromise(a);
      };

      // only ask for a count if the operator requires it
      if (count === 'above' || count === 'beside') {
        // call the API
        let query = 'https://widgets.pinterest.com/v1/urls/count.json?' +
          '&return_jsonp=false' +
          '&url=' + encodeURIComponent(pinUrl);
        return call(query).then(r => {
          render(r);
          return loadPromise(a);
        });
      } else {
        // you have everything you need to render with no waiting for API
        render();
        return loadPromise(a);
      }
    };

    // pinDo is set by data-do
    switch (pinDo) {

      case 'embedPin':
        return makePin();
        break;

      case 'buttonPin':
        return makeButton();
        break;

      default:
        break;
    }
  }
};

AMP.registerElement('amp-pinterest', AmpPinterest, $CSS$);
