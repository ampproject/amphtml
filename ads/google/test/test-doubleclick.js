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
import {createServedIframe} from '../../../testing/iframe';
import {writeAdScript} from '../doubleclick';

function verifyScript(win, name) {
  const scripts = ['gpt.js', 'glade.js'];
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
}

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


  it('should use GPT when' +
  'useSameDomainRenderingUntilDeprecated is not undefined', () => {
    const data = {useSameDomainRenderingUntilDeprecated: true};
    writeAdScript(win, data);
    verifyScript(win, 'gpt.js');
  });

  it('should use GPT when multiSize is not null', () => {
    const data = {multiSize: 'hey!'};
    writeAdScript(win, data);
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
    writeAdScript(win, data);
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
    writeAdScript(win, data);
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
    writeAdScript(win, data);
    verifyScript(win, 'glade.js');
  });
});
