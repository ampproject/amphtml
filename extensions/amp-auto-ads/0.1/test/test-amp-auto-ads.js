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

import {AmpAutoAdsElement, AmpAutoAdsService} from '../amp-auto-ads';
import {
  toggleExperiment,
  forceExperimentBranch,
} from '../../../../src/experiments';
import {viewerForDoc, xhrFor} from '../../../../src/services';
import {waitForChild} from '../../../../src/dom';
import {viewportForDoc} from '../../../../src/services';
import {
  ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
  AdSenseAmpAutoAdsHoldoutBranches,
} from '../../../../ads/google/adsense-amp-auto-ads';

describes.realWin('amp-auto-ads', {
  amp: {
    runtimeOn: true,
    ampdoc: 'single',
    extensions: ['amp-ad', 'amp-auto-ads'],
  },
}, env => {

  const AD_CLIENT = 'ca-pub-1234';

  let sandbox;
  let container;
  let anchor1;
  let anchor2;
  let anchor3;
  let anchor4;
  let xhr;
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

    const viewportMock = sandbox.mock(viewportForDoc(env.win.document));
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
    };

    xhr = xhrFor(env.win);
    xhr.fetchJson = () => {
      return Promise.resolve(configObj);
    };
    sandbox.spy(xhr, 'fetchJson');
  });

  function verifyAdElement(adElement) {
    expect(adElement.tagName).to.equal('AMP-AD');
    expect(adElement.getAttribute('type')).to.equal('adsense');
    expect(adElement.getAttribute('data-ad-client')).to.equal(AD_CLIENT);
  }

  describe('legacy <amp-auto-ads> setup', () => {
    let ampAutoAdsElement;
    let ampAutoAdsDomElem;

    beforeEach(() => {
      ampAutoAdsDomElem = env.win.document.createElement('amp-auto-ads');
      env.win.document.body.appendChild(ampAutoAdsDomElem);

      ampAutoAdsElement = new AmpAutoAdsElement(ampAutoAdsDomElem);
    });

    it('should insert three ads on page using config', () => {
      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'adsense');
      ampAutoAdsElement.buildCallback();

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

    it('should insert ads on the page when in holdout experiment branch',
        () => {
          forceExperimentBranch(env.win,
              ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
              AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);

          ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
          ampAutoAdsDomElem.setAttribute('type', 'adsense');
          ampAutoAdsElement.buildCallback();

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

    it('should not insert ads on the page when in holdout control branch',
        () => {
          forceExperimentBranch(env.win,
              ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
              AdSenseAmpAutoAdsHoldoutBranches.CONTROL);

          ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
          ampAutoAdsDomElem.setAttribute('type', 'adsense');
          ampAutoAdsElement.buildCallback();

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

      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'adsense');
      ampAutoAdsElement.buildCallback();

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

      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'adsense');
      ampAutoAdsElement.buildCallback();

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
      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'adsense');
      ampAutoAdsElement.buildCallback();

      return ampAutoAdsElement.layoutCallback().then(() => {
        expect(xhr.fetchJson).to.have.been.calledWith(
            '//pagead2.googlesyndication.com/getconfig/ama?client=' +
            AD_CLIENT + '&plah=localhost&ama_t=amp', {
              mode: 'cors',
              method: 'GET',
              credentials: 'omit',
              requireAmpResponseSourceOrigin: false,
            });
        expect(xhr.fetchJson).to.be.calledOnce;
      });
    });

    it('should throw an error if no type', () => {
      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      expect(() => ampAutoAdsElement.buildCallback())
          .to.throw(/Missing type attribute​​/);
      expect(xhr.fetchJson).not.to.have.been.called;
    });

    it('should not try and fetch config if unknown type', () => {
      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'unknowntype');

      expect(() => ampAutoAdsElement.buildCallback())
          .to.throw(/No AdNetworkConfig for type: unknowntype​​​/);

      expect(xhr.fetchJson).not.to.have.been.called;
    });

    it('should not try and fetch config if experiment off', () => {
      toggleExperiment(env.win, 'amp-auto-ads', false);
      ampAutoAdsDomElem.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsDomElem.setAttribute('type', 'adsense');

      expect(() => ampAutoAdsElement.buildCallback())
          .to.throw(/Experiment is off​​​/);
      expect(xhr.fetchJson).not.to.have.been.called;
    });
  });

  describe('script tag setup', () => {
    let ampAutoAdsService;
    let ampAutoAdsSetupNode;
    let bodyReadyResolve;
    let viewer;

    beforeEach(() => {
      ampAutoAdsSetupNode = env.win.document.createElement('meta');
      ampAutoAdsSetupNode.setAttribute('name', 'amp-auto-ads-setup');
      env.win.document.head.appendChild(ampAutoAdsSetupNode);

      const ampdoc = env.ampdoc;
      sandbox.stub(ampdoc, 'whenBodyAvailable').returns(new Promise(resolve => {
        bodyReadyResolve = resolve;
      }));
      viewer = viewerForDoc(ampdoc);
      sandbox.stub(viewer, 'onVisibilityChanged');
      sandbox.stub(viewer, 'isVisible').returns(true);

      ampAutoAdsService = new AmpAutoAdsService(ampdoc);
    });

    it('should insert three ads on page using config', () => {
      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');
      bodyReadyResolve();

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

    it('should only insert ads once the document is visible', done => {
      viewer.isVisible.returns(false);

      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');
      bodyReadyResolve();

      setTimeout(() => {
        expect(anchor1.childNodes).to.have.lengthOf(0);
        viewer.isVisible.returns(true);
        viewer.onVisibilityChanged.getCall(0).args[0]();

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
          done();
        });
      }, 10);
    });

    it('should insert ads on the page when in holdout experiment branch',
        () => {
          forceExperimentBranch(env.win,
              ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
              AdSenseAmpAutoAdsHoldoutBranches.EXPERIMENT);

          ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
          ampAutoAdsSetupNode.setAttribute('type', 'adsense');
          bodyReadyResolve();

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

    it('should not insert ads on the page when in holdout control branch',
        () => {
          forceExperimentBranch(env.win,
              ADSENSE_AMP_AUTO_ADS_HOLDOUT_EXPERIMENT_NAME,
              AdSenseAmpAutoAdsHoldoutBranches.CONTROL);

          ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
          ampAutoAdsSetupNode.setAttribute('type', 'adsense');
          bodyReadyResolve();;

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

      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');
      bodyReadyResolve();

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

      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');
      bodyReadyResolve();

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

    it('should fetch a config from the correct URL', done => {
      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');
      bodyReadyResolve();

      setTimeout(() => {
        expect(xhr.fetchJson).to.have.been.calledWith(
            '//pagead2.googlesyndication.com/getconfig/ama?client=' +
            AD_CLIENT + '&plah=localhost&ama_t=amp', {
              mode: 'cors',
              method: 'GET',
              credentials: 'omit',
              requireAmpResponseSourceOrigin: false,
            });
        expect(xhr.fetchJson).to.be.calledOnce;
        done();
      }, 10);
    });

    it('should throw an error if no type', () => {
      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      expect(() => ampAutoAdsService.runOnceIfDocVisible_())
          .to.throw(/Missing type attribute​​/);
      expect(xhr.fetchJson).not.to.have.been.called;
    });

    it('should not try and fetch config if unknown type', () => {
      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'unknowntype');

      expect(() => ampAutoAdsService.runOnceIfDocVisible_())
          .to.throw(/No AdNetworkConfig for type: unknowntype​​​/);

      expect(xhr.fetchJson).not.to.have.been.called;
    });

    it('should not try and fetch config if experiment off', () => {
      toggleExperiment(env.win, 'amp-auto-ads', false);
      ampAutoAdsSetupNode.setAttribute('data-ad-client', AD_CLIENT);
      ampAutoAdsSetupNode.setAttribute('type', 'adsense');

      expect(() => ampAutoAdsService.runOnceIfDocVisible_())
          .to.throw(/Experiment is off​​​/);
      expect(xhr.fetchJson).not.to.have.been.called;
    });
  });
});
