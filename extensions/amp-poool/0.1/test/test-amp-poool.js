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

import '../amp-poool';

describes.realWin('amp-poool', {
  amp: {
    extensions: ['amp-poool'],
  }
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
  });

  function getPoool(bundle_id, type, force_widget, debug, main_color, background_color) {
    const article = doc.createElement('div');
    article.id = "need-poool-custom";
    article.setAttribute("data-poool", 80);
    article.setAttribute("data-poool-mode", "excerpt");
    article.innerHTML = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>";
    doc.body.appendChild(article);

    const ampPoool = doc.createElement('amp-poool');
    ampPoool.setAttribute('height', 400);
    ampPoool.setAttribute('width', 400);
    ampPoool.setAttribute('data-init', bundle_id);
    ampPoool.setAttribute('data-page-view', type);
    ampPoool.setAttribute('data-debug', debug);
    ampPoool.setAttribute('data-force-widget', force_widget);
    ampPoool.setAttribute('data-main-color', main_color);
    ampPoool.setAttribute('data-background-color', background_color);

    doc.body.appendChild(ampPoool);
    return ampPoool.build().then(() => {
      return ampPoool.layoutCallback();
    }).then(() => ampPoool);
  }

  it('should return undefined when needed attributes aren\'t given', () => {
    return getPoool()
        .then(ampPoool => {
          expect(ampPoool.getAttribute('data-init')).to.equal("undefined");
          expect(ampPoool.getAttribute('data-page-view')).to.equal("undefined");
        });
  });

  it('tests poool-widget division existance', () => {
    return getPoool('ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH', 'premium')
        .then(ampPoool => {
          const _poool = ampPoool.firstChild;
          expect(_poool).to.not.be.null;
          expect(_poool.id).to.equal('poool-widget');
          expect(ampPoool.getAttribute('data-init')).to.not.be.null;
          expect(ampPoool.getAttribute('data-page-view')).to.not.be.null;
        });
  });

  it('verifies needed attributes presence', () => {
    return getPoool('ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH', 'premium')
        .then(ampPoool => {
          expect(ampPoool.getAttribute('data-init')).to.equal("ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH");
          expect(ampPoool.getAttribute('data-page-view')).to.equal("premium");
        });
  });

  it('tests amp-poool with additional config variables', () => {
    return getPoool('ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH', 'premium', 'question', true)
        .then(ampPoool => {
          expect(ampPoool.getAttribute('data-debug')).to.equal("true");
          expect(ampPoool.getAttribute('data-force-widget')).to.equal("question");
        });
  });

  it('tests amp-poool with additional style variables', () => {
    return getPoool('ZRGA3EYZ4GRBTSHREG345HGGZRTHZEGEH', 'premium', 'question', true, '#000', '#123')
        .then(ampPoool => {
          expect(ampPoool.getAttribute('data-main-color')).to.equal('#000');
          expect(ampPoool.getAttribute('data-background-color')).to.equal('#123');
        });
  });
});
