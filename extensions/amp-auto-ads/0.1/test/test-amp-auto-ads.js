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
import * as sinon from 'sinon';

describe('amp-auto-ads', () => {

  const AD_CLIENT = 'ca-pub-1234';

  let sandbox;
  let ampAutoAds;
  let ampAutoAdsElem;
  let xhr;

  beforeEach(() => {
    toggleExperiment(window, 'amp-auto-ads', true);
    sandbox = sinon.sandbox.create();
    ampAutoAdsElem = document.createElement('amp-auto-ads');
    document.body.appendChild(ampAutoAdsElem);

    xhr = xhrFor(window);
    xhr.fetchJson = () => {
      return Promise.resolve({
        'testKey': 'testValue',
      });
    };
    sandbox.spy(xhr, 'fetchJson');

    ampAutoAds = new AmpAutoAds(ampAutoAdsElem);
  });

  afterEach(() => {
    sandbox.restore();
    document.body.removeChild(ampAutoAdsElem);
  });

  it('should fetch a config from the correct URL', () => {
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    const hostname = window.location.hostname;
    expect(xhr.fetchJson).to.have.been.calledWith(
        '//pagead2.googlesyndication.com/getconfig/ama?client=' +
        AD_CLIENT + '&plah=' + hostname, {
          mode: 'cors',
          method: 'GET',
          requireAmpResponseSourceOrigin: false,
        });
    expect(xhr.fetchJson).to.be.calledOnce;
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
    ampAutoAds.buildCallback();

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
