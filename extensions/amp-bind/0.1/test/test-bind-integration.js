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

import '../../../amp-carousel/0.1/amp-carousel';
import {createFixtureIframe} from '../../../../testing/iframe';
import {bindForDoc} from '../../../../src/services';
import {ampdocServiceFor} from '../../../../src/ampdoc';

describe.configure().retryOnSaucelabs().run('amp-bind', function() {
  const fixtureLocation = 'test/fixtures/amp-bind-integrations.html';

  let fixture;
  let ampdoc;

  this.timeout(5000);

  beforeEach(() => {
    return createFixtureIframe(fixtureLocation).then(f => {
      fixture = f;
      return waitForEvent('amp:bind:initialize');
    }).then(() => {
      const ampdocService = ampdocServiceFor(fixture.win);
      ampdoc = ampdocService.getAmpDoc(fixture.doc);
    });
  });

  /**
   * @param {string} name
   * @return {!Promise}
   */
  function waitForEvent(name) {
    return new Promise(resolve => {
      function callback() {
        resolve();
        fixture.win.removeEventListener(name, callback);
      };
      fixture.win.addEventListener(name, callback);
    });
  }

  /** @return {!Promise} */
  function waitForBindApplication() {
    // Bind should be available, but need to wait for actions to resolve
    // service promise for bind and call setState.
    return bindForDoc(ampdoc).then(unusedBind =>
        waitForEvent('amp:bind:setState'));
  }

  /** @return {!Promise} */
  function waitForAllMutations() {
    return bindForDoc(ampdoc).then(unusedBind =>
        waitForEvent('amp:bind:mutated'));
  }

  describe('detecting bindings under dynamic tags', () => {
    it('should NOT bind blacklisted attributes', () => {
      const dynamicTag = fixture.doc.getElementById('dynamicTag');
      const div = fixture.doc.createElement('div');
      div.innerHTML = '<p [onclick]="javascript:alert(document.cookie)" ' +
                         '[onmouseover]="javascript:alert()" ' +
                         '[style]="background=color:black"></p>';
      const textElement = div.firstElementChild;
      // for amp-live-list, dynamic element is <div items>, which is a child
      // of the list.
      dynamicTag.firstElementChild.appendChild(textElement);
      return waitForAllMutations().then(() => {
        // Force bind to apply bindings
        fixture.doc.getElementById('triggerBindApplicationButton').click();
        return waitForBindApplication();
      }).then(() => {
        expect(textElement.getAttribute('onclick')).to.be.null;
        expect(textElement.getAttribute('onmouseover')).to.be.null;
        expect(textElement.getAttribute('style')).to.be.null;
      });
    });

    it('should NOT allow unsecure attribute values', () => {
      const div = fixture.doc.createElement('div');
      div.innerHTML = '<a [href]="javascript:alert(1)"></a>';
      const aElement = div.firstElementChild;
      const dynamicTag = fixture.doc.getElementById('dynamicTag');
      dynamicTag.firstElementChild.appendChild(aElement);
      return waitForAllMutations().then(() => {
        // Force bind to apply bindings
        fixture.doc.getElementById('triggerBindApplicationButton').click();
        return waitForBindApplication();
      }).then(() => {
        expect(aElement.getAttribute('href')).to.be.null;
      });
    });
  });

  describe('text integration', () => {
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

  describe('input integration', () => {
    it('should update dependent bindings on range input changes', () => {
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

    it('should update dependent bindings on checkbox input changes', () => {
      const checkboxText = fixture.doc.getElementById('checkboxText');
      const checkbox = fixture.doc.getElementById('checkbox');
      expect(checkboxText.textContent).to.equal('Unbound');
      checkbox.click();
      return waitForBindApplication().then(() => {
        expect(checkboxText.textContent).to.equal('Checked: true');
      });
    });

    it('should update dependent bindings on radio input changes', () => {
      const radioText = fixture.doc.getElementById('radioText');
      const radio = fixture.doc.getElementById('radio');
      expect(radioText.textContent).to.equal('Unbound');
      radio.click();
      return waitForBindApplication().then(() => {
        expect(radioText.textContent).to.equal('Checked: true');
      });
    });
  });

  describe('amp-carousel integration', () => {
    it('should update dependent bindings on carousel slide changes', () => {
      const slideNum = fixture.doc.getElementById('slideNum');
      const carousel = fixture.doc.getElementById('carousel');
      const impl = carousel.implementation_;
      expect(slideNum.textContent).to.equal('0');
      impl.go(1, /* animate */ false);
      return waitForBindApplication().then(() => {
        expect(slideNum.textContent).to.equal('1');
      });
    });

    it('should change slides when the slide attribute binding changes', () => {
      const carousel = fixture.doc.getElementById('carousel');
      const button = fixture.doc.getElementById('goToSlide1Button');
      const impl = carousel.implementation_;
      // No previous slide as current slide is 0th side
      expect(impl.hasPrev()).to.be.false;
      button.click();
      return waitForBindApplication().then(() => {
        // Has previous slide since the index has changed
        expect(impl.hasPrev()).to.be.true;
      });
    });
  });

  describe('amp-img integration', () => {
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

  describe('amp-live-list integration', () => {
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
          `<div items>` +
          ` <div id="newItem" data-sort-time=${Date.now()}>` +
          `    <p [text]="liveListText">unbound</p>` +
          ` </div>` +
          `</div>`;
      impl.update(update);
      fixture.doc.getElementById('liveListUpdateButton').click();

      let newItem;
      return waitForAllMutations().then(() => {
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

  describe('amp-selector integration', () => {
    it('should update dependent bindings when selection changes', () => {
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

  describe('amp-video integration', () => {
    it('should change src when the src attribute binding changes', () => {
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

  describe('amp-youtube', () => {
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

  describe('amp-brightcove', () => {
    it('should support binding to data-account', () => {
      const button = fixture.doc.getElementById('brightcoveButton');
      const bc = fixture.doc.getElementById('brightcove');
      // Force layout in case element is not in viewport.
      bc.implementation_.layoutCallback();
      const iframe = bc.querySelector('iframe');
      expect(iframe.src).to.not.contain('bound');
      button.click();
      return waitForBindApplication().then(() => {
        expect(iframe.src).to.contain('bound');
      });
    });
  });

  describe('amp-iframe', () => {
    it('should support binding to src', () => {
      const button = fixture.doc.getElementById('iframeButton');
      const ampIframe = fixture.doc.getElementById('ampIframe');
      // Force layout in case element is not in viewport.
      ampIframe.implementation_.layoutCallback();
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
});
