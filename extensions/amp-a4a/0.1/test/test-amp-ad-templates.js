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

import {AmpAdTemplates} from '../amp-ad-templates';
import {AmpMustache} from '../../../amp-mustache/0.1/amp-mustache';
import {Xhr} from '../../../../src/service/xhr-impl';


describes.fakeWin('amp-ad-templates', {amp: true}, env => {
  let win, doc;
  let fetchTextMock;
  let ampAdTemplates;

  beforeEach(() => {
    win = env.win;
    win.AMP_MODE = {localDev: false};
    doc = win.document;
    fetchTextMock = sandbox.stub(Xhr.prototype, 'fetchText');
    ampAdTemplates = new AmpAdTemplates(win);
  });

  it('should return a promise resolving to a string template', () => {
    const template = 'content not important here';
    fetchTextMock.withArgs(
        'https://adserver-com.cdn.ampproject.org/c/s/' +
        'adserver.com/amp_template_1',
        {
          mode: 'cors',
          method: 'GET',
          ampCors: false,
          credentials: 'omit',
        })
        .returns(Promise.resolve(
            {
              headers: {},
              text: () => template,
            }));
    return ampAdTemplates.fetch('https://adserver.com/amp_template_1')
        .then(fetchedTemplate => expect(fetchedTemplate).to.equal(template));
  });

  it('should render a template with correct values', () => {
    win.AMP.registerTemplate('amp-mustache', AmpMustache);
    const parentDiv = doc.createElement('div');
    parentDiv./*OK*/innerHTML =
        '<template type="amp-mustache"><p>{{foo}}</p></template>';
    doc.body.appendChild(parentDiv);
    return ampAdTemplates.render({foo: 'bar'}, parentDiv).then(result => {
      expect(result).to.not.be.null;
      expect(result./*OK*/innerHTML).to.equal('bar');
    });
  });

});

