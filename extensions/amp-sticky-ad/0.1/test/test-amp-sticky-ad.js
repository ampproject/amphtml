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
import {toggleExperiment} from '../../../../src/experiments';
import * as sinon from 'sinon';
import '../amp-sticky-ad';
import '../../../amp-ad/0.1/amp-ad';

describe('amp-sticky-ad', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpStickyAd() {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-sticky-ad', true);
      const ampStickyAd = iframe.doc.createElement('amp-sticky-ad');
      ampStickyAd.setAttribute('layout', 'nodisplay');
      ampStickyAd.isExperimentOn_ = true;
      const ampAd = iframe.doc.createElement('amp-ad');
      ampAd.setAttribute('width', '300');
      ampAd.setAttribute('height', '50');
      ampAd.setAttribute('type', 'a9');
      ampAd.setAttribute('data-aax_size', '300*50');
      ampAd.setAttribute('data-aax_pubname', 'abc123');
      ampAd.setAttribute('data-aax_src', '302');
      ampStickyAd.appendChild(ampAd);
      const link = iframe.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'blah');
      iframe.doc.head.appendChild(link);
      return iframe.addElement(ampStickyAd).then(() => {
        return Promise.resolve({
          iframe,
          ampStickyAd,
        });
      });
    });
  }

  it('should listen to scroll event', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      expect(impl.scrollUnlisten_).to.be.function;
    });
  });

  it('should not build when scrollTop less than viewportHeight', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const removeOnScrollListenerSpy =
          sandbox.spy(impl, 'removeOnScrollListener_');
      const getScrollTopSpy = sandbox.spy();
      const getSizeSpy = sandbox.spy();
      const getScrollHeightSpy = sandbox.spy();

      impl.viewport_.getScrollTop = function() {
        getScrollTopSpy();
        return 20;
      };
      impl.viewport_.getSize = function() {
        getSizeSpy();
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function() {
        getScrollHeightSpy();
        return 300;
      };

      impl.displayAfterScroll_();
      expect(getScrollTopSpy).to.have.been.called;
      expect(getSizeSpy).to.have.been.called;
      expect(getScrollHeightSpy).to.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(removeOnScrollListenerSpy).to.not.have.been.called;
    });
  });

  it('should build on enough scroll dist, one more viewport ahead', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const removeOnScrollListenerSpy =
          sandbox.spy(impl, 'removeOnScrollListener_');
      const getScrollTopSpy = sandbox.spy();
      const getSizeSpy = sandbox.spy();
      const getScrollHeightSpy = sandbox.spy();

      impl.viewport_.getScrollTop = function() {
        getScrollTopSpy();
        return 100;
      };
      impl.viewport_.getSize = function() {
        getSizeSpy();
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function() {
        getScrollHeightSpy();
        return 300;
      };
      impl.deferMutate = function(callback) {
        callback();
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };

      impl.displayAfterScroll_();
      expect(getScrollTopSpy).to.have.been.called;
      expect(getSizeSpy).to.have.been.called;
      expect(getScrollHeightSpy).to.have.been.called;
      expect(scheduleLayoutSpy).to.have.been.called;
      expect(removeOnScrollListenerSpy).to.have.been.called;
    });
  });

  it('should not build if less than one viewport height ahead', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const removeOnScrollListenerSpy =
          sandbox.spy(impl, 'removeOnScrollListener_');
      const getScrollTopSpy = sandbox.spy();
      const getSizeSpy = sandbox.spy();
      const getScrollHeightSpy = sandbox.spy();

      impl.viewport_.getScrollTop = function() {
        getScrollTopSpy();
        return 150;
      };
      impl.viewport_.getSize = function() {
        getSizeSpy();
        return {height: 100};
      };
      impl.viewport_.getScrollHeight = function() {
        getScrollHeightSpy();
        return 180;
      };
      impl.deferMutate = function(callback) {
        callback();
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };

      impl.displayAfterScroll_();
      expect(getScrollTopSpy).to.have.been.called;
      expect(getSizeSpy).to.have.been.called;
      expect(getScrollHeightSpy).to.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(removeOnScrollListenerSpy).to.have.been.called;
    });
  });

  it('should set body borderBottom correctly', () => {
    return getAmpStickyAd().then(obj => {
      const iframe = obj.iframe;
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;

      let borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      let borderStyle = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-style');
      expect(borderWidth).to.equal('0px');
      expect(borderStyle).to.equal('none');

      impl.viewport_.updatePaddingBottom(50);
      borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      borderStyle = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-style');
      expect(borderWidth).to.equal('50px');
      expect(borderStyle).to.equal('solid');
    });
  });

  it('should not build when child is not ad', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const getRealChildrenSpy = sandbox.spy();

      impl.getRealChildren = function() {
        getRealChildrenSpy();
        return [
          {tagName: 'AMP-IMG'},
        ];
      };

      const error = null;
      try {
        impl.buildCallback();
      } catch (AssertionError) {
        expect(AssertionError.messageArray).to.have.length(1);
        return;
      }
      expect(error).not.to.be.null;
    });
  });

  it('should not build when has more than 1 children', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const getRealChildrenSpy = sandbox.spy();

      impl.getRealChildren = function() {
        getRealChildrenSpy();
        return [
          {tagName: 'AMP-AD'},
          {tagName: 'AMP-AD'},
        ];
      };

      const error = null;
      try {
        impl.buildCallback();
      } catch (AssertionError) {
        expect(AssertionError.messageArray).to.have.length(1);
        return;
      }
      expect(error).not.to.be.null;
    });
  });

  it('should create a close button', () => {
    return getAmpStickyAd().then(obj => {
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;
      const addCloseButtonSpy = sandbox.spy(impl, 'addCloseButton_');

      impl.viewport_.getScrollTop = function() {
        return 100;
      };
      impl.viewport_.getSize = function() {
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function() {
        return 300;
      };
      impl.deferMutate = function(callback) {
        callback();
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };

      impl.displayAfterScroll_();
      expect(addCloseButtonSpy).to.be.called;
      expect(impl.element.children[1]).to.be.not.null;
      expect(impl.element.children[1].tagName).to.equal('BUTTON');
    });
  });

  it('close button should close ad and reset body borderBottom', () => {
    return getAmpStickyAd().then(obj => {
      const iframe = obj.iframe;
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;

      impl.viewport_.getScrollTop = function() {
        return 100;
      };
      impl.viewport_.getSize = function() {
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function() {
        return 300;
      };
      impl.deferMutate = function(callback) {
        callback();
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };
      impl.element.offsetHeight = function() {
        return 20;
      };

      impl.displayAfterScroll_();
      let borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('50px');
      expect(impl.element.children[1]).to.be.not.null;
      impl.element.children[1].dispatchEvent(new Event('click'));
      borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('0px');
    });
  });

  it('should collapse and reset borderBottom when its child do', () => {
    return getAmpStickyAd().then(obj => {
      const iframe = obj.iframe;
      const stickyAdElement = obj.ampStickyAd;
      const impl = stickyAdElement.implementation_;

      impl.viewport_.getScrollTop = function() {
        return 100;
      };
      impl.viewport_.getSize = function() {
        return {height: 50};
      };
      impl.viewport_.getScrollHeight = function() {
        return 300;
      };
      impl.deferMutate = function(callback) {
        callback();
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };
      impl.element.offsetHeight = function() {
        return 20;
      };

      impl.displayAfterScroll_();
      let borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('50px');
      impl.collapsedCallback();
      borderWidth = iframe.win.getComputedStyle(iframe.doc.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('0px');
      expect(stickyAdElement.style.display).to.equal('none');
    });
  });
});
