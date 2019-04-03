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

const TIMEOUT = 15000;

// Skip Edge, which throws "Permission denied" errors when inspecting
// element properties in the testing iframe (Edge 17, Windows 10).
describe.configure().skipEdge().run('amp-bind', function() {
  this.timeout(TIMEOUT);

  // Helper that sets the poll timeout.
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
