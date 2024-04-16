import '../../../amp-ad/0.1/amp-ad';
import {Services} from '#service';

import {AdTracker} from '../ad-tracker';
import {PlacementState, getPlacementsFromConfigObj} from '../placement';

describes.realWin(
  'placement',
  {
    amp: {
      runtimeOn: true,
      ampdoc: 'single',
      extensions: ['amp-ad'],
    },
  },
  (env) => {
    let win, doc, ampdoc;
    let container;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      ampdoc = env.ampdoc;
      env.iframe.style.height = '1000px';

      const belowFoldSpacer = doc.createElement('div');
      belowFoldSpacer.style.height = '1000px';
      doc.body.appendChild(belowFoldSpacer);

      container = doc.createElement('div');
      doc.body.appendChild(container);
      // Stub whenBuilt to resolve immediately to handle upgrade for AdSense
      // to FF impl.
      env.sandbox
        .stub(win.__AMP_BASE_CE_CLASS.prototype, 'whenBuilt')
        .callsFake(() => Promise.resolve());
    });

    describe('getAdElement', () => {
      it('should get ad Element when ad placed', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });

        const result = placements[0].placeAd(attributes, sizing, adTracker);
        env.flushVsync();
        return result.then(() => {
          expect(placements[0].getAdElement()).to.equal(anchor.childNodes[0]);
        });
      });

      it('should throw an error if ad not placed', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        allowConsoleError(() => {
          expect(() => placements[0].getAdElement()).to.throw(/No ad element/);
        });
      });
    });

    describe('getEstimatedPosition', () => {
      it('should estimate the position when before anchor', () => {
        const anchor = doc.createElement('div');
        anchor.style.position = 'absolute';
        anchor.style.top = '15px';
        anchor.style.height = '100px';
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        return placements[0].getEstimatedPosition((yPosition) => {
          expect(yPosition).to.equal(15);
        });
      });

      it('should estimate the position when first child of anchor', () => {
        const anchor = doc.createElement('div');
        anchor.style.position = 'absolute';
        anchor.style.top = '15px';
        anchor.style.height = '100px';
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        return placements[0].getEstimatedPosition((yPosition) => {
          expect(yPosition).to.equal(15);
        });
      });

      it('should estimate the position when last child of anchor', () => {
        const anchor = doc.createElement('div');
        anchor.style.position = 'absolute';
        anchor.style.top = '15px';
        anchor.style.height = '100px';
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 3,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        return placements[0].getEstimatedPosition((yPosition) => {
          expect(yPosition).to.equal(115);
        });
      });

      it('should estimate the position when after anchor', () => {
        const anchor = doc.createElement('div');
        anchor.style.position = 'absolute';
        anchor.style.top = '15px';
        anchor.style.height = '100px';
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 4,
              type: 1,
            },
          ],
          console,
        });
        expect(placements).to.have.lengthOf(1);

        return placements[0].getEstimatedPosition((yPosition) => {
          expect(yPosition).to.equal(115);
        });
      });
    });

    describe('placeAd', () => {
      it('should place an ad with the correct base attributes', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const baseAttributes = {
          'type': '_ping_',
          'data-custom-att-1': 'val-1',
          'data-custom-att-2': 'val-2',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(baseAttributes, sizing, adTracker)
          .then(() => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('_ping_');
            expect(adElement.getAttribute('layout')).to.equal('fixed-height');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(adElement.getAttribute('data-custom-att-1')).to.equal(
              'val-1'
            );
            expect(adElement.getAttribute('data-custom-att-2')).to.equal(
              'val-2'
            );
          });
      });

      it('should place an ad with fixed layouts', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const baseAttributes = {
          'type': '_ping_',
          'data-custom-att-1': 'val-1',
          'data-custom-att-2': 'val-2',
        };

        const sizing = {
          width: '300',
          height: '250',
        };

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(baseAttributes, sizing, adTracker)
          .then(() => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('_ping_');
            expect(adElement.getAttribute('layout')).to.equal('fixed');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(adElement.getAttribute('width')).to.equal('300');
            expect(adElement.getAttribute('style')).to.equal(
              'width: 300px; height: 250px;'
            );
            expect(adElement.getAttribute('data-custom-att-1')).to.equal(
              'val-1'
            );
            expect(adElement.getAttribute('data-custom-att-2')).to.equal(
              'val-2'
            );
          });
      });

      it('should place an ad with the correct placement attributes', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
              attributes: {
                'type': 'adsense',
                'data-custom-att-1': 'val-1',
                'data-custom-att-2': 'val-2',
              },
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const baseAttributes = {
          'type': '_ping_',
          'data-custom-att-2': 'val-3',
          'data-custom-att-3': 'val-4',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(baseAttributes, sizing, adTracker)
          .then(() => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('adsense');
            expect(adElement.getAttribute('layout')).to.equal('fixed-height');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(adElement.getAttribute('data-custom-att-1')).to.equal(
              'val-1'
            );
            expect(adElement.getAttribute('data-custom-att-2')).to.equal(
              'val-2'
            );
            expect(adElement.getAttribute('data-custom-att-3')).to.equal(
              'val-4'
            );
          });
      });

      it('should place an ad with i-amphtml-layout-awaiting-size class.', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const baseAttributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });

        const mutator = Services.mutatorForDoc(anchor);
        env.sandbox.stub(mutator, 'requestChangeSize').callsFake(() => {
          return Promise.reject();
        });

        return placements[0]
          .placeAd(baseAttributes, sizing, adTracker)
          .then(() => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('_ping_');
            expect(adElement.getAttribute('layout')).to.equal('fixed-height');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(
              adElement.classList.contains('i-amphtml-layout-awaiting-size')
            ).to.be.true;
          });
      });

      it('should place an ad with the correct margins', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
              style: {
                'top_m': 5,
                'bot_m': 6,
              },
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0].placeAd(attributes, sizing, adTracker).then(() => {
          const adElement = anchor.firstChild;
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement.getAttribute('type')).to.equal('_ping_');
          expect(adElement.getAttribute('layout')).to.equal('fixed-height');
          expect(adElement.getAttribute('height')).to.equal('0');
          expect(adElement.style.marginTop).to.equal('5px');
          expect(adElement.style.marginBottom).to.equal('6px');
          expect(adElement.style.marginLeft).to.equal('');
          expect(adElement.style.marginRight).to.equal('');
        });
      });

      it('should place an ad with top margin only', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
              style: {
                'top_m': 5,
              },
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0].placeAd(attributes, sizing, adTracker).then(() => {
          const adElement = anchor.firstChild;
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement.getAttribute('type')).to.equal('_ping_');
          expect(adElement.getAttribute('layout')).to.equal('fixed-height');
          expect(adElement.getAttribute('height')).to.equal('0');
          expect(adElement.style.marginTop).to.equal('5px');
          expect(adElement.style.marginBottom).to.equal('');
          expect(adElement.style.marginLeft).to.equal('');
          expect(adElement.style.marginRight).to.equal('');
        });
      });

      it('should place an ad with bottom margin only', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
              style: {
                'bot_m': 6,
              },
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0].placeAd(attributes, sizing, adTracker).then(() => {
          const adElement = anchor.firstChild;
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement.getAttribute('type')).to.equal('_ping_');
          expect(adElement.getAttribute('layout')).to.equal('fixed-height');
          expect(adElement.getAttribute('height')).to.equal('0');
          expect(adElement.style.marginTop).to.equal('');
          expect(adElement.style.marginBottom).to.equal('6px');
          expect(adElement.style.marginLeft).to.equal('');
          expect(adElement.style.marginRight).to.equal('');
        });
      });

      it('should place an ad with no margins', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
              style: {},
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0].placeAd(attributes, sizing, adTracker).then(() => {
          const adElement = anchor.firstChild;
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement.getAttribute('type')).to.equal('_ping_');
          expect(adElement.getAttribute('layout')).to.equal('fixed-height');
          expect(adElement.getAttribute('height')).to.equal('0');
          expect(adElement.style.marginTop).to.equal('');
          expect(adElement.style.marginBottom).to.equal('');
          expect(adElement.style.marginLeft).to.equal('');
          expect(adElement.style.marginRight).to.equal('');
        });
      });

      it('should set the full-with responsive attributes for responsive enabled users on narrow viewport.', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const viewportMock = env.sandbox.mock(
          Services.viewportForDoc(env.win.document)
        );
        viewportMock
          .expects('getSize')
          .returns({width: 487, height: 823})
          .atLeast(1);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker, true)
          .then((placementState) => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('_ping_');
            expect(adElement.getAttribute('layout')).to.equal('fixed');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(adElement.getAttribute('data-auto-format')).to.equal('rspv');
            expect(adElement.hasAttribute('data-full-width')).to.be.true;
            expect(adElement.style.marginTop).to.equal('');
            expect(adElement.style.marginBottom).to.equal('');
            expect(adElement.style.marginLeft).to.equal('');
            expect(adElement.style.marginRight).to.equal('');
            expect(placementState).to.equal(PlacementState.RESIZE_FAILED);
          });
      });

      it('should not set the full-with responsive attributes for responsive enabled users on wide viewport.', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const viewportMock = env.sandbox.mock(
          Services.viewportForDoc(env.win.document)
        );
        viewportMock
          .expects('getSize')
          .returns({width: 488, height: 1000})
          .atLeast(1);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};
        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });

        return placements[0]
          .placeAd(attributes, sizing, adTracker, true)
          .then((placementState) => {
            const adElement = anchor.firstChild;
            expect(adElement.tagName).to.equal('AMP-AD');
            expect(adElement.getAttribute('type')).to.equal('_ping_');
            expect(adElement.getAttribute('layout')).to.equal('fixed-height');
            expect(adElement.getAttribute('height')).to.equal('0');
            expect(adElement.hasAttribute('data-auto-format')).to.be.false;
            expect(adElement.hasAttribute('data-full-width')).to.be.false;
            expect(adElement.style.marginTop).to.equal('');
            expect(adElement.style.marginBottom).to.equal('');
            expect(adElement.style.marginLeft).to.equal('');
            expect(adElement.style.marginRight).to.equal('');
            expect(placementState).to.equal(PlacementState.PLACED);
          });
      });

      it('should report placement placed when resize allowed', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const mutator = Services.mutatorForDoc(anchor);
        env.sandbox.stub(mutator, 'requestChangeSize').callsFake(() => {
          return Promise.resolve();
        });

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(mutator.requestChangeSize).to.have.been.calledWith(
              anchor.firstChild,
              250,
              undefined
            );
            expect(placementState).to.equal(PlacementState.PLACED);
          });
      });

      it('should report resize failed when resize not allowed', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const mutator = Services.mutatorForDoc(anchor);
        env.sandbox.stub(mutator, 'requestChangeSize').callsFake(() => {
          return Promise.reject(new Error('Resize failed'));
        });

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(mutator.requestChangeSize).to.have.been.calledWith(
              anchor.firstChild,
              250,
              undefined
            );
            expect(placementState).to.equal(PlacementState.RESIZE_FAILED);
          });
      });

      it('should report too near existing ad', () => {
        const fakeAd = doc.createElement('div');
        container.appendChild(fakeAd);

        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const adTracker = new AdTracker([fakeAd], {
          initialMinSpacing: 100,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });

        const sizing = {};

        const attributes = {
          'type': '_ping_',
        };

        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(
              PlacementState.TOO_NEAR_EXISTING_AD
            );
          });
      });
    });

    describe('Ad positioning', () => {
      it('should place the ad before the anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(2);
            expect(container.childNodes[0].tagName).to.equal('AMP-AD');
          });
      });

      it('should place the ad after the anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 4,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(2);
            expect(container.childNodes[1].tagName).to.equal('AMP-AD');
          });
      });

      it('should place the ad as the first child of the anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);
        anchor.appendChild(doc.createElement('div'));

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(1);
            expect(anchor.childNodes[0].tagName).to.equal('AMP-AD');
          });
      });

      it('should place the ad as the last child of the anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);
        anchor.appendChild(doc.createElement('div'));

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 3,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(1);
            expect(anchor.childNodes[1].tagName).to.equal('AMP-AD');
          });
      });

      it('should place the ad inside the 2nd anchor with class name', () => {
        const anchor1 = doc.createElement('div');
        anchor1.className = 'aClass';
        container.appendChild(anchor1);

        const anchor2 = doc.createElement('div');
        anchor2.className = 'aClass';
        container.appendChild(anchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV.aClass',
                index: 1,
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        const attributes = {
          'type': '_ping_',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 0,
          subsequentMinSpacing: [],
          maxAdCount: 10,
        });
        return placements[0]
          .placeAd(attributes, sizing, adTracker)
          .then((placementState) => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(anchor1.childNodes).to.have.lengthOf(0);
            expect(anchor2.childNodes).to.have.lengthOf(1);
            expect(anchor2.childNodes[0].tagName).to.equal('AMP-AD');
          });
      });
    });

    describe('getPlacementsFromConfigObj', () => {
      it('should get a placement from the config object', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
      });

      it('should return empty array when no placements array', () => {
        const placements = getPlacementsFromConfigObj(ampdoc, {});
        expect(placements).to.be.empty;
      });

      it('should not return a placement with no anchor property', () => {
        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it('should not return a placement with no selector in the anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {},
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it('should not return a placement with an invalid position', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 5,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it("should not return placement if its anchor doesn't exist on the page", () => {
        const anchor = doc.createElement('div');
        anchor.id = 'wrongId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it('should get a placement for the 2nd anchor with class name', () => {
        const anchor1 = doc.createElement('div');
        anchor1.className = 'aClass';
        container.appendChild(anchor1);

        const anchor2 = doc.createElement('div');
        anchor2.className = 'aClass';
        container.appendChild(anchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV.aClass',
                index: 1,
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);

        expect(placements[0].anchorElement_).to.eql(anchor2);
      });

      it('should get a placement for all the anchors with class name', () => {
        const anchor1 = doc.createElement('div');
        anchor1.className = 'aClass';
        container.appendChild(anchor1);

        const anchor2 = doc.createElement('div');
        anchor2.className = 'aClass';
        container.appendChild(anchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV.aClass',
                all: true,
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(2);

        expect(placements[0].anchorElement_).to.eql(anchor1);
        expect(placements[1].anchorElement_).to.eql(anchor2);
      });

      it(
        'should get a placement for the 2nd anchor with class name when ' +
          'index and all both specified.',
        () => {
          const anchor1 = doc.createElement('div');
          anchor1.className = 'aClass';
          container.appendChild(anchor1);

          const anchor2 = doc.createElement('div');
          anchor2.className = 'aClass';
          container.appendChild(anchor2);

          const placements = getPlacementsFromConfigObj(ampdoc, {
            placements: [
              {
                anchor: {
                  selector: 'DIV.aClass',
                  index: 0,
                  all: true,
                },
                pos: 2,
                type: 1,
              },
            ],
          });
          expect(placements).to.have.lengthOf(1);

          expect(placements[0].anchorElement_).to.eql(anchor1);
        }
      );

      it('should only get placement for element with sufficient textContent', () => {
        const nonAnchor = doc.createElement('div');
        nonAnchor.className = 'class1';
        container.appendChild(nonAnchor);
        nonAnchor.appendChild(doc.createTextNode('abc'));

        const anchor = doc.createElement('div');
        anchor.className = 'class1';
        container.appendChild(anchor);
        anchor.appendChild(doc.createTextNode('abcd'));

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: '.class1',
                'min_c': 4,
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
        expect(placements[0].anchorElement_).to.eql(anchor);
      });

      it("should not return a placement that's inside an amp-sidebar", () => {
        const anchor = doc.createElement('amp-sidebar');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'AMP-SIDEBAR#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it("should not return a placement that's inside an amp-app-banner", () => {
        const anchor = doc.createElement('amp-app-banner');
        anchor.setAttribute('layout', 'nodisplay');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'AMP-APP-BANNER#anId',
              },
              pos: 2,
              type: 1,
            },
          ],
        });
        expect(placements).to.be.empty;
      });

      it('should get a placement when outside amp-sidebar', () => {
        const anchor = doc.createElement('amp-sidebar');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'AMP-SIDEBAR#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
      });

      it(
        'should not return a placement that is a child of a denylisted ' +
          'ancestor.',
        () => {
          const parent = doc.createElement('amp-sidebar');
          container.appendChild(parent);

          const anchor = doc.createElement('div');
          anchor.id = 'anId';
          parent.appendChild(anchor);

          const placements = getPlacementsFromConfigObj(ampdoc, {
            placements: [
              {
                anchor: {
                  selector: 'DIV#anId',
                },
                pos: 1,
                type: 1,
              },
            ],
          });
          expect(placements).to.have.lengthOf(0);
        }
      );

      it('should get a placement when anchor parent of denylisted ancestor.', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const child = doc.createElement('amp-sidebar');
        anchor.appendChild(child);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
      });
    });

    describe('getPlacementsFromConfigObj, sub-anchors', () => {
      it('should get placements using the sub anchor', () => {
        const nonAnchor = doc.createElement('div');
        nonAnchor.id = 'anId';
        container.appendChild(nonAnchor);

        const nonSubAnchor1 = doc.createElement('div');
        nonSubAnchor1.className = 'sub-class';
        nonAnchor.appendChild(nonSubAnchor1);

        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const subAnchor1 = doc.createElement('div');
        subAnchor1.className = 'sub-class';
        anchor.appendChild(subAnchor1);

        const nonSubAnchor2 = doc.createElement('div');
        nonSubAnchor2.className = 'non-sub-class';
        anchor.appendChild(nonSubAnchor2);

        const subAnchor2 = doc.createElement('div');
        subAnchor2.className = 'sub-class';
        anchor.appendChild(subAnchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                index: 1,
                sub: {
                  selector: '.sub-class',
                  all: true,
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(2);
        expect(placements[0].anchorElement_).to.eql(subAnchor1);
        expect(placements[1].anchorElement_).to.eql(subAnchor2);
      });

      it('should get placement only for anchor indexed in sub-anchor', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const subAnchor1 = doc.createElement('div');
        subAnchor1.className = 'sub-class';
        anchor.appendChild(subAnchor1);

        const subAnchor2 = doc.createElement('div');
        subAnchor2.className = 'sub-class';
        anchor.appendChild(subAnchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                sub: {
                  selector: '.sub-class',
                  index: 1,
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
        expect(placements[0].anchorElement_).to.eql(subAnchor2);
      });

      it('should get placements using recursive sub anchors', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const subAnchor1 = doc.createElement('div');
        subAnchor1.className = 'sub-class1';
        anchor.appendChild(subAnchor1);

        const subSubAnchor1 = doc.createElement('div');
        subSubAnchor1.className = 'sub-class2';
        subAnchor1.appendChild(subSubAnchor1);

        const nonSubSubAnchor = doc.createElement('div');
        nonSubSubAnchor.className = 'sub-class3';
        subAnchor1.appendChild(nonSubSubAnchor);

        const subAnchor2 = doc.createElement('div');
        subAnchor2.className = 'sub-class1';
        anchor.appendChild(subAnchor2);

        const subSubAnchor2 = doc.createElement('div');
        subSubAnchor2.className = 'sub-class2';
        subAnchor2.appendChild(subSubAnchor2);

        const nonSubAnchor = doc.createElement('div');
        nonSubAnchor.className = 'sub-class1';
        anchor.appendChild(nonSubAnchor);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                sub: {
                  selector: '.sub-class1',
                  all: true,
                  sub: {
                    selector: '.sub-class2',
                    all: true,
                  },
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(2);
        expect(placements[0].anchorElement_).to.eql(subSubAnchor1);
        expect(placements[1].anchorElement_).to.eql(subSubAnchor2);
      });

      it('should not return placement when no element matches sub anchor', () => {
        const nonAnchor = doc.createElement('div');
        nonAnchor.id = 'anId';
        container.appendChild(nonAnchor);

        const nonSubAnchor1 = doc.createElement('div');
        nonSubAnchor1.className = 'sub-class';
        nonAnchor.appendChild(nonSubAnchor1);

        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const nonSubAnchor2 = doc.createElement('div');
        nonSubAnchor2.className = 'non-sub-class';
        anchor.appendChild(nonSubAnchor2);

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                index: 1,
                sub: {
                  selector: '.sub-class',
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(0);
      });

      it(
        'sub anchor query selector matching should be scoped to within parent ' +
          'anchor element',
        () => {
          const wrapper = doc.createElement('div');
          wrapper.className = 'class1';
          container.appendChild(wrapper);

          const anchor = doc.createElement('div');
          anchor.className = 'class2';
          wrapper.appendChild(anchor);

          const subAnchor = doc.createElement('div');
          subAnchor.className = 'class3';
          anchor.appendChild(subAnchor);

          const placements = getPlacementsFromConfigObj(ampdoc, {
            placements: [
              {
                anchor: {
                  selector: 'body DIV.class2',
                  sub: {
                    selector: 'DIV.class1 DIV.class3',
                    all: true,
                  },
                },
                pos: 1,
                type: 1,
              },
            ],
          });
          expect(placements).to.have.lengthOf(0);
        }
      );

      it('should only get placements for elements with sufficient textContent', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const subAnchor1 = doc.createElement('div');
        subAnchor1.className = 'sub-class';
        anchor.appendChild(subAnchor1);
        subAnchor1.appendChild(doc.createTextNode('abc'));

        const subAnchor2 = doc.createElement('div');
        subAnchor2.className = 'sub-class';
        anchor.appendChild(subAnchor2);
        subAnchor2.appendChild(doc.createTextNode('abcd'));

        const subAnchor3 = doc.createElement('div');
        subAnchor3.className = 'sub-class';
        anchor.appendChild(subAnchor3);
        subAnchor3.appendChild(doc.createTextNode('abcd'));

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                sub: {
                  selector: '.sub-class',
                  'min_c': 4,
                  all: true,
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(2);
        expect(placements[0].anchorElement_).to.eql(subAnchor2);
        expect(placements[1].anchorElement_).to.eql(subAnchor3);
      });

      it('should only get placement for element with sufficient textContent', () => {
        const anchor = doc.createElement('div');
        anchor.id = 'anId';
        container.appendChild(anchor);

        const subAnchor1 = doc.createElement('div');
        subAnchor1.className = 'sub-class';
        anchor.appendChild(subAnchor1);
        subAnchor1.appendChild(doc.createTextNode('abc'));

        const subAnchor2 = doc.createElement('div');
        subAnchor2.className = 'sub-class';
        anchor.appendChild(subAnchor2);
        subAnchor2.appendChild(doc.createTextNode('abcd'));

        const placements = getPlacementsFromConfigObj(ampdoc, {
          placements: [
            {
              anchor: {
                selector: 'DIV#anId',
                sub: {
                  selector: '.sub-class',
                  'min_c': 4,
                  index: 0,
                },
              },
              pos: 1,
              type: 1,
            },
          ],
        });
        expect(placements).to.have.lengthOf(1);
        expect(placements[0].anchorElement_).to.eql(subAnchor2);
      });
    });
  }
);
