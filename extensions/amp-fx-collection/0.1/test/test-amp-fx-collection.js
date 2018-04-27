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

import {AmpFxCollection} from '../amp-fx-collection';
import {createElementWithAttributes} from '../../../../src/dom';
import {isExperimentOn, toggleExperiment} from '../../../../src/experiments';

describes.realWin('Creates the relevant fx presets correctly', {
  amp: {
    ampdoc: 'single',
    extensions: ['amp-fx-collection'],
  },
}, env => {
  let win;
  let ampdoc;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    toggleExperiment(win, 'amp-fx-fade-in', true, false);
    toggleExperiment(win, 'amp-fx-fade-in-scroll', true, false);
  });

  function createAmpFx(fxType, opt_attrs) {
    const element = createElementWithAttributes(win.document, 'div', opt_attrs);
    win.document.body.appendChild(element);
    const ampFxCollection = new AmpFxCollection(ampdoc);
    return ampFxCollection;
  }

  it('creates amp-fx components correctly', () => {
    let ampFx = createAmpFx('parallax', {
      'data-parallax-factor': 1.2,
    });
    expect(ampFx).to.not.be.null;
    expect(ampFx.getFxProvider_()).to.not.be.null;

    expect(isExperimentOn(win, 'amp-fx-fade-in')).to.be.true;
    ampFx = createAmpFx('fade-in');
    expect(ampFx).to.not.be.null;
    expect(ampFx.getFxProvider_()).to.not.be.null;

    expect(isExperimentOn(win, 'amp-fx-fade-in-scroll')).to.be.true;
    ampFx = createAmpFx('fade-in-scroll');
    expect(ampFx).to.not.be.null;
    expect(ampFx.getFxProvider_()).to.not.be.null;
  });

});



