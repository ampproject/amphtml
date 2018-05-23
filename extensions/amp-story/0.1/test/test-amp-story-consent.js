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

import {AmpStoryConsent} from '../amp-story-consent';
import {LocalizationService} from '../localization';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-consent', {amp: true}, env => {
  let win;
  let defaultConfig;
  let getComputedStyleStub;
  let storyConsent;
  let storyConsentConfigEl;
  let storyConsentEl;

  const setConfig = config => {
    storyConsentConfigEl.textContent = JSON.stringify(config);
  };

  beforeEach(() => {
    win = env.win;

    const consentConfig = {
      consents: {ABC: {}},
    };

    defaultConfig = {
      title: 'Foo title.',
      message: 'Foo message about the consent.',
      vendors: ['Item 1', 'Item 2'],
    };

    const styles = {'background-color': 'rgb(0, 0, 0)'};
    getComputedStyleStub =
        sandbox.stub(win, 'getComputedStyle').returns(styles);

    const localizationService = new LocalizationService(win);
    registerServiceBuilder(win, 'localization-v01', () => localizationService);

    // Test DOM structure:
    // <fake-amp-consent>
    //   <script type="application/json">{JSON Config}</script>
    //   <amp-story-consent>
    //     <script type="application/json">{JSON Config}</script>
    //   </amp-story-consent>
    // </fake-amp-consent>
    const consentEl = win.document.createElement('fake-amp-consent');

    const consentConfigEl = win.document.createElement('script');
    consentConfigEl.setAttribute('type', 'application/json');
    consentConfigEl.textContent = JSON.stringify(consentConfig);

    storyConsentConfigEl = win.document.createElement('script');
    storyConsentConfigEl.setAttribute('type', 'application/json');
    setConfig(defaultConfig);

    storyConsentEl = win.document.createElement('amp-story-consent');
    storyConsentEl.appendChild(storyConsentConfigEl);

    consentEl.appendChild(consentConfigEl);
    consentEl.appendChild(storyConsentEl);
    win.document.body.appendChild(consentEl);

    storyConsent = new AmpStoryConsent(storyConsentEl);
  });

  it('should parse the config', () => {
    storyConsent.buildCallback();
    expect(storyConsent.storyConsentConfig_)
        .to.deep.equal(defaultConfig);
  });

  it('should require a story-consent title', () => {
    delete defaultConfig.title;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires a title');
    });
  });

  it('should require a story-consent message', () => {
    delete defaultConfig.message;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires a message');
    });
  });

  it('should require a story-consent vendors', () => {
    delete defaultConfig.vendors;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires an array of vendors');
    });
  });

  it('should require a story-consent vendors of type array', () => {
    defaultConfig.vendors = 'foo';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('config requires an array of vendors');
    });
  });

  it('should whitelist the <amp-consent> actions', () => {
    const addToWhitelistStub =
        sandbox.stub(storyConsent.actions_, 'addToWhitelist');

    storyConsent.buildCallback();

    expect(addToWhitelistStub).to.have.been.calledTwice;
    expect(addToWhitelistStub).to.have.been.calledWith('AMP-CONSENT.accept');
    expect(addToWhitelistStub).to.have.been.calledWith('AMP-CONSENT.reject');
  });

  it('should broadcast the amp actions', () => {
    sandbox.stub(storyConsent.actions_, 'trigger');

    storyConsent.buildCallback();

    // Builds and appends a fake button directly in the storyConsent Shadow DOM.
    const buttonEl = win.document.createElement('button');
    buttonEl.setAttribute('on', 'tap:ABC.accept');
    storyConsent.storyConsentEl_.appendChild(buttonEl);

    const clickEvent = new Event('click');
    buttonEl.dispatchEvent(clickEvent);

    expect(storyConsent.actions_.trigger).to.have.been.calledOnce;
    expect(storyConsent.actions_.trigger).to.have.been.calledWith(buttonEl);
  });

  it('should set the font color to black if background is white', () => {
    const styles = {'background-color': 'rgb(255, 255, 255)'};
    getComputedStyleStub.returns(styles);
    storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_
        .querySelector('.i-amphtml-story-consent-action-accept');
    expect(buttonEl.getAttribute('style'))
        .to.equal('color: rgb(0, 0, 0) !important;');
  });

  it('should set the font color to white if background is black', () => {
    const styles = {'background-color': 'rgba(0, 0, 0, 1)'};
    getComputedStyleStub.returns(styles);
    storyConsent.buildCallback();

    const buttonEl = storyConsent.storyConsentEl_
        .querySelector('.i-amphtml-story-consent-action-accept');
    expect(buttonEl.getAttribute('style'))
        .to.equal('color: rgb(255, 255, 255) !important;');
  });
});
