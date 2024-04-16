import '../amp-date-countdown';
//import {Services} from '../../../../src/service';

describes.realWin(
  'amp-date-countdown',
  {
    amp: {
      // runtimeOn: true,
      extensions: ['amp-date-countdown'],
    },
  },
  (env) => {
    let win;
    let element;
    let impl;
    const ISOEndDate = '2020-06-01T00:00:00+08:00';
    const endDate = new Date(ISOEndDate);
    const twoDaysBeforeEndDate = new Date(endDate - 86400000 * 2); //substract 2 days

    beforeEach(async () => {
      ({win /*, sandbox*/} = env);

      element = win.document.createElement('amp-date-countdown');
      element.setAttribute('end-date', ISOEndDate);
      element.setAttribute('layout', 'responsive');
      win.document.body.appendChild(element);
      impl = await element.getImpl(false);
    });

    it(
      'should display timeleft in the format ' +
        '{d} {days} {h} {hours} {m} {minutes} {s} {seconds}',
      async () => {
        await element.buildInternal();
        const timeObj = Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')
        ); //English
        const itemElement = win.document.createElement('div');
        itemElement.textContent =
          timeObj.d +
          ' ' +
          timeObj.days +
          ' ' +
          timeObj.h +
          ' ' +
          timeObj.hours +
          ' ' +
          timeObj.m +
          ' ' +
          timeObj.minutes +
          ' ' +
          timeObj.s +
          ' ' +
          timeObj.seconds;
        expect(itemElement.textContent).to.equal(
          '2 Days 0 Hours 0 Minutes 0 Seconds'
        );
      }
    );

    it(
      'should display timeleft in the format ' +
        '{d} {days} {h} {hours} {m} {minutes} {s} {seconds},' +
        'in i18n Chinese Simplified',
      async () => {
        await element.buildInternal();
        const timeObj = Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('zh-cn')
        ); // Chinese
        const itemElement = win.document.createElement('div');
        itemElement.textContent =
          timeObj.d +
          ' ' +
          timeObj.days +
          ' ' +
          timeObj.h +
          ' ' +
          timeObj.hours +
          ' ' +
          timeObj.m +
          ' ' +
          timeObj.minutes +
          ' ' +
          timeObj.s +
          ' ' +
          timeObj.seconds;
        expect(itemElement.textContent).to.equal('2 天 0 小时 0 分钟 0 秒');
      }
    );

    it('should display timeleft in the format {hh}:{mm}:{ss}', async () => {
      await element.buildInternal();
      const timeObj = Object.assign(
        impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
        impl.getLocaleWord_('en')
      ); //English
      const itemElement = win.document.createElement('div');
      itemElement.textContent =
        timeObj.dd + ':' + timeObj.hh + ':' + timeObj.mm + ':' + timeObj.ss;
      expect(itemElement.textContent).to.equal('02:00:00:00');
    });

    it(
      'should display timeleft in the format ' +
        '{h} {hours} and {m} {minutes} and {s} {seconds}',
      async () => {
        await element.buildInternal();
        const timeObj = Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate - 1000),
          impl.getLocaleWord_('en')
        ); //English
        const itemElement = win.document.createElement('div');
        itemElement.textContent =
          timeObj.h +
          ' ' +
          timeObj.hours +
          ' and ' +
          timeObj.m +
          ' ' +
          timeObj.minutes +
          ' and ' +
          timeObj.s +
          ' ' +
          timeObj.seconds;
        expect(itemElement.textContent).to.equal(
          '23 Hours and 59 Minutes and 59 Seconds'
        );
        //1 day 23 Hours and 59 minutes and 59 seconds
      }
    );

    it('should display timeleft in the format {d} {days} {h}:{mm}', async () => {
      await element.buildInternal();
      const timeObj = Object.assign(
        impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate - 1000),
        impl.getLocaleWord_('en')
      ); //English
      const itemElement = win.document.createElement('div');
      itemElement.textContent =
        timeObj.d + ' ' + timeObj.days + ' ' + timeObj.h + ':' + timeObj.mm;
      expect(itemElement.textContent).to.equal('1 Days 23:59');
    });

    it('should calculate the timeleft after added offset-seconds', async () => {
      await element.buildInternal();
      const timeObj = Object.assign(
        impl.getYDHMSFromMs_(
          endDate - twoDaysBeforeEndDate + 24 * 60 * 60 * 1000
        ), // hours * minutes * seconds * ms
        impl.getLocaleWord_('en')
      ); // English
      const itemElement = win.document.createElement('div');
      itemElement.textContent =
        timeObj.d +
        ' ' +
        timeObj.days +
        ' ' +
        timeObj.h +
        ' ' +
        timeObj.hours +
        ' ' +
        timeObj.m +
        ' ' +
        timeObj.minutes +
        ' ' +
        timeObj.s +
        ' ' +
        timeObj.seconds;
      expect(itemElement.textContent).to.equal(
        '3 Days 0 Hours 0 Minutes 0 Seconds'
      );
    });

    it('should calculate the timeleft after substracted offset-seconds', async () => {
      await element.buildInternal();
      const timeObj = Object.assign(
        impl.getYDHMSFromMs_(
          endDate - twoDaysBeforeEndDate + -1 * 24 * 60 * 60 * 1000
        ), // hours * minutes * seconds * ms
        impl.getLocaleWord_('en')
      ); // English
      const itemElement = win.document.createElement('div');
      itemElement.textContent =
        timeObj.d +
        ' ' +
        timeObj.days +
        ' ' +
        timeObj.h +
        ' ' +
        timeObj.hours +
        ' ' +
        timeObj.m +
        ' ' +
        timeObj.minutes +
        ' ' +
        timeObj.s +
        ' ' +
        timeObj.seconds;
      expect(itemElement.textContent).to.equal(
        '1 Days 0 Hours 0 Minutes 0 Seconds'
      );
    });

    it(
      'should calculate a negative time when target is in future ' +
        'when using the "data-count-up" attribute',
      async () => {
        const countUp = true;
        element.setAttribute('data-count-up', '');
        element.setAttribute('when-ended', 'continue');
        await element.buildInternal();
        const timeObj = Object.assign(
          impl.getYDHMSFromMs_(
            endDate -
              twoDaysBeforeEndDate - //two days in future
              24 * 60 * 60 * 1000 - //minus 1 day
              60 * 60 * 1000 - //minus 1 hour
              60 * 1000 - //minus 1 minute
              1000, //minus 1 second
            countUp
          ), // hours * minutes * seconds * ms
          impl.getLocaleWord_('en')
        ); // English
        const itemElement = win.document.createElement('div');
        itemElement.textContent =
          timeObj.d +
          ' ' +
          timeObj.days +
          ' ' +
          timeObj.h +
          ' ' +
          timeObj.hours +
          ' ' +
          timeObj.m +
          ' ' +
          timeObj.minutes +
          ' ' +
          timeObj.s +
          ' ' +
          timeObj.seconds;
        expect(itemElement.textContent).to.equal(
          '0 Days -22 Hours -58 Minutes -58 Seconds'
        );
      }
    );

    it(
      'should calculate a positive time when target is in past ' +
        'when using the "data-count-up" attribute',
      async () => {
        const countUp = true;
        element.setAttribute('data-count-up', '');
        element.setAttribute('when-ended', 'continue');
        await element.buildInternal();
        const timeObj = Object.assign(
          impl.getYDHMSFromMs_(
            twoDaysBeforeEndDate -
              endDate + //two days in past
              24 * 60 * 60 * 1000 + //plus 1 day
              60 * 60 * 1000 + //plus 1 hour
              60 * 1000 + //plus 1 minute
              1000, //plus 1 second
            countUp
          ), // hours * minutes * seconds * ms
          impl.getLocaleWord_('en')
        ); // English
        const itemElement = win.document.createElement('div');
        itemElement.textContent =
          timeObj.d +
          ' ' +
          timeObj.days +
          ' ' +
          timeObj.h +
          ' ' +
          timeObj.hours +
          ' ' +
          timeObj.m +
          ' ' +
          timeObj.minutes +
          ' ' +
          timeObj.s +
          ' ' +
          timeObj.seconds;
        expect(itemElement.textContent).to.equal(
          '0 Days 22 Hours 58 Minutes 59 Seconds'
        );
      }
    );
  }
);
