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
  DATA_ATTR_NAME,
  DATA_MANAGER_ID_NAME,
  METATAG_NAME,
  RefreshManager,
  getPublisherSpecifiedRefreshInterval,
} from '../refresh-manager';
import {Services} from '../../../../src/services';

describe('refresh', () => {
  let mockA4a;
  const config = {
    visiblePercentageMin: 50,
    totalTimeMin: 0,
    continuousTimeMin: 1,
  };

  function getTestElement() {
    const div = window.document.createElement('div');
    div.setAttribute('style', 'width:1px; height:1px;');
    div.setAttribute('type', 'doubleclick');
    div.setAttribute(DATA_ATTR_NAME, '35');
    window.sandbox.replaceGetter(div, 'isConnected', () => true);
    div.getAmpDoc = () => {
      return {
        getMetaByName: (name) => {
          const metaTag = window.document.head.querySelector(
            `[name="${name}"]`
          );
          return metaTag ? metaTag.getAttribute('content') : null;
        },
      };
    };
    return div;
  }

  beforeEach(() => {
    mockA4a = {
      win: window,
      element: getTestElement(),
      refresh: () => {},
    };
  });

  describe('refresh-manager', () => {
    it('should get null refreshInterval', () => {
      mockA4a.element.removeAttribute(DATA_ATTR_NAME);
      expect(
        getPublisherSpecifiedRefreshInterval(
          mockA4a.element,
          window,
          'doubleclick'
        )
      ).to.be.null;
    });

    it('should get refreshInterval from slot', () => {
      expect(
        getPublisherSpecifiedRefreshInterval(
          mockA4a.element,
          window,
          'doubleclick'
        )
      ).to.equal(35000);
    });

    it('should get refreshInterval from meta tag', () => {
      mockA4a.element.removeAttribute(DATA_ATTR_NAME);
      const meta = window.document.createElement('meta');
      meta.setAttribute('name', METATAG_NAME);
      meta.setAttribute('content', 'doubleclick=40');
      window.document.head.appendChild(meta);
      expect(
        getPublisherSpecifiedRefreshInterval(
          mockA4a.element,
          window,
          'doubleclick'
        )
      ).to.equal(40000);
    });

    it('should call convertConfiguration_ and set proper units', () => {
      const getConfigurationSpy = window.sandbox.spy(
        RefreshManager.prototype,
        'convertAndSanitizeConfiguration_'
      );
      const refreshManager = new RefreshManager(
        mockA4a,
        {
          visiblePercentageMin: 50,
          continuousTimeMin: 1,
        },
        30000
      );
      expect(getConfigurationSpy).to.be.calledOnce;
      expect(refreshManager.config_).to.not.be.null;
      expect(refreshManager.config_.visiblePercentageMin).to.equal(0.5);
      expect(refreshManager.config_.continuousTimeMin).to.equal(1000);
    });

    describe('#ioCallback_', () => {
      let refreshManager;
      beforeEach(
        () => (refreshManager = new RefreshManager(mockA4a, config, 30000))
      );

      it('should stay in INITIAL state', () => {
        const ioEntry = {
          target: {
            getAttribute: (name) => (name == DATA_MANAGER_ID_NAME ? '0' : null),
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

    it('should execute the refresh event correctly', () => {
      // Attach element to DOM, as is necessary for request ampdoc.
      window.document.body.appendChild(mockA4a.element);
      const refreshSpy = window.sandbox.spy(mockA4a, 'refresh');

      // Ensure initial call to initiateRefreshCycle doesn't trigger refresh, as
      // this can have flaky results.
      const {initiateRefreshCycle} = RefreshManager.prototype;
      RefreshManager.prototype.initiateRefreshCycle = () => {};

      const refreshManager = new RefreshManager(mockA4a, config, 30000);
      refreshManager.initiateRefreshCycle = initiateRefreshCycle;

      // So the test doesn't hang for the required minimum 30s interval, or the
      // 1s ActiveView visibility definition.
      refreshManager.config_ = {
        visiblePercentageMin: 0,
        continuousTimeMin: 0,
      };
      refreshManager.refreshInterval_ = 0;
      refreshManager.initiateRefreshCycle();
      return Services.timerFor(window)
        .promise(500)
        .then(() => {
          expect(refreshSpy).to.be.calledOnce;
          window.document.body.removeChild(mockA4a.element);
        });
    });
  });
});
