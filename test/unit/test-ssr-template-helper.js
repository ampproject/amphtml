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

import {Services} from '../../src/services';
import {SsrTemplateHelper} from '../../src/ssr-template-helper';

describes.fakeWin('ssr-template-helper', {
  amp: true,
}, env => {
  let ampdoc;
  let hasCapabilityStub;
  let sandbox;
  let ssrTemplateHelper;
  const sourceComponent = 'amp-list';
  let maybeFindTemplateStub;
  let templates;
  let viewer;
  let win;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    sandbox = sinon.sandbox;
    win = env.win;
    templates = Services.templatesFor(win);
    viewer = Services.viewerForDoc(ampdoc);
    hasCapabilityStub = sandbox.stub(viewer, 'hasCapability');
    maybeFindTemplateStub = sandbox.stub(templates, 'maybeFindTemplate');
    ssrTemplateHelper =
        new SsrTemplateHelper(sourceComponent, viewer, templates);
  });

  afterEach(() => {
    win.document.documentElement.removeAttribute(
        'allow-viewer-render-template');
    sandbox.restore();
  });

  describe('isSupported', () => {
    it('should return true if doc level opt-in', () => {
      win.document.documentElement.setAttribute(
          'allow-viewer-render-template', true);
      hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
      expect(ssrTemplateHelper.isSupported()).to.be.true;
    });

    it('should return false if not doc level opt-in', () => {
      hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
      expect(ssrTemplateHelper.isSupported()).to.be.false;
    });

    it('should return false if doc level opt-in but viewer does not have '
      + 'capability', () => {
      win.document.documentElement.setAttribute(
          'allow-viewer-render-template', true);
      hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
      expect(ssrTemplateHelper.isSupported()).to.be.false;
    });
  });

  describe('fetchAndRenderTemplate', () => {
    it('should build payload', () => {
      const request = {
        'xhrUrl': 'https://www.abracadabra.org/some-json',
        'fetchOpt': {
          'body': {},
          'credentials': undefined,
          'headers': undefined,
          'method': 'GET',
          'requireAmpResponseSourceOrigin': false,
          'ampCors': true,
        },
      };
      const sendMessage = sandbox.spy(viewer, 'sendMessageAwaitResponse');
      maybeFindTemplateStub.returns(null);
      const templates = {
        successTemplate: {'innerHTML': '<div>much success</div>'},
        errorTemplate: {'innerHTML': '<div>try again</div>'},
      };
      ssrTemplateHelper.fetchAndRenderTemplate(
          {}, request, templates, {attr: 'test'});
      expect(sendMessage).calledWith('viewerRenderTemplate', {
        'ampComponent': {
          'type': 'amp-list',
          'successTemplate': {
            'type': 'amp-mustache',
            'payload': '<div>much success</div>',
          },
          'errorTemplate': {
            'type': 'amp-mustache',
            'payload': '<div>try again</div>',
          },
          'attr': 'test',
        },
        'originalRequest': {
          'init': {
            'ampCors': true,
            'body': {},
            'credentials': undefined,
            'headers': undefined,
            'method': 'GET',
            'requireAmpResponseSourceOrigin': false,
          },
          'input': 'https://www.abracadabra.org/some-json',
        },
      });
    });
  });

  describe('rendering templates', () => {
    let findAndSetHtmlForTemplate;
    let findAndRenderTemplate;
    let findAndRenderTemplateArray;
    beforeEach(() => {
      win.document.documentElement.setAttribute(
          'allow-viewer-render-template', true);
      hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
      findAndSetHtmlForTemplate =
        sandbox.stub(templates, 'findAndSetHtmlForTemplate');
      findAndRenderTemplate =
          sandbox.stub(templates, 'findAndRenderTemplate');
      findAndRenderTemplateArray =
          sandbox.stub(templates, 'findAndRenderTemplateArray');
    });

    describe('renderTemplate', () => {
      it('should set html template', () => {
        ssrTemplateHelper.renderTemplate(
            {}, {html: '<div>some template</div>'});
        expect(findAndSetHtmlForTemplate)
            .to.have.been.calledWith({}, '<div>some template</div>');
      });

      it('should throw error if html template is not defined', () => {
        allowConsoleError(() => { expect(() => {
          ssrTemplateHelper.renderTemplate({}, {html: null});
        }).to.throw(/Server side html response must be defined/); });
      });

      it('should render template ', () => {
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
        ssrTemplateHelper.renderTemplate(
            {}, {data: '<div>some template</div>'});
        expect(findAndRenderTemplate)
            .to.have.been.calledWith({}, {data: '<div>some template</div>'});
      });

      it('should set template array ', () => {
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
        ssrTemplateHelper.renderTemplate(
            {}, [{data: '<div>some template</div>'}]);
        expect(findAndRenderTemplateArray)
            .to.have.been.calledWith({}, [{data: '<div>some template</div>'}]);
      });
    });
  });
});
