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
 *  <amp-pinterest height=20 width=40
 *    data-do="buttonPin"
 *    data-url="http://www.flickr.com/photos/kentbrew/6851755809/"
 *    data-media="http://farm8.staticflickr.com/7027/6851755809_df5b2051c9_z.jpg"
 *    data-description="Next stop: Pinterest">
 *  </amp-pinterest>
 *
 *  <amp-pinterest width=239 height=400
 *    data-do="embedBoard"
 *    data-scale-height="289"
 *    data-scale-width="107"
 *    data-url="http://www.pinterest.com/kentbrew/art-i-wish-i-d-made/">
 *  </amp-pinterest>
 *
 * </code>
 */

import {isLayoutSizeDefined} from '../../../src/layout';
import {loadPromise} from '../../../src/event-helper';

const VALID_PARAMS = [
    'data-config',
    'data-height',
    'data-width',
    'data-shape',
    'data-color',
    'data-lang',
    'data-scale-width',
    'data-scale-height',
    'data-board-width' ];

class AmpPinterest extends AMP.BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }
  /** @override */
  layoutCallback() {

    let height = this.element.getAttribute('height');

    let width = this.element.getAttribute('width');

    var pinDo = AMP.assert(this.element.getAttribute('data-do'),
      'The data-do attribute is required for <amp-pinterest> %s',
      this.element);

    var pinUrl = AMP.assert(this.element.getAttribute('data-url'),
      'The data-url attribute is required for <amp-pinterest> %s',
      this.element);

    // load data from API via XHR
    var get = function(url) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              resolve(xhr.responseText);
            } else {
              reject(new Error('API call failed: ' + url));
            }
          }
        };
        xhr.open("GET", url, true);
        xhr.send();
      });
    }

    // pinDo is set by data-do
    switch (pinDo) {

      case 'buttonPin':

        // buttonPin renders a Pin It button and requires media and description

        var pinMedia = AMP.assert(this.element.getAttribute('data-media'),
          'The data-media attribute is required when <amp-pinterest> makes a Pin It button %s',
          this.element);

        var pinDescription = AMP.assert(this.element.getAttribute('data-description'),
          'The data-description attribute is required when <amp-pinterest> makes a Pin It button %s',
          this.element);

        // options
        let shape = this.element.getAttribute('data-shape');
        let color = this.element.getAttribute('data-color');
        let height = this.element.getAttribute('data-height');
        let lang = this.element.getAttribute('data-lang');
        let config = this.element.getAttribute('data-config');

        // start building a link
        var a = document.createElement('A');

        // save our outside context so we can return after rendering
        let that = this;

        // built it
        var render = function (r) {

          // shorten the pin count so it will fit in our bubble
          let prettyPinCount = function (n) {
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
          if (shape === 'round') {

            // we're round
            className = 'amp-pinterest-round';
            if (height === '32') {
              // we're tall
              className = 'amp-pinterest-round-32';
            }

          } else {

            // we're rectangular
            className = 'amp-pinterest-rect';
            if (height === '28') {
              // we're tall
              className = className + '-28';
            }

            // second selector: set background image
            className = className + ' amp-pinterest';
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

            // yes, we do this twice; once for container and once for background image
            if (height === '28') {
              // we're tall
              className = className + '-28';
            }
          }

          if (r) {

            // API reply comes wrapped in a default callback; need to remove if present
            r = r.replace(/^receiveCount\(/, '');
            r = r.replace(/\)$/, '');

            // can we parse the data?
            try {
              let data = JSON.parse(r);
              let countBubble = document.createElement('SPAN');

              // position the count
              if (config === 'above') {
                className = className + ' amp-pinterest-count-pad-above';
                countBubble.className = 'amp-pinterest-bubble-above';
              } else {
                className = className + ' amp-pinterest-count-pad-beside';
                countBubble.className = 'amp-pinterest-bubble-beside';
              }

              // size the bubble
              if (height === '28') {
                className = className + '-28';
                countBubble.className = countBubble.className + '-28';
              } else {
                className = className + '-20';
                countBubble.className = countBubble.className + '-20';
              }

              // fill with text; zero
              countBubble.appendChild(document.createTextNode(prettyPinCount(data.count - 0) || '0'));

              // append
              a.appendChild(countBubble);
            } catch (err) {
              // fail silently; what we thought was JSON could not be parsed
            }
          }

          // set our className
          a.className = className;

          // build our link
          a.href = 'https://www.pinterest.com/pin/create/button/';
          a.href = a.href + '?url=' + encodeURIComponent(pinUrl);
          a.href = a.href + '&media=' + encodeURIComponent(pinMedia);
          a.href = a.href + '&description=' + encodeURIComponent(pinDescription);

          // listen for clicks
          a.addEventListener('click', function (e) {
            // pop the pin create window on Pinterest
            window.open(this.href, '_pinit', 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=900,height=500,left=0,top=0');
            e.preventDefault();
          });

          // fill it
          that.applyFillContent(a);
          // append it
          that.element.appendChild(a);
          // done
          return loadPromise(a);
        }

        // only ask for a count if the operator requires it
        if (config === 'above' || config === 'beside') {
          // call the API
          let call = 'https://widgets.pinterest.com/v1/urls/count.json?url=' + encodeURIComponent(pinUrl);
          return get(call).then((r) => {
            render(r);
            return loadPromise(a);
          });
        } else {
          // you have everything you need to render with no waiting for API
          render();
          return loadPromise(a);
        }

      break;

      default:

        // we're a more complex widget, currently rendered in an iframe
        // looking into doing these inline now

        let iframe = document.createElement('iframe');
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowtransparency', 'true');

        // start setting the source of our iframe
        let src = 'https://assets.pinterest.com/ext/iffy.html?' +
            'act=' + encodeURIComponent(pinDo) +
            '&url=' + encodeURIComponent(pinUrl);

        for (let i = 0; i < VALID_PARAMS.length; i = i + 1) {
            let v = this.element.getAttribute(VALID_PARAMS[i]);
            if (v) {
                // remove data- prefix from params
                src = src + '&' + VALID_PARAMS[i].replace(/data-/, '') + '=' + encodeURIComponent(v);
            }
        }

        iframe.src = src;

        this.applyFillContent(iframe);
        iframe.width = width;
        iframe.height = height;
        this.element.appendChild(iframe);
        return loadPromise(iframe);

      break;
    }
  }
};

AMP.registerElement('amp-pinterest', AmpPinterest, $CSS$);
