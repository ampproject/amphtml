/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

require('../amp-date-countdown');

describes.realWin('amp-date-countdown', {
  amp: {
    extensions: ['amp-date-countdown'],
  },
}, env => {

  let win;
  let element;
  let impl;
  const ISOEndDate = '2020-06-01T00:00:00+08:00';
  const endDate = new Date(ISOEndDate);
  const twoDaysBeforeEndDate = new Date(endDate - 86400000 * 2); //substract 2 days

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-date-countdown');
    win.document.body.appendChild(element);
    //element.build();
    impl = element.implementation_;
    impl.mutateElement = function(callback) {
      callback();
    };
  });

  it('should display timeleft in the format ' +
    '{d} {days} {h} {hours} {m} {minutes} {s} {seconds}', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')); //English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('2 Days 0 Hours 0 Minutes 0 Seconds');
  });

  it('should display timeleft in the format ' +
    '{d} {days} {h} {hours} {m} {minutes} {s} {seconds},' +
    'in i18n Chinese Simplified', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('zh-CN')); // Chinese
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent).to.equal('2 天 0 小时 0 分钟 0 秒');
  });

  it('should display timeleft in the format {hh}:{mm}:{ss}', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')); //English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.dd + ':' +
      timeObj.hh + ':' +
      timeObj.mm + ':' +
      timeObj.ss;
    expect(itemElement.textContent)
        .to.equal('02:00:00:00');
  });

  it('should display timeleft in the format ' +
    '{h} {hours} and {m} {minutes} and {s} {seconds}', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_((endDate - twoDaysBeforeEndDate) - 1000),
          impl.getLocaleWord_('en')); //English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.h + ' ' + timeObj.hours + ' and ' +
      timeObj.m + ' ' + timeObj.minutes + ' and ' +
      timeObj.s + ' ' + timeObj.seconds;
    expect(itemElement.textContent)
        .to.equal('23 Hours and 59 Minutes and 59 Seconds');
    //1 day 23 Hours and 59 minutes and 59 seconds
  });

  it('should display timeleft in the format ' +
    '{d} {days} {h}:{mm}', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_((endDate - twoDaysBeforeEndDate) - 1000),
          impl.getLocaleWord_('en')); //English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ':' + timeObj.mm;
    expect(itemElement.textContent)
        .to.equal('1 Days 23:59');
  });

  it('should calculate timeleft and have biggest-unit up to hours', () => {
    element.setAttribute('biggest-unit', 'hours');
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')); // English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('0 Days 48 Hours 0 Minutes 0 Seconds');
  });

  it('should calculate timeleft and have biggest-unit up to minutes', () => {
    element.setAttribute('biggest-unit', 'minutes');
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')); // English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('0 Days 0 Hours 2880 Minutes 0 Seconds');
  });

  it('should calculate timeleft and have biggest-unit up to seconds', () => {
    element.setAttribute('biggest-unit', 'seconds');
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate),
          impl.getLocaleWord_('en')); // English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('0 Days 0 Hours 0 Minutes 172800 Seconds');
  });

  it('should calculate the timeleft after added offset-seconds', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate
            + (24 * 60 * 60 * 1000)), // hours * minutes * seconds * ms
          impl.getLocaleWord_('en')); // English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('3 Days 0 Hours 0 Minutes 0 Seconds');
  });

  it('should calculate the timeleft after substracted offset-seconds', () => {
    element.build();
    const timeObj =
      Object.assign(
          impl.getYDHMSFromMs_(endDate - twoDaysBeforeEndDate
            + (- 24 * 60 * 60 * 1000)), // hours * minutes * seconds * ms
          impl.getLocaleWord_('en')); // English
    const itemElement = win.document.createElement('div');
    itemElement.textContent = timeObj.d + ' ' + timeObj.days + ' ' +
      timeObj.h + ' ' + timeObj.hours + ' ' +
      timeObj.m + ' ' + timeObj.minutes + ' ' +
      timeObj.s + ' ' + timeObj.seconds ;
    expect(itemElement.textContent)
        .to.equal('1 Days 0 Hours 0 Minutes 0 Seconds');
  });

});
