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
import {BindEvents} from '../../extensions/amp-bind/0.1/bind-events';
import {BrowserController} from '../../testing/test-helper';
import {FormEvents} from '../../extensions/amp-form/0.1/form-events';
import {Services} from '../../src/services';
import {poll as classicPoll, createFixtureIframe} from '../../testing/iframe';

// Skip Edge, which throws "Permission denied" errors when inspecting
// element properties in the testing iframe (Edge 17, Windows 10).
describe.configure().skipEdge().run('amp-bind', function() {
  // Give more than default 2000ms timeout for local testing.
  const TIMEOUT = Math.max(window.ampTestRuntimeConfig.mochaTimeout, 4000);
  this.timeout(TIMEOUT);

  function poll(desc, condition, onError) {
    return classicPoll(desc, condition, onError, TIMEOUT);
  }

  describes.integration('basic', {
    /* eslint-disable max-len */
    body: `
      <button on="tap:AMP.setState({t: 'after_text'})" id="changeText"></button>
      <button on="tap:AMP.setState({c: 'after_class'})" id="changeClass"></button>
      <p class="before_class" [class]="c" [text]="t">before_text</p>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-bind'],
  }, env => {
    let browser;
    let doc;
    let text;

    beforeEach(() => {
      doc = env.win.document;
      text = doc.querySelector('p');
      browser = new BrowserController(env.win);
    });

    it('[text]', function*() {
      expect(text.textContent).to.equal('before_text');
      yield browser.wait(200);
      browser.click('#changeText');
      yield poll('[text]', () => text.textContent === 'after_text');
    });

    it('[class]', function*() {
      expect(text.className).to.equal('before_class');
      yield browser.wait(200);
      browser.click('#changeClass');
      yield poll('[class]', () => text.className === 'after_class');
    });
  });

  describes.integration('+ amp-img', {
    body: `
      <amp-img id="image" layout="responsive"
        src="http://example.com/before.jpg" [src]="src"
        alt="before_alt" [alt]="alt"
        width="1" [width]="w"
        height="1" [height]="h"></amp-img>

      <button on="tap:AMP.setState({src: 'http://example.com/after.jpg'})" id="changeSrc"></button>
      <button on="tap:AMP.setState({alt: 'after_alt'})" id="changeAlt"></button>
      <button on="tap:AMP.setState({w: 2, h: 2})" id="changeSize"></button>
    `,
    extensions: ['amp-bind'],
  }, env => {
    let doc, img;

    beforeEach(() => {
      doc = env.win.document;
      img = doc.querySelector('amp-img');
    });

    it('[src] with valid URL', () => {
      const button = doc.getElementById('changeSrc');
      expect(img.getAttribute('src')).to.equal('http://example.com/before.jpg');
      button.click();
      return poll('[src]',
          () => img.getAttribute('src') === 'http://example.com/after.jpg');
    });

    it('[alt]', () => {
      const button = doc.getElementById('changeAlt');
      expect(img.getAttribute('alt')).to.equal('before_alt');
      button.click();
      return poll('[src]', () => img.getAttribute('alt') === 'after_alt');
    });

    it('[width] and [height]', () => {
      const button = doc.getElementById('changeSize');
      expect(img.getAttribute('width')).to.equal('1');
      expect(img.getAttribute('height')).to.equal('1');
      button.click();
      return Promise.all([
        poll('[width]', () => img.getAttribute('width') === '2'),
        poll('[height]', () => img.getAttribute('height') === '2'),
      ]);
    });
  });

  describes.integration('+ forms', {
    /* eslint-disable max-len */
    body: `
      <input type="range" min=0 max=100 value=0 on="change:AMP.setState({rangeChange: event})">
      <p id="range" [text]="rangeChange.min + ' <= ' + rangeChange.value + ' <= ' + rangeChange.max">before_range</p>

      <input type="checkbox" on="change:AMP.setState({checkboxChange: event})" [checked]="isChecked">
      <p id="checkbox" [text]="'checked: ' + checkboxChange.checked" id="checkboxText">before_check</p>
      <button on="tap:AMP.setState({isChecked: isChecked != null ? !isChecked : false})"></button>

      <input type="radio" on="change:AMP.setState({radioChange: event})">
      <p id="radio" [text]="'checked: ' + radioChange.checked" id="radioText">before_radio</p>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-bind'],
  }, env => {
    let doc;

    beforeEach(() => {
      doc = env.win.document;
    });

    it('input[type=range] on:change', () => {
      const rangeText = doc.getElementById('range');
      const range = doc.querySelector('input[type="range"]');
      expect(rangeText.textContent).to.equal('before_range');
      // Calling #click() on the range element will not generate a change event,
      // so it must be generated manually.
      range.value = 47;
      range.dispatchEvent(new Event('change', {bubbles: true}));
      poll('[text]', () => rangeText.textContent === '0 <= 47 <= 100');
    });

    it('input[type=checkbox] on:change', () => {
      const checkboxText = doc.getElementById('checkbox');
      const checkbox = doc.querySelector('input[type="checkbox"]');
      expect(checkboxText.textContent).to.equal('before_check');
      checkbox.click();
      poll('[text]', () => checkboxText.textContent === 'checked: true');
    });

    it('[checked]', function*() {
      const checkbox = doc.querySelector('input[type="checkbox"]');
      const button = doc.querySelector('button');

      checkbox.click();
      // Note that attributes are initial values, properties are current values.
      expect(checkbox.hasAttribute('checked')).to.be.false;
      expect(checkbox.checked).to.be.true;

      button.click();
      yield poll('[checked]', () => !checkbox.checked);
      expect(checkbox.hasAttribute('checked')).to.be.false;

      button.click();
      yield poll('[checked]', () => checkbox.checked);
      // amp-bind sets both the attribute and property.
      expect(checkbox.hasAttribute('checked')).to.be.true;
    });

    it('input[type=radio] on:change', () => {
      const radioText = doc.getElementById('radio');
      const radio = doc.querySelector('input[type="radio"]');
      expect(radioText.textContent).to.equal('before_radio');
      radio.click();
      poll('[text]', () => radioText.textContent === 'checked: true');
    });
  });

  describes.integration('+ amp-carousel', {
    /* eslint-disable max-len */
    body: `
      <button on="tap:AMP.setState({slide: 1})" id="goToSlideOne"></button>
      <p [text]="slide">0</p>
      <amp-carousel type="slides" width=10 height=10
          on="slideChange:AMP.setState({slide: event.index})" [slide]="slide">
        <amp-img src="http://example.com/foo.jpg" width=10 height=10></amp-img>
        <amp-img src="http://example.com/bar.jpg" width=10 height=10></amp-img>
      </amp-carousel>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-bind', 'amp-carousel'],
  }, env => {
    let doc, carousel, slideText;

    beforeEach(() => {
      doc = env.win.document;
      carousel = doc.querySelector('amp-carousel');
      slideText = doc.querySelector('p');

      const browserController = new BrowserController(env.win);
      return browserController.waitForElementLayout('amp-carousel');
    });

    it('on:slideChange', () => {
      expect(slideText.textContent).to.equal('0');

      const nextSlide = carousel.querySelector('div.amp-carousel-button-next');
      nextSlide.click();
      return poll('[slide]', () => slideText.textContent === '1');
    });

    it('[slide]', function*() {
      const slides = carousel.querySelectorAll(
          '.i-amphtml-slide-item > amp-img');
      const first = slides[0];
      const second = slides[1];

      expect(first.getAttribute('aria-hidden')).to.equal('false');
      expect(second.getAttribute('aria-hidden')).to.be.equal('true');

      const button = doc.getElementById('goToSlideOne');
      button.click();

      yield poll('[slide]', () =>
        first.getAttribute('aria-hidden') === 'true');
      yield poll('[slide]', () =>
        second.getAttribute('aria-hidden') === 'false');
    });
  });

  /* eslint-disable max-len */
  const list = `
    <amp-state id="foo">
      <script type="application/json">
        {"bar": "123"}
      </script>
    </amp-state>
    <button on="tap:AMP.setState({src: 'https://example.com/data'})"></button>
    <amp-list width=200 height=50 template=mustache src="/list/fruit-data/get?cors=0" [src]="src">
    </amp-list>
    <template id=mustache type="amp-mustache">
      <p [text]="foo.bar"></p>
    </template>
  `;
  /* eslint-enable max-len */

  const listTests = env => {
    let doc;
    let list;
    let browser;

    beforeEach(() => {
      doc = env.win.document;
      list = doc.querySelector('amp-list');
      browser = new BrowserController(env.win);
    });

    it('[src]', () => {
      expect(list.getAttribute('src')).to.equal('/list/fruit-data/get?cors=0');
      browser.click('button');
      poll('[src]', () =>
        list.getAttribute('src') === 'https://example.com/data');
    });

    it('evaluate bindings in children', function*() {
      yield browser.waitForElementLayout('amp-list');
      const children = list.querySelectorAll('p');
      expect(children.length).to.equal(3);
      children.forEach(span => {
        expect(span.textContent).to.equal('123');
      });
    });
  };

  // TODO(choumx): amp-mustache-0.1 is broken on --single_pass.
  // describes.integration('+ amp-list, amp-mustache:0.1', {
  //   body: list,
  //   extensions: ['amp-bind', 'amp-list', 'amp-mustache:0.1'],
  // }, listTests);

  describes.integration('+ amp-list, amp-mustache:0.2', {
    body: list,
    extensions: ['amp-bind', 'amp-list', 'amp-mustache:0.2'],
  }, listTests);

  describes.integration('+ amp-selector', {
    /* eslint-disable max-len */
    body: `
      <button on="tap:AMP.setState({selected: 2})"></button>
      <p [text]="selected"></p>
      <amp-selector layout="container" [selected]="selected" on="select:AMP.setState({selected: event.targetOption})">
        <amp-img src="/0.jpg" width=10 height=10 option=0></amp-img>
        <amp-img src="/1.jpg" width=10 height=10 option=1></amp-img>
        <amp-img src="/2.jpg" width=10 height=10 option=2></amp-img>
      </amp-selector>
    `,
    /* eslint-enable max-len */
    extensions: ['amp-bind', 'amp-selector'],
  }, env => {
    let doc, images, selectedText;

    beforeEach(() => {
      doc = env.win.document;
      images = doc.getElementsByTagName('amp-img');
      selectedText = doc.querySelector('p');

      const browserController = new BrowserController(env.win);
      return browserController.waitForElementLayout('amp-selector');
    });

    it('on:select', function*() {
      expect(images[0].hasAttribute('selected')).to.be.false;
      expect(images[1].hasAttribute('selected')).to.be.false;
      expect(images[2].hasAttribute('selected')).to.be.false;
      expect(selectedText.textContent).to.equal('');
      images[1].click();
      yield poll('[text]', () => selectedText.textContent === '1');
      expect(images[0].hasAttribute('selected')).to.be.false;
      expect(images[1].hasAttribute('selected')).to.be.true;
      expect(images[2].hasAttribute('selected')).to.be.false;
    });

    it('[selected]', function*() {
      const button = doc.querySelector('button');
      expect(images[0].hasAttribute('selected')).to.be.false;
      expect(images[1].hasAttribute('selected')).to.be.false;
      expect(images[2].hasAttribute('selected')).to.be.false;
      expect(selectedText.textContent).to.equal('');
      button.click();
      yield poll('[text]', () => selectedText.textContent === '2');
      expect(images[0].hasAttribute('selected')).to.be.false;
      expect(images[1].hasAttribute('selected')).to.be.false;
      expect(images[2].hasAttribute('selected')).to.be.true;
    });
  });
});

// TODO(choumx): Rewrite/unskip the remaining tests.
describe.skip('amp-bind', function() {
  // Give more than default 2000ms timeout for local testing.
  const TIMEOUT = Math.max(window.ampTestRuntimeConfig.mochaTimeout, 4000);
  this.timeout(TIMEOUT);

  let fixture;
  let sandbox;
  let numSetStates;
  let numTemplated;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    numSetStates = 0;
    numTemplated = 0;
  });

  afterEach(() => {
    fixture = null;
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
      const numberOfAmpComponents =
          (opt_numberOfAmpElements === undefined) ? 1 : opt_numberOfAmpElements;
      const promises = [
        fixture.awaitEvent(BindEvents.INITIALIZE, 1),
      ];
      if (numberOfAmpComponents > 0) {
        promises.push(
            classicPoll('All AMP components are laid out', () => {
              const laidOutElements =
                  fixture.doc.querySelectorAll('.i-amphtml-layout').length;
              return laidOutElements === numberOfAmpComponents;
            })
        );
      }
      return Promise.all(promises);
    });
  }

  /** @return {!Promise} */
  function waitForSetState() {
    // Bind should be available, but need to wait for actions to resolve
    // service promise for bind and call setState.
    return fixture.awaitEvent(BindEvents.SET_STATE, ++numSetStates);
  }

  /** @return {!Promise} */
  function waitForTemplateRescan() {
    return fixture.awaitEvent(BindEvents.RESCAN_TEMPLATE, ++numTemplated);
  }

  describe('with <amp-form>', () => {
    beforeEach(() => {
      // <form> is not an AMP element.
      return setupWithFixture('test/fixtures/bind-form.html', 0)
          // Wait for AmpFormService to register <form> elements.
          .then(() => fixture.awaitEvent(FormEvents.SERVICE_INIT, 1));
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
      return waitForSetState().then(() => {
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

  describe('with <amp-live-list>', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-live-list.html');
    });

    it('should detect bindings in initial live-list elements', () => {
      const liveListItems = fixture.doc.getElementById('liveListItems');
      expect(liveListItems.children.length).to.equal(1);

      const liveListItem1 = fixture.doc.getElementById('liveListItem1');
      expect(liveListItem1.firstElementChild.textContent).to.equal(
          'unbound');

      const button = fixture.doc.getElementById('changeLiveListTextButton');
      button.click();
      return waitForSetState().then(() => {
        expect(liveListItem1.firstElementChild.textContent).to
            .equal('hello world');
      });
    });

    it('should apply scope to bindings in new list items', () => {
      const liveList = fixture.doc.getElementById('liveList');
      const liveListItems = fixture.doc.getElementById('liveListItems');
      expect(liveListItems.children.length).to.equal(1);

      const existingItem = fixture.doc.getElementById('liveListItem1');
      expect(existingItem.firstElementChild.textContent).to.equal(
          'unbound');

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
        return waitForSetState();
      }).then(() => {
        expect(existingItem.firstElementChild.textContent).to
            .equal('hello world');
        expect(newItem.firstElementChild.textContent).to
            .equal('hello world');
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
      return waitForSetState().then(() => {
        expect(vid.getAttribute('src')).to
            .equal('https://www.google.com/bound.webm');
      });
    });

    it('should NOT change src when new value is a blocked URL', () => {
      const button = fixture.doc.getElementById('disallowedVidUrlButton');
      const vid = fixture.doc.getElementById('video');
      expect(vid.getAttribute('src')).to
          .equal('https://www.google.com/unbound.webm');
      button.click();
      return waitForSetState().then(() => {
        expect(vid.getAttribute('src')).to
            .equal('https://www.google.com/unbound.webm');
      });
    });

    it('should NOT change src when new value uses an invalid protocol',
        () => {
          const button = fixture.doc.getElementById('httpVidSrcButton');
          const vid = fixture.doc.getElementById('video');
          expect(vid.getAttribute('src')).to
              .equal('https://www.google.com/unbound.webm');
          button.click();
          return waitForSetState().then(() => {
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
      return waitForSetState().then(() => {
        expect(vid.getAttribute('alt')).to.equal('hello world');
      });
    });

    it('should show/hide vid controls when the control binding changes',
        () => {
          const showControlsButton =
          fixture.doc.getElementById('showVidControlsButton');
          const hideControlsButton =
          fixture.doc.getElementById('hideVidControlsButton');
          const vid = fixture.doc.getElementById('video');
          expect(vid.hasAttribute('controls')).to.be.false;
          showControlsButton.click();
          return waitForSetState().then(() => {
            expect(vid.hasAttribute('controls')).to.be.true;
            hideControlsButton.click();
            return waitForSetState();
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
      return waitForSetState().then(() => {
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
      return waitForSetState().then(() => {
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
      return waitForSetState().then(() => {
        expect(ampIframe.getAttribute('src')).to.contain(newSrc);
        expect(iframe.src).to.contain(newSrc);
      });
    });
  });

  describe.configure().skipIfPropertiesObfuscated().run('+ amp-state', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-basic.html', 0);
    });

    it('should not loop infinitely if updates change its src binding', () => {
      const {doc, win} = fixture;
      const changeAmpStateSrcButton = doc.getElementById('changeAmpStateSrc');
      const setState = doc.getElementById('setState');
      const ampState = doc.getElementById('ampState');
      const batchedXhr = Services.batchedXhrFor(win);
      // Stub XHR for endpoint such that it returns state that would
      // point the amp-state element back to its original source.
      sandbox.stub(batchedXhr, 'fetchJson')
          .withArgs(
              'https://www.google.com/bind/second/source', sinon.match.any)
          .returns(Promise.resolve({
            json() {
              return Promise.resolve({
                stateSrc: 'https://www.google.com/bind/first/source',
              });
            },
          }));
      // Changes amp-state's src from
      // .../first/source to .../second/source.
      changeAmpStateSrcButton.click();
      return waitForSetState().then(() => {
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/second/source');
        // Wait for XHR to finish and for bind to re-apply bindings.
        return waitForSetState();
      }).then(() => {
        // bind applications caused by an amp-state mutation SHOULD NOT
        // update src attributes on amp-state elements.
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/second/source');
        setState.click();
        return waitForSetState();
      }).then(() => {
        // Now that a non-amp-state mutation has ocurred, the
        // amp-state's src attribute can be updated with the new
        // src from the XHR.
        expect(ampState.getAttribute('src'))
            .to.equal('https://www.google.com/bind/first/source');
      });
    });
  });

  // The only difference in amp4email is that URL attributes cannot be bound.
  describe('amp4email', () => {
    beforeEach(() => {
      return setupWithFixture('test/fixtures/bind-amp4email.html');
    });

    it('should NOT allow mutation of a[href]', () => {
      const button = fixture.doc.getElementById('changeHrefButton');
      const a = fixture.doc.getElementById('anchorElement');
      expect(a.getAttribute('href')).to.equal('https://foo.com');
      button.click();
      return waitForSetState().then(() => {
        expect(a.getAttribute('href')).to.equal('https://foo.com');
      });
    });

    it('should NOT allow mutation of img[src]', () => {
      const button = fixture.doc.getElementById('changeImgSrcButton');
      const img = fixture.doc.getElementById('image');
      expect(img.getAttribute('src')).to.equal('https://foo.com/foo.jpg');
      button.click();
      return waitForSetState().then(() => {
        expect(img.getAttribute('src')).to.equal('https://foo.com/foo.jpg');
      });
    });
  });
});
