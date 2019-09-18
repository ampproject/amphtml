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

import {
  Action,
  AmpStoryStoreService,
  StateProperty,
} from '../amp-story-store-service';
import {
  DIALOG_VISIBLE_CLASS,
  InfoDialog,
  MOREINFO_VISIBLE_CLASS,
} from '../amp-story-info-dialog';
import {Services} from '../../../../src/services';
import {registerServiceBuilder} from '../../../../src/service';

describes.realWin('amp-story-share-menu', {amp: true}, env => {
  let moreInfoLinkUrl;
  let embedded;
  let parentEl;
  let infoDialog;
  let storeService;
  let win;

  const MOREINFO_CLASS = '.i-amphtml-story-info-moreinfo';

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    embedded = true;
    registerServiceBuilder(win, 'story-store', () => storeService);

    // Making sure resource tasks run synchronously.
    sandbox.stub(Services, 'resourcesForDoc').returns({
      mutateElement: (element, callback) => {
        callback();
        return Promise.resolve();
      },
    });

    sandbox.stub(Services, 'localizationServiceV01').returns({
      getLocalizedString: localizedStringId => `string(${localizedStringId})`,
    });

    sandbox.stub(Services, 'viewerForDoc').returns({
      isEmbedded: () => embedded,
      sendMessageAwaitResponse: eventType => {
        if (eventType === 'moreInfoLinkUrl') {
          return Promise.resolve(moreInfoLinkUrl);
        }

        return Promise.resolve();
      },
    });

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);
    infoDialog = new InfoDialog(win, parentEl);
  });

  it('should build the info dialog', () => {
    return infoDialog.build().then(() => {
      expect(infoDialog.isBuilt()).to.be.true;
      expect(infoDialog.element_).to.exist;
    });
  });

  it('should hide more info link when there is no viewer messaging', () => {
    embedded = false;
    return infoDialog.build().then(() => {
      expect(
        infoDialog.element_.querySelector(MOREINFO_CLASS)
      ).not.to.have.class(MOREINFO_VISIBLE_CLASS);
    });
  });

  it('should hide more info link when the viewer does not supply it', () => {
    moreInfoLinkUrl = null;

    return infoDialog.build().then(() => {
      expect(
        infoDialog.element_.querySelector(MOREINFO_CLASS)
      ).not.to.have.class(MOREINFO_VISIBLE_CLASS);
    });
  });

  it('should show more info link when the viewer supplies it', () => {
    moreInfoLinkUrl = 'https://example.com/more-info.html';

    return infoDialog.build().then(() => {
      expect(infoDialog.element_.querySelector(MOREINFO_CLASS)).to.have.class(
        MOREINFO_VISIBLE_CLASS
      );
    });
  });

  it('should append the info dialog in the parentEl on build', () => {
    return infoDialog.build().then(() => {
      expect(parentEl.childElementCount).to.equal(1);
    });
  });

  it('should show the info dialog on store property update', () => {
    return infoDialog.build().then(() => {
      storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
      expect(infoDialog.element_).to.have.class(DIALOG_VISIBLE_CLASS);
    });
  });

  it('should hide the info dialog on click on the overlay', () => {
    return infoDialog.build().then(() => {
      storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
      infoDialog.element_.dispatchEvent(new Event('click'));

      expect(infoDialog.element_).not.to.have.class(DIALOG_VISIBLE_CLASS);
      expect(storeService.get(StateProperty.INFO_DIALOG_STATE)).to.be.false;
    });
  });

  it('should not hide the info dialog on click on the inner container', () => {
    return infoDialog.build().then(() => {
      storeService.dispatch(Action.TOGGLE_INFO_DIALOG, true);
      infoDialog.innerContainerEl_.dispatchEvent(new Event('click'));

      expect(infoDialog.element_).to.have.class(DIALOG_VISIBLE_CLASS);
      expect(storeService.get(StateProperty.INFO_DIALOG_STATE)).to.be.true;
    });
  });
});
