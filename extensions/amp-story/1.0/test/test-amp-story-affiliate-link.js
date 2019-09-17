/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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
  AFFILIATE_LINK_BUILT,
  AmpStoryAffiliateLink,
} from '../amp-story-affiliate-link';
import {Services} from '../../../../src/services';

describes.realWin('amp-story-affiliate-link', {amp: true}, env => {
  let win;
  let link;
  let linkEl;
  const text = 'amp.devamp.devamp.devamp.devamp';

  beforeEach(() => {
    win = env.win;
    const {sandbox} = env;
    const resources = Services.resourcesForDoc(env.ampdoc);
    sandbox.stub(resources, 'mutateElement').callsFake((element, mutator) => {
      mutator();
    });

    linkEl = win.document.createElement('a');
    linkEl.setAttribute('affiliate-link-icon', 'shopping-cart');
    linkEl.setAttribute('href', 'https://amp.dev');
    linkEl.setAttribute('target', '_blank');
    linkEl.textContent = text;

    const storyGridLayerEl = win.document.createElement('amp-story-grid-layer');
    storyGridLayerEl.appendChild(linkEl);

    const storyPageEl = win.document.createElement('amp-story-page');
    storyPageEl.appendChild(storyGridLayerEl);

    const storyEl = win.document.createElement('amp-story');
    storyEl.appendChild(storyPageEl);

    win.document.body.appendChild(storyEl);

    link = new AmpStoryAffiliateLink(win, linkEl);
    link.build();
  });

  it('should build affiliate link', () => {
    expect(linkEl[AFFILIATE_LINK_BUILT]).to.be.true;
  });

  it('should initialize the <a> tag', () => {
    expect(linkEl.hasAttribute('expanded')).to.be.false;
    expect(linkEl.hasAttribute('pristine')).to.be.true;
  });

  it('should add textContext to the text element', () => {
    const textEl = linkEl.querySelector('.i-amphtml-story-affiliate-link-text');
    expect(textEl.hasAttribute('hidden')).to.be.true;
    expect(textEl.textContent).to.equal(text);
  });

  it('should append the launch element', () => {
    const launchEl = linkEl.querySelector(
      '.i-amphtml-story-affiliate-link-launch'
    );
    expect(launchEl.hasAttribute('hidden')).to.be.true;
  });
});
