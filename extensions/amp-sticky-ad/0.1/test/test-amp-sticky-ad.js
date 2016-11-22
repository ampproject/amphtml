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

import '../amp-sticky-ad';
import '../../../amp-ad/0.1/amp-ad';

describes.realWin('amp-sticky-ad 0.1 version', {
  win: { /* window spec */
    location: '...',
    historyOff: false,
  },
  amp: { /* amp spec */
    runtimeOn: false,
    extensions: ['amp-sticky-ad:0.1'],
  },
}, env => {
  let win;
  let ampStickyAd;
  let impl;
  describe('with valid child 0.1', () => {
    beforeEach(() => {
      win = env.win;
      ampStickyAd = win.document.createElement('amp-sticky-ad');
      ampStickyAd.setAttribute('layout', 'nodisplay');
      const ampAd = win.document.createElement('amp-ad');
      ampStickyAd.appendChild(ampAd);
      win.document.body.appendChild(ampStickyAd);
      ampStickyAd.build();
      impl = ampStickyAd.implementation_;
    });

    it('should listen to scroll event', () => {
      expect(impl.scrollUnlisten_).to.be.function;
    });

    it('should not build when scrollTop less than viewportHeight', done => {
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
      done();
    });

    it('should build on enough scroll dist, one more viewport ahead', () => {
      const scheduleLayoutSpy = sandbox.stub(impl, 'scheduleLayoutForAd_',
          () => {});
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

    it('should not build if less than one viewport height ahead', () => {
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

    it('should set body borderBottom correctly', () => {
      let borderWidth = win.getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
      let borderStyle = win.getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-style');
      expect(borderWidth).to.equal('0px');
      expect(borderStyle).to.equal('none');

      impl.viewport_.updatePaddingBottom(50);
      return impl.viewport_.ampdoc.whenBodyAvailable().then(() => {
        borderWidth = win.getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
        borderStyle = win.getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-style');
        expect(borderWidth).to.equal('50px');
        expect(borderStyle).to.equal('solid');
      });
    });

    it('should create a close button', () => {
      const addCloseButtonSpy = sandbox.spy(impl, 'addCloseButton_');
      sandbox.stub(impl, 'scheduleLayoutForAd_', () => {});

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

    it('should listen to amp:built, amp:load:end', () => {
      impl.ad_.isBuilt = () => {
        return false;
      };
      impl.vsync_.mutate = function(callback) {
        callback();
      };
      const layoutAdSpy = sandbox.spy(impl, 'layoutAd_');
      impl.scheduleLayoutForAd_();
      expect(layoutAdSpy).to.not.been.called;
      impl.ad_.dispatchEvent(new Event('amp:built'));
      expect(layoutAdSpy).to.be.called;
      impl.ad_.dispatchEvent(new Event('amp:load:end'));
      expect(ampStickyAd).to.have.attribute('visible');
      expect(ampStickyAd.classList.contains('amp-sticky-ad-loaded'))
          .to.be.true;
    });
  });


  describe('with unvalid child 0.1', () => {
    let ampImg;
    let ampAd1;
    let ampAd2;
    beforeEach(() => {
      win = env.win;
      ampStickyAd = win.document.createElement('amp-sticky-ad');
      ampStickyAd.setAttribute('layout', 'nodisplay');
      ampImg = win.document.createElement('amp-img');
      ampAd1 = win.document.createElement('amp-ad');
      ampAd2 = win.document.createElement('amp-ad');
      win.document.body.appendChild(ampStickyAd);
    });

    it('should not build when child is not ad', () => {
      ampStickyAd.appendChild(ampImg);
      const impl = ampStickyAd.implementation_;

      const error = null;
      try {
        impl.buildCallback();
      } catch (AssertionError) {
        expect(AssertionError.messageArray).to.have.length(1);
        return;
      }
      expect(error).not.to.be.null;
    });

    it('should not build when has more than 1 children', () => {
      ampStickyAd.appendChild(ampAd1);
      ampStickyAd.appendChild(ampAd2);
      const impl = ampStickyAd.implementation_;

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
});


describes.realWin('amp-sticky-ad 0.1 with real ad child', {
  win: { /* window spec */
    location: '...',
    historyOff: false,
  },
  amp: { /* amp spec */
    runtimeOn: false,
    extensions: ['amp-sticky-ad:0.1', 'amp-ad'],
  },
}, env => {
  let win;
  let ampStickyAd;
  let impl;
  beforeEach(done => {
    win = env.win;
    ampStickyAd = win.document.createElement('amp-sticky-ad');
    ampStickyAd.setAttribute('layout', 'nodisplay');
    const ampAd = win.document.createElement('amp-ad');
    ampAd.setAttribute('height', '50');
    ampAd.setAttribute('width', '200');
    ampAd.setAttribute('type', '_ping_');
    ampStickyAd.appendChild(ampAd);
    win.document.body.appendChild(ampStickyAd);
    ampStickyAd.build();
    impl = ampStickyAd.implementation_;
    return ampAd.implementation_.upgradeCallback().then(() => {
      done();
    });
  });

  it('close button should close ad and reset body borderBottom', () => {
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
    return impl.viewport_.ampdoc.whenBodyAvailable().then(() => {
      let borderWidth = win.getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('50px');
      expect(impl.element.children[1]).to.be.not.null;
      impl.element.children[1].dispatchEvent(new Event('click'));
      return impl.viewport_.ampdoc.whenBodyAvailable().then(() => {
        borderWidth = win.getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
        expect(borderWidth).to.equal('0px');
      });
    });
  });

  it('should collapse and reset borderBottom when its child do', () => {
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
    return impl.viewport_.ampdoc.whenBodyAvailable().then(() => {
      let borderWidth = win.getComputedStyle(win.document.body, null)
          .getPropertyValue('border-bottom-width');
      expect(borderWidth).to.equal('50px');
      impl.collapsedCallback();
      return impl.viewport_.ampdoc.whenBodyAvailable().then(() => {
        borderWidth = win.getComputedStyle(win.document.body, null)
            .getPropertyValue('border-bottom-width');
        expect(borderWidth).to.equal('0px');
        expect(ampStickyAd.style.display).to.equal('none');
      });
    });
  });
});
