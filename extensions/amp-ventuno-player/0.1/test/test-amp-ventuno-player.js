/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {AmpVentunoPlayer} from '../amp-ventuno-player';

describes.realWin('amp-ventuno-player', {
  amp: {
    extensions: ['amp-ventuno-player'],
  }
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-ventuno-player');
    win.document.body.appendChild(element);
  });

  function getVentunoPlayer(type, pubid, slotid, title, url, meta) {
	  const player = win.document.createElement('amp-ventuno-player');
	  if (type) {
		player.setAttribute('data-player', type);
	  }
	  if (pubid) {
		player.setAttribute('data-pubid', pubid);
	  }
	  if (slotid) {
		player.setAttribute('data-slotid', slotid);
	  }
	  if (title) {
		player.setAttribute('data-title', title);
	  }
	  if (url) {
		player.setAttribute('data-url', url);
	  }
	  if (meta) {
		player.setAttribute('data-meta', meta);
	  }
	  win.document.body.appendChild(player);
	  return player.build()
	  	.then(() => player.layoutCallback())
	  	.then(() => player);
  }

  it('renders an editorial player', () => {
	let actSrc = 'https://venwebsecure.ventunotech.com/embed/embedPlayer.html?pFrom=amp&pType=ep&pubKey=49b792a987103&slot=380&pTitle=test&pUrl=http%3A%2F%2Fventunotech.com&pMeta=One%2CTwo%2Cthree';
	  return getVentunoPlayer('ep', '49b792a987103', '380', 'test', 'http://ventunotech.com', 'One,Two,three').then(player => {
		const playerIframe = player.querySelector('iframe');
		expect(playerIframe).to.not.be.null;
		expect(playerIframe.src).to.equal(actSrc);
	  });
  });

});
