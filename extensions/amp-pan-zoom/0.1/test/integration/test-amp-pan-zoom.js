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

import {AmpEvents} from '../../../../../src/amp-events';
import {createFixtureIframe} from '../../../../../testing/iframe';
import {toggleExperiment} from '../../../../../src/experiments';

describe
  .configure()
  .ifChrome()
  .run('amp-pan-zoom', function() {
    this.timeout(100000);
    let fixture;
    beforeEach(() => {
      return createFixtureIframe('test/fixtures/amp-pan-zoom.html', 1000).then(
        f => {
          fixture = f;
          toggleExperiment(fixture.win, 'amp-pan-zoom', true, true);
        }
      );
    });

    it('two amp-pan-zoom should exist', () => {
      expect(fixture.doc.querySelectorAll('amp-pan-zoom')).to.have.length.above(
        0
      );
    });

    // TODO(cathyxz): Flaky on Chrome 67 on Windows 7.
    it.skip('should resize and center content', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_END, 2).then(() => {
        const panZoom = fixture.doc.querySelector('#amp-pan-zoom-1');
        const content = panZoom.children[0];
        expect(content.style.width).to.equal('300px');
        // 481 / 641 * 300 = 225
        expect(content.style.height).to.equal('225px');
        // (240 - 225) / 2 = 8
        expect(content.style.top).to.equal('8px');
        expect(content.style.left).to.equal('0px');
      });
    });

    // TODO(cathyxz): Flaky on Chrome 67 on Windows 7.
    it.skip('should apply initial configurations correctly', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_END, 4).then(() => {
        const panZoom = fixture.doc.querySelector('#amp-pan-zoom-2');
        const content = panZoom.children[0];
        expect(content.style.transform).to.equal(
          'translate(50px, 100px) scale(2)'
        );
      });
    });
  });
