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

import {createFixtureIframe, expectBodyToBecomeVisible} from
    '../../testing/iframe.js';

describe('amp-carousel', () => {

  let fixture;
  beforeEach(() => {
    return createFixtureIframe('test/fixtures/carousels.html', 500)
      .then((f) => {
        fixture = f;
      });
  });

  it('should show the body', () => {
    return expectBodyToBecomeVisible(fixture.win);
  });

  it('should be present', () => {
    expect(fixture.doc.querySelectorAll('amp-carousel'))
        .to.have.length.above(0);
    return fixture.awaitEvent('amp:load:start', 1).then(() => {
      expect(fixture.doc.querySelectorAll('amp-carousel'))
          .to.have.length.above(0);
    });
  });

  describe('when amp-mode-mouse class is on body', () => {

    beforeEach(() => {
      fixture.doc.body.classList.add('amp-mode-mouse');
    });

    it('should only have the next button visible when on first item', () => {
      return fixture.awaitEvent('amp:load:start', 1).then(() => {
        let amp = fixture.doc.querySelector('#carousel-1');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('should not be able to go past the first or last item', () => {
      return fixture.awaitEvent('amp:load:start', 1).then(() => {
        let amp = fixture.doc.querySelector('#carousel-1');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        prevBtn.style.visibility = 'visible';
        nextBtn.style.visibility = 'visible';
        expect(prevBtn).to.be.visible;
        expect(nextBtn).to.be.visible;
        expect(prevBtn).to.have.class('amp-disabled');
        prevBtn.click();
        expect(prevBtn).to.have.class('amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        nextBtn.click();
        nextBtn.click();
        expect(nextBtn).to.have.class('amp-disabled');
        prevBtn.click();
        expect(prevBtn).to.not.have.class('amp-disabled');
        prevBtn.click();
        expect(prevBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slide) should only have the next button visible when on ' +
       'first item', () => {
      return fixture.awaitEvent('amp:load:start', 4).then(() => {
        let amp = fixture.doc.querySelector('#slides-1');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('should only have the prev button visible when on last item', () => {
      return fixture.awaitEvent('amp:load:start', 1).then(() => {
        let amp = fixture.doc.querySelector('#carousel-1');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');
        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
        nextBtn.click();
        nextBtn.click();
        nextBtn.click();
        expect(prevBtn).to.be.visible;
        expect(nextBtn).to.be.hidden;
      });
    });

    it('(type=slides) should only have the prev button visible when ' +
       'on last item', () => {
      return fixture.awaitEvent('amp:load:start', 4).then(() => {
        let amp = fixture.doc.querySelector('#slides-1');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');
        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
        nextBtn.click();
        nextBtn.click();
        nextBtn.click();
        // TODO(erwinm): figure out why do we need 2 extra clicks here?
        nextBtn.click();
        nextBtn.click();
        expect(prevBtn).to.be.visible;
        expect(nextBtn).to.be.hidden;
      });
    });

    it('(type=slides loop) should always have a prev and next button be ' +
       'able to get past the first and last item', () => {
      return fixture.awaitEvent('amp:load:start', 7).then(() => {
        let amp = fixture.doc.querySelector('#slides-4');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');
        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
        // TODO(erwinm): figure out why do we need 2 extra clicks here?
        nextBtn.click();
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
        nextBtn.click();
        expect(prevBtn).to.not.have.class('-amp-disabled');
        expect(nextBtn).to.not.have.class('-amp-disabled');
      });
    });

    it('should not have any buttons visible when theres only a single ' +
       'item', () => {
      fixture.doc.body.classList.add('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 2).then(() => {
        let amp = fixture.doc.querySelector('#carousel-2');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });

    it('(type=slides) should not have any buttons visible when theres ' +
       'only a single item', () => {
      fixture.doc.body.classList.add('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 5).then(() => {
        let amp = fixture.doc.querySelector('#slides-2');
        expect(fixture.doc.body).to.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
        expect(prevBtn).to.have.class('amp-disabled');
        expect(nextBtn).to.have.class('amp-disabled');
      });
    });
  });

  describe('when amp-mode-mouse class is not on body', () => {

    it('should not have the buttons visible', () => {
      fixture.doc.body.classList.remove('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 1).then(() => {
        let amp = fixture.doc.querySelector('#carousel-1');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
      });
    });

    it('(type=slides) should not have the buttons visible', () => {
      fixture.doc.body.classList.remove('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 4).then(() => {
        let amp = fixture.doc.querySelector('#slides-1');
        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.hidden;
      });
    });
  });

  describe('when amp-carousel has explicit `controls` attribute', () => {

    it('should have visible buttons even when `amp-mode-mouse` ' +
       'is not on body', () => {
      fixture.doc.body.classList.remove('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 3).then(() => {
        let amp = fixture.doc.querySelector('#carousel-3');

        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');
        expect(amp).to.have.attribute('controls');
        expect(amp).to.have.class('-amp-carousel-has-controls');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });

    it('(type=slides) should have visible buttons even when `amp-mode-mouse`' +
       ' is not on body', () => {
      fixture.doc.body.classList.remove('amp-mode-mouse');
      return fixture.awaitEvent('amp:load:start', 6).then(() => {
        let amp = fixture.doc.querySelector('#slides-3');

        expect(fixture.doc.body).to.not.have.class('amp-mode-mouse');
        expect(amp).to.have.attribute('controls');
        expect(amp).to.have.class('-amp-carousel-has-controls');

        let prevBtn = amp.querySelector('.amp-carousel-button-prev');
        let nextBtn = amp.querySelector('.amp-carousel-button-next');
        expect(prevBtn).to.be.hidden;
        expect(nextBtn).to.be.visible;
      });
    });
  });
});

