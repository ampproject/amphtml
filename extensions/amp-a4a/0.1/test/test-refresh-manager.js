/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {
  RefreshManager,
  DATA_ATTR_NAME,
  DATA_MANAGER_ID_NAME,
  METATAG_NAME,
} from '../refresh-manager';
import {timerFor} from '../../../../src/services';
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';

function getTestElement() {
  const div = window.document.createElement('div');
  div.setAttribute('style', 'width:1px; height:1px;');
  div.setAttribute('type', 'doubleclick');
  div.setAttribute(DATA_ATTR_NAME, '35');
  return div;
}


describe('refresh-manager', () => {
  let mockA4a;
  let sandbox;
  const config = {
    visiblePercentageMin: 50,
    totalTimeMin: 0,
    continuousTimeMin: 1,
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    mockA4a = {
      win: window,
      element: getTestElement(),
      refresh: () => {},
    };
    toggleExperiment(window, 'amp-ad-refresh', true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should get refreshInterval from slot', () => {
    const getPublisherSpecifiedRefreshIntervalSpy = sandbox.spy(
        RefreshManager.prototype, 'getPublisherSpecifiedRefreshInterval_');
    const refreshManager = new RefreshManager(mockA4a, config);
    expect(getPublisherSpecifiedRefreshIntervalSpy).to.be.calledOnce;
    expect(refreshManager.refreshInterval_).to.equal(35000);
  });

  it('should get refreshInterval from meta tag', () => {
    const getPublisherSpecifiedRefreshIntervalSpy = sandbox.spy(
        RefreshManager.prototype, 'getPublisherSpecifiedRefreshInterval_');
    mockA4a.element.removeAttribute(DATA_ATTR_NAME);
    const meta = window.document.createElement('meta');
    meta.setAttribute('name', METATAG_NAME);
    meta.setAttribute('content', 'doubleclick=40');
    window.document.head.appendChild(meta);
    const refreshManager = new RefreshManager(mockA4a, config);
    expect(getPublisherSpecifiedRefreshIntervalSpy).to.be.calledOnce;
    expect(refreshManager.refreshInterval_).to.equal(40000);
  });

  it('should call convertConfiguration_ and set proper units', () => {
    const getConfigurationSpy = sandbox.spy(
        RefreshManager.prototype, 'convertAndSanitizeConfiguration_');
    const refreshManager = new RefreshManager(mockA4a, {
      visiblePercentageMin: 50,
      totalTimeMin: 0,
      continuousTimeMin: 1,
    });
    expect(getConfigurationSpy).to.be.calledOnce;
    expect(refreshManager.config_).to.not.be.null;
    expect(refreshManager.config_.visiblePercentageMin).to.equal(0.5);
    expect(refreshManager.config_.totalTimeMin).to.equal(0);
    expect(refreshManager.config_.continuousTimeMin).to.equal(1000);
  });

  it('should be eligible for refresh', () => {
    const refreshManager = new RefreshManager(mockA4a, config);
    expect(refreshManager.isRefreshable()).to.be.true;
  });

  it('should NOT be eligible for refresh', () => {
    mockA4a.element.removeAttribute(DATA_ATTR_NAME);
    const refreshManager = new RefreshManager(mockA4a, config);
    expect(refreshManager.isRefreshable()).to.be.false;
  });

  describe('#ioCallback_', () => {
    let refreshManager;
    beforeEach(() => refreshManager = new RefreshManager(mockA4a, config));

    it('should stay in INITIAL state', () => {
      const ioEntry = {
        target: {
          getAttribute: name => name == DATA_MANAGER_ID_NAME ? '0' : null,
        },
        intersectionRatio: refreshManager.config_.visiblePercentageMin,
      };
      refreshManager.ioCallback_([ioEntry]);
      expect(refreshManager.visibilityTimeoutId_).to.be.null;
      expect(refreshManager.state_).to.equal('initial');
    });

    it('should transition into VIEW_PENDING state', () => {
      const ioEntry = {
        target: mockA4a.element,
        intersectionRatio: refreshManager.config_.visiblePercentageMin,
      };
      refreshManager.ioCallback_([ioEntry]);
      expect(refreshManager.visibilityTimeoutId_).to.be.ok;
      expect(refreshManager.state_).to.equal('view_pending');
    });

    it('should transition to VIEW_PENDING state then back to INITIAL', () => {
      const ioEntry = {
        target: mockA4a.element,
        intersectionRatio: refreshManager.config_.visiblePercentageMin,
      };
      refreshManager.ioCallback_([ioEntry]);
      expect(refreshManager.visibilityTimeoutId_).to.be.ok;
      expect(refreshManager.state_).to.equal('view_pending');
      ioEntry.intersectionRatio = 0;
      refreshManager.ioCallback_([ioEntry]);
      expect(refreshManager.visibilityTimeoutId_).to.be.null;
      expect(refreshManager.state_).to.equal('initial');
    });
  });

  // TODO(levitzky) unskip this test once global test flakiness has been
  // resolved.
  it.skip('should execute the refresh event correctly', () => {
    // Attach element to DOM, as is necessary for request ampdoc.
    window.document.body.appendChild(mockA4a.element);
    const refreshSpy = sandbox.spy(mockA4a, 'refresh');
    const refreshManager = new RefreshManager(mockA4a, config);
    // So the test doesn't hang for the required minimum 30s interval, or the
    // 1s ActiveView visibility definition.
    refreshManager.config_ = {
      visiblePercentageMin: 0,
      continuousTimeMin: 0,
    };
    refreshManager.refreshInterval_ = 0;
    refreshManager.initiateRefreshCycle();
    timerFor(window).promise(500).then(() => {
      // Twice because constructor calls initiateRefreshCycle().
      expect(refreshSpy).to.be.calledTwice;
      window.document.body.removeChild(mockA4a.element);
    });
  });
});


