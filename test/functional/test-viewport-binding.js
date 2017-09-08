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

import {installDocService} from '../../src/service/ampdoc-impl';
import {Services} from '../../src/services';
import {
  ViewportBindingIosEmbedWrapper_,
} from '../../src/service/viewport/viewport-binding-ios-embed-wrapper';
import {
  ViewportBindingNatural_,
} from '../../src/service/viewport/viewport-binding-natural';
import {
  ViewportBindingNaturalIosEmbed_,
} from '../../src/service/viewport/viewport-binding-natural-ios-embed';
import {installDocumentStateService} from '../../src/service/document-state';
import {installPlatformService} from '../../src/service/platform-impl';
import {installViewerServiceForDoc} from '../../src/service/viewer-impl';
import {installVsyncService} from '../../src/service/vsync-impl';
import {whenDocumentReady} from '../../src/document-ready';

describes.realWin('ViewportBindingNatural', {ampCss: true}, env => {
  let binding;
  let win;
  let ampdoc;
  let viewer;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '200px';
    win = env.win;
    win.document.documentElement.classList.add('i-amphtml-singledoc');

    const child = win.document.createElement('div');
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
    expect(win.getComputedStyle(win.document.body).overflow)
        .to.equal('visible');
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

  it('should calculate size', () => {
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

  it('should update scrollTop on scrollElement', () => {
    win.pageYOffset = 11;
    win.document.scrollingElement.scrollTop = 17;
    binding.setScrollTop(21);
    expect(win.document.scrollingElement./*OK*/scrollTop).to.equal(21);
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
    expect(rect.left).to.equal(12);  // round(0 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
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
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });


  it('should disable scroll temporarily and reset scroll', () => {
    let htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');

    binding.disableScroll();

    expect(win.document.documentElement).to.have.class(
        'i-amphtml-scroll-disabled');
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('hidden');

    binding.resetScroll();

    expect(win.document.documentElement).to.not.have.class(
        'i-amphtml-scroll-disabled');
    htmlCss = win.getComputedStyle(win.document.documentElement);
    expect(htmlCss.overflowX).to.equal('hidden');
    expect(htmlCss.overflowY).to.equal('auto');
  });
});

describes.realWin('ViewportBindingNaturalIosEmbed', {ampCss: true}, env => {
  let binding;
  let win;

  beforeEach(() => {
    env.iframe.style.width = '100px';
    env.iframe.style.height = '200px';
    win = env.win;
    const child = win.document.createElement('div');
    child.id = 'child';
    child.style.width = '200px';
    child.style.height = '300px';
    win.document.body.appendChild(child);
    installDocService(win, /* isSingleDoc */ true);
    installDocumentStateService(win);
    installVsyncService(win);
    const ampdoc = Services.ampdocServiceFor(win).getAmpDoc();
    installPlatformService(win);
    installViewerServiceForDoc(ampdoc);

    win.document.documentElement.classList.add('i-amphtml-singledoc');
    binding = new ViewportBindingNaturalIosEmbed_(win, ampdoc);
    return Promise.resolve();
  });

  it('should require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should subscribe to resize events on window, scroll on body', () => {
    expect(win.eventListeners.count('resize')).to.equal(1);
    expect(win.eventListeners.count('scroll')).to.equal(0);
    expect(win.document.body.eventListeners.count('scroll')).to.equal(1);
  });

  it('should setup document for embed scrolling', () => {
    const documentElement = win.document.documentElement;
    const body = win.document.body;
    expect(documentElement.style.overflowY).to.equal('auto');
    expect(documentElement.style.webkitOverflowScrolling).to.equal('touch');
    expect(win.getComputedStyle(documentElement).overflowY).to.equal('auto');

    // Assigned styles.
    expect(body.style.overflowX).to.equal('hidden');
    expect(body.style.overflowY).to.equal('auto');
    expect(body.style.webkitOverflowScrolling).to.equal('touch');
    expect(body.style.position).to.equal('absolute');
    expect(body.style.top).to.equal('0px');
    expect(body.style.left).to.equal('0px');
    expect(body.style.right).to.equal('0px');
    expect(body.style.bottom).to.equal('0px');

    // Resolved styles.
    const resolvedBodyStyle = win.getComputedStyle(body);
    expect(resolvedBodyStyle.overflowX).to.equal('hidden');
    expect(resolvedBodyStyle.overflowY).to.equal('auto');
    expect(resolvedBodyStyle.position).to.equal('absolute');
    expect(resolvedBodyStyle.top).to.equal('0px');
    expect(resolvedBodyStyle.left).to.equal('0px');
    expect(resolvedBodyStyle.right).to.equal('0px');
    expect(resolvedBodyStyle.bottom).to.equal('0px');

    const scrollpos = body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos).to.be.ok;
    expect(scrollpos.style.position).to.equal('absolute');
    expect(scrollpos.style.top).to.equal('0px');
    expect(scrollpos.style.left).to.equal('0px');
    expect(scrollpos.style.width).to.equal('0px');
    expect(scrollpos.style.height).to.equal('0px');
    expect(scrollpos.style.visibility).to.equal('hidden');

    const scrollmove = body.querySelector('#i-amphtml-scrollmove');
    expect(scrollmove).to.be.ok;
    expect(scrollmove.style.position).to.equal('absolute');
    expect(scrollmove.style.top).to.equal('0px');
    expect(scrollmove.style.left).to.equal('0px');
    expect(scrollmove.style.width).to.equal('0px');
    expect(scrollmove.style.height).to.equal('0px');
    expect(scrollmove.style.visibility).to.equal('hidden');

    const endpos = body.querySelector('#i-amphtml-endpos');
    expect(endpos).to.be.ok;
    expect(endpos.style.position).to.not.be.ok;
    expect(endpos.style.top).to.not.be.ok;
    expect(endpos.style.width).to.equal('0px');
    expect(endpos.style.height).to.equal('0px');
    expect(endpos.style.visibility).to.equal('hidden');
    expect(endpos.getBoundingClientRect().top).to.equal(300);
  });

  it('should always have scrollWidth equal window.innerWidth', () => {
    expect(binding.getScrollWidth()).to.equal(100);
  });

  it('should update border on BODY when updatePaddingTop', () => {
    binding.updatePaddingTop(31);
    expect(win.document.body.style.borderTop).to
        .equal('31px solid transparent');
    expect(win.document.body.style.paddingTop).to.not.be.ok;
  });

  it('should update border in lightbox mode when updateLightboxMode', () => {
    binding.updatePaddingTop(31);
    expect(win.document.body.style.borderTop).to
        .equal('31px solid transparent');
    expect(win.document.body.style.borderTopStyle).to.equal('solid');

    return binding.updateLightboxMode(true).then(() => {
      expect(win.document.body.style.borderTopStyle).to.equal('none');

      return binding.updateLightboxMode(false);
    }).then(() => {
      expect(win.document.body.style.borderTopStyle).to.equal('solid');
      expect(win.document.body.style.borderBottomStyle).to.not.equal('solid');
      expect(win.document.body.style.borderLeftStyle).to.not.equal('solid');
      expect(win.document.body.style.borderRightStyle).to.not.equal('solid');
    });
  });

  it('should calculate size', () => {
    const size = binding.getSize();
    expect(size.width).to.equal(100);
    expect(size.height).to.equal(200);
  });

  it('should calculate scrollTop from scrollpos element', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    binding.onScrolled_();
    expect(binding.getScrollTop()).to.equal(17);
  });

  it('should calculate scrollTop from scrollpos element with padding', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    binding.updatePaddingTop(10);
    binding.onScrolled_();
    // scrollTop = - BCR.top + paddingTop
    expect(binding.getScrollTop()).to.equal(27);
  });

  it('should calculate scrollHeight from scrollpos/endpos elements', () => {
    binding.setScrollTop(17);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-17);
    const endpos = win.document.body.querySelector('#i-amphtml-endpos');
    expect(endpos.getBoundingClientRect().top).to.equal(283);  // 300 - 17
    expect(binding.getScrollHeight()).to.equal(300);  // 283 - (-17)
  });


  it('should offset client rect for layout', () => {
    binding.setScrollTop(100);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-100);
    expect(scrollpos.getBoundingClientRect().left).to.equal(0);
    binding.onScrolled_();
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el);
    expect(rect.left).to.equal(12);  // round(0 + 11.5)
    expect(rect.top).to.equal(113);  // round(100 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should set scroll position via moving element', () => {
    binding.setScrollTop(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    expect(scrollmove.style.transform).to.equal('translateY(10px)');
  });

  it('should set scroll position via moving element with padding', () => {
    binding.updatePaddingTop(19);
    binding.setScrollTop(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    // transform = scrollTop - paddingTop
    expect(scrollmove.style.transform).to.equal('translateY(-9px)');
  });

  it('should adjust scroll position when scrolled to 0', () => {
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(0);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(scrollmove.style.transform).to.equal('translateY(1px)');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-1);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should adjust scroll position when scrolled to 0 w/padding', () => {
    binding.updatePaddingTop(10);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(10);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    // transform = 1 - updatePadding
    expect(scrollmove.style.transform).to.equal('translateY(-9px)');
    // scroll pos should not change
    expect(scrollpos.getBoundingClientRect().top).to.equal(10);
    expect(event.preventDefault).to.be.calledOnce;
  });

  it('should adjust scroll position when scrolled to 0; w/o event', () => {
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(0);
    const scrollmove = win.document.body.querySelector('#i-amphtml-scrollmove');
    binding.adjustScrollPos_();
    expect(scrollmove.style.transform).to.equal('translateY(1px)');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-1);
  });

  it('should NOT adjust scroll position when scrolled away from 0', () => {
    binding.setScrollTop(10);
    const scrollpos = win.document.body.querySelector('#i-amphtml-scrollpos');
    expect(scrollpos.getBoundingClientRect().top).to.equal(-10);
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(scrollpos.getBoundingClientRect().top).to.equal(-10);
    expect(event.preventDefault).to.have.not.been.called;
  });

  it('should NOT adjust scroll position when overscrolled', () => {
    binding.setScrollTop(310);
    const event = {preventDefault: sandbox.spy()};
    binding.adjustScrollPos_(event);
    expect(event.preventDefault).to.have.not.been.called;
  });
});


describes.realWin('ViewportBindingIosEmbedWrapper', {ampCss: true}, env => {
  let win;
  let binding;
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
    binding = new ViewportBindingIosEmbedWrapper_(win);
    binding.connect();
  });

  it('should NOT require fixed layer transferring', () => {
    expect(binding.requiresFixedLayerTransfer()).to.be.true;
  });

  it('should start w/o overscroll and set it on doc ready', () => {
    const root = win.document.documentElement;
    expect(root).to.not.have.class('i-amphtml-ios-overscroll');
    expect(root.style.webkitOverflowScrolling).to.not.equal('touch');
    expect(binding.wrapper_.style.webkitOverflowScrolling).to.not
        .equal('touch');
    return whenDocumentReady(win.document).then(() => {
      expect(root).to.have.class('i-amphtml-ios-overscroll');
    });
  });

  it('should have UI setup', () => {
    expect(binding.setupDone_).to.be.true;
    expect(win.document.documentElement)
        .to.have.class('i-amphtml-ios-embed');
    expect(win.document.body).to.exist;
    expect(win.document.body.parentNode)
        .to.not.equal(win.document.documentElement);
    expect(win.document.body.parentNode)
        .to.equal(binding.wrapper_);
    expect(binding.wrapper_.parentNode)
        .to.equal(win.document.documentElement);
    expect(binding.wrapper_.tagName).to.equal('HTML');
    expect(binding.wrapper_.id).to.equal('i-amphtml-wrapper');
    expect(win.document.body.contains(child)).to.be.true;
    expect(binding.wrapper_.contains(child)).to.be.true;
    expect(win.document.contains(child)).to.be.true;
    expect(child.textContent).to.equal('test');

    // Top-level classes moved to the wrapper element.
    expect(win.document.documentElement).to.not.have.class('top');
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
    expect(bodyCss.borderTop.replace('rgba(0, 0, 0, 0)', 'transparent'))
        .to.equal('1px solid transparent');
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
    expect(win.document.documentElement.eventListeners.count('scroll'))
        .to.equal(0);
    expect(win.document.body.eventListeners.count('scroll'))
        .to.equal(0);
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

  it('should calculate size', () => {
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
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
  });

  it('should offset client rect for layout and position passed in', () => {
    binding.wrapper_.scrollTop = 10;
    const el = {
      getBoundingClientRect: () => {
        return {left: 11.5, top: 12.5, width: 13.5, height: 14.5};
      },
    };
    const rect = binding.getLayoutRect(el, 100, 200);
    expect(rect.left).to.equal(112);  // round(100 + 11.5)
    expect(rect.top).to.equal(213);  // round(200 + 12.5)
    expect(rect.width).to.equal(14);  // round(13.5)
    expect(rect.height).to.equal(15);  // round(14.5)
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

    expect(binding.wrapper_).to.not.have.class(
        'i-amphtml-scroll-disabled');
    wrapperCss = win.getComputedStyle(binding.wrapper_);
    expect(wrapperCss.overflowX).to.equal('hidden');
    expect(wrapperCss.overflowY).to.equal('auto');
  });
});
