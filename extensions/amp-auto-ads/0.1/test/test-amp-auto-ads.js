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
import '../amp-auto-ads';
import {Services} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';
import {waitForChild} from '../../../../src/dom';

describes.realWin(
  'amp-auto-ads',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-ad', 'amp-auto-ads'],
    },
  },
  env => {
    const OPT_IN_STATUS_ANCHOR_ADS = 2;

    let win;
    let doc;
    let sandbox;
    let container;
    let anchor1;
    let anchor2;
    let anchor3;
    let anchor4;
    let xhr;
    let whenVisible;
    let configObj;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      sandbox = env.sandbox;

      toggleExperiment(win, 'amp-auto-ads', true);

      // There seem to be a lot of tests that don't clean up after themselves,
      // meaning there are a lot of <AMP-AD>s left over in the DOM.
      // An alternative to doing this clean up would be for this test to do all
      // its DOM stuff in a dedicated window, but trying that seems to result in a
      // lot of errors.
      const ampAds = doc.getElementsByTagName('AMP-AD');
      while (ampAds.length) {
        ampAds[0].parentNode.removeChild(ampAds[0]);
      }

      const extensions = Services.extensionsFor(win);
      sandbox
        .stub(extensions, 'loadElementClass')
        .callsFake(() => Promise.resolve(() => {}));

      const viewportMock = sandbox.mock(Services.viewportForDoc(doc));
      viewportMock
        .expects('getSize')
        .returns({width: 320, height: 500})
        .atLeast(1);

      container = doc.createElement('div');
      doc.body.appendChild(container);

      anchor1 = doc.createElement('div');
      anchor1.id = 'anId1';
      container.appendChild(anchor1);

      const spacer = doc.createElement('div');
      spacer.style.height = '1000px';
      container.appendChild(spacer);

      anchor2 = doc.createElement('div');
      anchor2.id = 'anId2';
      container.appendChild(anchor2);

      const spacer2 = doc.createElement('div');
      spacer2.style.height = '499px';
      container.appendChild(spacer2);

      anchor3 = doc.createElement('div');
      anchor3.id = 'anId3';
      container.appendChild(anchor3);

      const spacer3 = doc.createElement('div');
      spacer3.style.height = '500px';
      container.appendChild(spacer3);

      anchor4 = doc.createElement('div');
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
        optInStatus: [1],
      };

      xhr = Services.xhrFor(win);
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
    });

    function getAmpAutoAds(type) {
      const ampAutoAds = doc.createElement('amp-auto-ads');
      if (type !== 'NONE') {
        ampAutoAds.setAttribute('type', type || '_ping_');
      }
      doc.body.appendChild(ampAutoAds);
      return ampAutoAds.build().then(() => {
        return ampAutoAds.layoutCallback();
      });
    }

    function verifyAdElement(adElement) {
      expect(adElement.tagName).to.equal('AMP-AD');
      expect(adElement.getAttribute('type')).to.equal('_ping_');
    }

    it('should wait for viewer visible', () => {
      let resolve;
      const visible = new Promise(res => {
        resolve = res;
      });
      whenVisible.returns(visible);

      return getAmpAutoAds().then(() => {
        return Promise.resolve()
          .then(() => {
            expect(xhr.fetchJson).to.not.have.been.called;
            resolve();
            return visible;
          })
          .then(() => {
            expect(xhr.fetchJson).to.have.been.called;
          });
      });
    });

    it('should insert three ads on page using config', () => {
      return getAmpAutoAds().then(() => {
        return new Promise(resolve => {
          waitForChild(
            anchor4,
            parent => {
              return parent.childNodes.length > 0;
            },
            () => {
              expect(anchor1.childNodes).to.have.lengthOf(1);
              expect(anchor2.childNodes).to.have.lengthOf(1);
              expect(anchor3.childNodes).to.have.lengthOf(0);
              expect(anchor4.childNodes).to.have.lengthOf(1);
              verifyAdElement(anchor1.childNodes[0]);
              verifyAdElement(anchor2.childNodes[0]);
              verifyAdElement(anchor4.childNodes[0]);
              resolve();
            }
          );
        });
      });
    });

    it('should insert ads with the config provided attributes', () => {
      configObj.attributes = {
        'bad-name': 'should be filtered',
        'data-custom-att-1': 'val-1',
        'data-custom-att-2': 'val-2',
      };

      return getAmpAutoAds().then(() => {
        return new Promise(resolve => {
          waitForChild(
            anchor4,
            parent => {
              return parent.childNodes.length > 0;
            },
            () => {
              expect(anchor1.childNodes).to.have.lengthOf(1);
              expect(
                anchor1.childNodes[0].getAttribute('data-custom-att-1')
              ).to.equal('val-1');
              expect(
                anchor1.childNodes[0].getAttribute('data-custom-att-2')
              ).to.equal('val-2');

              expect(anchor2.childNodes).to.have.lengthOf(1);
              expect(
                anchor2.childNodes[0].getAttribute('data-custom-att-1')
              ).to.equal('val-1');
              expect(
                anchor2.childNodes[0].getAttribute('data-custom-att-2')
              ).to.equal('val-2');

              expect(anchor4.childNodes).to.have.lengthOf(1);
              expect(
                anchor4.childNodes[0].getAttribute('data-custom-att-1')
              ).to.equal('val-1');
              expect(
                anchor4.childNodes[0].getAttribute('data-custom-att-2')
              ).to.equal('val-2');
              resolve();
            }
          );
        });
      });
    });

    it('should override ad network type with config provided attribute', () => {
      configObj.attributes = {
        'type': '_ping_',
      };

      return getAmpAutoAds('doubleclick').then(() => {
        return new Promise(resolve => {
          waitForChild(
            anchor4,
            parent => {
              return parent.childNodes.length > 0;
            },
            () => {
              expect(anchor1.childNodes).to.have.lengthOf(1);
              expect(anchor1.childNodes[0].getAttribute('type')).to.equal(
                '_ping_'
              );

              expect(anchor2.childNodes).to.have.lengthOf(1);
              expect(anchor2.childNodes[0].getAttribute('type')).to.equal(
                '_ping_'
              );

              expect(anchor4.childNodes).to.have.lengthOf(1);
              expect(anchor4.childNodes[0].getAttribute('type')).to.equal(
                '_ping_'
              );
              resolve();
            }
          );
        });
      });
    });

    it('should fetch a config from the correct URL', () => {
      return getAmpAutoAds().then(() => {
        expect(xhr.fetchJson).to.have.been.calledWith(
          '//lh3.googleusercontent.com/' +
            'pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no-n',
          {
            mode: 'cors',
            method: 'GET',
            credentials: 'omit',
            requireAmpResponseSourceOrigin: false,
          }
        );
        expect(xhr.fetchJson).to.be.calledOnce;
      });
    });

    it('should throw an error if no type', () => {
      return allowConsoleError(() => {
        return getAmpAutoAds('NONE').catch(err => {
          expect(err.message).to.include('Missing type attribute');
          expect(xhr.fetchJson).not.to.have.been.called;
        });
      });
    });

    it('should not try and fetch config if unknown type', () => {
      return allowConsoleError(() => {
        return getAmpAutoAds('unknowntype').catch(err => {
          expect(err.message).to.include('No AdNetworkConfig for type');
          expect(xhr.fetchJson).not.to.have.been.called;
        });
      });
    });

    it('should not try and fetch config if experiment off', () => {
      return allowConsoleError(() => {
        toggleExperiment(env.win, 'amp-auto-ads', false);
        return getAmpAutoAds().catch(err => {
          expect(err.message).to.include('Experiment is off');
          expect(xhr.fetchJson).not.to.have.been.called;
        });
      });
    });

    describe('Anchor Ad', () => {
      it('should not insert anchor ad if not opted in', () => {
        return getAmpAutoAds().then(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              expect(
                env.win.document.getElementsByTagName('AMP-STICKY-AD')
              ).to.have.lengthOf(0);
              resolve();
            }, 500);
          });
        });
      });

      it('should insert three ads plus anchor ad', () => {
        configObj['optInStatus'].push(OPT_IN_STATUS_ANCHOR_ADS);

        return getAmpAutoAds().then(() => {
          const bannerAdsPromise = new Promise(resolve => {
            waitForChild(
              anchor4,
              parent => {
                return parent.childNodes.length > 0;
              },
              () => {
                expect(anchor1.childNodes).to.have.lengthOf(1);
                expect(anchor2.childNodes).to.have.lengthOf(1);
                expect(anchor3.childNodes).to.have.lengthOf(0);
                expect(anchor4.childNodes).to.have.lengthOf(1);
                verifyAdElement(anchor1.childNodes[0]);
                verifyAdElement(anchor2.childNodes[0]);
                verifyAdElement(anchor4.childNodes[0]);
                resolve();
              }
            );
          });

          const anchorAdPromise = new Promise(resolve => {
            waitForChild(
              env.win.document.body,
              parent => {
                return parent.firstChild.tagName == 'AMP-STICKY-AD';
              },
              () => {
                resolve();
              }
            );
          });

          return Promise.all([bannerAdsPromise, anchorAdPromise]);
        });
      });

      it('should insert anchor anchor ad only', () => {
        configObj = {
          optInStatus: [2],
        };

        return getAmpAutoAds().then(() => {
          return new Promise(resolve => {
            waitForChild(
              env.win.document.body,
              parent => {
                return parent.firstChild.tagName == 'AMP-STICKY-AD';
              },
              () => {
                resolve();
              }
            );
          });
        });
      });
    });

    describe('ad constraints', () => {
      it('should insert 3 ads when using the default ad contraints', () => {
        return getAmpAutoAds().then(() => {
          return new Promise(resolve => {
            waitForChild(
              anchor4,
              parent => {
                return parent.childNodes.length > 0;
              },
              () => {
                expect(anchor1.childNodes).to.have.lengthOf(1);
                expect(anchor2.childNodes).to.have.lengthOf(1);
                expect(anchor3.childNodes).to.have.lengthOf(0);
                expect(anchor4.childNodes).to.have.lengthOf(1);
                verifyAdElement(anchor1.childNodes[0]);
                verifyAdElement(anchor2.childNodes[0]);
                verifyAdElement(anchor4.childNodes[0]);
                resolve();
              }
            );
          });
        });
      });

      it('should insert 4 ads when using the config ad constraints', () => {
        configObj.adConstraints = {
          initialMinSpacing: '499px',
          maxAdCount: 8,
        };

        return getAmpAutoAds().then(() => {
          return new Promise(resolve => {
            waitForChild(
              anchor4,
              parent => {
                return parent.childNodes.length > 0;
              },
              () => {
                expect(anchor1.childNodes).to.have.lengthOf(1);
                expect(anchor2.childNodes).to.have.lengthOf(1);
                expect(anchor3.childNodes).to.have.lengthOf(1);
                expect(anchor4.childNodes).to.have.lengthOf(1);
                verifyAdElement(anchor1.childNodes[0]);
                verifyAdElement(anchor2.childNodes[0]);
                verifyAdElement(anchor3.childNodes[0]);
                verifyAdElement(anchor4.childNodes[0]);
                resolve();
              }
            );
          });
        });
      });
    });
  }
);
