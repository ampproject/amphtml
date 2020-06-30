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

import '../amp-story-360';
import {createElementWithAttributes} from '../../../../src/dom';

const base64image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABALDA4MChAODQ4SERATGCgaGBYWGDEjJR0oOjM9PDkzODdASFxOQERXRTc4UG1RV19iZ2hnPk1xeXBkeFxlZ2P/2wBDARESEhgVGC8aGi9jQjhCY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2P/wAARCAAgAEADASIAAhEBAxEB/8QAGgAAAwADAQAAAAAAAAAAAAAAAwQFAAIGAf/EADIQAAIBAwICCAUDBQAAAAAAAAECAwAEERIhEzEFIkFRYXGBoRQjkbHRFUKTUnKSweH/xAAYAQEAAwEAAAAAAAAAAAAAAAABAAIDBP/EABkRAQEBAQEBAAAAAAAAAAAAAAEAESESMf/aAAwDAQACEQMRAD8Ao3NytsjcOXBCk6Mt981zsnTN8zluINP9OMj33p6Po23llbiuuk5Pyjgj0xQ7roiOMHgzsFYgBZdI28wd/pXQAWatNPSd6c/PI8gBQTc3Z53U/wDIaoR2FrIdHxAWTYYLDn+Odet0PKCeH8xewirgPyqrKW56Qn1cGS6k0jLaGY4rEvLwEYu5/wCQ1cs7e4srd+AkSO4wXEjBvDw2pMdEBCWkuYgg5sGH+8UcntrF0nfuoT4nSP7B+KsWj2ltbt8TcLLMx1ciefcQNqmQQW6B9c0LjsInVcfejQraIhWWS2aQnbVMMe1VQkWgCCVsBmXLnSg15LHwFNfAyRSsp1sANJ1EqAT9/Tuq1+m2bIWjiCyBgVYQr1T4bUSa2lMKrph6p7MoD7bCuS2kLS1FnEXGJndssV7uwYOO2tJbdX3VZIyFyeQX03P/AH3puMTcN1nijMuSA8ROPp+aGsmtOFJJgKd+rgmk5TNkhZyFSGmbhj92NvPn586WltpMyCCJpNHcw3Hrv7VTcTiThRRkxkdVm5DPeM1tYxXVtJrIBwTvknV5jFOrHkKXLbyiMcEEZGWUruvmDg48aXxIIg6zKNQOVXrH1xmuhuJL91bNtatE3NZGY7/40G3tQq6Zki0ncKIlZQT3dUH65qTl/9k=';

describes.realWin(
  'amp-story-360',
  {
    amp: {
      runtimeOn: true,
      extensions: ['amp-story-360', 'amp-img'],
    },
  },
  (env) => {
    let win;
    let ampImg;
    let element;
    let threesixty;

    beforeEach(async () => {
      win = env.win;

      element = win.document.createElement('amp-story-360');
      element.setAttribute('layout', 'fill');
      element.setAttribute('duration', '1s');
      element.setAttribute('heading-end', '95');
      element.style.height = '100px';

      ampImg = win.document.createElement('amp-img');
      ampImg.setAttribute('src', '/examples/img/panorama1.jpg');
      ampImg.setAttribute('width', '7168');
      ampImg.setAttribute('height', '3584');
      element.appendChild(ampImg);

      win.document.body.appendChild(element);
      threesixty = await element.getImpl();
    });

    it('should build and parse duration attribute', async () => {
      await threesixty.layoutCallback();
      expect(threesixty.duration_).to.equal(1000);
    });
  }
);  