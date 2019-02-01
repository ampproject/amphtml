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


const TAG = 'amp-auto-lightbox';


describes.realWin(TAG, {
  amp: {
    amp: true,
    ampdoc: 'single',
  },
}, env => {

  let html;

  const {any} = sinon.match;

  const schemaTypes = Object.keys(ENABLED_SCHEMA_TYPES);

  const firstElementLeaf = el =>
    el.firstElementChild ? firstElementLeaf(el.firstElementChild) : el;

  function wrap(el, wrapper) {
    firstElementLeaf(wrapper).appendChild(el);
    return wrapper;
  }

  const stubAllCriteriaMet = () => env.sandbox.stub(Criteria, 'meetsAll');
  const mockAllCriteriaMet = isMet => stubAllCriteriaMet().returns(isMet);

  function mockCandidates(candidates) {
    env.sandbox.stub(Scanner, 'getCandidates').returns(candidates);
    return candidates;
  }

  const mockSchemaType = type =>
    env.sandbox.stub(Schema, 'getDocumentType').returns(type);

  const iterProduct = (a, b, callback) => a.forEach(itemA =>
    b.forEach(itemB => callback(itemA, itemB)));

  const squaredCompare = (set, callback) => iterProduct(set, set, (a, b) => {
    if (a != b) {
      callback(a, b);
    }
  });

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
  const matchEquals = comparison =>
    sinon.match(subject => subject == comparison);

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

    const meetsTreeShapeCriteriaMsg = outerHtml =>
      `Criteria.meetsTreeShapeCriteria(html\`${outerHtml}\`)`;

    function itAccepts(shouldAccept, scenarios) {
      scenarios.forEach(({kind, mutate, wrapWith}) => {
        const maybeWrap = root => wrapWith ? wrap(root, wrapWith()) : root;
        const maybeMutate = root => mutate && mutate(root);

        it(`${shouldAccept ? 'accepts' : 'rejects'} ${kind}`, () => {
          [
            html`<amp-img src="asada.png"></amp-img>`,
            html`<div><amp-img src="adobada.png"></amp-img></div>`,
            html`<div><div><amp-img src="carnitas.png"></amp-img></div></div>`,
          ].forEach(unwrapped => {
            maybeMutate(unwrapped);

            const scenario = maybeWrap(unwrapped);
            const candidate = firstElementLeaf(scenario);

            env.win.document.body.appendChild(scenario);

            expect(candidate).to.be.ok;
            expect(candidate.tagName).to.equal('AMP-IMG');

            expect(
                Criteria.meetsTreeShapeCriteria(candidate),
                meetsTreeShapeCriteriaMsg(scenario.outerHTML))
                .to.equal(shouldAccept);
          });
        });
      });
    }

    [true, false].forEach(accepts => {
      describe('self-test', () => {
        beforeEach(() => {
          env.sandbox.stub(Criteria, 'meetsTreeShapeCriteria').returns(accepts);
        });
        itAccepts(accepts, [{kind: 'any'}]);
      });
    });

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
    const {vw, vh} = {vw: 1000, vh: 600};

    const expectMeetsSizingCriteria = (
      renderWidth, renderHeight, naturalWidth, naturalHeight) =>
      expect(meetsSizingCriteria(
          renderWidth, renderHeight, naturalWidth, naturalHeight, vw, vh));

    it(`accepts elements ${areaDeltaPerc}%+ of size than render area`, () => {
      const renderWidth = 1000;
      const renderHeight = 200;

      const renderArea = renderWidth * renderHeight;

      const minArea = (renderArea) * RENDER_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      const axisRange = [minDim + 1, minDim + 10, minDim + 100];
      iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight).to.be.true;
      });
    });

    it(`rejects elements < ${areaDeltaPerc}%+ of size of render area`, () => {
      const renderWidth = 100;
      const renderHeight = 100;

      const renderArea = renderWidth * renderHeight;

      const minArea = (renderArea) * (RENDER_AREA_RATIO - 0.1);
      const minDim = Math.sqrt(minArea);

      const axisRange = [minDim, minDim - 10, minDim - 100];
      iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight).to.be.false;
      });
    });

    const minAreaPerc = VIEWPORT_AREA_RATIO * 100;

    it(`accepts elements that cover ${minAreaPerc}%+ of the viewport`, () => {
      const minArea = (vw * vh) * VIEWPORT_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      const naturalWidth = 100;
      const naturalHeight = 100;

      const axisRange = [minDim, minDim + 10, minDim + 100];
      iterProduct(axisRange, axisRange, (renderWidth, renderHeight) => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight).to.be.true;
      });

    });

    it(`rejects elements that cover < ${minAreaPerc}% of the viewport`, () => {
      const minArea = (vw * vh) * VIEWPORT_AREA_RATIO;
      const minDim = Math.sqrt(minArea);

      const axisRange = [minDim - 1, minDim - 10, minDim - 100];
      iterProduct(axisRange, axisRange, (renderWidth, renderHeight) => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            /* naturalWidth */ renderWidth,
            /* naturalHeight */ renderHeight).to.be.false;
      });
    });

    it('accepts elements with height > than viewport\'s', () => {
      const renderWidth = vw;
      const renderHeight = vh;

      [
        vh + 1,
        vh + 10,
        vh + 100,
      ].forEach(naturalHeight => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            /* naturalWidth */ renderWidth,
            naturalHeight).to.be.true;
      });
    });

    it('accepts elements with width > than viewport\'s', () => {
      const renderWidth = vw;
      const renderHeight = vh;

      [
        vw + 1,
        vw + 10,
        vw + 100,
      ].forEach(naturalWidth => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            /* naturalHeight */ renderHeight).to.be.true;
      });
    });

    it('rejects elements with dimensions <= than viewport\'s', () => {
      const renderWidth = 100;
      const renderHeight = 100;

      const axisRange = [renderWidth, renderWidth - 10, renderWidth - 100];
      iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
        expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight).to.be.false;
      });
    });

  });

  describe('scan', () => {

    const waitForAllScannedToBeResolved = () =>
      scan(env.ampdoc).then(scanned => scanned && Promise.all(scanned));

    beforeEach(() => {
      mockSchemaType(schemaTypes[0]);
    });

    it('does not load extension if no candidates found', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockIsEmbeddedAndTrustedViewer(true);
      mockCandidates([]);

      yield waitForAllScannedToBeResolved();

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.not.have.been.called;
    });

    it('loads extension if >= 1 candidates meet criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockIsEmbeddedAndTrustedViewer(true);
      mockCandidates([mockLoadedSignal(html`<amp-img></amp-img>`, true)]);

      mockAllCriteriaMet(true);

      yield waitForAllScannedToBeResolved();

      expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION))
          .to.have.been.calledOnce;
    });

    it('does not load extension if no candidates meet criteria', function* () {
      const installExtensionForDoc = spyInstallExtensionsForDoc();

      mockCandidates([mockLoadedSignal(html`<amp-img></amp-img>`, true)]);

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

      mockCandidates([a, b, c]);
      mockIsEmbeddedAndTrustedViewer(true);

      yield waitForAllScannedToBeResolved();

      expect(a.getAttribute(LIGHTBOXABLE_ATTR)).to.be.ok;
      expect(b.getAttribute(LIGHTBOXABLE_ATTR)).to.not.be.ok;
      expect(c.getAttribute(LIGHTBOXABLE_ATTR)).to.be.ok;
    });

    it('sets unique group for candidates that meet criteria', function* () {
      const candidates = mockCandidates([1, 2, 3].map(() =>
        mockLoadedSignal(html`<amp-img src="a.png"></amp-img>`, true)));

      mockAllCriteriaMet(true);
      mockIsEmbeddedAndTrustedViewer(true);

      yield waitForAllScannedToBeResolved();

      squaredCompare(candidates, (a, b) => {
        expect(a.getAttribute(LIGHTBOXABLE_ATTR))
            .not.to.equal(b.getAttribute(LIGHTBOXABLE_ATTR));
      });
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

    const expectIsEnabled = shouldBeEnabled =>
      resolveIsEnabledForDoc(env.ampdoc, ['foo']).then(actuallyEnabled => {
        expect(actuallyEnabled).to.equal(shouldBeEnabled);
      });

    it('rejects documents without schema', () => {
      mockIsEmbeddedAndTrustedViewer(true);
      return expectIsEnabled(false);
    });

    it('rejects schema with invalid @type', () => {
      mockIsEmbeddedAndTrustedViewer(true);
      mockSchemaType('hamberder');
      return expectIsEnabled(false);
    });

    schemaTypes.forEach(type => {

      it(`accepts schema with @type=${type}`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(true);
        return expectIsEnabled(true);
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
        return expectIsEnabled(false);
      });

      it(`rejects schema with @type=${type} for non-embedded docs`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(
            /* isEmbedded */ false,
            /* isTrusted */ true);
        return expectIsEnabled(false);
      });

      it(`rejects schema with @type=${type} for untrusted viewer`, () => {
        mockSchemaType(type);
        mockIsEmbeddedAndTrustedViewer(
            /* isEmbedded */ true,
            /* isTrusted */ false);
        return expectIsEnabled(false);
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
      const candidates = [1, 2, 3].map(() => html`<amp-img></amp-img>`);

      yield Promise.all(candidates.map(c => apply(env.ampdoc, c)));

      squaredCompare(candidates, (a, b) => {
        expect(a.getAttribute(LIGHTBOXABLE_ATTR))
            .not.to.equal(b.getAttribute(LIGHTBOXABLE_ATTR));
      });
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
