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

describes.fakeWin(
  'ssr-template-helper',
  {
    amp: true,
  },
  env => {
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
      ssrTemplateHelper = new SsrTemplateHelper(
        sourceComponent,
        viewer,
        templates
      );
    });

    afterEach(() => {
      win.document.documentElement.removeAttribute(
        'allow-viewer-render-template'
      );
      sandbox.restore();
    });

    describe('isSupported', () => {
      it('should return true if doc level opt-in, trusted viewer, and has capability', async () => {
        win.document.documentElement.setAttribute(
          'allow-viewer-render-template',
          true
        );
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        viewer.isTrustedViewer = () => Promise.resolve(true);

        expect(await ssrTemplateHelper.isSupported()).to.be.true;
      });

      it('should return false if not a trusted viewer', async () => {
        win.document.documentElement.setAttribute(
          'allow-viewer-render-template',
          true
        );
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        viewer.isTrustedViewer = () => Promise.resolve(false);

        expect(await ssrTemplateHelper.isSupported()).to.be.false;
      });

      it('should return false if not doc level opt-in', async () => {
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        viewer.isTrustedViewer = () => Promise.resolve(true);

        expect(await ssrTemplateHelper.isSupported()).to.be.false;
      });

      it('should return false if viewer does not have capability', async () => {
        win.document.documentElement.setAttribute(
          'allow-viewer-render-template',
          true
        );
        viewer.isTrustedViewer = () => Promise.resolve(true);
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);

        expect(await ssrTemplateHelper.isSupported()).to.be.false;
      });
    });

    describe('ssr', () => {
      it('should build payload', () => {
        const request = {
          'xhrUrl': 'https://www.abracadabra.org/some-json',
          'fetchOpt': {
            'body': {},
            'credentials': undefined,
            'headers': undefined,
            'method': 'GET',
            'ampCors': true,
          },
        };
        const sendMessage = sandbox.spy(viewer, 'sendMessageAwaitResponse');
        maybeFindTemplateStub.returns(null);
        const templates = {
          successTemplate: {'innerHTML': '<div>much success</div>'},
          errorTemplate: {'innerHTML': '<div>try again</div>'},
        };
        ssrTemplateHelper.ssr({}, request, templates, {
          attr: 'test',
        });
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
        findAndSetHtmlForTemplate = sandbox.stub(
          templates,
          'findAndSetHtmlForTemplate'
        );
        findAndRenderTemplate = sandbox.stub(
          templates,
          'findAndRenderTemplate'
        );
        findAndRenderTemplateArray = sandbox.stub(
          templates,
          'findAndRenderTemplateArray'
        );
      });

      describe('applySsrOrCsrTemplate', () => {
        it('should set html template', async () => {
          ssrTemplateHelper.isSupported = () => Promise.resolve(true);
          await ssrTemplateHelper.applySsrOrCsrTemplate(
            {},
            {html: '<div>some template</div>'}
          );

          expect(findAndSetHtmlForTemplate).to.have.been.calledWith(
            {},
            '<div>some template</div>'
          );
        });

        it('should throw error if html template is not defined', () => {
          ssrTemplateHelper.isSupported = () => Promise.resolve(true);
          const errorMsg = /Server side html response must be defined/;
          expectAsyncConsoleError(errorMsg);

          return ssrTemplateHelper.applySsrOrCsrTemplate({}, {html: null}).then(
            () => {
              throw new Error('must never happen');
            },
            error => expect(error).to.match(errorMsg)
          );
        });

        it('should render template ', async () => {
          ssrTemplateHelper.isSupported = () => Promise.resolve(false);
          await ssrTemplateHelper.applySsrOrCsrTemplate(
            {},
            {data: '<div>some template</div>'}
          );
          expect(findAndRenderTemplate).to.have.been.calledWith(
            {},
            {data: '<div>some template</div>'}
          );
        });

        it('should set template array ', async () => {
          ssrTemplateHelper.isSupported = () => Promise.resolve(false);
          await ssrTemplateHelper.applySsrOrCsrTemplate({}, [
            {data: '<div>some template</div>'},
          ]);
          expect(findAndRenderTemplateArray).to.have.been.calledWith({}, [
            {data: '<div>some template</div>'},
          ]);
        });
      });
    });
  }
);
