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

import {CommonSignals} from '../../../../src/common-signals';
import {
  Criteria,
  LIGHTBOXABLE_ATTR,
  RENDER_AREA_RATIO,
  REQUIRED_EXTENSION,
  Scanner,
  VIEWPORT_AREA_RATIO,
  isDocValid,
  meetsCriteria,
  meetsSizingCriteria,
  scanDoc,
} from '../amp-lightbox-gallery-detection';
import {Services} from '../../../../src/services';
import {createElementWithAttributes} from '../../../../src/dom';
import {htmlFor} from '../../../../src/static-template';
import {tryResolve} from '../../../../src/utils/promise';


const TAG = 'amp-lightbox-gallery-detection';


describes.realWin(TAG, {
  amp: {
    amp: true,
    ampdoc: 'single',
  },
}, env => {

  let html;

  const {any} = sinon.match;

  const capitalize = str => str.replace(/^([a-z])/, (_, m) => m.toUpperCase());

  const ampImgFromTree = el =>
    el.tagName == 'AMP-IMG' ? el : el.querySelector('amp-img');

  const criteriaMethod = c => 'meets' + capitalize(c) + 'Criteria';

  function mockCriteriaMet(criteria, isMet) {
    env.sandbox.stub(Criteria, criteriaMethod(criteria)).returns(isMet);
  }

  const stubAllCriteriaMet = () => env.sandbox.stub(Criteria, 'meetsAll');

  function mockAllCriteriaMet(isMet) {
    stubAllCriteriaMet().returns(isMet);
  }

  function mockScannedImages(images) {
    env.sandbox.stub(Scanner, 'getAllImages').returns(tryResolve(() => images));
  }

  function mockSchemaType(type) {
    const {document} = env.win;
    const script = html`<script type="application/ld+json"></script>`;
    script.innerText = JSON.stringify({
      '@type': type,
    });
    document.head.appendChild(script);
  }

  function spyInstallExtensionsForDoc() {
    const installExtensionForDoc = env.sandbox.spy();

    env.sandbox.stub(Services, 'extensionsFor').returns({
      installExtensionForDoc,
    });

    return installExtensionForDoc;
  }

  // necessary since element matching `withArgs` deep equals and overflows
  function matchEquals(comparison) {
    return sinon.match(subject => subject == comparison);
  }

  beforeEach(() => {
    html = htmlFor(env.win.document);
  });

  describe('meetsCriteria', () => {

    it('rejects placeholder images', () => {
      mockCriteriaMet('actionable', true);
      mockCriteriaMet('sizing', true);

      const element = html`<amp-img src="bla.png" placeholder></amp-img>`;

      expect(meetsCriteria(element)).to.be.false;
    });

    it('rejects actionable images by tap action', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container is tappable
        html`<div on="tap:doSomething">
          <amp-img src="bla.png"></amp-img>
        </div>`,

        // non-immediate ancestor is tappable
        html`<div on="tap:doSomething">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </div>`,

        // image is tappable
        html`<amp-img src="bla.png" on="tap:doSomething">`,

        // immediate container is tappable with prefix actions
        html`<div on="whatever:doSomething;tap:doSomething">
          <amp-img src="bla.png"></amp-img>
        </div>`,

        // non-immediate ancestor is tappable with prefix actions
        html`<div on="whatever:doSomething;tap:doSomething">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </div>`,

        // image is tappable with prefix actions
        html`<amp-img src="bla.png" on="whatever:doSomething;tap:doSomething">`,

        // immediate container is tappable with sufix actions
        html`<div on="tap:doSomething;whatever:doSomething">
          <amp-img src="bla.png"></amp-img>
        </div>`,

        // non-immediate ancestor is tappable with sufix actions
        html`<div on="tap:doSomething;whatever:doSomething">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </div>`,

        // image is tappable with sufix actions
        html`<amp-img src="bla.png" on="tap:doSomething;whatever:doSomething">`,

        // immediate container is tappable with whitespace
        html`<div on=" tap:doSomething;  ">
          <amp-img src="bla.png"></amp-img>
        </div>`,

        // non-immediate ancestor is tappable with whitespace
        html`<div on=" tap:doSomething;  ">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </div>`,

        // image is tappable with whitespace
        html`<amp-img src="bla.png" on=" tap:doSomething; ">`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.false;
      });
    });

    it('accepts images with a non-tap action', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container has non-tap actions
        html`<div on="nottap:doSomething">
          <amp-img src="bla.png"></amp-img>
        </div>`,

        // non-immediate ancestor has non-tap actions
        html`<div on="nottap:doSomething">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </div>`,

        // image has non-tap actions
        html`<amp-img src="bla.png" on="nottap:doSomething">`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.true;
      });
    });

    it('rejects images inside an <amp-selector>', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container is amp-selector
        html`<amp-selector>
          <amp-img src="bla.png"></amp-img>
        </amp-selector>`,

        // non-immediate ancestor is amp-selector
        html`<amp-selector>
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </amp-selector>`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.false;
      });
    });

    it('rejects images inside an <amp-script>', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container is amp-script
        html`<amp-script>
          <amp-img src="bla.png"></amp-img>
        </amp-script>`,

        // non-immediate ancestor is amp-script
        html`<amp-script>
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </amp-script>`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.false;
      });
    });

    it('rejects images inside an <amp-story>', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container is amp-story
        html`<amp-story>
          <amp-img src="bla.png"></amp-img>
        </amp-story>`,

        // non-immediate ancestor is amp-story
        html`<amp-story>
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </amp-story>`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.false;
      });
    });

    it('rejects images inside a clickable link', () => {
      mockCriteriaMet('placeholder', true);
      mockCriteriaMet('sizing', true);

      const renderScenarios = [
        // immediate container is clickable link
        html`<a href="http://hamberders.com">
          <amp-img src="bla.png"></amp-img>
        </a>`,

        // non-immediate ancestor is clickable link
        html`<a href="http://hamberders.com">
          <div>
            <amp-img src="bla.png"></amp-img>
          </div>
        </a>`,
      ];

      renderScenarios.forEach(root => {
        expect(meetsCriteria(ampImgFromTree(root))).to.be.false;
      });
    });

  });

  describe('meetsSizingCriteria', () => {
    const areaDeltaPerc = RENDER_AREA_RATIO * 100;

    it(`accepts images ${areaDeltaPerc}%+ of size than render area`, () => {
      const vw = 1000;
      const vh = 600;

      const renderWidth = 1000;
      const renderHeight = 200;

      const renderArea = renderWidth * renderHeight;

      const minArea = (renderArea) * RENDER_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      [
        minDim + 1,
        minDim + 10,
        minDim + 100,
      ].forEach(naturalWidth => {
        [
          minDim + 1,
          minDim + 10,
          minDim + 100,
        ].forEach(naturalHeight => {
          expect(meetsSizingCriteria(
              renderWidth,
              renderHeight,
              naturalWidth,
              naturalHeight,
              vw,
              vh)).to.be.true;
        });
      });
    });

    it(`rejects images < ${areaDeltaPerc}%+ of size of render area`, () => {
      const vw = 1000;
      const vh = 600;

      const renderWidth = 100;
      const renderHeight = 100;

      const renderArea = renderWidth * renderHeight;

      const minArea = (renderArea) * (RENDER_AREA_RATIO - 0.1);
      const minDim = Math.sqrt(minArea);

      [
        minDim,
        minDim - 10,
        minDim - 100,
      ].forEach(naturalWidth => {
        [
          minDim,
          minDim - 10,
          minDim - 100,
        ].forEach(naturalHeight => {
          expect(meetsSizingCriteria(
              renderWidth,
              renderHeight,
              naturalWidth,
              naturalHeight,
              vw,
              vh)).to.be.false;
        });
      });
    });

    const minAreaPerc = VIEWPORT_AREA_RATIO * 100;

    it(`accepts images that cover ${minAreaPerc}%+ of the viewport`, () => {
      const vw = 1000;
      const vh = 600;

      const minArea = (vw * vh) * VIEWPORT_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      const naturalWidth = 100;
      const naturalHeight = 100;

      [
        minDim,
        minDim + 10,
        minDim + 100,
      ].forEach(renderWidth => {
        [
          minDim,
          minDim + 10,
          minDim + 100,
        ].forEach(renderHeight => {
          expect(meetsSizingCriteria(
              renderWidth,
              renderHeight,
              naturalWidth,
              naturalHeight,
              vw,
              vh)).to.be.true;
        });
      });

    });

    it(`rejects images that cover < ${minAreaPerc}% of the viewport`, () => {
      const vw = 1000;
      const vh = 600;

      const minArea = (vw * vh) * VIEWPORT_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      [
        minDim - 1,
        minDim - 10,
        minDim - 100,
      ].forEach(renderWidth => {
        [
          minDim - 1,
          minDim - 10,
          minDim - 100,
        ].forEach(renderHeight => {
          expect(meetsSizingCriteria(
              renderWidth,
              renderHeight,
              /* naturalWidth */ renderWidth,
              /* naturalHeight */ renderHeight,
              vw,
              vh)).to.be.false;
        });
      });
    });

    it('accepts images with height > than viewport\'s', () => {
      const vw = 1000;
      const vh = 600;

      const renderWidth = vw;
      const renderHeight = vh;

      [
        vh + 1,
        vh + 10,
        vh + 100,
      ].forEach(naturalHeight => {
        expect(meetsSizingCriteria(
            renderWidth,
            renderHeight,
            /* naturalWidth */ renderWidth,
            naturalHeight,
            vw,
            vh)).to.be.true;
      });
    });

    it('accepts images with width > than viewport\'s', () => {
      const vw = 1000;
      const vh = 600;

      const renderWidth = vw;
      const renderHeight = vh;

      [
        vw + 1,
        vw + 10,
        vw + 100,
      ].forEach(naturalWidth => {
        expect(meetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            /* naturalHeight */ renderHeight,
            vw,
            vh)).to.be.true;
      });
    });

    it('rejects images with dimensions <= than viewport\'s', () => {
      const vw = 1000;
      const vh = 600;

      const renderWidth = 100;
      const renderHeight = 100;

      [
        renderWidth,
        renderWidth - 10,
        renderWidth - 100,
      ].forEach(naturalWidth => {
        [
          renderHeight,
          renderHeight - 10,
          renderHeight - 100,
        ].forEach(naturalHeight => {
          expect(meetsSizingCriteria(
              renderWidth,
              renderHeight,
              naturalWidth,
              naturalHeight,
              vw,
              vh)).to.be.false;
        });
      });
    });

  });

  describe('scanDoc', () => {

    it('does not load extension if no elements found', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockSchemaType('Article');
      mockScannedImages([]);

      yield scanDoc(env.ampdoc);

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.not.have.been.called;
    });

    it('loads extension if at least one element meets criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockSchemaType('Article');
      mockScannedImages([
        html`<amp-img src="bla.png"></amp-img>`,
      ]);

      mockAllCriteriaMet(true);

      yield scanDoc(env.ampdoc);

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.have.been.calledOnce;
    });

    it('does not load extension if no elements meet criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockScannedImages([
        html`<amp-img src="bla.png"></amp-img>`,
      ]);

      mockAllCriteriaMet(false);

      yield scanDoc(env.ampdoc);

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.not.have.been.called;
    });

    it('sets attribute for images that meet criteria', function* () {
      const a = html`<amp-img src="a.png"></amp-img>`;
      const b = html`<amp-img src="b.png"></amp-img>`;
      const c = html`<amp-img src="c.png"></amp-img>`;

      const allCriteriaMet = stubAllCriteriaMet();

      allCriteriaMet.withArgs(matchEquals(a)).returns(true);
      allCriteriaMet.withArgs(matchEquals(b)).returns(false);
      allCriteriaMet.withArgs(matchEquals(c)).returns(true);

      mockSchemaType('Article');
      mockScannedImages([a, b, c]);

      yield scanDoc(env.ampdoc);

      expect(a.getAttribute(LIGHTBOXABLE_ATTR)).to.equal('');
      expect(b.getAttribute(LIGHTBOXABLE_ATTR)).to.not.be.ok;
      expect(c.getAttribute(LIGHTBOXABLE_ATTR)).to.equal('');
    });

  });

  describe('Scanner', () => {

    it('filters out images that fail to load', () => {
      const doc = env.win.document;

      const a = html`<amp-img src="bla.png"></amp-img>`;
      const b = html`<amp-img src="bla.png"></amp-img>`;

      sandbox.stub(doc, 'querySelectorAll').withArgs('amp-img').returns([a, b]);

      a.signals().rejectSignal(CommonSignals.LOAD_END, new Error());
      b.signals().signal(CommonSignals.LOAD_END);

      return Scanner.getAllImages(doc).then(images => {
        expect(images.length).to.equal(1);
        expect(images[0]).to.equal(b);
      });
    });

  });

  describe('isDocValid', () => {

    it('rejects documents without schema', () => {
      expect(isDocValid(env.ampdoc)).to.be.false;
    });

    it('rejects schema with invalid @type', () => {
      mockSchemaType('hamberder');
      expect(isDocValid(env.ampdoc)).to.be.false;
    });

    [
      'Article',
      'NewsArticle',
      'BlogPosting',
      'LiveBlogPosting',
      'DiscussionForumPosting',
    ].forEach(type => {

      it(`accepts schema with @type=${type}`, () => {
        mockSchemaType(type);
        expect(isDocValid(env.ampdoc)).to.be.true;
      });

      it(`rejects schema with @type=${type} but lightbox explicit`, () => {
        const doc = env.win.document;

        const extensionScript = createElementWithAttributes(doc, 'script', {
          'custom-element': REQUIRED_EXTENSION,
        });

        const lightboxable = createElementWithAttributes(doc, 'amp-img', {
          [LIGHTBOXABLE_ATTR]: '',
        });

        doc.head.appendChild(extensionScript);
        doc.body.appendChild(lightboxable);

        mockSchemaType(type);

        expect(isDocValid(env.ampdoc)).to.be.false;

      });

    });

  });

});
