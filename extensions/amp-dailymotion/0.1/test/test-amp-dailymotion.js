import '../amp-dailymotion';

describes.realWin(
  'amp-dailymotion',
  {
    amp: {
      extensions: ['amp-dailymotion'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getDailymotion(
      videoId,
      optResponsive,
      optCustomSettings,
      optAutoplay
    ) {
      const dailymotion = doc.createElement('amp-dailymotion');
      dailymotion.setAttribute('data-videoid', videoId);
      dailymotion.setAttribute('width', '111');
      dailymotion.setAttribute('height', '222');
      if (optResponsive) {
        dailymotion.setAttribute('layout', 'responsive');
      }
      if (optCustomSettings) {
        dailymotion.setAttribute('data-start', 123);
        dailymotion.setAttribute('data-param-origin', 'example&.org');
      }
      if (optAutoplay) {
        dailymotion.setAttribute('autoplay', true);
      }
      doc.body.appendChild(dailymotion);
      await dailymotion.buildInternal();
      await dailymotion.layoutCallback();
      return dailymotion;
    }

    it('renders', async () => {
      const dailymotion = await getDailymotion('x2m8jpp');

      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp'
      );
    });

    it('renders responsively', async () => {
      const dailymotion = await getDailymotion(
        'x2m8jpp',
        /* optResponsive */ true
      );
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.className).to.match(/i-amphtml-fill-content/);
    });

    it('renders with custom settings', async () => {
      const dailymotion = await getDailymotion(
        'x2m8jpp',
        /* optResponsive */ false,
        /* optCustomSettings */ true
      );
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp&start=123&origin=example%26.org'
      );
    });

    it('renders already muted when autoplay is enabled', async () => {
      const dailymotion = await getDailymotion(
        'x2m8jpp',
        /* optResponsive */ false,
        /* optCustomSettings */ false,
        /* optAutoplay */ true
      );
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp&mute=1'
      );
    });

    it('renders without mute when autoplay and mute are not explicitly added', async () => {
      const dailymotion = await getDailymotion(
        'x2m8jpp',
        /* optResponsive */ false,
        /* optCustomSettings */ false
      );
      const iframe = dailymotion.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal(
        'https://www.dailymotion.com/embed/video/x2m8jpp?api=1&html=1&app=amp'
      );
    });

    it('requires data-videoid', () => {
      return allowConsoleError(() => {
        return getDailymotion('').should.eventually.be.rejectedWith(
          /The data-videoid attribute is required for/
        );
      });
    });

    it('unlayout and relayout', async () => {
      const dailymotion = await getDailymotion('x2m8jpp');
      expect(dailymotion.querySelector('iframe')).to.exist;

      const unlayoutResult = dailymotion.unlayoutCallback();
      expect(unlayoutResult).to.be.true;
      expect(dailymotion.querySelector('iframe')).to.not.exist;

      await dailymotion.layoutCallback();
      expect(dailymotion.querySelector('iframe')).to.exist;
    });
  }
);
