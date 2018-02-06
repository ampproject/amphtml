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

import '../../../amp-ad/0.1/amp-ad';
import {
  ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
  AdSenseAmpAutoAdsHoldoutBranches,
} from '../../../../ads/google/adsense-amp-auto-ads';
import {AmpAutoAds} from '../amp-auto-ads';
import {Services} from '../../../../src/services';
import {
  forceExperimentBranch,
  toggleExperiment,
} from '../../../../src/experiments';
import {waitForChild} from '../../../../src/dom';

describes.realWin('amp-auto-ads', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
    extensions: ['amp-ad', 'amp-auto-ads'],
  },
}, env => {

  const AD_CLIENT = 'ca-pub-1234';
  const OPT_IN_STATUS_ANCHOR_ADS = 2;

  let sandbox;
  let container;
  let anchor1;
  let anchor2;
  let anchor3;
  let anchor4;
  let ampAutoAds;
  let ampAutoAdsElem;
  let xhr;
  let whenVisible;
  let configObj;

  beforeEach(() => {
    // There seem to be a lot of tests that don't clean up after themselves,
    // meaning there are a lot of <AMP-AD>s left over in the DOM.
    // An alternative to doing this clean up would be for this test to do all
    // its DOM stuff in a dedicated window, but trying that seems to result in a
    // lot of errors.
    const ampAds = env.win.document.getElementsByTagName('AMP-AD');
    while (ampAds.length) {
      ampAds[0].parentNode.removeChild(ampAds[0]);
    }

    toggleExperiment(env.win, 'amp-auto-ads', true);
    sandbox = env.sandbox;

    const extensions = Services.extensionsFor(env.win);
    sandbox.stub(extensions, 'loadElementClass').callsFake(
        () => Promise.resolve(() => {}));

    const viewportMock =
        sandbox.mock(Services.viewportForDoc(env.win.document));
    viewportMock.expects('getSize').returns(
        {width: 320, height: 500}).atLeast(1);

    container = env.win.document.createElement('div');
    env.win.document.body.appendChild(container);

    anchor1 = env.win.document.createElement('div');
    anchor1.id = 'anId1';
    container.appendChild(anchor1);

    const spacer = env.win.document.createElement('div');
    spacer.style.height = '1000px';
    container.appendChild(spacer);

    anchor2 = env.win.document.createElement('div');
    anchor2.id = 'anId2';
    container.appendChild(anchor2);

    const spacer2 = env.win.document.createElement('div');
    spacer2.style.height = '499px';
    container.appendChild(spacer2);

    anchor3 = env.win.document.createElement('div');
    anchor3.id = 'anId3';
    container.appendChild(anchor3);

    const spacer3 = env.win.document.createElement('div');
    spacer3.style.height = '500px';
    container.appendChild(spacer3);

    anchor4 = env.win.document.createElement('div');
    anchor4.id = 'anId4';
    container.appendChild(anchor4);

    ampAutoAdsElem = env.win.document.createElement('amp-auto-ads');
    env.win.document.body.appendChild(ampAutoAdsElem);

    configObj = {
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
      optInStatus: [1],
    };

    xhr = Services.xhrFor(env.win);
    xhr.fetchJson = () => {
      return Promise.resolve({
        json() {
          return Promise.resolve(configObj);
        },
      });
    };
    sandbox.spy(xhr, 'fetchJson');

    const viewer = Services.viewerForDoc(env.ampdoc);
    whenVisible = sandbox.stub(viewer, 'whenFirstVisible');
    whenVisible.returns(Promise.resolve());

    ampAutoAds = new AmpAutoAds(ampAutoAdsElem);
  });

  function verifyAdElement(adElement) {
    expect(adElement.tagName).to.equal('AMP-AD');
    expect(adElement.getAttribute('type')).to.equal('adsense');
    expect(adElement.getAttribute('data-ad-client')).to.equal(AD_CLIENT);
  }

  it('should wait for viewer visible', () => {
    let resolve;
    const visible = new Promise(res => {
      resolve = res;
    });
    whenVisible.returns(visible);

    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return Promise.resolve().then(() => {
      expect(xhr.fetchJson).to.not.have.been.called;
      resolve();
      return visible;
    }).then(() => {
      expect(xhr.fetchJson).to.have.been.called;
    });
  });

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

  it('should insert ads on the page when in holdout experiment branch', () => {
    forceExperimentBranch(env.win,
        ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
        AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);

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

  it('should not insert ads on the page when in holdout control branch', () => {
    forceExperimentBranch(env.win,
        ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
        AdSenseAmpAutoAdsHoldoutBranches.CONTROL);

    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return new Promise(resolve => {
      setTimeout(() => {
        expect(anchor1.childNodes).to.have.lengthOf(0);
        expect(anchor2.childNodes).to.have.lengthOf(0);
        expect(anchor3.childNodes).to.have.lengthOf(0);
        expect(anchor4.childNodes).to.have.lengthOf(0);
        resolve();
      }, 500);
    });
  });

  it('should insert ads with the config provided attributes', () => {
    configObj.attributes = {
      'bad-name': 'should be filtered',
      'data-custom-att-1': 'val-1',
      'data-custom-att-2': 'val-2',
    };

    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return new Promise(resolve => {
      waitForChild(anchor4, parent => {
        return parent.childNodes.length > 0;
      }, () => {
        expect(anchor1.childNodes).to.have.lengthOf(1);
        expect(anchor1.childNodes[0].getAttribute('data-custom-att-1'))
            .to.equal('val-1');
        expect(anchor1.childNodes[0].getAttribute('data-custom-att-2'))
            .to.equal('val-2');

        expect(anchor2.childNodes).to.have.lengthOf(1);
        expect(anchor2.childNodes[0].getAttribute('data-custom-att-1'))
            .to.equal('val-1');
        expect(anchor2.childNodes[0].getAttribute('data-custom-att-2'))
            .to.equal('val-2');

        expect(anchor4.childNodes).to.have.lengthOf(1);
        expect(anchor4.childNodes[0].getAttribute('data-custom-att-1'))
            .to.equal('val-1');
        expect(anchor4.childNodes[0].getAttribute('data-custom-att-2'))
            .to.equal('val-2');
        resolve();
      });
    });
  });

  it('should override ad network type with config provided attribute', () => {
    configObj.attributes = {
      'type': 'doubleclick',
    };

    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');
    ampAutoAds.buildCallback();

    return new Promise(resolve => {
      waitForChild(anchor4, parent => {
        return parent.childNodes.length > 0;
      }, () => {
        expect(anchor1.childNodes).to.have.lengthOf(1);
        expect(anchor1.childNodes[0].getAttribute('type'))
            .to.equal('doubleclick');

        expect(anchor2.childNodes).to.have.lengthOf(1);
        expect(anchor2.childNodes[0].getAttribute('type'))
            .to.equal('doubleclick');

        expect(anchor4.childNodes).to.have.lengthOf(1);
        expect(anchor4.childNodes[0].getAttribute('type'))
            .to.equal('doubleclick');
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
          AD_CLIENT + '&plah=localhost&ama_t=amp&' +
          'url=http%3A%2F%2Flocalhost%3A9876%2Fcontext.html', {
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
    toggleExperiment(env.win, 'amp-auto-ads', false);
    ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
    ampAutoAdsElem.setAttribute('type', 'adsense');

    expect(() => ampAutoAds.buildCallback())
        .to.throw(/Experiment is off​​​/);
    expect(xhr.fetchJson).not.to.have.been.called;
  });

  describe('Anchor Ad', () => {
    it('should not insert anchor ad if not opted in', () => {
      ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsElem.setAttribute('type', 'adsense');
      ampAutoAds.buildCallback();

      return new Promise(resolve => {
        setTimeout(() => {
          expect(env.win.document.getElementsByTagName('AMP-STICKY-AD'))
              .to.have.lengthOf(0);
          resolve();
        }, 500);
      });
    });

    it('should insert three ads plus anchor ad', () => {
      configObj['optInStatus'].push(OPT_IN_STATUS_ANCHOR_ADS);

      ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsElem.setAttribute('type', 'adsense');
      ampAutoAds.buildCallback();

      const bannerAdsPromise = new Promise(resolve => {
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

      const anchorAdPromise = new Promise(resolve => {
        waitForChild(env.win.document.body, parent => {
          return parent.firstChild.tagName == 'AMP-STICKY-AD';
        }, () => {
          resolve();
        });
      });

      return Promise.all([bannerAdsPromise, anchorAdPromise]);
    });

    it('should insert anchor anchor ad only', () => {
      configObj = {
        optInStatus: [2],
      };

      ampAutoAdsElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsElem.setAttribute('type', 'adsense');
      ampAutoAds.buildCallback();

      return new Promise(resolve => {
        waitForChild(env.win.document.body, parent => {
          return parent.firstChild.tagName == 'AMP-STICKY-AD';
        }, () => {
          resolve();
        });
      });
    });
  });
});
