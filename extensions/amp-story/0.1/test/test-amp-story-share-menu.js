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

import {Action, AmpStoryStoreService} from '../amp-story-store-service';
import {ScrollableShareWidget} from '../amp-story-share';
import {Services} from '../../../../src/services';
import {ShareMenu, VISIBLE_CLASS} from '../amp-story-share-menu';
import {registerServiceBuilder} from '../../../../src/service';


describes.realWin('amp-story-share-menu', {amp: true}, env => {
  let parentEl;
  let shareMenu;
  let shareWidgetMock;
  let storeService;
  let win;

  beforeEach(() => {
    win = env.win;
    storeService = new AmpStoryStoreService(win);
    registerServiceBuilder(win, 'story-store', () => storeService);

    const shareWidget = {build: () => win.document.createElement('div')};
    shareWidgetMock = sandbox.mock(shareWidget);
    sandbox.stub(ScrollableShareWidget, 'create').returns(shareWidget);

    // Making sure the vsync tasks run synchronously.
    sandbox.stub(Services, 'vsyncFor').returns({
      mutate: fn => fn(),
      run: (vsyncTaskSpec, vsyncState) => {
        vsyncTaskSpec.measure(vsyncState);
        vsyncTaskSpec.mutate(vsyncState);
      },
    });

    parentEl = win.document.createElement('div');
    win.document.body.appendChild(parentEl);
    shareMenu = new ShareMenu(win, parentEl);
  });

  it('should build the sharing menu', () => {
    shareMenu.build();

    expect(shareMenu.isBuilt()).to.be.true;
    expect(shareMenu.element_).to.exist;
  });

  it('should append the sharing menu in the parentEl on build', () => {
    shareMenu.build();

    expect(parentEl.childElementCount).to.equal(1);
  });

  it('should build the share widget when building the component', () => {
    shareWidgetMock
        .expects('build')
        .once()
        .returns(win.document.createElement('div'));

    shareMenu.build();

    expect(shareMenu.isBuilt()).to.be.true;

    shareWidgetMock.verify();
  });

  it('should append the share widget when building the component', () => {
    const shareWidgetEl = win.document.createElement('div');
    shareWidgetEl.classList.add('foo');

    shareWidgetMock.expects('build').returns(shareWidgetEl);

    shareMenu.build();

    expect(shareMenu.element_.querySelector('.foo')).to.exist;
    shareWidgetMock.verify();
  });

  it('should show the share menu on store property update', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);

    expect(shareMenu.element_).to.have.class(VISIBLE_CLASS);
  });

  it('should hide the share menu on click on the overlay', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    shareMenu.element_.dispatchEvent(new Event('click'));

    expect(shareMenu.element_).not.to.have.class(VISIBLE_CLASS);
  });

  it('should not hide the share menu on click on the widget container', () => {
    shareMenu.build();

    storeService.dispatch(Action.TOGGLE_SHARE_MENU, true);
    shareMenu.innerContainerEl_.dispatchEvent(new Event('click'));

    expect(shareMenu.element_).to.have.class(VISIBLE_CLASS);
  });
});
