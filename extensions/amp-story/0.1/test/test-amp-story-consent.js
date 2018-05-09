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
import {Services} from '../../../../src/services';

describes.fakeWin('amp-story-consent', {amp: true}, env => {
  let win;
  let consentConfigEl;
  let defaultConfig;
  let sandbox;
  let storyConsent;
  let storyConsentEl;

  const setConfig = config => {
    consentConfigEl.textContent = JSON.stringify(config);
  };

  beforeEach(() => {
    win = env.win;
    sandbox = sinon.sandbox.create();

    defaultConfig = {
      consents: {ABC: {}},
      'story-consent': {
        title: 'Foo title.',
        message: 'Foo message about the consent.',
        'vendors': ['Item 1', 'Item 2'],
      },
    };

    sandbox.stub(Services, 'localizationService').returns({
      getLocalizedString: localizedStringId => `string(${localizedStringId})`,
    });

    // Test DOM structure:
    // <fake-amp-consent>
    //   <script type="application/json">{JSON Config}</script>
    //   <amp-story-consent></amp-story-consent>
    // </fake-amp-consent>
    const consentEl = win.document.createElement('fake-amp-consent');

    consentConfigEl = win.document.createElement('script');
    consentConfigEl.setAttribute('type', 'application/json');
    setConfig(defaultConfig);

    storyConsentEl = win.document.createElement('amp-story-consent');

    consentEl.appendChild(consentConfigEl);
    consentEl.appendChild(storyConsentEl);
    win.document.body.appendChild(consentEl);

    storyConsent = new AmpStoryConsent(storyConsentEl);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should parse the config', () => {
    storyConsent.buildCallback();
    expect(storyConsent.consentConfig_).to.deep.equal(defaultConfig);
  });

  it('should require a story-consent title', () => {
    delete defaultConfig['story-consent'].title;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('story-consent requires a title');
    });
  });

  it('should require a story-consent message', () => {
    delete defaultConfig['story-consent'].message;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('story-consent requires a message');
    });
  });

  it('should require a story-consent vendors', () => {
    delete defaultConfig['story-consent'].vendors;
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('story-consent requires an array of vendors');
    });
  });

  it('should require a story-consent vendors of type array', () => {
    defaultConfig['story-consent'].vendors = 'foo';
    setConfig(defaultConfig);

    allowConsoleError(() => {
      expect(() => {
        storyConsent.buildCallback();
      }).to.throw('story-consent requires an array of vendors');
    });
  });

  it('should whitelist the amp actions using the expected consent ID', () => {
    const addToWhitelistStub =
        sandbox.stub(storyConsent.actions_, 'addToWhitelist');

    storyConsent.buildCallback();

    expect(addToWhitelistStub).to.have.been.calledTwice;
    expect(addToWhitelistStub).to.have.been.calledWith('ABC.accept');
    expect(addToWhitelistStub).to.have.been.calledWith('ABC.reject');
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
});
