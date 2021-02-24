/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {createFixtureIframe} from '../../testing/iframe';
import {toggleExperiment} from '../../src/experiments';
import {whenUpgradedToCustomElement} from '../../src/dom';

describe
  .configure()
  .enableIe()
  .run('Render a shadow-dom based element', () => {
    let fixture;

    beforeEach(async () => {
      fixture = await createFixtureIframe(
        'test/fixtures/shadow-dom-element.html',
        3000
      );
      toggleExperiment(fixture.win, 'bento', true, true);
    });

    it('should create shadow root', async () => {
      const carousel = fixture.doc.querySelector('amp-base-carousel');
      await whenUpgradedToCustomElement(carousel);
      await carousel.whenBuilt();
      await new Promise(setTimeout);

      expect(carousel.shadowRoot).to.exist;

      const slides = carousel.querySelectorAll('amp-img');
      expect(slides).to.have.length(2);

      const slots = carousel.shadowRoot
        .querySelector('c')
        .querySelectorAll('slot');
      expect(slots).to.have.length(2);

      expect(slides[0].assignedSlot).to.equal(slots[0]);
      expect(slides[1].assignedSlot).to.equal(slots[1]);
      expect(slots[0].assignedNodes()[0]).to.equal(slides[0]);
      expect(slots[1].assignedNodes()[0]).to.equal(slides[1]);
      expect(slots[0].getRootNode()).to.equal(carousel.shadowRoot);
    });
  });

describe
  .configure()
  .run('Render a shadow-dom based element, force polyfill', () => {
    let fixture;

    beforeEach(async () => {
      fixture = await createFixtureIframe(
        'test/fixtures/shadow-dom-element-polyfill.html',
        3000
      );
      toggleExperiment(fixture.win, 'bento', true, true);
    });

    it('should create shadow root', async () => {
      const carousel = fixture.doc.querySelector('amp-base-carousel');
      await whenUpgradedToCustomElement(carousel);
      await carousel.whenBuilt();
      await new Promise(setTimeout);

      expect(carousel.shadowRoot).to.exist;

      const slides = carousel.querySelectorAll('amp-img');
      expect(slides).to.have.length(2);

      const slots = carousel.shadowRoot
        .querySelector('c')
        .querySelectorAll('slot');
      expect(slots).to.have.length(2);

      expect(slides[0].assignedSlot).to.equal(slots[0]);
      expect(slides[1].assignedSlot).to.equal(slots[1]);
      expect(slots[0].assignedNodes()[0]).to.equal(slides[0]);
      expect(slots[1].assignedNodes()[0]).to.equal(slides[1]);
      expect(slots[0].getRootNode()).to.equal(carousel.shadowRoot);
    });
  });
