/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import {AdStrategy} from '../ad-strategy';
import {AdTracker} from '../ad-tracker';
import {PlacementState, getPlacementsFromConfigObj} from '../placement';

describes.realWin(
  'amp-strategy',
  {
    amp: {
      runtimeOn: true,
      ampdoc: 'single',
      extensions: ['amp-ad'],
    },
  },
  env => {
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
    });

    it('should call placeAd with correct parameters', () => {
      const anchor1 = doc.createElement('div');
      anchor1.id = 'anchor1Id';
      container.appendChild(anchor1);

      const configObj = {
        placements: [
          {
            anchor: {
              selector: 'DIV#anchor1Id',
            },
            pos: 2,
            type: 1,
          },
        ],
      };
      const placements = getPlacementsFromConfigObj(ampdoc, configObj);
      expect(placements).to.have.lengthOf(1);

      const placeAdSpy = sandbox.spy(placements[0], 'placeAd');

      const attributes = {
        'type': 'adsense',
        'data-custom-att-1': 'val-1',
        'data-custom-att-2': 'val-2',
      };

      const sizing = {};

      const adTracker = new AdTracker([], {
        initialMinSpacing: 0,
        subsequentMinSpacing: [],
        maxAdCount: 1,
      });
      const adStrategy = new AdStrategy(
        placements,
        attributes,
        sizing,
        adTracker,
        true
      );

      return adStrategy.run().then(unused => {
        expect(placeAdSpy).to.be.calledWith(
          attributes,
          sizing,
          adTracker,
          true
        );
      });
    });

    it('should place an ad in the first placement only with correct attributes', () => {
      const anchor1 = doc.createElement('div');
      anchor1.id = 'anchor1Id';
      container.appendChild(anchor1);

      const anchor2 = doc.createElement('div');
      anchor2.id = 'anchor2Id';
      container.appendChild(anchor2);

      const configObj = {
        placements: [
          {
            anchor: {
              selector: 'DIV#anchor1Id',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anchor2Id',
            },
            pos: 2,
            type: 1,
          },
        ],
      };
      const placements = getPlacementsFromConfigObj(ampdoc, configObj);
      expect(placements).to.have.lengthOf(2);

      const attributes = {
        'type': 'adsense',
        'data-custom-att-1': 'val-1',
        'data-custom-att-2': 'val-2',
      };

      const sizing = {};

      const adTracker = new AdTracker([], {
        initialMinSpacing: 0,
        subsequentMinSpacing: [],
        maxAdCount: 1,
      });
      const adStrategy = new AdStrategy(
        placements,
        attributes,
        sizing,
        adTracker
      );

      return adStrategy.run().then(result => {
        expect(result).to.deep.equal({adsPlaced: 1, totalAdsOnPage: 1});
        expect(anchor1.childNodes).to.have.lengthOf(1);
        expect(anchor2.childNodes).to.have.lengthOf(0);
        const adElement = anchor1.childNodes[0];
        expect(adElement.tagName).to.equal('AMP-AD');
        expect(adElement.getAttribute('type')).to.equal('adsense');
        expect(adElement.getAttribute('data-custom-att-1')).to.equal('val-1');
        expect(adElement.getAttribute('data-custom-att-2')).to.equal('val-2');
      });
    });

    it('should place the second ad when placing the first one fails', () => {
      const anchor1 = doc.createElement('div');
      anchor1.id = 'anchor1Id';
      container.appendChild(anchor1);

      const anchor2 = doc.createElement('div');
      anchor2.id = 'anchor2Id';
      container.appendChild(anchor2);

      const configObj = {
        placements: [
          {
            anchor: {
              selector: 'DIV#anchor1Id',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anchor2Id',
            },
            pos: 2,
            type: 1,
          },
        ],
      };
      const placements = getPlacementsFromConfigObj(ampdoc, configObj);

      expect(placements).to.have.lengthOf(2);
      sandbox.stub(placements[0], 'placeAd').callsFake(() => {
        return Promise.resolve(PlacementState.REIZE_FAILED);
      });

      const attributes = {
        'type': 'adsense',
        'data-custom-att-1': 'val-1',
        'data-custom-att-2': 'val-2',
      };

      const sizing = {};

      const adTracker = new AdTracker([], {
        initialMinSpacing: 0,
        subsequentMinSpacing: [],
        maxAdCount: 1,
      });
      const adStrategy = new AdStrategy(
        placements,
        attributes,
        sizing,
        adTracker
      );

      return adStrategy.run().then(result => {
        expect(result).to.deep.equal({adsPlaced: 1, totalAdsOnPage: 1});
        expect(anchor1.childNodes).to.have.lengthOf(0);
        expect(anchor2.childNodes).to.have.lengthOf(1);
        const adElement = anchor2.childNodes[0];
        expect(adElement.tagName).to.equal('AMP-AD');
        expect(adElement.getAttribute('type')).to.equal('adsense');
        expect(adElement.getAttribute('data-custom-att-1')).to.equal('val-1');
        expect(adElement.getAttribute('data-custom-att-2')).to.equal('val-2');
      });
    });

    it(
      'should place an ad in the first placement only when second placement ' +
        'too close.',
      () => {
        const belowViewportSpacer = doc.createElement('div');
        belowViewportSpacer.style.height = '1000px';
        container.appendChild(belowViewportSpacer);

        const anchor1 = doc.createElement('div');
        anchor1.id = 'anchor1Id';
        container.appendChild(anchor1);

        const spacer = doc.createElement('div');
        spacer.style.height = '199px';
        container.appendChild(spacer);

        const anchor2 = doc.createElement('div');
        anchor2.id = 'anchor2Id';
        container.appendChild(anchor2);

        const configObj = {
          placements: [
            {
              anchor: {
                selector: 'DIV#anchor1Id',
              },
              pos: 2,
              type: 1,
            },
            {
              anchor: {
                selector: 'DIV#anchor2Id',
              },
              pos: 2,
              type: 1,
            },
          ],
        };
        const placements = getPlacementsFromConfigObj(ampdoc, configObj);
        expect(placements).to.have.lengthOf(2);

        const attributes = {
          'type': 'adsense',
          'data-custom-att-1': 'val-1',
          'data-custom-att-2': 'val-2',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 200,
          subsequentMinSpacing: [],
          maxAdCount: 2,
        });
        const adStrategy = new AdStrategy(
          placements,
          attributes,
          sizing,
          adTracker
        );

        return adStrategy.run().then(result => {
          expect(result).to.deep.equal({adsPlaced: 1, totalAdsOnPage: 1});
          expect(anchor1.childNodes).to.have.lengthOf(1);
          expect(anchor2.childNodes).to.have.lengthOf(0);
          const adElement = anchor1.childNodes[0];
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement.getAttribute('type')).to.equal('adsense');
          expect(adElement.getAttribute('data-custom-att-1')).to.equal('val-1');
          expect(adElement.getAttribute('data-custom-att-2')).to.equal('val-2');
        });
      }
    );

    it(
      'should place an ad in the first placement and second placement when ' +
        'sufficiently far apart.',
      () => {
        const belowViewportSpacer = doc.createElement('div');
        belowViewportSpacer.style.height = '1000px';
        container.appendChild(belowViewportSpacer);

        const anchor1 = doc.createElement('div');
        anchor1.id = 'anchor1Id';
        container.appendChild(anchor1);

        const spacer = doc.createElement('div');
        spacer.style.height = '200px';
        container.appendChild(spacer);

        const anchor2 = doc.createElement('div');
        anchor2.id = 'anchor2Id';
        container.appendChild(anchor2);

        const configObj = {
          placements: [
            {
              anchor: {
                selector: 'DIV#anchor1Id',
              },
              pos: 2,
              type: 1,
            },
            {
              anchor: {
                selector: 'DIV#anchor2Id',
              },
              pos: 2,
              type: 1,
            },
          ],
        };
        const placements = getPlacementsFromConfigObj(ampdoc, configObj);
        expect(placements).to.have.lengthOf(2);

        const attributes = {
          'type': 'adsense',
          'data-custom-att-1': 'val-1',
          'data-custom-att-2': 'val-2',
        };

        const sizing = {};

        const adTracker = new AdTracker([], {
          initialMinSpacing: 200,
          subsequentMinSpacing: [],
          maxAdCount: 2,
        });
        const adStrategy = new AdStrategy(
          placements,
          attributes,
          sizing,
          adTracker
        );

        return adStrategy.run().then(result => {
          expect(result).to.deep.equal({adsPlaced: 2, totalAdsOnPage: 2});
          expect(anchor1.childNodes).to.have.lengthOf(1);
          expect(anchor2.childNodes).to.have.lengthOf(1);
          const adElement1 = anchor1.childNodes[0];
          expect(adElement1.tagName).to.equal('AMP-AD');
          expect(adElement1.getAttribute('type')).to.equal('adsense');
          expect(adElement1.getAttribute('data-custom-att-1')).to.equal(
            'val-1'
          );
          expect(adElement1.getAttribute('data-custom-att-2')).to.equal(
            'val-2'
          );
          const adElement2 = anchor2.childNodes[0];
          expect(adElement2.tagName).to.equal('AMP-AD');
          expect(adElement2.getAttribute('type')).to.equal('adsense');
          expect(adElement2.getAttribute('data-custom-att-1')).to.equal(
            'val-1'
          );
          expect(adElement2.getAttribute('data-custom-att-2')).to.equal(
            'val-2'
          );
        });
      }
    );

    it(
      'should place an ad in the first placement only when already an ad on ' +
        'the page.',
      () => {
        const fakeExistingAd = doc.createElement('div');
        container.appendChild(fakeExistingAd);

        const belowViewportSpacer = doc.createElement('div');
        belowViewportSpacer.style.height = '1000px';
        container.appendChild(belowViewportSpacer);

        const anchor1 = doc.createElement('div');
        anchor1.id = 'anchor1Id';
        container.appendChild(anchor1);

        const spacer = doc.createElement('div');
        spacer.style.height = '200px';
        container.appendChild(spacer);

        const anchor2 = doc.createElement('div');
        anchor2.id = 'anchor2Id';
        container.appendChild(anchor2);

        const configObj = {
          placements: [
            {
              anchor: {
                selector: 'DIV#anchor1Id',
              },
              pos: 2,
              type: 1,
            },
            {
              anchor: {
                selector: 'DIV#anchor2Id',
              },
              pos: 2,
              type: 1,
            },
          ],
        };
        const placements = getPlacementsFromConfigObj(ampdoc, configObj);
        expect(placements).to.have.lengthOf(2);

        const attributes = {
          'type': 'adsense',
          'data-custom-att-1': 'val-1',
          'data-custom-att-2': 'val-2',
        };

        const sizing = {};

        const adTracker = new AdTracker([fakeExistingAd], {
          initialMinSpacing: 200,
          subsequentMinSpacing: [],
          maxAdCount: 2,
        });
        const adStrategy = new AdStrategy(
          placements,
          attributes,
          sizing,
          adTracker
        );

        return adStrategy.run().then(result => {
          expect(result).to.deep.equal({adsPlaced: 1, totalAdsOnPage: 2});
          expect(anchor1.childNodes).to.have.lengthOf(1);
          expect(anchor2.childNodes).to.have.lengthOf(0);
          const adElement1 = anchor1.childNodes[0];
          expect(adElement1.tagName).to.equal('AMP-AD');
          expect(adElement1.getAttribute('type')).to.equal('adsense');
          expect(adElement1.getAttribute('data-custom-att-1')).to.equal(
            'val-1'
          );
          expect(adElement1.getAttribute('data-custom-att-2')).to.equal(
            'val-2'
          );
        });
      }
    );

    it('should report unable to place either ad', () => {
      const anchor1 = doc.createElement('div');
      anchor1.id = 'anchor1Id';
      container.appendChild(anchor1);

      const anchor2 = doc.createElement('div');
      anchor2.id = 'anchor2Id';
      container.appendChild(anchor2);

      const configObj = {
        placements: [
          {
            anchor: {
              selector: 'DIV#anchor1Id',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anchor2Id',
            },
            pos: 2,
            type: 1,
          },
        ],
      };
      const placements = getPlacementsFromConfigObj(ampdoc, configObj);

      expect(placements).to.have.lengthOf(2);
      sandbox.stub(placements[0], 'placeAd').callsFake(() => {
        return Promise.resolve(PlacementState.REIZE_FAILED);
      });
      sandbox.stub(placements[1], 'placeAd').callsFake(() => {
        return Promise.resolve(PlacementState.REIZE_FAILED);
      });

      const attributes = {
        'type': 'adsense',
      };

      const sizing = {};

      const adTracker = new AdTracker([], {
        initialMinSpacing: 0,
        subsequentMinSpacing: [],
        maxAdCount: 1,
      });
      const adStrategy = new AdStrategy(
        placements,
        attributes,
        sizing,
        adTracker
      );

      return adStrategy.run().then(result => {
        expect(result).to.deep.equal({adsPlaced: 0, totalAdsOnPage: 0});
        expect(anchor1.childNodes).to.have.lengthOf(0);
        expect(anchor2.childNodes).to.have.lengthOf(0);
      });
    });
  }
);
