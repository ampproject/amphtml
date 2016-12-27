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

import {resourcesForDoc} from '../../../../src/resources';
import {PlacementState, getPlacementsFromConfigObj} from '../placement';
import * as sinon from 'sinon';

describe('placement', () => {

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

  describe('placeAd', () => {
    it('should place an ad with the correct attributes', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', [
        {
          name: 'custom-att-1',
          value: 'val-1',
        },
        {
          name: 'custom-att-2',
          value: 'val-2',
        },
      ]).then(() => {
        const adElement = anchor.firstChild;
        expect(adElement.tagName).to.equal('AMP-AD');
        expect(adElement).to.have.attribute('type', 'ad-network-type');
        expect(adElement).to.have.attribute('layout', 'responsive');
        expect(adElement).to.have.attribute('width', '320');
        expect(adElement).to.have.attribute('height', '0');
        expect(adElement).to.have.attribute('data-custom-att-1', 'val-1');
        expect(adElement).to.have.attribute('data-custom-att-2', 'val-2');
      });
    });

    it('should report placement placed when resize allowed', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const resource = resourcesForDoc(anchor);
      sandbox.stub(resource, 'attemptChangeSize', () => {
        return Promise.resolve();
      });

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(resource.attemptChangeSize).to.have.been.calledWith(
                anchor.firstChild, 100, 320);
            expect(placementState).to.equal(PlacementState.PLACED);
          });
    });

    it('should report resize failed when resize not allowed', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const resource = resourcesForDoc(anchor);
      sandbox.stub(resource, 'attemptChangeSize', () => {
        return Promise.reject(new Error('Resize failed'));
      });

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(resource.attemptChangeSize).to.have.been.calledWith(
                anchor.firstChild, 100, 320);
            expect(placementState).to.equal(PlacementState.RESIZE_FAILED);
          });
    });
  });

  describe('Ad positioning', () => {
    it('should place the ad before the anchor', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(2);
            expect(container.childNodes[0].tagName).to.equal('AMP-AD');
          });
    });

    it('should place the ad after the anchor', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(2);
            expect(container.childNodes[1].tagName).to.equal('AMP-AD');
          });
    });

    it('should place the ad as the first child of the anchor', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);
      anchor.appendChild(document.createElement('div'));

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(1);
            expect(anchor.childNodes[0].tagName).to.equal('AMP-AD');
          });
    });

    it('should place the ad as the last child of the anchor', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);
      anchor.appendChild(document.createElement('div'));

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(container.childNodes).to.have.lengthOf(1);
            expect(anchor.childNodes[1].tagName).to.equal('AMP-AD');
          });
    });

    it('should place the ad inside the 2nd anchor with class name', () => {
      const anchor1 = document.createElement('div');
      anchor1.className = 'aClass';
      container.appendChild(anchor1);

      const anchor2 = document.createElement('div');
      anchor2.className = 'aClass';
      container.appendChild(anchor2);

      const placements = getPlacementsFromConfigObj(window, {
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

      return placements[0].placeAd('ad-network-type', []).then(
          placementState => {
            expect(placementState).to.equal(PlacementState.PLACED);
            expect(anchor1.childNodes).to.have.lengthOf(0);
            expect(anchor2.childNodes).to.have.lengthOf(1);
            expect(anchor2.childNodes[0].tagName).to.equal('AMP-AD');
          });
    });
  });

  describe('getPlacementsFromConfigObj', () => {
    it('should get a placement from the config object', () => {
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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
      const placements = getPlacementsFromConfigObj(window, {});
      expect(placements).to.be.empty;
    });

    it('should not return a placement with no anchor property', () => {
      const placements = getPlacementsFromConfigObj(window, {
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
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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
      const anchor = document.createElement('div');
      anchor.id = 'anId';
      container.appendChild(anchor);

      const placements = getPlacementsFromConfigObj(window, {
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

    it('should not return placement if its anchor doesn\'t exist on the page',
        () => {
          const anchor = document.createElement('div');
          anchor.id = 'wrongId';
          container.appendChild(anchor);

          const placements = getPlacementsFromConfigObj(window, {
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
  });
});
