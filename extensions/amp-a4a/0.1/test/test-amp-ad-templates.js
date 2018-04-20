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

  const cdnUrl = 'https://adserver-com.cdn.ampproject.org/ad/s/' +
      'adserver.com/amp_template_1';
  const canonicalUrl = 'https://adserver.com/amp_template_1';

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
        cdnUrl,
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
    return ampAdTemplates.fetch(canonicalUrl)
        .then(fetchedTemplate => expect(fetchedTemplate).to.equal(template));
  });

  it('should use CDN url if one is supplied', () => {
    expect(ampAdTemplates.getTemplateProxyUrl_(cdnUrl)).to.equal(cdnUrl);
  });

  it('should convert canonical to CDN', () => {
    expect(ampAdTemplates.getTemplateProxyUrl_(canonicalUrl)).to.equal(cdnUrl);
  });

  it('should render a template with correct values', () => {
    win.AMP.registerTemplate('amp-mustache', AmpMustache);
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

  it('should insert analytics component', () => {
    const parentDiv = doc.createElement('div');
    parentDiv./*OK*/innerHTML =
        '<p>123</p>';
    doc.body.appendChild(parentDiv);
    const analytics = [{
      'remote': 'remoteUrl',
      'inline': {
        'requests': 'r',
      },
    }, {
      'type': 'googleanalytics',
    }];
    ampAdTemplates.insertAnalytics(parentDiv, analytics);
    expect(parentDiv.childNodes.length).to.equal(3);
    expect(parentDiv.innerHTML).to.equal('<p>123</p>' +
        '<amp-analytics config="remoteUrl">' +
        '<script type="application/json">{"requests":"r"}</script>' +
        '</amp-analytics>' +
        '<amp-analytics type="googleanalytics"></amp-analytics>');
  });
});

