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
import {PlacementState, getPlacementsFromConfigObj} from '../placement';
import * as sinon from 'sinon';

describe('ad-strategy', () => {

  let sandbox;
  let container;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(container);
  });

  it('should place an ad in the first placement only with correct attributes',
      () => {
        const anchor1 = document.createElement('div');
        anchor1.id = 'anchor1Id';
        container.appendChild(anchor1);

        const anchor2 = document.createElement('div');
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
        const placements = getPlacementsFromConfigObj(window, configObj);
        expect(placements).to.have.lengthOf(2);

        const adStrategy = new AdStrategy('ad-network-type', placements, [
          {
            name: 'custom-att-1',
            value: 'val-1',
          },
          {
            name: 'custom-att-2',
            value: 'val-2',
          },
        ]);

        return adStrategy.run().then(success => {
          expect(success).to.equal(true);
          expect(anchor1.childNodes).to.have.lengthOf(1);
          expect(anchor2.childNodes).to.have.lengthOf(0);
          const adElement = anchor1.childNodes[0];
          expect(adElement.tagName).to.equal('AMP-AD');
          expect(adElement).to.have.attribute('type', 'ad-network-type');
          expect(adElement).to.have.attribute('data-custom-att-1', 'val-1');
          expect(adElement).to.have.attribute('data-custom-att-2', 'val-2');
        });
      });

  it('should place the second ad when placing the first one fails', () => {
    const anchor1 = document.createElement('div');
    anchor1.id = 'anchor1Id';
    container.appendChild(anchor1);

    const anchor2 = document.createElement('div');
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
    const placements = getPlacementsFromConfigObj(window, configObj);

    expect(placements).to.have.lengthOf(2);
    sandbox.stub(placements[0], 'placeAd', () => {
      return Promise.resolve(PlacementState.REIZE_FAILED);
    });

    const adStrategy = new AdStrategy('ad-network-type', placements, [
      {
        name: 'custom-att-1',
        value: 'val-1',
      },
      {
        name: 'custom-att-2',
        value: 'val-2',
      },
    ]);

    return adStrategy.run().then(success => {
      expect(success).to.equal(true);
      expect(anchor1.childNodes).to.have.lengthOf(0);
      expect(anchor2.childNodes).to.have.lengthOf(1);
      const adElement = anchor2.childNodes[0];
      expect(adElement.tagName).to.equal('AMP-AD');
      expect(adElement).to.have.attribute('type', 'ad-network-type');
      expect(adElement).to.have.attribute('data-custom-att-1', 'val-1');
      expect(adElement).to.have.attribute('data-custom-att-2', 'val-2');
    });
  });

  it('should report strategy as unsuccessful when unable to place either ad',
      () => {
        const anchor1 = document.createElement('div');
        anchor1.id = 'anchor1Id';
        container.appendChild(anchor1);

        const anchor2 = document.createElement('div');
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
        const placements = getPlacementsFromConfigObj(window, configObj);

        expect(placements).to.have.lengthOf(2);
        sandbox.stub(placements[0], 'placeAd', () => {
          return Promise.resolve(PlacementState.REIZE_FAILED);
        });
        sandbox.stub(placements[1], 'placeAd', () => {
          return Promise.resolve(PlacementState.REIZE_FAILED);
        });

        const adStrategy = new AdStrategy('ad-network-type', placements, [
          {
            name: 'custom-att-1',
            value: 'val-1',
          },
          {
            name: 'custom-att-2',
            value: 'val-2',
          },
        ]);

        return adStrategy.run().then(success => {
          expect(success).to.equal(false);
          expect(anchor1.childNodes).to.have.lengthOf(0);
          expect(anchor2.childNodes).to.have.lengthOf(0);
        });
      });
});
