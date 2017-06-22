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

import {
  createFixtureIframe,
  expectBodyToBecomeVisible,
} from '../../testing/iframe';
import {AmpEvents} from '../../src/amp-events';

describe.skip('integration amp-carousel', () => {

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/carousels.html', 1000)
        .then(f => {
          fixture = f;
        });
  });

  it('should show the body in carousel test', () => {
    return expectBodyToBecomeVisible(fixture.win);
  });

  it('should be present', () => {
    expect(fixture.doc.querySelectorAll('amp-carousel'))
        .to.have.length.above(0);
    return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
      expect(fixture.doc.querySelectorAll('amp-carousel'))
          .to.have.length.above(0);
    });
  });

  describe('when amp-mode-mouse class is on body', () => {

    beforeEach(() => {
      fixture.doc.body.classList.add('amp-mode-mouse');
    });

    it('should only have the next button enabled ' +
       'when on first item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-1');
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('should not be able to go past the first or last item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-1');
        const impl = amp.implementation_;

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        prevBtn.style.visibility = 'visible';
        nextBtn.style.visibility = 'visible';
        expect(prevBtn).to.be.visible;
        expect(nextBtn).to.be.visible;
        expect(prevBtn).to.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        impl.go(1, false);
        expect(nextBtn).to.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        impl.go(-1, false);
        expect(prevBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slide) should only have the next button enabled when on ' +
       'first item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 4).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-4');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('should only have the prev button enabled ' +
       'when on last item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-1');
        const impl = amp.implementation_;
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        impl.go(1, false);
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slides) should only have the prev button enabled when ' +
       'on last item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 4).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-4');
        const impl = amp.implementation_;
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        impl.go(1, false);
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slides loop) should always have a prev and next button be ' +
       'able to get past the first and last item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 7).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-7');
        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        expect(nextBtn).to.not.have.class('amp-disabled');
      });
    });

    it('should not have any buttons enabled when theres only a single ' +
       'item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 2).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-2');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slides) should not have any buttons enabled when theres ' +
       'only a single item', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 5).then(() => {
        fixture.doc.body.classList.add('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-5');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });
  });

  describe('when amp-mode-mouse class is not on body', () => {

    it('should not have the buttons visible', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 1).then(() => {
        fixture.doc.body.classList.remove('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-1');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
      });
    });

    it('(type=slides) should not have the buttons visible', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 4).then(() => {
        fixture.doc.body.classList.remove('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-4');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
      });
    });
  });

  describe('when amp-carousel has explicit `controls` attribute', () => {

    it('should have visible buttons even when `amp-mode-mouse` ' +
       'is not on body', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 3).then(() => {
        fixture.doc.body.classList.remove('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-3');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        expect(amp).to.have.attribute('controls');
        expect(amp).to.have.class('i-amphtml-carousel-has-controls');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('(type=slides) should have visible buttons ' +
       'even when `amp-mode-mouse` is not on body', () => {
      return fixture.awaitEvent(AmpEvents.LOAD_START, 6).then(() => {
        fixture.doc.body.classList.remove('amp-mode-mouse');
        const amp = fixture.doc.querySelector('#carousel-6');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        expect(amp).to.have.attribute('controls');
        expect(amp).to.have.class('i-amphtml-carousel-has-controls');

        const prevBtn = amp.querySelector('.amp-carousel-button-prev');
        const nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });
  });
});
