/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {batchedXhrFor} from '../../src/services';
import * as sinon from 'sinon';

describe.configure().retryOnSaucelabs().run('amp-bind', function() {
  let fixture;
  let sandbox;
  let numSetStates;
  let numTemplated;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    numSetStates = 0;
    numTemplated = 0;
  });

  afterEach(() => {
    sandbox.restore();
  });

  /**
   * @param {string} fixtureLocation
   * @param {number=} opt_numberOfAmpElements
   * @return {!Promise}
   */
  function setupWithFixture(fixtureLocation, opt_numberOfAmpElements) {
    return createFixtureIframe(fixtureLocation).then(f => {
      fixture = f;
      // Most fixtures have a single AMP element that will be laid out.
      const loadStartsToExpect =
          (opt_numberOfAmpElements === undefined) ? 1 : opt_numberOfAmpElements;
      return Promise.all([
        fixture.awaitEvent('amp:bind:initialize', 1),
        fixture.awaitEvent('amp:load:start', loadStartsToExpect),
      ]);
    });
  }

  /** @return {!Promise} */
  function waitForBindApplication() {
    return fixture.awaitEvent('amp:bind:setState', ++numSetStates);
  }

  /** @return {!Promise} */
  function waitForTemplateRescan() {
    return fixture.awaitEvent('amp:bind:rescan-template', ++numTemplated);
  }

  describe('with [text] and [class]', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-basic.html');
    });

    it('should update text when text attribute binding changes', () => {
      const textElement = fixture.doc.getElementById('textElement');
      const button = fixture.doc.getElementById('changeTextButton');
      expect(textElement.textContent).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.textContent).to.equal('hello world');
      });
    });

    it('should update CSS class when class binding changes', () => {
      const textElement = fixture.doc.getElementById('textElement');
      const button = fixture.doc.getElementById('changeTextClassButton');
      expect(textElement.className).to.equal('original');
      button.click();
      return waitForBindApplication().then(() => {
        expect(textElement.className).to.equal('new');
      });
    });
  });

  // TODO(choumx, #9759): Seems like old browsers give up when hitting expected
  // user errors due to illegal bindings in the form's template.
  describe.configure().ifChrome().run('with <amp-form>', () => {
    beforeEach(() => {
      // <form> is not an AMP element.
      return setupWithFixture('test/fixtures/bind-form.html', 0)
          // Wait for AmpFormService to register <form> elements.
          .then(() => fixture.awaitEvent('amp:form-service:initialize', 1));
    });

    it('should NOT allow invalid bindings or values', () => {
      const xhrText = fixture.doc.getElementById('xhrText');
      const templatedText = fixture.doc.getElementById('templatedText');
      const illegalHref = fixture.doc.getElementById('illegalHref');
      const submitButton = fixture.doc.getElementById('submitButton');

      expect(xhrText.textContent).to.equal('');
      expect(illegalHref.getAttribute('href')).to.be.null;
      expect(templatedText.getAttribute('onclick')).to.be.null;
      expect(templatedText.getAttribute('onmouseover')).to.be.null;
      expect(templatedText.getAttribute('style')).to.be.null;
      expect(templatedText.textContent).to.equal('');

      submitButton.click();

      // The <amp-form> has on="submit-success:AMP.setState(...)".
      return waitForBindApplication().then(() => {
        // References to XHR JSON data should work on submit-success.
        expect(xhrText.textContent).to.equal('John Miller');
        // Illegal bindings/values should not be applied to DOM.
        expect(illegalHref.getAttribute('href')).to.be.null;
        expect(templatedText.getAttribute('onclick')).to.be.null;
        expect(templatedText.getAttribute('onmouseover')).to.be.null;
        expect(templatedText.getAttribute('style')).to.be.null;
        // [text] is ok.
        expect(templatedText.textContent).to.equal('textIsLegal');
      });
    });
  });

  describe('with <input>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-basic.html');
    });

    it('should update on range input changes', () => {
      const rangeText = fixture.doc.getElementById('rangeText');
      const range = fixture.doc.getElementById('range');
      expect(rangeText.textContent).to.equal('Unbound');
      // Calling #click() the range will not generate a change event
      // so it must be generated manually.
      range.value = 47;
      range.dispatchEvent(new Event('change', {bubbles: true}));
      return waitForBindApplication().then(() => {
        expect(rangeText.textContent).to.equal('0 <= 47 <= 100');
      });
    });

    it('should update on checkbox input changes', () => {
      const checkboxText = fixture.doc.getElementById('checkboxText');
      const checkbox = fixture.doc.getElementById('checkbox');
      expect(checkboxText.textContent).to.equal('Unbound');
      checkbox.click();
      return waitForBindApplication().then(() => {
        expect(checkboxText.textContent).to.equal('Checked: true');
      });
    });

    it('should update input[checked] when its binding changes', () => {
      // Does *NOT* have the `checked` attribute.
      const checkbox = fixture.doc.getElementById('checkedBound');
      const button = fixture.doc.getElementById('toggleCheckedButton');
      // Some attributes on certain input elements, such as `checked` on
      // checkbox, only specify an initial value. Clicking the checkbox
      // ensures the element is no longer relying on `value` as
      // an initial value.
      checkbox.click();
      expect(checkbox.hasAttribute('checked')).to.be.false;
      expect(checkbox.checked).to.be.true;
      button.click();
      return waitForBindApplication().then(() => {
        expect(checkbox.hasAttribute('checked')).to.be.false;
        expect(checkbox.checked).to.be.false;
        button.click();
        return waitForBindApplication();
      }).then(() => {
        // When Bind checks the box back to true, it adds the checked attr.
        expect(checkbox.hasAttribute('checked')).to.be.true;
        expect(checkbox.checked).to.be.true;
      });
    });

    it('should update on radio input changes', () => {
      const radioText = fixture.doc.getElementById('radioText');
      const radio = fixture.doc.getElementById('radio');
      expect(radioText.textContent).to.equal('Unbound');
      radio.click();
      return waitForBindApplication().then(() => {
        expect(radioText.textContent).to.equal('Checked: true');
      });
    });
  });

  // TODO(choumx): Flaky on Edge/Firefox for some reason.
  describe.configure().ifChrome().run('with <amp-carousel>', () => {
    beforeEach(() => {
      // One <amp-carousel> plus two <amp-img> elements.
      return setupWithFixture('test/fixtures/bind-carousel.html', 3);
    });

    it('should update on carousel slide changes', () => {
      const slideNumber = fixture.doc.getElementById('slideNumber');
      expect(slideNumber.textContent).to.equal('0');

      const carousel = fixture.doc.getElementById('carousel');
      const nextSlideButton =
          carousel.querySelector('div.amp-carousel-button-next');
      nextSlideButton.click();

      return waitForBindApplication().then(() => {
        expect(slideNumber.textContent).to.equal('1');
      });
    });

    it('should change slides when the slide attribute binding changes', () => {
      const carousel = fixture.doc.getElementById('carousel');
      const slides =
          carousel.querySelectorAll('.i-amphtml-slide-item > amp-img');
      const firstSlide = slides[0];
      const secondSlide = slides[1];

      expect(firstSlide.getAttribute('aria-hidden')).to.equal('false');
      expect(secondSlide.getAttribute('aria-hidden')).to.be.equal('true');

      const button = fixture.doc.getElementById('goToSlideOne');
      button.click();

      return waitForBindApplication().then(() => {
        expect(secondSlide.getAttribute('aria-hidden')).to.be.equal('false');
        expect(firstSlide.getAttribute('aria-hidden')).to.equal('true');
      });
    });
  });

  describe('with <amp-img>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-basic.html');
    });

    it('should change src when the src attribute binding changes', () => {
      const button = fixture.doc.getElementById('changeImgSrcButton');
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('src')).to.equal('http://www.google.com/image1');
      button.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to
            .equal('http://www.google.com/image2');
      });
    });

    it('should NOT change src when new value is a blocked URL', () => {
      const button = fixture.doc.getElementById('invalidSrcButton');
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('src')).to.equal('http://www.google.com/image1');
      button.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to
            .equal('http://www.google.com/image1');
      });
    });

    it('should NOT change src when new value uses an invalid protocol', () => {
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('src')).to.equal('http://www.google.com/image1');
      const ftpSrcButton = fixture.doc.getElementById('ftpSrcButton');
      ftpSrcButton.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('src')).to.equal('http://www.google.com/image1');
        const telSrcButton = fixture.doc.getElementById('telSrcButton');
        telSrcButton.click();
        return waitForBindApplication();
      }).then(() => {
        expect(img.getAttribute('src')).to
            .equal('http://www.google.com/image1');
      });
    });

    it('should change alt when the alt attribute binding changes', () => {
      const button = fixture.doc.getElementById('changeImgAltButton');
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('alt')).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('alt')).to.equal('hello world');
      });
    });

    it('should change width and height when their bindings change', () => {
      const button = fixture.doc.getElementById('changeImgDimensButton');
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('height')).to.equal('200');
      expect(img.getAttribute('width')).to.equal('200');
      button.click();
      return waitForBindApplication().then(() => {
        expect(img.getAttribute('height')).to.equal('300');
        expect(img.getAttribute('width')).to.equal('300');
      });
    });
  });

  describe('with <amp-live-list>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-live-list.html');
    });

    it('should detect bindings in initial live-list elements', () => {
      const liveListItems = fixture.doc.getElementById('liveListItems');
      expect(liveListItems.children.length).to.equal(1);

      const liveListItem1 = fixture.doc.getElementById('liveListItem1');
      expect(liveListItem1.firstElementChild.textContent).to.equal('unbound');

      const button = fixture.doc.getElementById('changeLiveListTextButton');
      button.click();
      return waitForBindApplication().then(() => {
        expect(liveListItem1.firstElementChild.textContent).to
            .equal('hello world');
      });
    });

    it('should apply scope to bindings in new list items', () => {
      const liveList = fixture.doc.getElementById('liveList');
      const liveListItems = fixture.doc.getElementById('liveListItems');
      expect(liveListItems.children.length).to.equal(1);

      const existingItem = fixture.doc.getElementById('liveListItem1');
      expect(existingItem.firstElementChild.textContent).to.equal('unbound');

      const impl = liveList.implementation_;
      const update = document.createElement('div');
      update.innerHTML =
          '<div items>' +
          ` <div id="newItem" data-sort-time=${Date.now()}>` +
          '    <p [text]="liveListText">unbound</p>' +
          ' </div>' +
          '</div>';
      impl.update(update);
      fixture.doc.getElementById('liveListUpdateButton').click();

      let newItem;
      return waitForTemplateRescan().then(() => {
        expect(liveListItems.children.length).to.equal(2);
        newItem = fixture.doc.getElementById('newItem');
        fixture.doc.getElementById('changeLiveListTextButton').click();
        return waitForBindApplication();
      }).then(() => {
        expect(existingItem.firstElementChild.textContent).to
            .equal('hello world');
        expect(newItem.firstElementChild.textContent).to
            .equal('hello world');
      });
    });
  });

  describe('with <amp-selector>', () => {
    beforeEach(() => {
      // One <amp-selector> and three <amp-img> elements.
      return setupWithFixture('test/fixtures/bind-selector.html', 4);
    });

    it('should update when selection changes', () => {
      const selectionText = fixture.doc.getElementById('selectionText');
      const img1 = fixture.doc.getElementById('selectorImg1');
      const img2 = fixture.doc.getElementById('selectorImg2');
      const img3 = fixture.doc.getElementById('selectorImg3');
      expect(img1.hasAttribute('selected')).to.be.false;
      expect(img2.hasAttribute('selected')).to.be.false;
      expect(img3.hasAttribute('selected')).to.be.false;
      expect(selectionText.textContent).to.equal('None');
      img2.click();
      return waitForBindApplication().then(() => {
        expect(img1.hasAttribute('selected')).to.be.false;
        expect(img2.hasAttribute('selected')).to.be.true;
        expect(img3.hasAttribute('selected')).to.be.false;
        expect(selectionText.textContent).to.equal('2');
      });
    });

    it('should update selection when bound value for selected changes', () => {
      const button = fixture.doc.getElementById('changeSelectionButton');
      const selectionText = fixture.doc.getElementById('selectionText');
      const img1 = fixture.doc.getElementById('selectorImg1');
      const img2 = fixture.doc.getElementById('selectorImg2');
      const img3 = fixture.doc.getElementById('selectorImg3');
      expect(img1.hasAttribute('selected')).to.be.false;
      expect(img2.hasAttribute('selected')).to.be.false;
      expect(img3.hasAttribute('selected')).to.be.false;
      expect(selectionText.textContent).to.equal('None');
      // Changes selection to 2
      button.click();
      return waitForBindApplication().then(() => {
        expect(img1.hasAttribute('selected')).to.be.false;
        expect(img2.hasAttribute('selected')).to.be.true;
        expect(img3.hasAttribute('selected')).to.be.false;
        expect(selectionText.textContent).to.equal('2');
      });
    });
  });

  describe('with <amp-video>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-video.html');
    });

    it('should support binding to src', () => {
      const button = fixture.doc.getElementById('changeVidSrcButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.getAttribute('src')).to
          .equal('https://www.google.com/unbound.webm');
      button.click();
      return waitForBindApplication().then(() => {
        expect(vid.getAttribute('src')).to
            .equal('https://www.google.com/bound.webm');
      });
    });

    it('should NOT change src when new value is a blocked URL', () => {
      const button = fixture.doc.getElementById('disallowedVidUrlButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.getAttribute('src')).to
          .equal('https://www.google.com/unbound.webm');;
      button.click();
      return waitForBindApplication().then(() => {
        expect(vid.getAttribute('src')).to
            .equal('https://www.google.com/unbound.webm');
      });
    });

    it('should NOT change src when new value uses an invalid protocol', () => {
      const button = fixture.doc.getElementById('httpVidSrcButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.getAttribute('src')).to
          .equal('https://www.google.com/unbound.webm');
      button.click();
      return waitForBindApplication().then(() => {
        // Only HTTPS is allowed
        expect(vid.getAttribute('src')).to
            .equal('https://www.google.com/unbound.webm');
      });
    });

    it('should change alt when the alt attribute binding changes', () => {
      const button = fixture.doc.getElementById('changeVidAltButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.getAttribute('alt')).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(vid.getAttribute('alt')).to.equal('hello world');
      });
    });

    it('should show/hide vid controls when the control binding changes', () => {
      const showControlsButton =
          fixture.doc.getElementById('showVidControlsButton');
      const hideControlsButton =
          fixture.doc.getElementById('hideVidControlsButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.hasAttribute('controls')).to.be.false;
      showControlsButton.click();
      return waitForBindApplication().then(() => {
        expect(vid.hasAttribute('controls')).to.be.true;
        hideControlsButton.click();
        return waitForBindApplication();
      }).then(() => {
        expect(vid.hasAttribute('controls')).to.be.false;
      });
    });
  });

  describe('with <amp-youtube>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-youtube.html');
    });

    it('should support binding to data-video-id', () => {
      const button = fixture.doc.getElementById('youtubeButton');
      const yt = fixture.doc.getElementById('youtube');
      expect(yt.getAttribute('data-videoid')).to.equal('unbound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(yt.getAttribute('data-videoid')).to.equal('bound');
      });
    });
  });

  describe('with <amp-brightcove>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-brightcove.html');
    });

    it('should support binding to data-account', () => {
      const button = fixture.doc.getElementById('brightcoveButton');
      const bc = fixture.doc.getElementById('brightcove');
      const iframe = bc.querySelector('iframe');
      expect(iframe.src).to.not.contain('bound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(iframe.src).to.contain('bound');
      });
    });
  });

  describe('with <amp-iframe>', () => {
    beforeEach(() => {
      // <amp-iframe> and its placeholder <amp-img>.
      return setupWithFixture('test/fixtures/bind-iframe.html', 2);
    });

    it('should support binding to src', () => {
      const button = fixture.doc.getElementById('iframeButton');
      const ampIframe = fixture.doc.getElementById('ampIframe');
      const iframe = ampIframe.querySelector('iframe');
      const newSrc = 'https://giphy.com/embed/DKG1OhBUmxL4Q';
      expect(ampIframe.getAttribute('src')).to.not.contain(newSrc);
      expect(iframe.src).to.not.contain(newSrc);
      button.click();
      return waitForBindApplication().then(() => {
        expect(ampIframe.getAttribute('src')).to.contain(newSrc);
        expect(iframe.src).to.contain(newSrc);
      });
    });
  });

  describe('with <amp-list>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-list.html');
    });

    it('should support binding to src', () => {
      const button = fixture.doc.getElementById('listSrcButton');
      const list = fixture.doc.getElementById('list');
      expect(list.getAttribute('src'))
          .to.equal('https://www.google.com/unbound.json');
      button.click();
      return waitForBindApplication().then(() => {
        expect(list.getAttribute('src'))
            .to.equal('https://www.google.com/bound.json');
      });
    });

    it('should NOT change src when new value uses an invalid protocol', () => {
      const button = fixture.doc.getElementById('httpListSrcButton');
      const list = fixture.doc.getElementById('list');
      expect(list.getAttribute('src'))
          .to.equal('https://www.google.com/unbound.json');
      button.click();
      return waitForBindApplication().then(() => {
        expect(list.getAttribute('src'))
            .to.equal('https://www.google.com/unbound.json');
      });
    });
  });

  describe('with <amp-state>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-basic.html');
    });

    it('should not loop infinitely if updates change its src binding', () => {
      const changeAmpStateSrcButton =
          fixture.doc.getElementById('ampStateSrcButton');
      const triggerBindApplicationButton =
          fixture.doc.getElementById('triggerBindApplicationButton');
      const ampState = fixture.doc.getElementById('ampState');
      const batchedXhr = batchedXhrFor(fixture.win);
      // Stub XHR for endpoint such that it returns state that would point
      // the amp-state element back to its original source.
      sandbox.stub(batchedXhr, 'fetchJson')
          .withArgs(
              'https://www.google.com/bind/second/source',
              sinon.match.any)
          .returns(Promise.resolve({
            json() {
              return Promise.resolve({
                stateSrc: 'https://www.google.com/bind/first/source',
              });
            },
          }));
      // Changes amp-state's src from .../first/source to .../second/source.
      changeAmpStateSrcButton.click();
      return waitForBindApplication().then(() => {
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/second/source');
        // Wait for XHR to finish and for bind to re-apply bindings.
        return waitForBindApplication();
      }).then(() => {
        // bind applications caused by an amp-state mutation SHOULD NOT update
        // src attributes on amp-state elements.
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/second/source');
        // Trigger a bind apply that isn't from an amp-state
        triggerBindApplicationButton.click();
        return waitForBindApplication();
      }).then(() => {
        // Now that a non-amp-state mutation has ocurred, the amp-state's src
        // attribute can be updated with the new src from the XHR.
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/first/source');
      });
    });
  });
});
