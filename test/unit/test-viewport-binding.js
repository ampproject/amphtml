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

import {Services} from '../../src/services';
import {ViewportBindingIosEmbedShadowRoot_} from '../../src/service/viewport/viewport-binding-ios-embed-sd';
import {ViewportBindingIosEmbedWrapper_} from '../../src/service/viewport/viewport-binding-ios-embed-wrapper';
import {ViewportBindingNatural_} from '../../src/service/viewport/viewport-binding-natural';
import {installDocService} from '../../src/service/ampdoc-impl';
import {installDocumentStateService} from '../../src/service/document-state';
import {installPlatformService} from '../../src/service/platform-impl';
import {installVsyncService} from '../../src/service/vsync-impl';
import {toggleExperiment} from '../../src/experiments';
import {whenDocumentReady} from '../../src/document-ready';

describes.realWin('ViewportBindingNatural', {ampCss: true}, env => {
  let binding;
  let win;
  let ampdoc;
  let viewer;
  let child;
  let sandbox;

  beforeEach(() => {
    sandbox = env.sandbox;

    env.iframe.style.width = '100px';
    env.iframe.style.height = '200px';
    win = env.win;
    win.document.documentElement.classList.add('i-amphtml-singledoc');

    child = win.document.createElement('div');
    child.style.width = '200px';
    child.style.height = '300px';
    win.document.body.appendChild(child);

    viewer = {};

    installPlatformService(win);
    installVsyncService(win);
    installDocService(win, /* isSingleDoc */ true);
    installDocumentStateService(win);
    ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    binding.connect();
  });

  it('should setup overflow:visible on body', () => {
    expect(win.getComputedStyle(win.document.body).overflow).to.equal(
      'visible'
    );
  });

  it('should configure body as relative', () => {
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    expect(win.document.body.style.display).to.not.be.ok;
    const bodyStyles = win.getComputedStyle(win.document.body);
    expect(bodyStyles.position).to.equal('relative');
    // It's important that this experiment does NOT override the previously
    // set `overflow`.
    expect(bodyStyles.overflow).to.equal('visible');
  });

  it('should override body overflow for iOS webview', () => {
    win.document.documentElement.classList.add('i-amphtml-webview');
    binding = new ViewportBindingNatural_(ampdoc, viewer);
    const bodyStyles = win.getComputedStyle(win.document.body);
    expect(bodyStyles.position).to.equal('relative');
    expect(bodyStyles.overflowX).to.equal('hidden');
    expect(bodyStyles.overflowY).to.not.equal('hidden');
  });

  it('should NOT require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.false;
  });

  it('should NOT require override of the global scrollTo', () => {
    expect(binding.overrideGlobalScrollTo()).to.be.false;
  });

  it('should connect events: subscribe to scroll and resize events', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    expect(win.eventListeners.count('scroll')).to.equal(1);
  });

  it('should disconnect events', () => {
    // After disconnect, there are no more listeners on window.
    binding.disconnect();
    expect(win.eventListeners.count('resize')).to.equal(0);
    expect(win.eventListeners.count('scroll')).to.equal(0);
  });

  it('should update padding', () => {
    binding.updatePaddingTop(31);
    expect(win.document.documentElement.style.paddingTop).to.equal('31px');
  });

  // TODO(zhouyx, #11827): Make this test work on Safari.
  it.configure()
    .skipSafari()
    .run('should calculate size', () => {
      const size = binding.getSize();
      expect(size.width).to.equal(100);
      expect(size.height).to.equal(200);
    });

  it('should calculate scrollTop from scrollElement', () => {
    win.pageYOffset = 11;
    win.document.scrollingElement.scrollTop = 17;
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from scrollElement', () => {
    expect(binding.getScrollWidth()).to.equal(200);
  });

  it('should calculate scrollHeight from scrollElement', () => {
    expect(binding.getScrollHeight()).to.equal(300);
  });

  it('should calculate contentHeight from body height', () => {
    // Set content to be smaller than viewport.
    child.style.height = '50px';
    expect(binding.getContentHeight()).to.equal(50);
  });

  it('should include padding top in contentHeight', () => {
    binding.updatePaddingTop(10);
    binding.setScrollTop(20); // should have no effect on height
    expect(binding.getContentHeight()).to.equal(310);
  });

  it('should account for child margin-top', () => {
    child.style.marginTop = '15px';
    expect(binding.getContentHeight()).to.equal(315);
  });

  it('should account for child margin-top (WebKit)', () => {
    sandbox.stub(win.document, 'scrollingElement').value(null);
    sandbox.stub(binding.platform_, 'isWebKit').returns(true);

    child.style.marginTop = '15px';
    expect(binding.getContentHeight()).to.equal(315);
  });

  it('should update scrollTop on scrollElement', () => {
    win.pageYOffset = 11;
    win.document.scrollingElement.scrollTop = 17;
    binding.setScrollTop(21);
    expect(win.document.scrollingElement./*OK*/ scrollTop).to.equal(21);
  });

  it('should fallback scrollTop to pageYOffset', () => {
    win.pageYOffset = 11;
    delete win.document.scrollingElement.scrollTop;
    expect(binding.getScrollTop()).to.equal(11);
  });

  it('should offset client rect for layout', () => {
    win.pageXOffset = 0;
    win.pageYOffset = 200;
    delete win.document.scrollingElement;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12); // round(0 + 11.5)
    expect(rect.top).to.equal(213); // round(200 + 12.5)
    expect(rect.width).to.equal(14); // round(13.5)
    expect(rect.height).to.equal(15); // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    win.pageXOffset = 0;
    win.pageYOffset = 2000;
    delete win.document.scrollingElement;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el, 100, 200);
    expect(rect.left).to.equal(112); // round(100 + 11.5)
    expect(rect.top).to.equal(213); // round(200 + 12.5)
    expect(rect.width).to.equal(14); // round(13.5)
    expect(rect.height).to.equal(15); // round(14.5)
  });

  it('should disable scroll temporarily and reset scroll', () => {
    let htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');

    binding.disableScroll();

    expect(win.document.documentElement).to.have.class(
      'i-amphtml-scroll-disabled'
    );
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('hidden');

    binding.resetScroll();

    expect(win.document.documentElement).to.not.have.class(
      'i-amphtml-scroll-disabled'
    );
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');
  });
});

describes.realWin('ViewportBindingIosEmbedWrapper', {ampCss: true}, env => {
  let win;
  let binding;
  let vsync;
  let child;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '100px';
    win = env.win;
    win.document.documentElement.className = 'top i-amphtml-singledoc';
    child = win.document.createElement('div');
    child.style.width = '200px';
    child.style.height = '300px';
    child.textContent = 'test';
    win.document.body.appendChild(child);
    installDocService(win, /* isSingleDoc */ true);
    installDocumentStateService(win);
    installVsyncService(win);
    installPlatformService(win);
    vsync = Services.vsyncFor(win);
    binding = new ViewportBindingIosEmbedWrapper_(win);
    binding.connect();
  });

  it('should NOT setup body min-height w/o experiment', () => {
    const style = win.getComputedStyle(win.document.body);
    expect(style.minHeight).to.equal('0px');
  });

  it('should require override of the global scrollTo', () => {
    expect(binding.overrideGlobalScrollTo()).to.be.true;
  });

  // TODO(#22220): Remove when "ios-fixed-no-transfer" experiment is cleaned up.
  it('should require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  // TODO(#22220): Remove when "ios-fixed-no-transfer" experiment is cleaned up.
  it('should require fixed layer transferring for later iOS w/o experiment', () => {
    sandbox
      .stub(Services.platformFor(win), 'getIosVersionString')
      .callsFake(() => '12.2');
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should configure fixed layer transferring based on iOS version', () => {
    toggleExperiment(win, 'ios-fixed-no-transfer');
    let version;
    sandbox
      .stub(Services.platformFor(win), 'getIosVersionString')
      .callsFake(() => version);

    // 12.1 is still out.
    version = '12.1';
    expect(binding.requiresFixedLayerTransfer()).to.be.true;

    // 12.2 and up are fixed.
    version = '12.2';
    expect(binding.requiresFixedLayerTransfer()).to.be.false;

    version = '12.3';
    expect(binding.requiresFixedLayerTransfer()).to.be.false;

    version = '13.0';
    expect(binding.requiresFixedLayerTransfer()).to.be.false;
  });

  it('should start w/o overscroll and set it on doc ready', () => {
    const root = win.document.documentElement;
    expect(root).to.not.have.class('i-amphtml-ios-overscroll');
    expect(root.style.webkitOverflowScrolling).to.not.equal('touch');
    expect(binding.wrapper_.style.webkitOverflowScrolling).to.not.equal(
      'touch'
    );
    return whenDocumentReady(win.document).then(() => {
      expect(root).to.have.class('i-amphtml-ios-overscroll');
    });
  });

  it('should have UI setup', () => {
    expect(binding.setupDone_).to.be.true;
    expect(win.document.documentElement).to.have.class('i-amphtml-ios-embed');
    expect(win.document.body).to.exist;
    expect(win.document.body.parentNode).to.not.equal(
      win.document.documentElement
    );
    expect(win.document.body.parentNode).to.equal(binding.wrapper_);
    expect(binding.wrapper_.parentNode).to.equal(win.document.documentElement);
    expect(binding.wrapper_.tagName).to.equal('HTML');
    expect(binding.wrapper_.id).to.equal('i-amphtml-wrapper');
    expect(win.document.body.contains(child)).to.be.true;
    expect(binding.wrapper_.contains(child)).to.be.true;
    expect(win.document.contains(child)).to.be.true;
    expect(child.textContent).to.equal('test');

    // Top-level classes moved to the wrapper element.
    expect(win.document.documentElement).to.have.class('top');
    expect(binding.wrapper_).to.have.class('top');
  });

  it('should have CSS setup', () => {
    win.document.body.style.display = 'table';
    const htmlCss = win.getComputedStyle(win.document.documentElement);
    const wrapperCss = win.getComputedStyle(binding.wrapper_);
    const bodyCss = win.getComputedStyle(win.document.body);

    // `<html>` must have `position: static` or layout is broken.
    expect(htmlCss.position).to.equal('static');

    // `<html>` and `<i-amphtml-wrapper>` must be scrollable, but not `body`.
    // Unfortunately, we can't test here `-webkit-overflow-scrolling`.
    expect(htmlCss.overflowY).to.equal('auto');
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(bodyCss.overflowY).to.equal('visible');
    expect(bodyCss.overflowX).to.equal('visible');

    // Wrapper must be a block and positioned absolute at 0/0/0/0.
    expect(wrapperCss.display).to.equal('block');
    expect(wrapperCss.position).to.equal('absolute');
    expect(wrapperCss.top).to.equal('0px');
    expect(wrapperCss.left).to.equal('0px');
    expect(wrapperCss.right).to.equal('0px');
    expect(wrapperCss.bottom).to.equal('0px');
    expect(wrapperCss.margin).to.equal('0px');

    // `body` must have `relative` positioning and `block` display.
    expect(bodyCss.position).to.equal('relative');
    // Preserve the customized `display` value.
    expect(bodyCss.display).to.equal('table');

    // `body` must have a 1px transparent border for two purposes:
    // (1) to cancel out margin collapse in body's children;
    // (2) to offset scroll adjustment to 1 to avoid scroll freeze problem.
    expect(
      bodyCss.borderTop.replace('rgba(0, 0, 0, 0)', 'transparent')
    ).to.equal('1px solid transparent');
    expect(bodyCss.margin).to.equal('0px');
  });

  it('should be immediately scrolled to 1 to avoid freeze', () => {
    expect(binding.wrapper_.scrollTop).to.equal(1);
  });

  it('should connect events: subscribe to scroll and resize events', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    // Note that scroll event is on the wrapper, and NOT on root or body.
    expect(win.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.eventListeners.count('scroll')).to.equal(0);
    expect(
      win.document.documentElement.eventListeners.count('scroll')
    ).to.equal(0);
    expect(win.document.body.eventListeners.count('scroll')).to.equal(0);
  });

  it('should disconnect events', () => {
    // After disconnect, there are no more listeners on window.
    binding.disconnect();
    expect(win.eventListeners.count('resize')).to.equal(0);
  });

  it('should update padding', () => {
    binding.updatePaddingTop(31);
    expect(binding.wrapper_.style.paddingTop).to.equal('31px');
    // Notice, root is not touched.
    expect(win.document.documentElement.style.paddingTop).to.equal('');
  });

  // TODO(zhouyx, #11827): Make this test work on Safari.
  it.configure()
    .skipSafari()
    .run('should calculate size', () => {
      const size = binding.getSize();
      expect(size.width).to.equal(100);
      expect(size.height).to.equal(100);
    });

  it('should calculate scrollTop from wrapper', () => {
    binding.wrapper_.scrollTop = 17;
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollWidth from wrapper', () => {
    expect(binding.getScrollWidth()).to.equal(200);
  });

  it('should calculate scrollHeight from wrapper', () => {
    expect(binding.getScrollHeight()).to.equal(301); // +1px for border-top.
  });

  it('should calculate contentHeight from body height', () => {
    // Set content to be smaller than viewport.
    child.style.height = '50px';
    expect(binding.getContentHeight()).to.equal(51);
  });

  it('should include padding top in contentHeight', () => {
    binding.updatePaddingTop(10);
    binding.setScrollTop(20); // should have no effect on height
    expect(binding.getContentHeight()).to.equal(311); // +1px for border-top.
  });

  it('should account for child margin-top', () => {
    child.style.marginTop = '15px';
    expect(binding.getContentHeight()).to.equal(316); // +1px for border-top.
  });

  it('should update scrollTop on wrapper', () => {
    binding.setScrollTop(21);
    expect(binding.wrapper_.scrollTop).to.equal(21);
  });

  it('should adjust scrollTop to avoid scroll freeze', () => {
    binding.setScrollTop(21);
    expect(binding.wrapper_.scrollTop).to.equal(21);

    // `scrollTop=0` is normally not allowed.
    binding.setScrollTop(0);
    expect(binding.wrapper_.scrollTop).to.equal(1);
  });

  it('should offset client rect for layout', () => {
    binding.wrapper_.scrollTop = 200;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.top).to.equal(213); // round(200 + 12.5)
    expect(rect.width).to.equal(14); // round(13.5)
    expect(rect.height).to.equal(15); // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    binding.wrapper_.scrollTop = 10;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el, 100, 200);
    expect(rect.left).to.equal(112); // round(100 + 11.5)
    expect(rect.top).to.equal(213); // round(200 + 12.5)
    expect(rect.width).to.equal(14); // round(13.5)
    expect(rect.height).to.equal(15); // round(14.5)
  });

  it('should call scroll event', () => {
    return new Promise(resolve => {
      binding.onScroll(resolve);
      binding.wrapper_.scrollTop = 11;
    }).then(() => {
      expect(binding.getScrollTop()).to.equal(11);
    });
  });

  it('should disable scroll temporarily and reset scroll', () => {
    let wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');

    binding.disableScroll();

    expect(binding.wrapper_).to.have.class('i-amphtml-scroll-disabled');
    wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('hidden');

    binding.resetScroll();

    expect(binding.wrapper_).to.not.have.class('i-amphtml-scroll-disabled');
    wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');
  });

  it('should NOT refresh overscroll w/o experiment', () => {
    binding.contentHeightChanged();
    const root = win.document.documentElement;
    return vsync.mutatePromise().then(() => {
      expect(root).to.have.class('i-amphtml-ios-overscroll');
    });
  });
});

describes.realWin('ViewportBindingIosEmbedShadowRoot_', {ampCss: true}, env => {
  let iframe;
  let win;
  let binding;
  let vsync;
  let child;

  // Can only test when Shadow DOM is available.
  describe
    .configure()
    .if(() => Element.prototype.attachShadow)
    .run('Viewport' + 'BindingIosEmbedShadowRoot_', function() {
      beforeEach(function() {
        iframe = env.iframe;
        iframe.style.width = '100px';
        iframe.style.height = '100px';
        win = env.win;
        win.document.documentElement.className = 'top i-amphtml-singledoc';
        child = win.document.createElement('div');
        child.style.width = '200px';
        child.style.height = '300px';
        child.textContent = 'test';
        win.document.body.appendChild(child);

        const styleEl = win.document.createElement('style');
        styleEl.textContent = `
          .flexed {display: flex}
          @media (min-width: 150px) {
            body {display: table}
          }
        `;
        win.document.head.appendChild(styleEl);

        installDocService(win, /* isSingleDoc */ true);
        installDocumentStateService(win);
        installVsyncService(win);
        vsync = Services.vsyncFor(win);
        binding = new ViewportBindingIosEmbedShadowRoot_(win);
        binding.connect();
      });

      it('should NOT setup body min-height w/o experiment', () => {
        const style = win.getComputedStyle(win.document.body);
        expect(style.minHeight).to.equal('0px');
      });

      it('should NOT require fixed layer transferring', () => {
        expect(binding.requiresFixedLayerTransfer()).to.be.false;
      });

      it('should require override of the global scrollTo', () => {
        expect(binding.overrideGlobalScrollTo()).to.be.true;
      });

      it('should start w/o overscroll and set it on doc ready', () => {
        const root = binding.getScrollingElement();
        expect(root).to.not.have.class('i-amphtml-ios-overscroll');
        return whenDocumentReady(win.document).then(() => {
          expect(root).to.have.class('i-amphtml-ios-overscroll');
        });
      });

      it('should have UI setup', () => {
        expect(binding.setupDone_).to.be.true;
        expect(win.document.documentElement).to.have.class(
          'i-amphtml-ios-embed-sd'
        );
        // Should preserve existing classes.
        expect(win.document.documentElement).to.have.class('top');
        expect(win.document.body).to.exist;
        expect(win.document.body.parentNode).to.equal(
          win.document.documentElement
        );
        expect(win.document.body.shadowRoot).to.exist;
        expect(win.document.body.shadowRoot.firstElementChild).to.equal(
          binding.scroller_
        );
        expect(binding.wrapper_.parentNode).to.equal(binding.scroller_);
        expect(binding.wrapper_.firstElementChild.tagName).to.equal('SLOT');
        expect(binding.wrapper_.tagName).to.equal('DIV');
        expect(binding.wrapper_.id).to.equal('i-amphtml-body-wrapper');
        expect(win.document.body.contains(child)).to.be.true;
        expect(binding.wrapper_.contains(child)).to.be.false;
        expect(win.document.contains(child)).to.be.true;
        expect(child.textContent).to.equal('test');
      });

      it('should have CSS setup', () => {
        const htmlCss = win.getComputedStyle(win.document.documentElement);
        const scrollerCss = win.getComputedStyle(binding.scroller_);
        const wrapperCss = win.getComputedStyle(binding.wrapper_);
        const bodyCss = win.getComputedStyle(win.document.body);

        // `<html>` must have `position: static` or layout is broken. It must
        // not be scrollable.
        expect(htmlCss.position).to.equal('static');
        expect(htmlCss.overflowY).to.equal('hidden');
        expect(htmlCss.overflowX).to.equal('hidden');

        // Body takes full viewport and not scrollable.
        expect(bodyCss.overflowY).to.equal('hidden');
        expect(bodyCss.overflowX).to.equal('hidden');
        expect(bodyCss.margin).to.equal('0px');
        expect(bodyCss.position).to.equal('absolute');
        expect(bodyCss.top).to.equal('0px');
        expect(bodyCss.left).to.equal('0px');
        expect(bodyCss.right).to.equal('0px');
        expect(bodyCss.bottom).to.equal('0px');

        // Scroller is full-viewport size and scrollable.
        // Unfortunately, we can't test here `-webkit-overflow-scrolling`.
        expect(scrollerCss.overflowY).to.equal('auto');
        expect(scrollerCss.overflowX).to.equal('hidden');
        expect(wrapperCss.overflowY).to.equal('visible');
        expect(wrapperCss.overflowX).to.equal('visible');

        // Scroller must be a block and positioned absolute at 0/0/0/0.
        expect(scrollerCss.display).to.equal('block');
        expect(scrollerCss.boxSizing).to.equal('border-box');
        expect(scrollerCss.position).to.equal('absolute');
        expect(scrollerCss.top).to.equal('0px');
        expect(scrollerCss.left).to.equal('0px');
        expect(scrollerCss.right).to.equal('0px');
        expect(scrollerCss.bottom).to.equal('0px');
        expect(scrollerCss.margin).to.equal('0px');
        // Scroler must have a 1px transparent border for two purposes:
        // (1) to cancel out margin collapse in body's children;
        // (2) to offset scroll adjustment to 1 to avoid scroll freeze problem.
        expect(
          scrollerCss.borderTop.replace('rgba(0, 0, 0, 0)', 'transparent')
        ).to.equal('1px solid transparent');

        // Wrapper must additionally have `will-change: transform` to avoid iOS
        // rendering bug where contents inside the `-webkit-overflow-scrolling`
        // element would occasionally fail to paint. This bug appears to trigger
        // more often when Shadow DOM is involved.
        expect(wrapperCss.willChange).to.equal('transform');

        // Preserve and inherit the customized body styles.
        win.document.body.style.display = 'flex';
        win.document.body.style.flexDirection = 'row';
        win.document.body.style.alignItems = 'center';
        return vsync.mutatePromise().then(() => {
          expect(binding.wrapper_.style.display).to.equal('flex');
          expect(binding.wrapper_.style.flexDirection).to.equal('row');
          expect(binding.wrapper_.style.alignItems).to.equal('center');
        });
      });

      it('should update body styles on class changes', () => {
        // Body styles are moved to the wrapper.
        return vsync
          .mutatePromise()
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('block');
            win.document.body.classList.add('flexed');
            return vsync.mutatePromise();
          })
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('flex');
          });
      });

      it('should update body styles on style changes', () => {
        // Body styles are moved to the wrapper.
        return vsync
          .mutatePromise()
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('block');
            win.document.body.style.display = 'table';
            return vsync.mutatePromise();
          })
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('table');
          });
      });

      it('should update body styles on resize', () => {
        // Body styles are moved to the wrapper.
        return vsync
          .mutatePromise()
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('block');
            return new Promise(resolve => {
              binding.onResize(resolve);
              iframe.style.width = '200px';
            });
          })
          .then(() => {
            return vsync.mutatePromise();
          })
          .then(() => {
            expect(binding.wrapper_.style.display).to.equal('table');
          });
      });

      it('should be immediately scrolled to 1 to avoid freeze', () => {
        expect(binding.scroller_.scrollTop).to.equal(1);
      });

      it('should connect events: subscribe to scroll and resize events', () => {
        expect(win.eventListeners.count('resize')).to.equal(1);
        // Note that scroll event is on the wrapper, and NOT on root or body.
        expect(win.eventListeners.count('scroll')).to.equal(0);
        expect(win.document.eventListeners.count('scroll')).to.equal(0);
        expect(
          win.document.documentElement.eventListeners.count('scroll')
        ).to.equal(0);
        expect(win.document.body.eventListeners.count('scroll')).to.equal(0);
      });

      it('should disconnect events', () => {
        // After disconnect, there are no more listeners on window.
        binding.disconnect();
        expect(win.eventListeners.count('resize')).to.equal(0);
      });

      it('should update padding', () => {
        binding.updatePaddingTop(31);
        expect(binding.scroller_.style.paddingTop).to.equal('31px');
        // Notice, root is not touched.
        expect(win.document.documentElement.style.paddingTop).to.equal('');
      });

      it('should calculate scrollTop from scroller', () => {
        binding.scroller_.scrollTop = 17;
        expect(binding.getScrollTop()).to.equal(17);
      });

      it('should calculate scrollWidth from scroller', () => {
        expect(binding.getScrollWidth()).to.equal(200);
      });

      it('should calculate scrollHeight from scroller', () => {
        expect(binding.getScrollHeight()).to.equal(300);
      });

      it('should calculate contentHeight from body height', () => {
        // Set content to be smaller than viewport.
        child.style.height = '50px';
        expect(binding.getContentHeight()).to.equal(51);
      });

      it('should include padding top in contentHeight', () => {
        binding.updatePaddingTop(10);
        binding.setScrollTop(20); // should have no effect on height
        expect(binding.getContentHeight()).to.equal(311); // +1px for border-top.
      });

      it('should account for child margin-top', () => {
        child.style.marginTop = '15px';
        expect(binding.getContentHeight()).to.equal(316); // +1px for border-top.
      });

      it('should update scrollTop on scroller', () => {
        binding.setScrollTop(21);
        expect(binding.scroller_.scrollTop).to.equal(21);
      });

      it('should adjust scrollTop to avoid scroll freeze', () => {
        binding.setScrollTop(21);
        expect(binding.scroller_.scrollTop).to.equal(21);

        // `scrollTop=0` is normally not allowed.
        binding.setScrollTop(0);
        expect(binding.scroller_.scrollTop).to.equal(1);
      });

      it('should offset client rect for layout', () => {
        binding.scroller_.scrollTop = 200;
        const el = {
          getBoundingClientRect: () => {
            return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
          },
        };
        const rect = binding.getLayoutRect(el);
        expect(rect.top).to.equal(213); // round(200 + 12.5)
        expect(rect.width).to.equal(14); // round(13.5)
        expect(rect.height).to.equal(15); // round(14.5)
      });

      it('should offset client rect for layout and position passed in', () => {
        binding.scroller_.scrollTop = 10;
        const el = {
          getBoundingClientRect: () => {
            return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
          },
        };
        const rect = binding.getLayoutRect(el, 100, 200);
        expect(rect.left).to.equal(112); // round(100 + 11.5)
        expect(rect.top).to.equal(213); // round(200 + 12.5)
        expect(rect.width).to.equal(14); // round(13.5)
        expect(rect.height).to.equal(15); // round(14.5)
      });

      it('should call scroll event', () => {
        binding.scroller_.scrollTop = 1;
        return new Promise(resolve => {
          binding.onScroll(resolve);
          binding.scroller_.scrollTop = 11;
        }).then(() => {
          expect(binding.getScrollTop()).to.equal(11);
        });
      });

      it('should disable scroll temporarily and reset scroll', () => {
        let scrollerCss = win.getComputedStyle(binding.scroller_);
        expect(scrollerCss.overflowX).to.equal('hidden');
        expect(scrollerCss.overflowY).to.equal('auto');

        binding.disableScroll();

        scrollerCss = win.getComputedStyle(binding.scroller_);
        expect(scrollerCss.overflowX).to.equal('hidden');
        expect(scrollerCss.overflowY).to.equal('hidden');

        binding.resetScroll();

        scrollerCss = win.getComputedStyle(binding.scroller_);
        expect(scrollerCss.overflowX).to.equal('hidden');
        expect(scrollerCss.overflowY).to.equal('auto');
      });

      it('should NOT refresh overscroll w/o experiment', () => {
        const scroller = binding.scroller_;
        const setStyleStub = sandbox.stub(scroller.style, 'setProperty');
        binding.contentHeightChanged();
        return vsync.mutatePromise().then(() => {
          const {args} = setStyleStub.lastCall;
          expect(args[1]).to.not.equal('auto');
        });
      });
    });
});
