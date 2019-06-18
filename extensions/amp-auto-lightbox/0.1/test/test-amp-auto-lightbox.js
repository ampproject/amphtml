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
  DocMetaAnnotations,
  ENABLED_LD_JSON_TYPES,
  ENABLED_OG_TYPE_ARTICLE,
  LIGHTBOXABLE_ATTR,
  Mutation,
  RENDER_AREA_RATIO,
  REQUIRED_EXTENSION,
  Scanner,
  VIEWPORT_AREA_RATIO,
  apply,
  isEnabledForDoc,
  meetsSizingCriteria,
  runCandidates,
  scan,
} from '../amp-auto-lightbox';
import {Services} from '../../../../src/services';
import {Signals} from '../../../../src/utils/signals';
import {createElementWithAttributes} from '../../../../src/dom';
import {htmlFor} from '../../../../src/static-template';
import {isArray} from '../../../../src/types';
import {tryResolve} from '../../../../src/utils/promise';

const TAG = 'amp-auto-lightbox';

describes.realWin(
  TAG,
  {
    amp: {
      amp: true,
      ampdoc: 'single',
    },
  },
  env => {
    let html;

    const {any} = sinon.match;

    const ldJsonSchemaTypes = Object.keys(ENABLED_LD_JSON_TYPES);
    const ogTypes = [ENABLED_OG_TYPE_ARTICLE];

    const firstElementLeaf = el =>
      el.firstElementChild ? firstElementLeaf(el.firstElementChild) : el;

    function wrap(el, wrapper) {
      firstElementLeaf(wrapper).appendChild(el);
      return wrapper;
    }

    const stubAllCriteriaMet = () => env.sandbox.stub(Criteria, 'meetsAll');
    const mockAllCriteriaMet = isMet =>
      stubAllCriteriaMet().returns(tryResolve(() => isMet));

    function mockCandidates(candidates) {
      env.sandbox.stub(Scanner, 'getCandidates').returns(candidates);
      return candidates;
    }

    const mockLdJsonSchemaTypes = type =>
      env.sandbox
        .stub(DocMetaAnnotations, 'getAllLdJsonTypes')
        .returns(isArray(type) ? type : [type]);

    const mockOgType = type =>
      env.sandbox.stub(DocMetaAnnotations, 'getOgType').returns(type);

    const iterProduct = (a, b, callback) =>
      a.forEach(itemA => b.forEach(itemB => callback(itemA, itemB)));

    const squaredCompare = (set, callback) =>
      iterProduct(set, set, (a, b) => {
        if (a != b) {
          callback(a, b);
        }
      });

    function mockIsProxyOrigin(isProxyOrigin) {
      env.sandbox.stub(Services, 'urlForDoc').returns({
        isProxyOrigin() {
          return isProxyOrigin;
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

      env.sandbox
        .stub(Mutation, 'mutate')
        .callsFake((_, mutator) => tryResolve(mutator));
    });

    describe('meetsTreeShapeCriteria', () => {
      const meetsTreeShapeCriteriaMsg = ({outerHtml}) =>
        `Criteria.meetsTreeShapeCriteria(html\`${outerHtml}\`)`;

      function itAcceptsOrRejects(scenarios) {
        scenarios.forEach(({rejects, accepts, mutate, wrapWith}) => {
          const maybeWrap = root => (wrapWith ? wrap(root, wrapWith()) : root);
          const maybeMutate = root => mutate && mutate(root);

          it(`${accepts ? 'accepts' : 'rejects'} ${accepts || rejects}`, () => {
            [
              html`
                <amp-img src="asada.png"></amp-img>
              `,
              html`
                <div><amp-img src="adobada.png"></amp-img></div>
              `,
              html`
                <div>
                  <div><amp-img src="carnitas.png"></amp-img></div>
                </div>
              `,
            ].forEach(unwrapped => {
              maybeMutate(unwrapped);

              const scenario = maybeWrap(unwrapped);
              const candidate = firstElementLeaf(scenario);

              env.win.document.body.appendChild(scenario);

              expect(candidate).to.be.ok;
              expect(candidate.tagName).to.equal('AMP-IMG');

              expect(
                Criteria.meetsTreeShapeCriteria(candidate),
                meetsTreeShapeCriteriaMsg(scenario)
              ).to.equal(!!accepts);
            });
          });
        });
      }

      describe('self-test', () => {
        const criteriaIsMetThereforeAcceptsOrRejects = (isMet, scenarios) => {
          describe(`Criteria ${isMet ? 'met' : 'unmet'}`, () => {
            beforeEach(() => {
              env.sandbox
                .stub(Criteria, 'meetsTreeShapeCriteria')
                .returns(isMet);
            });
            itAcceptsOrRejects(scenarios);
          });
        };
        criteriaIsMetThereforeAcceptsOrRejects(true, [{accepts: 'any'}]);
        criteriaIsMetThereforeAcceptsOrRejects(false, [{rejects: 'any'}]);
      });

      beforeEach(() => {
        // Insert element for valid tap actions to be resolved.
        env.win.document.body.appendChild(
          html`
            <div id="valid"></div>
          `
        );
      });

      itAcceptsOrRejects([
        {
          accepts: 'elements by default',
        },
        {
          accepts: 'elements with a non-tap action',
          mutate: el => el.setAttribute('on', 'nottap:valid'),
        },
        {
          accepts: 'elements with a tap action that does not resolve to a node',
          mutate: el => el.setAttribute('on', 'tap:i-do-not-exist'),
        },
        {
          accepts: 'elements inside non-clickable anchor',
          wrapWith: () =>
            html`
              <a id="my-anchor"></a>
            `,
        },
        {
          rejects: 'explicitly opted-out subnodes',
          mutate: el => el.setAttribute('data-amp-auto-lightbox-disable', ''),
        },
        {
          rejects: 'amp-subscriptions subnodes',
          mutate: el => el.setAttribute('subscriptions-action', ''),
        },
        {
          rejects: 'placeholder subnodes',
          mutate: el => el.setAttribute('placeholder', ''),
        },
        {
          rejects: 'items actionable by tap with a single action',
          mutate: el => el.setAttribute('on', 'tap:valid'),
        },
        {
          rejects: 'items actionable by tap with multiple actions',
          mutate: el => el.setAttribute('on', 'whatever:something;tap:valid'),
        },
        {
          rejects: 'items inside an amp-selector',
          mutate: el => el.setAttribute('option', ''),
          wrapWith: () =>
            html`
              <amp-selector></amp-selector>
            `,
        },
        {
          rejects: 'items inside a button',
          wrapWith: () =>
            html`
              <button></button>
            `,
        },
        {
          rejects: 'items inside amp-script',
          wrapWith: () =>
            html`
              <amp-script></amp-script>
            `,
        },
        {
          rejects: 'items inside amp-story',
          wrapWith: () =>
            html`
              <amp-story></amp-story>
            `,
        },
        {
          rejects: 'items inside amp-lightbox',
          wrapWith: () =>
            html`
              <amp-lightbox></amp-lightbox>
            `,
        },
        {
          rejects: 'items inside a clickable link',
          wrapWith: () =>
            html`
              <a href="http://hamberders.com"></a>
            `,
        },
      ]);
    });

    describe('meetsSizingCriteria', () => {
      const areaDeltaPerc = RENDER_AREA_RATIO * 100;
      const {vw, vh} = {vw: 1000, vh: 600};

      const expectMeetsSizingCriteria = (
        renderWidth,
        renderHeight,
        naturalWidth,
        naturalHeight
      ) =>
        expect(
          meetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight,
            vw,
            vh
          )
        );

      it(`accepts elements ${areaDeltaPerc}%+ of size than render area`, () => {
        const renderWidth = 1000;
        const renderHeight = 200;

        const renderArea = renderWidth * renderHeight;

        const minArea = renderArea * RENDER_AREA_RATIO;
        const minDim = Math.sqrt(minArea);

        const axisRange = [minDim + 1, minDim + 10, minDim + 100];
        iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight
          ).to.be.true;
        });
      });

      it(`rejects elements < ${areaDeltaPerc}%+ of size of render area`, () => {
        const renderWidth = 100;
        const renderHeight = 100;

        const renderArea = renderWidth * renderHeight;

        const minArea = renderArea * (RENDER_AREA_RATIO - 0.1);
        const minDim = Math.sqrt(minArea);

        const axisRange = [minDim, minDim - 10, minDim - 100];
        iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight
          ).to.be.false;
        });
      });

      const minAreaPerc = VIEWPORT_AREA_RATIO * 100;

      it(`accepts elements that cover ${minAreaPerc}%+ of the viewport`, () => {
        const minArea = vw * vh * VIEWPORT_AREA_RATIO;
        const minDim = Math.sqrt(minArea);

        const naturalWidth = 100;
        const naturalHeight = 100;

        const axisRange = [minDim, minDim + 10, minDim + 100];
        iterProduct(axisRange, axisRange, (renderWidth, renderHeight) => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight
          ).to.be.true;
        });
      });

      it(`rejects elements that cover < ${minAreaPerc}% of the viewport`, () => {
        const minArea = vw * vh * VIEWPORT_AREA_RATIO;
        const minDim = Math.sqrt(minArea);

        const axisRange = [minDim - 1, minDim - 10, minDim - 100];
        iterProduct(axisRange, axisRange, (renderWidth, renderHeight) => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            /* naturalWidth */ renderWidth,
            /* naturalHeight */ renderHeight
          ).to.be.false;
        });
      });

      it("accepts elements with height > than viewport's", () => {
        const renderWidth = vw;
        const renderHeight = vh;

        [vh + 1, vh + 10, vh + 100].forEach(naturalHeight => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            /* naturalWidth */ renderWidth,
            naturalHeight
          ).to.be.true;
        });
      });

      it("accepts elements with width > than viewport's", () => {
        const renderWidth = vw;
        const renderHeight = vh;

        [vw + 1, vw + 10, vw + 100].forEach(naturalWidth => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            /* naturalHeight */ renderHeight
          ).to.be.true;
        });
      });

      it("rejects elements with dimensions <= than viewport's", () => {
        const renderWidth = 100;
        const renderHeight = 100;

        const axisRange = [renderWidth, renderWidth - 10, renderWidth - 100];
        iterProduct(axisRange, axisRange, (naturalWidth, naturalHeight) => {
          expectMeetsSizingCriteria(
            renderWidth,
            renderHeight,
            naturalWidth,
            naturalHeight
          ).to.be.false;
        });
      });
    });

    describe('scan', () => {
      const waitForAllScannedToBeResolved = () => {
        const scanned = scan(env.ampdoc);
        if (scanned) {
          return Promise.all(scanned);
        }
      };

      beforeEach(() => {
        // mock valid type
        mockLdJsonSchemaTypes(ldJsonSchemaTypes[0]);
      });

      it('does not load extension if no candidates found', async () => {
        const installExtensionForDoc = spyInstallExtensionsForDoc();

        mockIsProxyOrigin(true);
        mockCandidates([]);

        await waitForAllScannedToBeResolved();

        expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION)).to.not
          .have.been.called;
      });

      it('loads extension if >= 1 candidates meet criteria', async () => {
        const installExtensionForDoc = spyInstallExtensionsForDoc();

        mockIsProxyOrigin(true);
        mockCandidates([
          mockLoadedSignal(
            html`
              <amp-img></amp-img>
            `,
            true
          ),
        ]);

        mockAllCriteriaMet(true);

        await waitForAllScannedToBeResolved();

        expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION)).to.have
          .been.calledOnce;
      });

      it('does not load extension if no candidates meet criteria', async () => {
        const installExtensionForDoc = spyInstallExtensionsForDoc();

        mockCandidates([
          mockLoadedSignal(
            html`
              <amp-img></amp-img>
            `,
            true
          ),
        ]);

        mockAllCriteriaMet(false);
        mockIsProxyOrigin(true);

        await waitForAllScannedToBeResolved();

        expect(installExtensionForDoc.withArgs(any, REQUIRED_EXTENSION)).to.not
          .have.been.called;
      });

      it('sets attribute only for candidates that meet criteria', async () => {
        const a = mockLoadedSignal(
          html`
            <amp-img src="a.png"></amp-img>
          `,
          true
        );
        const b = mockLoadedSignal(
          html`
            <amp-img src="b.png"></amp-img>
          `,
          true
        );
        const c = mockLoadedSignal(
          html`
            <amp-img src="c.png"></amp-img>
          `,
          true
        );

        const allCriteriaMet = stubAllCriteriaMet();

        allCriteriaMet.withArgs(matchEquals(a)).returns(tryResolve(() => true));
        allCriteriaMet
          .withArgs(matchEquals(b))
          .returns(tryResolve(() => false));
        allCriteriaMet.withArgs(matchEquals(c)).returns(tryResolve(() => true));

        mockCandidates([a, b, c]);
        mockIsProxyOrigin(true);

        await waitForAllScannedToBeResolved();

        expect(a).to.have.attribute(LIGHTBOXABLE_ATTR);
        expect(b).to.not.have.attribute(LIGHTBOXABLE_ATTR);
        expect(c).to.have.attribute(LIGHTBOXABLE_ATTR);
      });

      it('sets unique group for candidates that meet criteria', async () => {
        const candidates = mockCandidates(
          [1, 2, 3].map(() =>
            mockLoadedSignal(
              html`
                <amp-img src="a.png"></amp-img>
              `,
              true
            )
          )
        );

        mockAllCriteriaMet(true);
        mockIsProxyOrigin(true);

        await waitForAllScannedToBeResolved();

        squaredCompare(candidates, (a, b) => {
          expect(a.getAttribute(LIGHTBOXABLE_ATTR)).not.to.equal(
            b.getAttribute(LIGHTBOXABLE_ATTR)
          );
        });
      });
    });

    describe('runCandidates', () => {
      it('filters out candidates that fail to load', async () => {
        const shouldNotLoad = mockLoadedSignal(
          html`
            <amp-img src="bla.png"></amp-img>
          `,
          false
        );

        const shouldLoad = mockLoadedSignal(
          html`
            <amp-img src="bla.png"></amp-img>
          `,
          true
        );

        const candidates = [shouldNotLoad, shouldLoad];

        mockAllCriteriaMet(true);

        const elected = await Promise.all(
          runCandidates(env.ampdoc, candidates)
        );

        expect(elected).to.have.length(2);
        expect(elected[0]).to.be.undefined;
        expect(elected[1]).to.equal(shouldLoad);
      });
    });

    describe('isEnabledForDoc', () => {
      const expectIsEnabled = shouldBeEnabled => {
        env.sandbox.stub(env.ampdoc, 'getBody').returns({
          // only needs to be truthy since its ref req is mocked
          firstElementChild: true,
        });
        expect(isEnabledForDoc(env.ampdoc)).to.equal(shouldBeEnabled);
      };

      it('rejects documents without any type annotation', () => {
        mockIsProxyOrigin(true);
        expectIsEnabled(false);
      });

      describe('DOM selection', () => {
        const mockRootNodeContent = els => {
          const fakeRoot = html`
            <div></div>
          `;
          els.forEach(el => {
            fakeRoot.appendChild(el);
          });
          env.sandbox.stub(env.ampdoc, 'getRootNode').returns(fakeRoot);
        };

        describe('getOgType', () => {
          it('returns empty', () => {
            expect(DocMetaAnnotations.getOgType(env.ampdoc)).to.be.undefined;
          });

          it('returns tag', () => {
            mockRootNodeContent([
              // Expected:
              html`
                <meta property="og:type" content="foo" />
              `,

              // Filler:
              html`
                <meta property="og:something" content="bar" />
              `,
              html`
                <meta property="vims and emacs are both awful" content="baz" />
              `,
              html`
                <meta name="description" content="My Website" />
              `,
            ]);

            expect(DocMetaAnnotations.getOgType(env.ampdoc)).to.equal('foo');
          });
        });

        describe('getAllLdJsonTypes', () => {
          const createLdJsonTag = content => {
            const tag = html`
              <script type="application/ld+json"></script>
            `;
            tag.textContent = JSON.stringify(content);
            return tag;
          };

          it('returns empty', () => {
            expect(DocMetaAnnotations.getAllLdJsonTypes(env.ampdoc)).to.be
              .empty;
          });

          it('returns all found @types', () => {
            const expectedA = 'foo';
            const expectedB = 'bar';
            const expectedC = 'baz';

            mockRootNodeContent([
              html`
                <script></script>
              `,
              createLdJsonTag({'@type': expectedA}),
              createLdJsonTag({'tacos': 'sí por favor'}),
              createLdJsonTag({'@type': expectedB}),
              createLdJsonTag({'@type': expectedC}),
              createLdJsonTag(''),
            ]);

            expect(
              DocMetaAnnotations.getAllLdJsonTypes(env.ampdoc)
            ).to.deep.equal([expectedA, expectedB, expectedC]);
          });
        });
      });

      describe('by LD+JSON @type', () => {
        it('rejects doc with invalid LD+JSON @type', () => {
          mockIsProxyOrigin(true);
          mockLdJsonSchemaTypes('hamberder');
          expectIsEnabled(false);
        });

        ldJsonSchemaTypes.forEach(type => {
          const typeSubObj = `{..."@type": "${type}"}`;

          it(`accepts docs with ${typeSubObj} schema and proxy origin`, () => {
            mockLdJsonSchemaTypes(type);
            mockIsProxyOrigin(true);
            expectIsEnabled(true);
          });

          it(`rejects docs with ${typeSubObj} schema, lightbox explicit`, () => {
            const doc = env.win.document;

            const extensionScript = createElementWithAttributes(doc, 'script', {
              'custom-element': REQUIRED_EXTENSION,
            });

            const lightboxable = createElementWithAttributes(doc, 'amp-img', {
              [LIGHTBOXABLE_ATTR]: '',
            });

            doc.head.appendChild(extensionScript);
            doc.body.appendChild(lightboxable);

            mockLdJsonSchemaTypes(type);
            mockIsProxyOrigin(true);
            expectIsEnabled(false);
          });

          it(`rejects docs with ${typeSubObj} schema, non-proxy origin`, () => {
            mockLdJsonSchemaTypes(type);
            mockIsProxyOrigin(false);
            expectIsEnabled(false);
          });
        });
      });

      describe('by og:type', () => {
        it('rejects doc with invalid <meta property="og:type">', () => {
          mockIsProxyOrigin(true);
          mockOgType('cinnamonroll');
          expectIsEnabled(false);
        });

        ogTypes.forEach(type => {
          const ogTypeMeta = `<meta property="og:type" content="${type}">`;

          it(`accepts docs with ${ogTypeMeta} and proxy origin`, () => {
            mockOgType(type);
            mockIsProxyOrigin(true);
            expectIsEnabled(true);
          });

          it(`rejects docs with ${ogTypeMeta}, but lightbox explicit`, () => {
            const doc = env.win.document;

            const extensionScript = createElementWithAttributes(doc, 'script', {
              'custom-element': REQUIRED_EXTENSION,
            });

            const lightboxable = createElementWithAttributes(doc, 'amp-img', {
              [LIGHTBOXABLE_ATTR]: '',
            });

            doc.head.appendChild(extensionScript);
            doc.body.appendChild(lightboxable);

            mockOgType(type);
            mockIsProxyOrigin(true);
            expectIsEnabled(false);
          });

          it(`rejects docs with ${ogTypeMeta} for non-proxy origin`, () => {
            mockOgType(type);
            mockIsProxyOrigin(false);
            expectIsEnabled(false);
          });
        });
      });
    });

    describe('apply', () => {
      it('sets attribute', async () => {
        const element = html`
          <amp-img src="chabuddy.g"></amp-img>
        `;

        await apply(env.ampdoc, element);

        expect(element).to.have.attribute(LIGHTBOXABLE_ATTR);
      });

      it('sets unique group for each element', async () => {
        const candidates = [1, 2, 3].map(
          () =>
            html`
              <amp-img></amp-img>
            `
        );

        await Promise.all(candidates.map(c => apply(env.ampdoc, c)));

        squaredCompare(candidates, (a, b) => {
          expect(a.getAttribute(LIGHTBOXABLE_ATTR)).not.to.equal(
            b.getAttribute(LIGHTBOXABLE_ATTR)
          );
        });
      });

      it('dispatches event', async () => {
        const element = html`
          <amp-img src="chabuddy.g"></amp-img>
        `;

        element.dispatchCustomEvent = env.sandbox.spy();

        await apply(env.ampdoc, element);

        expect(
          element.dispatchCustomEvent.withArgs(AutoLightboxEvents.NEWLY_SET)
        ).to.have.been.calledOnce;
      });
    });
  }
);
