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
  ADSENSE_A4A_EXPERIMENT_NAME,
} from '../../../../extensions/amp-ad-network-adsense-impl/0.1/adsense-a4a-config'; // eslint-disable-line
import {
  DOUBLECLICK_A4A_EXPERIMENT_NAME,
} from '../../../../extensions/amp-ad-network-doubleclick-impl/0.1/doubleclick-a4a-config'; // eslint-disable-line
import {forceExperimentBranch} from '../../../../src/experiments';

describe('#getLifecycleReporter', () => {

  let win;
  let doc;

  beforeEach(() => {
    return createIframePromise(false).then(iframeFixture => {
      win = iframeFixture.win;
      doc = iframeFixture.doc;
    });
  });

  it('should not create reporter if sampling is not enabled', () => {
    forceExperimentBranch(win, 'a4aProfilingRate', null);
    forceExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME, '1234');
    const element = doc.createElement('div');
    element.setAttribute('type', 'doubleclick');
    doc.body.appendChild(element);
    expect(getLifecycleReporter({
      win,
      element,
    }, 0, 0)).to.be.instanceOf(BaseLifecycleReporter);
  });

  it('should not create reporter if not adsense or doubleclick exp', () => {
    forceExperimentBranch(win, 'a4aProfilingRate', 'unused');
    const element = doc.createElement('div');
    element.setAttribute('type', 'doubleclick');
    doc.body.appendChild(element);
    expect(getLifecycleReporter({
      win,
      element,
    }, 0, 0)).to.be.instanceOf(BaseLifecycleReporter);
  });

  it('should create reporter for doubleclick', () => {
    forceExperimentBranch(win, 'a4aProfilingRate', 'unused');
    forceExperimentBranch(win, DOUBLECLICK_A4A_EXPERIMENT_NAME, '1234');
    const element = doc.createElement('div');
    element.setAttribute('type', 'doubleclick');
    doc.body.appendChild(element);
    expect(getLifecycleReporter({
      win,
      element,
    }, 0, 0)).to.be.instanceOf(GoogleAdLifecycleReporter);
  });

  it('should create reporter for adsense', () => {
    forceExperimentBranch(win, 'a4aProfilingRate', 'unused');
    forceExperimentBranch(win, ADSENSE_A4A_EXPERIMENT_NAME, '1234');
    const element = doc.createElement('div');
    element.setAttribute('type', 'adsense');
    doc.body.appendChild(element);
    expect(getLifecycleReporter({
      win,
      element,
    }, 0, 0)).to.be.instanceOf(GoogleAdLifecycleReporter);
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
    mockReporter = new GoogleAdLifecycleReporter(env.win, fakeElt, 37);
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
      fakeElt.setAttribute(EXPERIMENT_ATTRIBUTE, '1234');
      fakeElt.setAttribute('data-a4a-upgrade-type', 'foo');
      forceExperimentBranch(env.win, DOUBLECLICK_A4A_EXPERIMENT_NAME, '1234');
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
      expect(emitPingStub).to.be.calledOnce;
      const pingUrl = emitPingStub.firstCall.args[0];
      const experimentId = 1234;
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
