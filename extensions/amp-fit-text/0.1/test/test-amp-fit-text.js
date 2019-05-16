/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {calculateFontSize_, updateOverflow_} from '../amp-fit-text';

describes.realWin(
  'amp-fit-text component',
  {
    amp: {
      extensions: ['amp-fit-text'],
    },
  },
  env => {
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function getFitText(text, opt_responsive) {
      const ft = doc.createElement('amp-fit-text');
      ft.setAttribute('width', '111');
      ft.setAttribute('height', '222');
      ft.style.fontFamily = 'Arial';
      ft.style.fontSize = '17px';
      ft.style.lineHeight = '17px';
      ft.style.overflow = 'hidden';
      ft.style.width = '111px';
      ft.style.height = '222px';
      ft.style.position = 'relative';
      if (opt_responsive) {
        ft.setAttribute('layout', 'responsive');
      }
      ft.textContent = text;
      doc.body.appendChild(ft);
      return ft
        .build()
        .then(() => ft.layoutCallback())
        .then(() => ft);
    }

    it('renders', () => {
      const text = 'Lorem ipsum';
      return getFitText(text).then(ft => {
        const content = ft.querySelector('.i-amphtml-fit-text-content');
        expect(content).to.not.equal(null);
        expect(content.textContent).to.equal(text);
      });
    });
  }
);

describes.realWin('amp-fit-text calculateFontSize', {}, env => {
  let win, doc;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    element = doc.createElement('div');
    element.style.fontFamily = 'Arial';
    element.style.lineHeight = '1em';
    element.style.position = 'absolute';
    element.style.left = 0;
    element.style.top = 0;
    element.style.visibility = 'hidden';
    doc.body.appendChild(element);
  });

  it('should always fit on one line w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 20, 200, 6, 72)).to.equal(20);
    expect(calculateFontSize_(element, 10, 200, 6, 72)).to.equal(10);
    expect(calculateFontSize_(element, 40, 200, 6, 72)).to.equal(40);
  });

  it('should always fit the width w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 10, 6, 72)).to.equal(15);
    expect(calculateFontSize_(element, 200, 20, 6, 72)).to.equal(30);
    expect(calculateFontSize_(element, 200, 40, 6, 72)).to.equal(60);
  });

  it('should hit min w/ small height and enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 6, 200, 6, 72)).to.equal(6);
    expect(calculateFontSize_(element, 3, 200, 6, 72)).to.equal(6);
  });

  it('should hit min w/ small width and enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 2, 6, 72)).to.equal(6);
    expect(calculateFontSize_(element, 200, 4, 6, 72)).to.equal(6);
  });

  it('should hit max w/ enough width', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 72, 200, 6, 72)).to.equal(72);
    expect(calculateFontSize_(element, 80, 200, 6, 72)).to.equal(72);
  });

  it('should hit max w/ enough height', () => {
    element./*OK*/ innerHTML = 'A';
    expect(calculateFontSize_(element, 200, 48, 6, 72)).to.equal(72);
    expect(calculateFontSize_(element, 200, 60, 6, 72)).to.equal(72);
  });

  it('should always fit on two lines w/ enough width', () => {
    element./*OK*/ innerHTML = 'A<br>B';
    expect(calculateFontSize_(element, 20, 200, 6, 72)).to.equal(10);
  });
});

describes.realWin('amp-fit-text updateOverflow', {}, env => {
  let win, doc;
  let content;
  let classToggles;
  let measurer;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    classToggles = {};
    content = {
      style: {},
      classList: {
        toggle: (className, on) => {
          classToggles[className] = on;
        },
      },
    };

    measurer = doc.createElement('div');
    measurer.style.fontFamily = 'Arial';
    measurer.style.lineHeight = '1.15em';
    measurer.style.position = 'absolute';
    measurer.style.width = '300px';
    doc.body.appendChild(measurer);
  });

  function getLineClamp() {
    for (const k in content.style) {
      if (k == 'lineClamp' || k.match(/.*LineClamp/)) {
        return content.style[k];
      }
    }
    return null;
  }

  it('should always fit on one line', () => {
    measurer./*OK*/ innerHTML = 'A';
    updateOverflow_(content, measurer, 24, 20);
    expect(classToggles['i-amphtml-fit-text-content-overflown']).to.be.false;
    expect(getLineClamp()).to.equal('');
    expect(content.style.maxHeight).to.equal('');
  });

  it('should always fit on two lines', () => {
    measurer./*OK*/ innerHTML = 'A<br>B';
    updateOverflow_(content, measurer, 24, 20);
    expect(classToggles['i-amphtml-fit-text-content-overflown']).to.equal(true);
    expect(getLineClamp()).to.equal(1);
    expect(content.style.maxHeight).to.equal(23 + 'px'); // 23 = 20 * 1.15
  });
});
