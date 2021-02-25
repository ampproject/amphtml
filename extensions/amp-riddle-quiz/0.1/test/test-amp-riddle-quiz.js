/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import '../amp-riddle-quiz';
import {element} from 'prop-types';

describes.realWin(
  'amp-riddle-quiz',
  {
    amp: {
      extensions: ['amp-riddle-quiz'],
    },
  },
  (env) => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getRiddleQuiz() {
      const element = doc.createElement('amp-riddle-quiz');
      element.setAttribute('data-riddle-id', '25799');
      element.setAttribute('width', '100');
      element.setAttribute('height', '200');

      doc.body.appendChild(element);
      return element
        .buildInternal()
        .then(() => element.layoutCallback())
        .then(() => element);
    }

    it('renders', async () => {
      const element = await getRiddleQuiz();
      const iframe = element.querySelector('iframe');
      expect(iframe).to.not.be.null;
      expect(iframe.src).to.equal('https://www.riddle.com/a/iframe/25799');
    });

    it('removes iframe after unlayoutCallback', async () => {
      const element = await getRiddleQuiz();
      const iframe = element.querySelector('iframe');
      expect(iframe).to.not.be.null;

      const impl = await element.getImpl(false);
      impl.unlayoutCallback();
      expect(element.querySelector('iframe')).to.be.null;
    });
  }
);
