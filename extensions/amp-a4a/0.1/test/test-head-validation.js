import {rootNodeFor} from '#core/dom';

import {Services} from '#service';

import {processHead} from '../head-validation';

describes.realWin('head validation', {amp: true}, (env) => {
  let adElement;
  let head;

  beforeEach(() => {
    const doc = env.win.document;
    adElement = doc.createElement('amp-ad');
    doc.body.appendChild(adElement);
    head = doc.createElement('head');
    doc.body.appendChild(head);
    rootNodeFor(head).documentElement.setAttribute('amp4ads', '');
  });

  describe('processHead', () => {
    it('returns null when head is empty', () => {
      const validated = processHead(env.win, adElement, head);
      expect(validated).to.be.null;
    });

    it('returns null when no amp4ads or ⚡️4ads', () => {
      const validated = processHead(env.win, adElement, head);
      expect(validated).to.be.null;
    });

    it('should allow meta and title', () => {
      head.innerHTML = `
        <title>cool cat pics</title>
        <meta content="width=device-width,minimum-scale=1,initial-scale=1" name="viewport">
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('title')).to.exist;
      expect(validated.head.querySelector('meta')).to.exist;
    });

    it('removes unknown elements', () => {
      head.innerHTML = `
        <cats>meow</cats>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('cats')).not.to.exist;
    });

    it('saves amp extension ids, preloads them, and removes from DOM', () => {
      const preloadStub = env.sandbox.stub(
        Services.extensionsFor(env.win),
        'preloadExtension'
      );
      head.innerHTML = `
        <script async custom-element="amp-fit-text" src="https://cdn.ampproject.org/v0/amp-fit-text-0.1.js"></script>
        <script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('script')).not.to.exist;
      expect(validated.extensions).to.have.length(2);
      expect(validated.extensions[0].extensionId).to.equal('amp-fit-text');
      expect(validated.extensions[1].extensionId).to.equal('amp-video');
      expect(preloadStub).calledTwice;
      expect(preloadStub.firstCall).calledWith('amp-fit-text');
      expect(preloadStub.secondCall).calledWith('amp-video');
    });

    it('registers extensions with RTV', () => {
      const preloadStub = env.sandbox.stub(
        Services.extensionsFor(env.win),
        'preloadExtension'
      );
      head.innerHTML = `
        <script async custom-element="amp-analytics" src="https://cdn.ampproject.org/rtv/012104070150000/v0/amp-analytics-0.1.js"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('script')).not.to.exist;
      expect(validated.extensions).to.have.length(1);
      expect(preloadStub).calledOnce;
      expect(validated.extensions[0].extensionId).to.equal('amp-analytics');
      expect(preloadStub.firstCall).calledWith('amp-analytics');
    });

    it('ignores v0 scripts (versioned & unversioned)', () => {
      const preloadStub = env.sandbox.stub(
        Services.extensionsFor(env.win),
        'preloadExtension'
      );
      head.innerHTML = `
        <script async src="https://cdn.ampproject.org/v0.js"></script>
        <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
        <script async src="https://cdn.ampproject.org/rtv/012104070150000/v0.js"></script>
        <script async src="https://cdn.ampproject.org/rtv/012104070150000/amp4ads-v0.js"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('script')).not.to.exist;
      expect(validated.extensions).to.have.length(0);
      expect(preloadStub).not.to.be.called;
    });

    it('removes non-allowlisted amp elements scripts', () => {
      const preloadStub = env.sandbox.stub(
        Services.extensionsFor(env.win),
        'preloadExtension'
      );
      head.innerHTML = `
        <script async custom-element="amp-iframe" src="https://cdn.ampproject.org/v0/amp-iframe-0.1.js"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('script')).not.to.exist;
      expect(preloadStub).not.to.be.called;
    });

    it('allows application/json scripts', () => {
      head.innerHTML = `
        <script type="application/json"></script>
        <script src="evil.com"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      const script = validated.head.querySelectorAll('script');
      expect(script).to.have.length(1);
      expect(script[0].type).to.equal('application/json');
    });

    it('removes inabox runtime script', () => {
      head.innerHTML = `
        <script async src="https://cdn.ampproject.org/amp4ads-v0.js"></script>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('script')).not.to.exist;
    });

    it('keeps <link> preloading images, and preloads', () => {
      const preloadStub = env.sandbox.stub(
        Services.preconnectFor(env.win),
        'preload'
      );
      head.innerHTML = `
        <link rel="preload" as="image" href="https://cats.com/meow.jpg" >
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('link')).to.exist;
      expect(preloadStub).calledWith(env.ampdoc, 'https://cats.com/meow.jpg');
    });

    it('ignores other <link> preloads', () => {
      const preloadStub = env.sandbox.stub(
        Services.preconnectFor(env.win),
        'preload'
      );
      head.innerHTML = `
        <link rel="preload" href="myFont.woff2" as="font" type="font/woff2">
        <link rel="preload" href="/styles/other.css" as="style">
        <link rel="preload" href="https://example.com/some/embed" as="embed">
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('link')).not.to.exist;
      expect(preloadStub).not.to.be.called;
    });

    it('keeps <link> preloading allowlisted fonts, and preloads', () => {
      const preloadStub = env.sandbox.stub(
        Services.preconnectFor(env.win),
        'preload'
      );
      head.innerHTML = `
        <link href="https://fonts.googleapis.com/css2?family=Montserrat+Subrayada&display=swap" rel="stylesheet">
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('link')).to.exist;
      expect(preloadStub).calledWith(
        env.ampdoc,
        'https://fonts.googleapis.com/css2?family=Montserrat+Subrayada&display=swap'
      );
    });

    it('does not allow arbitrary font providers', () => {
      const preloadStub = env.sandbox.stub(
        Services.preconnectFor(env.win),
        'preload'
      );
      head.innerHTML = `
        <link href="https://evil.fonts.com" rel="stylesheet">
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('link')).not.to.exist;
      expect(preloadStub).not.to.be.called;
    });

    it('keeps amp styles', () => {
      head.innerHTML = `
        <style amp-custom></style>
        <style amp-keyframes></style>
        <style amp4ads-boilerplate></style>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelectorAll('style')).to.have.length(3);
    });

    it('removes other styles', () => {
      head.innerHTML = `
        <style></style>
        <style random></style>
      `;
      const validated = processHead(env.win, adElement, head);
      expect(validated.head.querySelector('style')).not.to.exist;
    });
  });
});
