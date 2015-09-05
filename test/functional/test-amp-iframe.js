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

import {Timer} from '../../src/timer';
import {createIframe} from '../../testing/iframe';
import {installIframe} from '../../src/amp-iframe';
import {resources} from '../../src/resources';

describe('amp-iframe', () => {

  var timer = new Timer(window);
  var loaded = 0;
  beforeEach(() => {
    loaded = 0;
  });

  window.onmessage = function(message) {
    if (message == 'loaded-iframe') {
      loaded++;
    }
  };

  function getAmpIframe(attributes, opt_top) {
    return new Promise(function() {
      var iframe = createIframe();
      installIframe(iframe.win);
      var i = iframe.doc.createElement('amp-iframe');
      for (var key in attributes) {
        i.setAttribute(key, attributes[key]);
      }
      var top = opt_top || '601px';
      i.style.position = 'absolute';
      i.style.top = top;
      iframe.doc.body.appendChild(i);
      return timer.promise(0).then(() => {
        console.log('LOAD');
        i.implementation_.loadContent().then(() => {
          console.log('LOADED');
          return i;
        });
      });
    });
  }

  it('should render iframe', () => {
    return getAmpIframe({
      src: 'http://iframe.localhost:9876/base/fixtures/iframe.html'
    }).then((amp) => {
      expect(iframe.getAttribute('sandbox')).to.equal('');
    });
  });
});
