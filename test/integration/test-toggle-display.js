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

import {AmpEvents} from '../../src/amp-events';
import {createFixtureIframe} from '../../testing/iframe.js';
import {setInitialDisplay, toggle} from '../../src/style';

describe
  .configure()
  .retryOnSaucelabs()
  .run('toggle display helper', () => {
    let fixture;
    let sandbox;
    let img;

    beforeEach(() => {
      sandbox = sinon.sandbox;

      return createFixtureIframe('test/fixtures/images.html', 500)
        .then(f => {
          fixture = f;

          // Wait for one <amp-img> element to load.
          return fixture.awaitEvent(AmpEvents.LOAD_END, 1);
        })
        .then(() => {
          img = fixture.doc.querySelector('amp-img');
        });
    });

    afterEach(() => {
      sandbox.restore();
    });

    describes.repeated(
      'toggle',
      {
        'regular': () => {},
        'inline display style': el => {
          setInitialDisplay(el, 'inline-block');
        },
        'stylesheet display style': () => {
          const s = fixture.doc.createElement('style');
          s.innerText = 'amp-img { display: inline-block !important; }';
          fixture.doc.head.appendChild(s);
        },
      },
      (name, setup) => {
        it('toggle display', () => {
          setup(img);

          toggle(img, false);
          expect(img).to.have.display('none');
          toggle(img, true);
          expect(img).to.not.have.display('none');
        });
      }
    );
  });
