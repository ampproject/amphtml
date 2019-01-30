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

import {AutoLightboxEvents} from '../../../../src/auto-lightbox';
import {CommonSignals} from '../../../../src/common-signals';
import {
  Criteria,
  ENABLED_SCHEMA_TYPES,
  LIGHTBOXABLE_ATTR,
  Mutation,
  RENDER_AREA_RATIO,
  REQUIRED_EXTENSION,
  Scanner,
  Schema,
  VIEWPORT_AREA_RATIO,
  apply,
  meetsSizingCriteria,
  resolveIsEnabledForDoc,
  runCandidates,
  scan,
} from '../amp-auto-lightbox';
import {Services} from '../../../../src/services';
import {Signals} from '../../../../src/utils/signals';
import {createElementWithAttributes} from '../../../../src/dom';
import {htmlFor} from '../../../../src/static-template';
import {parseUrlDeprecated} from '../../../../src/url';
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

  const schemaTypes = Object.keys(ENABLED_SCHEMA_TYPES);

  const ampImgFromTree = el =>
    el.tagName == 'AMP-IMG' ? el : el.querySelector('amp-img');

  const stubAllCriteriaMet = () =>
    env.sandbox.stub(Criteria, 'meetsAll');

  function mockAllCriteriaMet(isMet) {
    stubAllCriteriaMet().returns(isMet);
  }

  function mockCandidates(candidates) {
    env.sandbox.stub(Scanner, 'getCandidates').returns(candidates);
  }

  function mockSchemaType(type) {
    env.sandbox.stub(Schema, 'getDocumentType').returns(type);
  }

  function mockIsEmbeddedAndTrustedViewer(isEmbedded, opt_isTrusted) {
    const isTrusted = opt_isTrusted === undefined ? isEmbedded : opt_isTrusted;
    const viewerHostname = isTrusted ? 'google.com' : 'tacos.al.pastor';

    env.sandbox.stub(Services, 'viewerForDoc').returns({
      isEmbedded() {
        return isEmbedded;
      },
      getViewerOrigin() {
        return tryResolve(() => `https://${viewerHostname}`);
      },
    });
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

  function mockCandidatesForLengthCheck() {
    return ['foo'];
  }

  function mockLoadedSignal(element, isLoadedSuccessfully) {
    const signals = new Signals();
    element.signals = () => signals;
    if (isLoadedSuccessfully) {
      signals.signal(CommonSignals.LOAD_END);
    } else {
      signals.rejectSignal(CommonSignals.LOAD_END, 'Mocked rejection');
    }
    return element;
  }

  beforeEach(() => {
    html = htmlFor(env.win.document);

    env.sandbox.stub(Mutation, 'mutate').callsFake((_, mutator) =>
      tryResolve(mutator));

    env.sandbox.stub(Services, 'urlForDoc').returns({
      parse(url) {
        return parseUrlDeprecated(url);
      },
    });
  });

  describe('meetsTreeShapeCriteria', () => {

    function itAccepts(shouldAccept, scenarios) {
      scenarios.forEach(({kind, mutate, wrapWith}) => {
        function maybeWrap(root) {
          if (wrapWith) {
            const wrapper = wrapWith();
            wrapper.appendChild(root);
            return wrapper;
          }
          return root;
        }

        function maybeMutate(root) {
          if (mutate) {
            mutate(root);
          }
          return root;
        }

        it(`${shouldAccept ? 'accepts' : 'rejects'} ${kind}`, () => {
          [
            html`<amp-img src="asada.png"></amp-img>`,
            html`<div><amp-img src="adobada.png"></amp-img></div>`,
            html`<div><div><amp-img src="carnitas.png"></amp-img></div></div>`,
          ].forEach(unwrapped => {
            const scenario = maybeWrap(maybeMutate(unwrapped));
            env.win.document.body.appendChild(scenario);
            expect(
                Criteria.meetsTreeShapeCriteria(ampImgFromTree(scenario)),
                scenario.outerHTML)
                .to.equal(shouldAccept);
          });
        });
      });
    }

    itAccepts(true, [
      {
        kind: 'elements by default',
      },
      {
        kind: 'elements with a non-tap action',
        mutate: el => el.setAttribute('on', 'nottap:doSomething'),
      },
      {
        kind: 'elements inside non-clickable anchor',
        wrapWith: () => html`<a id=my-anchor></a>`,
      },
    ]);

    itAccepts(false, [
      {
        kind: 'explicitly opted-out subnodes',
        mutate: el => el.setAttribute('data-amp-auto-lightbox-disable', ''),
      },
      {
        kind: 'presentation subnodes',
        mutate: el => el.setAttribute('role', 'presentation'),
      },
      {
        kind: 'placeholder subnodes',
        mutate: el => el.setAttribute('placeholder', ''),
      },
      {
        kind: 'items actionable by tap with a single action',
        mutate: el => el.setAttribute('on', 'tap:doSomething'),
      },
      {
        kind: 'items actionable by tap with multiple actions',
        mutate: el =>
          el.setAttribute('on', 'whatever:doSomething;tap:doSomethingElse'),
      },
      {
        kind: 'items inside an amp-selector',
        mutate: el => el.setAttribute('option', ''),
        wrapWith: () => html`<amp-selector></amp-selector>`,
      },
      {
        kind: 'items inside a button',
        wrapWith: () => html`<button></button>`,
      },
      {
        kind: 'items inside amp-script',
        wrapWith: () => html`<amp-script></amp-script>`,
      },
      {
        kind: 'items inside amp-story',
        wrapWith: () => html`<amp-story></amp-story>`,
      },
      {
        kind: 'items inside a clickable link',
        wrapWith: () => html`<a href="http://hamberders.com"></a>`,
      },
    ]);

  });

  describe('meetsSizingCriteria', () => {
    const areaDeltaPerc = RENDER_AREA_RATIO * 100;

    it(`accepts elements ${areaDeltaPerc}%+ of size than render area`, () => {
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

    it(`rejects elements < ${areaDeltaPerc}%+ of size of render area`, () => {
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

    it(`accepts elements that cover ${minAreaPerc}%+ of the viewport`, () => {
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

    it(`rejects elements that cover < ${minAreaPerc}% of the viewport`, () => {
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

    it('accepts elements with height > than viewport\'s', () => {
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

    it('accepts elements with width > than viewport\'s', () => {
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

    it('rejects elements with dimensions <= than viewport\'s', () => {
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

  describe('scan', () => {

    function waitForAllScannedToBeResolved() {
      return scan(env.ampdoc).then(scanned => scanned && Promise.all(scanned));
    }

    it('does not load extension if no candidates found', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockSchemaType(schemaTypes[0]);
      mockIsEmbeddedAndTrustedViewer(true);
      mockCandidates([]);

      yield waitForAllScannedToBeResolved();

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.not.have.been.called;
    });

    it('loads extension if >= 1 candidates meet criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockSchemaType(schemaTypes[0]);
      mockIsEmbeddedAndTrustedViewer(true);
      mockCandidates([
        mockLoadedSignal(html`<amp-img src="bla.png"></amp-img>`, true),
      ]);

      mockAllCriteriaMet(true);

      yield waitForAllScannedToBeResolved();

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.have.been.calledOnce;
    });

    it('does not load extension if no candidates meet criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockCandidates([
        mockLoadedSignal(html`<amp-img src="bla.png"></amp-img>`, true),
      ]);

      mockAllCriteriaMet(false);
      mockIsEmbeddedAndTrustedViewer(true);

      yield waitForAllScannedToBeResolved();

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.not.have.been.called;
    });

    it('sets attribute only for candidates that meet criteria', function* () {
      const a = mockLoadedSignal(html`<amp-img src="a.png"></amp-img>`, true);
      const b = mockLoadedSignal(html`<amp-img src="b.png"></amp-img>`, true);
      const c = mockLoadedSignal(html`<amp-img src="c.png"></amp-img>`, true);

      const allCriteriaMet = stubAllCriteriaMet();

      allCriteriaMet.withArgs(matchEquals(a)).returns(true);
      allCriteriaMet.withArgs(matchEquals(b)).returns(false);
      allCriteriaMet.withArgs(matchEquals(c)).returns(true);

      mockSchemaType(schemaTypes[0]);
      mockCandidates([a, b, c]);
      mockIsEmbeddedAndTrustedViewer(true);

      yield waitForAllScannedToBeResolved();

      expect(a.getAttribute(LIGHTBOXABLE_ATTR)).to.be.ok;
      expect(b.getAttribute(LIGHTBOXABLE_ATTR)).to.not.be.ok;
      expect(c.getAttribute(LIGHTBOXABLE_ATTR)).to.be.ok;
    });

    it('sets unique group for candidates that meet criteria', function* () {
      const a = mockLoadedSignal(html`<amp-img src="a.png"></amp-img>`, true);
      const b = mockLoadedSignal(html`<amp-img src="b.png"></amp-img>`, true);
      const c = mockLoadedSignal(html`<amp-img src="c.png"></amp-img>`, true);

      mockAllCriteriaMet(true);

      mockSchemaType(schemaTypes[0]);
      mockCandidates([a, b, c]);
      mockIsEmbeddedAndTrustedViewer(true);

      yield waitForAllScannedToBeResolved();

      const aAttr = a.getAttribute(LIGHTBOXABLE_ATTR);
      const bAttr = b.getAttribute(LIGHTBOXABLE_ATTR);
      const cAttr = c.getAttribute(LIGHTBOXABLE_ATTR);

      expect(aAttr).to.be.ok;
      expect(aAttr).to.not.equal(bAttr);
      expect(aAttr).to.not.equal(cAttr);

      expect(bAttr).to.be.ok;
      expect(bAttr).to.not.equal(aAttr);
      expect(bAttr).to.not.equal(cAttr);

      expect(cAttr).to.be.ok;
      expect(cAttr).to.not.equal(aAttr);
      expect(cAttr).to.not.equal(bAttr);
    });

  });

  describe('runCandidates', () => {

    it('filters out candidates that fail to load', () => {
      const shouldNotLoad = mockLoadedSignal(
          html`<amp-img src="bla.png"></amp-img>`,
          false);

      const shouldLoad = mockLoadedSignal(
          html`<amp-img src="bla.png"></amp-img>`,
          true);

      const candidates = [shouldNotLoad, shouldLoad];

      mockAllCriteriaMet(true);

      return Promise.all(runCandidates(env.ampdoc, candidates))
          .then(candidates => {
            expect(candidates.length).to.equal(2);
            expect(candidates[0]).to.not.be.ok;
            expect(candidates[1]).to.equal(shouldLoad);
          });
    });

  });

  describe('resolveIsEnabledForDoc', () => {

    it('rejects documents without schema', () => {
      mockIsEmbeddedAndTrustedViewer(true);

      return resolveIsEnabledForDoc(env.ampdoc,
          mockCandidatesForLengthCheck()).then(isEnabled => {
        expect(isEnabled).to.be.false;
      });
    });

    it('rejects schema with invalid @type', () => {
      mockIsEmbeddedAndTrustedViewer(true);
      mockSchemaType('hamberder');

      return resolveIsEnabledForDoc(env.ampdoc,
          mockCandidatesForLengthCheck()).then(isEnabled => {
        expect(isEnabled).to.be.false;
      });
    });

    schemaTypes.forEach(type => {

      it(`accepts schema with @type=${type}`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(true);

        return resolveIsEnabledForDoc(env.ampdoc,
            mockCandidatesForLengthCheck()).then(isEnabled => {
          expect(isEnabled).to.be.true;
        });
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
        mockIsEmbeddedAndTrustedViewer(true);

        return resolveIsEnabledForDoc(env.ampdoc,
            mockCandidatesForLengthCheck()).then(isEnabled => {
          expect(isEnabled).to.be.false;
        });

      });

      it(`rejects schema with @type=${type} for non-embedded docs`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(
            /* isEmbedded */ false,
            /* isTrusted */ true);

        return resolveIsEnabledForDoc(
            env.ampdoc, mockCandidatesForLengthCheck()).then(isEnabled => {
          expect(isEnabled).to.be.false;
        });
      });

      it(`rejects schema with @type=${type} for untrusted viewer`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(
            /* isEmbedded */ true,
            /* isTrusted */ false);

        return resolveIsEnabledForDoc(
            env.ampdoc, mockCandidatesForLengthCheck()).then(isEnabled => {
          expect(isEnabled).to.be.false;
        });
      });

    });

  });

  describe('apply', () => {

    it('sets attribute', function* () {
      const element = html`<amp-img src="chabuddy.g"></amp-img>`;

      yield apply(env.ampdoc, element);

      expect(element.getAttribute(LIGHTBOXABLE_ATTR)).to.be.ok;
    });

    it('sets unique group for each element', function* () {
      const a = html`<amp-img src="a.png"></amp-img>`;
      const b = html`<amp-img src="b.png"></amp-img>`;
      const c = html`<amp-img src="c.png"></amp-img>`;

      yield apply(env.ampdoc, a);
      yield apply(env.ampdoc, b);
      yield apply(env.ampdoc, c);

      const aAttr = a.getAttribute(LIGHTBOXABLE_ATTR);
      const bAttr = b.getAttribute(LIGHTBOXABLE_ATTR);
      const cAttr = c.getAttribute(LIGHTBOXABLE_ATTR);

      expect(aAttr).to.be.ok;
      expect(aAttr).to.not.equal(bAttr);
      expect(aAttr).to.not.equal(cAttr);

      expect(bAttr).to.be.ok;
      expect(bAttr).to.not.equal(aAttr);
      expect(bAttr).to.not.equal(cAttr);

      expect(cAttr).to.be.ok;
      expect(cAttr).to.not.equal(aAttr);
      expect(cAttr).to.not.equal(bAttr);
    });

    it('dispatches event', function* () {
      const element = html`<amp-img src="chabuddy.g"></amp-img>`;

      element.dispatchCustomEvent = env.sandbox.spy();

      yield apply(env.ampdoc, element);

      expect(element.dispatchCustomEvent.withArgs(AutoLightboxEvents.NEWLY_SET))
          .to.have.been.calledOnce;
    });

  });

});
