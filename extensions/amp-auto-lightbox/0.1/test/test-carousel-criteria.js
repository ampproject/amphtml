/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CarouselCriteria} from '../carousel-criteria';
import {htmlFor} from '../../../../src/static-template';
import {toggleExperiment} from '../../../../src/experiments';


const TAG = 'amp-auto-lightbox';


describes.realWin(TAG, {
  amp: {
    amp: true,
    ampdoc: 'single',
    experiments: ['amp-auto-lightbox-carousel'],
  },
}, env => {

  let html;

  function buildCarousel(slides) {
    const element = html`<amp-carousel></amp-carousel>`;
    slides.forEach(slide => {
      slide.classList.add('amp-carousel-slide');
      element.appendChild(slide);
    });
    env.win.document.body.appendChild(element);
    return element;
  }

  beforeEach(() => {
    html = htmlFor(env.win.document.body);
    toggleExperiment(env.win, 'amp-auto-lightbox-carousel', true);
  });

  it('rejects carousels without <amp-img>', () => {
    const root = buildCarousel([
      html`<div>Slide 1</div>`,
      html`<div>Slide 2</div>`,
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.false;
  });

  it('rejects carousels with <amp-img> but non-image slides', () => {
    const root = buildCarousel([
      html`<amp-img></amp-img>`,
      html`<amp-img></amp-img>`,
      html`<div>Slide</div>`,
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.false;
  });

  it('accepts carousels with only <amp-img>', () => {
    const root = buildCarousel([
      html`<amp-img></amp-img>`,
      html`<amp-img></amp-img>`,
      html`<amp-img></amp-img>`,
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.true;
  });

  it('accepts carousels with only <amp-img> (nested)', () => {
    const root = buildCarousel([
      html`<div><amp-img></amp-img></div>`,
      html`<div><amp-img></amp-img></div>`,
      html`<div><amp-img></amp-img></div>`,
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.true;
  });

  it('accepts carousels with <amp-img> in every slide (mixed)', () => {
    const root = buildCarousel([
      html`<div><amp-img></amp-img> Hello world!</div>`,
      html`<amp-img></amp-img>`,
      html`<div><amp-img></amp-img><div><strong>Hola</strong></div>`,
      html`<div><h1>My Image</h1><amp-img></amp-img></div>`,
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.true;
  });

  it('rejects deep trees with only <amp-img>', () => {
    const deep = html`<div><div><div><div><div><div><div><div><div>
      <amp-img></amp-img>
    </div></div></div></div></div></div></div></div></div>`;

    const root = buildCarousel([
      deep,
      deep.cloneNode(/* deep */ true),
      deep.cloneNode(/* deep */ true),
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.false;
  });

  it('rejects wide trees with only <amp-img>', () => {
    const wide = html`<div>
      <amp-img></amp-img>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>`;

    const root = buildCarousel([
      wide,
      wide.cloneNode(/* deep */ true),
      wide.cloneNode(/* deep */ true),
    ]);

    expect(CarouselCriteria.meetsAll(root)).to.eventually.be.false;
  });

});
