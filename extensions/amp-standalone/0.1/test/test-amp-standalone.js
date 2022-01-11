import {StandaloneService} from '../amp-standalone';

describes.sandboxed('amp-standalone', {}, (env) => {
  let fakeAmpdoc;

  beforeEach(() => {
    fakeAmpdoc = {
      win: {
        location: {
          href: '',
        },
        origin: '',
      },
    };
  });

  it('should not react for <button> tags', () => {
    const service = new StandaloneService(fakeAmpdoc);
    class PlatformFake {}
    PlatformFake.prototype.isSafari = env.sandbox.stub().returns(true);
    PlatformFake.prototype.isChrome = env.sandbox.stub().returns(false);
    env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());
    const handlerStub = env.sandbox.stub(service, 'handleSafariStandalone_');

    const fakeEvent = {
      target: {
        nodeType: 1,
        tagName: 'BUTTON',
      },
    };
    service.handleClick_(fakeEvent);

    expect(handlerStub).to.not.have.been.called;
  });

  it('should react for <a> tags', () => {
    const service = new StandaloneService(fakeAmpdoc);
    class PlatformFake {}
    PlatformFake.prototype.isSafari = env.sandbox.stub().returns(true);
    PlatformFake.prototype.isChrome = env.sandbox.stub().returns(false);
    env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());
    const handlerStub = env.sandbox.stub(service, 'handleSafariStandalone_');

    const fakeEvent = {
      target: {
        nodeType: 1,
        tagName: 'A',
      },
    };
    service.handleClick_(fakeEvent);

    expect(handlerStub).to.have.been.called;
  });

  describe('safari', () => {
    it('should open non-_blank internal links in the same tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(true);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(false);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: null,
          origin: 'http://www.example.com',
          href: 'http://www.example.com/cool',
        },
      };

      // false means the link will open in the same tab
      expect(service.handleClick_(fakeEvent)).to.be.false;
      expect(fakeAmpdoc.win.location.href).to.equal(
        'http://www.example.com/cool'
      );
    });

    it('should open _blank internal links in a new tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(true);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(false);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: '_blank',
          origin: 'http://www.example.com',
        },
      };

      // true means the link will open in a new tab
      expect(service.handleClick_(fakeEvent)).to.be.true;
    });

    it('should open external links in a new tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(true);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(false);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: null,
          origin: 'http://www.google.com',
        },
      };

      // true means the link will open in a new tab
      expect(service.handleClick_(fakeEvent)).to.be.true;
    });
  });

  describe('chrome', () => {
    it('should open non-_blank internal links in the same tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(false);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(true);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: null,
          origin: 'http://www.example.com',
        },
      };

      expect(service.handleClick_(fakeEvent)).to.be.undefined;
      expect(fakeEvent.target.target).to.be.null;
    });

    it('should open _blank internal links in a new tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(false);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(true);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: '_blank',
          origin: 'http://www.example.com',
        },
      };

      expect(service.handleClick_(fakeEvent)).to.be.undefined;
      expect(fakeEvent.target.target).to.equal('_blank');
    });

    it('should open external links in a new tab', () => {
      fakeAmpdoc.win.origin = 'http://www.example.com';
      const service = new StandaloneService(fakeAmpdoc);
      class PlatformFake {}
      PlatformFake.prototype.isSafari = env.sandbox.stub().returns(false);
      PlatformFake.prototype.isChrome = env.sandbox.stub().returns(true);
      env.sandbox.stub(service, 'getPlatform_').returns(new PlatformFake());

      const fakeEvent = {
        target: {
          nodeType: 1,
          tagName: 'A',
          target: null,
          origin: 'http://www.google.com',
        },
      };

      expect(service.handleClick_(fakeEvent)).to.be.undefined;
      expect(fakeEvent.target.target).to.equal('_blank');
    });
  });
});
