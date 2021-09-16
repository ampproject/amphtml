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

import {AmpAutoAds} from '../amp-auto-ads';
import {toggleExperiment} from '../../../../src/experiments';
import {xhrFor} from '../../../../src/xhr';
import {waitForChild} from '../../../../src/dom';
import * as sinon from 'sinon';

describe('amp-auto-ads', () => {

  const AD_CLIENT = 'ca-pub-1234';

  let sandbox;
  let container;
  let anchor1;
  let anchor2;
  let anchor3;
  let anchor4;
  let ampAutoAds;
  let ampAutoAdsElem;
  let xhr;

  beforeEach(() => {
    // There seem to be a lot of tests that don't clean up after themselves,
    // meaning there are a lot of <AMP-AD>s left over in the DOM.
    // An alternative to doing this clean up would be for this test to do all
    // its DOM stuff in a dedicated window, but trying that seems to result in a
    // lot of errors.
    const ampAds = document.getElementsByTagName('AMP-AD');
    while (ampAds.length) {
      ampAds[0].parentNode.removeChild(ampAds[0]);
    }

    toggleExperiment(window, 'amp-auto-ads', true);
    sandbox = sinon.sandbox.create();

    container = document.createElement('div');
    document.body.appendChild(container);

    anchor1 = document.createElement('div');
    anchor1.id = 'anId1';
    container.appendChild(anchor1);

    const spacer = document.createElement('div');
    spacer.style.height = '1000px';
    container.appendChild(spacer);

    anchor2 = document.createElement('div');
    anchor2.id = 'anId2';
    container.appendChild(anchor2);

    const spacer2 = document.createElement('div');
    spacer2.style.height = '499px';
    container.appendChild(spacer2);

    anchor3 = document.createElement('div');
    anchor3.id = 'anId3';
    container.appendChild(anchor3);

    const spacer3 = document.createElement('div');
    spacer3.style.height = '500px';
    container.appendChild(spacer3);

    anchor4 = document.createElement('div');
    anchor4.id = 'anId4';
    container.appendChild(anchor4);

    ampAutoAdsElem = document.createElement('amp-auto-ads');
    document.body.appendChild(ampAutoAdsElem);

    xhr = xhrFor(window);
    xhr.fetchJson = () => {
      return Promise.resolve({
        placements: [
          {
            anchor: {
              selector: 'DIV#anId1',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anId2',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anId3',
            },
            pos: 2,
            type: 1,
          },
          {
            anchor: {
              selector: 'DIV#anId4',
            },
            pos: 2,
            type: 1,
          },
        ],
      });
    };
    sandbox.spy(xhr, 'fetchJson');

    ampAutoAds = new AmpAutoAds(ampAutoAdsElem);
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(container);
    document.body.removeChild(ampAutoAdsElem);
  });

  function verifyAdElement(adElement) {
    expect(adElement.tagName).to.equal('AMP-AD');
    expect(adElement.getAttribute('type')).to.equal('adsense');
    expect(adElement.getAttribute('data-ad-client')).to.equal(AD_CLIENT);
  }

  it('should insert three ads on page using config', () => {
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return new Promise(resolve => {
      waitForChild(anchor4, parent => {
        return parent.childNodes.length > 0;
      }, () => {
        expect(anchor1.childNodes).to.have.lengthOf(1);
        expect(anchor2.childNodes).to.have.lengthOf(1);
        expect(anchor3.childNodes).to.have.lengthOf(0);
        expect(anchor4.childNodes).to.have.lengthOf(1);
        verifyAdElement(anchor1.childNodes[0]);
        verifyAdElement(anchor2.childNodes[0]);
        verifyAdElement(anchor4.childNodes[0]);
        resolve();
      });
    });
  });

  it('should fetch a config from the correct URL', () => {
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return ampAutoAds.layoutCallback().then(() => {
      expect(xhr.fetchJson).to.have.been.calledWith(
          '//pagead2.googlesyndication.com/getconfig/ama?client=' +
          AD_CLIENT + '&plah=foo.bar&ama_t=amp', {
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
            requireAmpResponseSourceOrigin: false,
          });
      expect(xhr.fetchJson).to.be.calledOnce;
    });
  });

  it('should throw an error if no type', () => {
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    expect(() => ampAutoAds.buildCallback())
        .to.throw(/Missing type attribute​​/);
    expect(xhr.fetchJson).not.to.have.been.called;
  });

  it('should not try and fetch config if unknown type', () => {
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'unknowntype');

    expect(() => ampAutoAds.buildCallback())
        .to.throw(/No AdNetworkConfig for type: unknowntype​​​/);

    expect(xhr.fetchJson).not.to.have.been.called;
  });

  it('should not try and fetch config if experiment off', () => {
    toggleExperiment(window, 'amp-auto-ads', false);
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');

    expect(() => ampAutoAds.buildCallback())
        .to.throw(/Experiment is off​​​/);
    expect(xhr.fetchJson).not.to.have.been.called;
  });
});
