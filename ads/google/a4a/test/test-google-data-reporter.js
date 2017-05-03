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

import {createIframePromise} from '../../../../testing/iframe';
import {
    getLifecycleReporter,
    setGoogleLifecycleVarsFromHeaders,
    googleLifecycleReporterFactory,
} from '../google-data-reporter';
import {
    GoogleAdLifecycleReporter,
    BaseLifecycleReporter,
} from '../performance';
import {EXPERIMENT_ATTRIBUTE, QQID_HEADER} from '../utils';
import {
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES,
} from '../../../../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config';  // eslint-disable-line max-len
import {
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH,
} from '../../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config';  // eslint-disable-line max-len

/**
 * Construct a lifecycle reporter for an element with a given eid in one of
 * the reporting namespaces.  If eid is not specified, creates an element with
 * no eid.
 * @param {string} namespace
 * @param {string} ad type
 * @param {string=} opt_eid
 * @returns {*}
 */
function buildElementWithEid(namespace, type, opt_eid) {
  return createIframePromise(false).then(iframeFixture => {
    const win = iframeFixture.win;
    const doc = iframeFixture.doc;
    const elem = doc.createElement('div');
    elem.setAttribute('type', type);
    if (opt_eid) {
      elem.setAttribute(EXPERIMENT_ATTRIBUTE, opt_eid);
    }
    doc.body.appendChild(elem);
    const pseudoAmpElement = {
      win,
      element: elem,
    };
    return getLifecycleReporter(pseudoAmpElement, namespace, 0, 0);
  });
}

describe('#getLifecycleReporter', () => {
  const EXPERIMENT_BRANCH_EIDS = [
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.experiment,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.experiment,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.experiment,
    '117152632',
  ];
  const CONTROL_BRANCH_EIDS = [
    ADSENSE_A4A_EXTERNAL_EXPERIMENT_BRANCHES.control,
    ADSENSE_A4A_INTERNAL_EXPERIMENT_BRANCHES.control,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.control,
    DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
    DOUBLECLICK_A4A_INTERNAL_EXPERIMENT_BRANCHES_POST_LAUNCH.control,
  ];

  ['adsense', 'doubleclick'].forEach(type => {
    describe(`type = ${type}`, () => {
      EXPERIMENT_BRANCH_EIDS.forEach(eid => {
        it(`should return real reporter for a4a eid = ${eid}`, () => {
          return buildElementWithEid('a4a', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(GoogleAdLifecycleReporter);
          });
        });

        it(`should return a null reporter for amp eid = ${eid}`, () => {
          return buildElementWithEid('amp', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });

        it(`should return null reporter for bogus namespace eid = ${eid}`,
            () => {
              return buildElementWithEid('fnord', type, eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });

        it(`should return null reporter for non-Google ad, eid = ${eid}`,
            () => {
              return buildElementWithEid('a4a', 'a9', eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });
      });

      CONTROL_BRANCH_EIDS.forEach(eid => {
        it(`should return null reporter for a4a eid = ${eid}`, () => {
          return buildElementWithEid('a4a', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });

        it(`should return a real reporter for amp eid = ${eid}`, () => {
          return buildElementWithEid('amp', type, eid).then(reporter => {
            expect(reporter).to.be.instanceOf(GoogleAdLifecycleReporter);
          });
        });

        it(`should return null reporter for bogus namespace eid = ${eid}`,
            () => {
              return buildElementWithEid('fnord', type, eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });

        it(`should return null reporter for non-Google ad, eid = ${eid}`,
            () => {
              return buildElementWithEid('amp', 'a9', eid).then(reporter => {
                expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
              });
            });
      });

      for (const namespace in ['a4a', 'amp']) {
        it(`should return null reporter for ${namespace} and no eid`, () => {
          return buildElementWithEid(namespace, type).then(reporter => {
            expect(reporter).to.be.instanceOf(BaseLifecycleReporter);
          });
        });
      }
    });
  });

  describes.fakeWin('#setGoogleLifecycleVarsFromHeaders', {amp: true}, env => {
    const headerData = {};
    const headerMock = {
      get: h => { return h in headerData ? headerData[h] : null; },
    };
    let mockReporter;
    let emitPingStub;
    beforeEach(() => {
      const fakeElt = env.createAmpElement('div');
      env.win.Math = Math;
      env.win.document.body.appendChild(fakeElt);
      mockReporter = new GoogleAdLifecycleReporter(
          env.win, fakeElt, 'test', 37);
      mockReporter.setPingAddress('http://localhost:9876/');
      emitPingStub = sandbox.stub(mockReporter, 'emitPing_');
    });

    it('should pick up qqid from headers', () => {
      headerData[QQID_HEADER] = 'test_qqid';
      expect(mockReporter.extraVariables_).to.be.empty;
      setGoogleLifecycleVarsFromHeaders(headerMock, mockReporter);
      mockReporter.sendPing('preAdThrottle');
      expect(emitPingStub).to.be.calledOnce;
      expect(emitPingStub).to.be.calledWithMatch(/[&?]qqid.37=test_qqid/);
    });

    it('should pick up rendering method from headers', () => {
      headerData['X-AmpAdRender'] = 'fnord';
      expect(mockReporter.extraVariables_).to.be.empty;
      setGoogleLifecycleVarsFromHeaders(headerMock, mockReporter);
      mockReporter.sendPing('preAdThrottle');
      expect(emitPingStub).to.be.calledOnce;
      expect(emitPingStub).to.be.calledWithMatch(/[&?]rm.37=fnord/);
    });
  });

  describes.sandboxed('#googleLifecycleReporterFactory', {}, () => {
    describes.fakeWin('default parameters', {amp: true}, env => {
      let mockReporter;
      let emitPingStub;
      beforeEach(() => {
        const fakeElt = env.win.document.createElement('div');
        fakeElt.setAttribute('data-amp-slot-index', '22');
        fakeElt.setAttribute('type', 'doubleclick');
        fakeElt.setAttribute(EXPERIMENT_ATTRIBUTE,
            DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment);
        env.win.document.body.appendChild(fakeElt);
        env.win.ampAdPageCorrelator = 7777777;
        const a4aContainer = {
          element: fakeElt,
          win: env.win,
        };
        mockReporter = googleLifecycleReporterFactory(a4aContainer);
        expect(mockReporter).to.be.instanceOf(GoogleAdLifecycleReporter);
        mockReporter.setPingAddress('http://localhost:9876/');
        emitPingStub = sandbox.stub(mockReporter, 'emitPing_');
      });

      it('should generate a ping with known parameters', () => {
        const viewer = env.win.services.viewer.obj;
        viewer.firstVisibleTime_ = viewer.lastVisibleTime_ = Date.now();
        mockReporter.sendPing('renderFriendlyStart');
        const pingElements = env.win.document.querySelectorAll('img');
        expect(emitPingStub).to.be.calledOnce;
        const pingUrl = emitPingStub.firstCall.args[0];
        const experimentId =
          DOUBLECLICK_A4A_EXTERNAL_EXPERIMENT_BRANCHES_PRE_LAUNCH.experiment;
        const expectedParams = [
          's=a4a',
          'c=7777777',
          'slotId=22',
          `rls=${encodeURIComponent('$internalRuntimeVersion$')}`,
          'v_h=[0-9]+',
          's_t=',  // SROLL_TOP not defined in test environment.
          'stageName=renderFriendlyStart',
          'stageIdx=6',
          'met.a4a.22=renderFriendlyStart.[0-9]+',
          `e.22=${experimentId}`,
          'adt.22=doubleclick',
          'met.a4a=firstVisibleTime.[0-9]+%2ClastVisibleTime.[0-9]+',
        ];
        expectedParams.forEach(p => {
          expect(pingUrl, p).to.match(new RegExp(`[?&]${p}(&|$)`));
        });
      });
    });
  });
});
