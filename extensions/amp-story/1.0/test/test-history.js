/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {LOCAL_STORAGE_KEY, getHistoryState, setHistoryState} from '../history';
import {loadPromise} from '../../../../src/event-helper';
import {removeElement} from '../../../../src/dom';

describes.realWin('amp-story history', {}, (env) => {
  let clock;
  let iframes;

  async function getWin(opt_url) {
    const iframe = document.createElement('iframe');
    iframe.src = opt_url || '/404-is-fine.html';
    document.body.appendChild(iframe);
    iframes.push(iframe);
    await loadPromise(iframe);
    return iframe.contentWindow;
  }

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    iframes = [];
  });

  afterEach(() => {
    iframes.forEach(removeElement);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  });

  it('should store history', async () => {
    const win = await getWin();
    setHistoryState(win, 'stateName1', 'foo');
    setHistoryState(win, 'stateName2', 'bar');
    expect(getHistoryState(win, 'stateName1')).to.equal('foo');
    expect(getHistoryState(win, 'stateName2')).to.equal('bar');
    expect(getHistoryState(win, 'otherName')).to.be.null;
  });

  it('should override history', async () => {
    const win = await getWin();
    setHistoryState(win, 'stateName', 'foo');
    setHistoryState(win, 'stateName', 'bar');
    expect(getHistoryState(win, 'stateName')).to.equal('bar');
  });

  it('should share history between windows', async () => {
    const win1 = await getWin();
    const win2 = await getWin();
    setHistoryState(win1, 'stateName', 'foo');
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.equal('foo');
  });

  it('should share history between windows and ignore fragments', async () => {
    const win1 = await getWin('/404-is-fine.html#XXX');
    const win2 = await getWin('/404-is-fine.html#YYY');
    setHistoryState(win1, 'stateName', 'foo');
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.equal('foo');
  });

  it('should not share state if a #page=foo param is present', async () => {
    const win1 = await getWin('/404-is-fine.html');
    const win2 = await getWin('/404-is-fine.html#page=test');
    setHistoryState(win1, 'stateName', 'foo');
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.be.null;
  });

  it('should expire localStorage based state', async () => {
    const win1 = await getWin();
    const win2 = await getWin();
    setHistoryState(win1, 'stateName', 'foo');
    clock.tick(10 * 60 * 1000);
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.equal('foo');
    clock.tick(2);
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.be.null;
  });

  it('should store state by url', async () => {
    const win1 = await getWin();
    const win2 = await getWin('/some-other-url-that-may-404.html');
    setHistoryState(win1, 'stateName', 'foo');
    expect(getHistoryState(win1, 'stateName')).to.equal('foo');
    expect(getHistoryState(win2, 'stateName')).to.be.null;
  });
});
