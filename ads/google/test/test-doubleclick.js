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
import {selectGptExperiment, writeAdScript} from '../doubleclick';
import {createServedIframe} from '../../../testing/iframe';

function verifyScript(win, name) {
  const scripts = ['gpt.js', 'gpt_sf_a.js', 'gpt_sf_b.js', 'glade.js'];
  assert(scripts.includes(name));
  scripts.forEach(script => {
    if (script == 'glade.js') {
      expect(!!win.document.querySelector(
          'script[src="https://securepubads.g.doubleclick.net/static/glade.js"]'))
          .to.equal(script == name);
    } else {
      expect(!!win.document.querySelector(
          `script[src="https://www.googletagservices.com/tag/js/${script}"]`))
          .to.equal(script == name);
    }
  });
};

describe('selectGptExperiment', () => {

  it('should return the correct filename when given the experimental condition',
      () => {
        const controlData = {experimentId: '21060540'};
        const experimentData = {experimentId: '21060541'};
        const notInEitherData = {};
        expect(selectGptExperiment(controlData)).to
            .equal('gpt_sf_a.js');
        expect(selectGptExperiment(experimentData)).to
            .equal('gpt_sf_b.js');
        expect(selectGptExperiment(notInEitherData)).to
            .equal(undefined);
      });
});

describes.sandboxed('writeAdScript', {}, env => {

  let win;
  beforeEach(() => {
    return createServedIframe().then(iframe => {
      win = iframe.win;
    });
  });

  afterEach(() => {
    env.sandbox.restore();
  });


  it('should use GPT and opt out of the GladeExperiment when multiSize is not' +
  'null', () => {
    const data = {multiSize: 'hey!'};
    const gptFilename = undefined;

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'gpt.js');
  });

  it('should use GPT and opt out of the GladeExperiment when in the control' +
  'branch of the SingleFileGPT experiment', () => {
    const data = {};
    const gptFilename = 'gpt_sf_a.js';

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'gpt_sf_a.js');
  });

  it('should use GPT and opt out of the GladeExperiment when in the' +
  'experiment branch of the SingleFileGPT experiment', () => {
    const data = {};
    const gptFilename = 'gpt_sf_b.js';

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'gpt_sf_b.js');
  });

  it('should use GPT based on experimentFraction value and' +
  'absence of google_glade=1 in url', () => {
    env.sandbox.stub(win.Math, 'random').returns(0);
    const div = win.document.createElement('div');
    div.setAttribute('id', 'c');
    env.sandbox.stub(win.document, 'getElementById').returns(div);
    win.context = {};
    win.context.location = {};
    win.context.location.href = 'http://www.example.com';
    const data = {};
    const gptFilename = undefined;

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'gpt.js');
  });

  it('should use GPT based on presence of google_glade=0' +
  'and absence of google_glade=1 in the url', () => {
    env.sandbox.stub(win.Math, 'random').returns(1);
    const div = win.document.createElement('div');
    div.setAttribute('id', 'c');
    env.sandbox.stub(win.document, 'getElementById').returns(div);
    win.context = {};
    win.context.location = {};
    win.context.location.href = 'http://www.example.com?google_glade=0';
    const data = {};
    const gptFilename = undefined;

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'gpt.js');
  });

  it('should use Glade based on presence of google_glade=1 in url', () => {
    env.sandbox.stub(win.Math, 'random').returns(1);
    const div = win.document.createElement('div');
    div.setAttribute('id', 'c');
    env.sandbox.stub(win.document, 'getElementById').returns(div);
    win.context = {};
    win.context.location = {};
    win.context.location.href = 'http://www.example.com?google_glade=1';
    const data = {};
    const gptFilename = undefined;

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'glade.js');
  });

  it('should use doubleClickWithGlade based on absence of google_glade=0' +
  'in url and experimentFraction value', () => {
    env.sandbox.stub(win.Math, 'random').returns(1);
    const div = win.document.createElement('div');
    div.setAttribute('id', 'c');
    env.sandbox.stub(win.document, 'getElementById').returns(div);
    win.context = {};
    win.context.location = {};
    win.context.location.href = 'http://www.example.com';
    const data = {};
    const gptFilename = undefined;

    writeAdScript(win, data, gptFilename);

    verifyScript(win, 'glade.js');
  });
});
