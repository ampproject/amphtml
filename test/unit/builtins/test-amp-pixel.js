import {Services} from '#service';
import {installUrlReplacementsForEmbed} from '#service/url-replacements-impl';
import {VariableSource} from '#service/variable-source';

import * as privacySandboxUtils from 'src/utils/privacy-sandbox-utils';

describes.realWin('amp-pixel', {amp: true}, (env) => {
  const urlErrorRegex = /src attribute must start with/;

  let win;
  let whenFirstVisiblePromise, whenFirstVisibleResolver;
  let pixel;

  beforeEach(async () => {
    win = env.win;
    whenFirstVisiblePromise = new Promise((resolve) => {
      whenFirstVisibleResolver = resolve;
    });
    env.sandbox
      .stub(env.ampdoc, 'whenFirstVisible')
      .callsFake(() => whenFirstVisiblePromise);
    await createPixel(
      'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?'
    );
    env.sandbox.spy(Services, 'urlReplacementsForDoc');
  });

  function createPixel(src, referrerPolicy) {
    pixel = win.document.createElement('amp-pixel');
    pixel.setAttribute('src', src);
    if (referrerPolicy) {
      pixel.setAttribute('referrerpolicy', referrerPolicy);
    }
    win.document.body.appendChild(pixel);
    return pixel.buildInternal();
  }

  /**
   * @param {string=} opt_src
   * @param {string=} opt_attributionsrc
   * @return {!Promise<?Image>}
   */
  function trigger(opt_src, opt_attributionsrc) {
    if (opt_src != null) {
      pixel.setAttribute('src', opt_src);
    }
    if (opt_attributionsrc != null) {
      pixel.setAttribute('attributionsrc', opt_attributionsrc);
    }
    whenFirstVisibleResolver();
    return whenFirstVisiblePromise
      .then(() => {
        return pixel.getImpl(false);
      })
      .then((impl) => {
        expect(impl.triggerPromise_).to.be.not.null;
        return impl.triggerPromise_;
      });
  }

  it('should be non-displayed', () => {
    expect(pixel.style.width).to.equal('0px');
    expect(pixel.style.height).to.equal('0px');
    expect(pixel.getAttribute('aria-hidden')).to.equal('true');
    expect(pixel).to.have.display('none');
  });

  it('should NOT trigger when src is empty', async () => {
    const implementation = await pixel.getImpl(false);
    expect(pixel.children).to.have.length(0);
    expect(implementation.triggerPromise_).to.be.null;
    return trigger('').then((img) => {
      expect(implementation.triggerPromise_).to.be.ok;
      expect(img).to.be.undefined;
    });
  });

  it('should trigger when doc becomes visible', async () => {
    const implementation = await pixel.getImpl(false);
    expect(pixel.children).to.have.length(0);
    expect(implementation.triggerPromise_).to.be.null;
    return trigger().then((img) => {
      expect(implementation.triggerPromise_).to.be.ok;
      expect(img.src).to.equal(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?'
      );
    });
  });

  it('should allow protocol-relative URLs', () => {
    const url = '//pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2';
    return trigger(url).then((img) => {
      // Protocol is resolved to `http:` relative to test server.
      expect(img.src).to.equal(
        'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2'
      );
    });
  });

  it('should disallow http URLs', () => {
    expectAsyncConsoleError(urlErrorRegex);
    const url = 'http://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually.be.rejectedWith(urlErrorRegex);
  });

  it('should disallow relative URLs', () => {
    expectAsyncConsoleError(urlErrorRegex);
    const url = '/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually.be.rejectedWith(urlErrorRegex);
  });

  it('should disallow fake-protocol URLs', () => {
    expectAsyncConsoleError(urlErrorRegex);
    const url = 'https/activity;dc_iu=1/abc;ord=2';
    return expect(trigger(url)).to.eventually.be.rejectedWith(urlErrorRegex);
  });

  it('should replace URL parameters', () => {
    env.sandbox.stub(Math, 'random').callsFake(() => 111);
    const url = 'https://pubads.g.doubleclick.net/activity;r=RANDOM';
    return trigger(url).then((img) => {
      expect(img.src).to.equal(
        'https://pubads.g.doubleclick.net/activity;r=111'
      );
    });
  });

  it('should throw for referrerpolicy with value other than no-referrer', () => {
    return allowConsoleError(() => {
      return createPixel(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?',
        'origin'
      ).then(
        () => {
          throw new Error('must have failed.');
        },
        (reason) => {
          expect(reason.message).to.match(/referrerpolicy/);
        }
      );
    });
  });

  it('should not allow attribution reporting', () => {
    const attributionSrc =
      '//pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=2';
    pixel.setAttribute(
      'src',
      'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=ATTRIBUTION_REPORTING_STATUS'
    );
    return trigger(null, attributionSrc).then((img) => {
      // Protocol is resolved to `http:` relative to test server.
      expect(img.src).to.equal(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=5'
      );
      expect(img.attributionSrc).to.be.undefined;
    });
  });

  it('should allow attribution reporting with empty attributionsrc', () => {
    env.sandbox
      .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
      .returns(true);
    const attributionSrc = '';
    pixel.setAttribute(
      'src',
      'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=ATTRIBUTION_REPORTING_STATUS'
    );
    return trigger(null, attributionSrc).then((img) => {
      // Protocol is resolved to `http:` relative to test server.
      expect(img.src).to.equal(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=6'
      );
      expect(img.attributionSrc).to.equal('');
      expect(Services.urlReplacementsForDoc).to.be.calledWith(pixel);
    });
  });

  it('should allow attribution reporting with attributionsrc defined', () => {
    env.sandbox
      .stub(privacySandboxUtils, 'isAttributionReportingAllowed')
      .returns(true);
    pixel.setAttribute(
      'src',
      'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=ATTRIBUTION_REPORTING_STATUS'
    );
    const attributionSrc =
      'https://adtech.example?ars=ATTRIBUTION_REPORTING_STATUS';
    return trigger(null, attributionSrc).then((img) => {
      // Protocol is resolved to `http:` relative to test server.
      expect(img.src).to.equal(
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?ars=6'
      );
      expect(img.attributionSrc).to.equal('https://adtech.example?ars=6');
      expect(Services.urlReplacementsForDoc).to.be.calledWith(pixel);
    });
  });
});

describes.realWin(
  'amp-pixel in embed',
  {
    amp: {
      ampdoc: 'fie',
    },
  },
  (env) => {
    class TestVariableSource extends VariableSource {
      constructor() {
        super(env.ampdoc);
      }
      initialize() {
        this.set('TEST', () => 'value1');
      }
    }

    let win;
    let whenFirstVisiblePromise, whenFirstVisibleResolver;
    let pixel;
    let implementation;

    beforeEach(async () => {
      win = env.win;

      whenFirstVisiblePromise = new Promise((resolve) => {
        whenFirstVisibleResolver = resolve;
      });
      env.sandbox
        .stub(env.ampdoc, 'whenFirstVisible')
        .callsFake(() => whenFirstVisiblePromise);

      installUrlReplacementsForEmbed(env.ampdoc, new TestVariableSource());

      pixel = win.document.createElement('amp-pixel');
      pixel.setAttribute(
        'src',
        'https://pubads.g.doubleclick.net/activity;dc_iu=1/abc;ord=1?'
      );
      win.document.body.appendChild(pixel);
      await pixel.buildInternal();
      implementation = await pixel.getImpl();
    });

    /**
     * @param {string=} opt_src
     * @return {!Promise<?Image>}
     */
    function trigger(opt_src) {
      if (opt_src) {
        pixel.setAttribute('src', opt_src);
      }
      whenFirstVisibleResolver();
      return whenFirstVisiblePromise.then(() => {
        expect(implementation.triggerPromise_).to.be.not.null;
        return implementation.triggerPromise_;
      });
    }

    it("should use embed's URL replacer", () => {
      const url = 'https://pubads.g.doubleclick.net/activity;t=TEST';
      return trigger(url).then((img) => {
        expect(img.src).to.equal(
          'https://pubads.g.doubleclick.net/activity;t=value1'
        );
      });
    });
  }
);
