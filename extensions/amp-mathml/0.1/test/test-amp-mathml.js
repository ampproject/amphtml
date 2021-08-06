/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-mathml';

describes.realWin(
  'amp-mathml',
  {
    amp: {
      extensions: ['amp-mathml'],
      canonicalUrl: 'https://foo.bar/baz',
    },
  },
  (env) => {
    let win, doc;
    const title = 'My MathML formula';

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    async function getAmpMathml() {
      const ampMathml = doc.createElement('amp-mathml');
      ampMathml.setAttribute('layout', 'container');
      ampMathml.setAttribute(
        'data-formula',
        '[x = {-b pm sqrt{b^2-4ac} over 2a}.]'
      );
      ampMathml.setAttribute('title', title);
      doc.body.appendChild(ampMathml);
      await ampMathml.buildInternal();
      await ampMathml.layoutCallback();
      return ampMathml;
    }

    it('renders iframe with title', async () => {
      const ampMathml = await getAmpMathml();
      const iframe = ampMathml.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.title).to.equal(title);
    });

    it('removes iframe on unlayout', async () => {
      const ampMathml = await getAmpMathml();
      const iframe = ampMathml.firstChild;
      expect(iframe).to.not.be.null;
      ampMathml.unlayoutCallback();
      expect(ampMathml.querySelector('iframe')).to.be.null;
    });
  }
);
