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
  (env) => {
    let ampdoc;
    let hasCapabilityStub;
    let ssrTemplateHelper;
    const sourceComponent = 'amp-list';
    let maybeFindTemplateStub;
    let templates;
    let viewer;
    let win;

    beforeEach(() => {
      ampdoc = env.ampdoc;
      win = env.win;
      templates = Services.templatesFor(win);
      viewer = Services.viewerForDoc(ampdoc);
      viewer.isTrustedViewer = () => Promise.resolve(true);
      hasCapabilityStub = env.sandbox.stub(viewer, 'hasCapability');
      maybeFindTemplateStub = env.sandbox.stub(templates, 'maybeFindTemplate');
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
    });

    describe('isEnabled', () => {
      it('should return true if doc level opt-in', () => {
        win.document.documentElement.setAttribute(
          'allow-viewer-render-template',
          true
        );
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        expect(ssrTemplateHelper.isEnabled()).to.be.true;
      });

      it('should return false if not doc level opt-in', () => {
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        expect(ssrTemplateHelper.isEnabled()).to.be.false;
      });

      it(
        'should return false if doc level opt-in but viewer does not have ' +
          'capability',
        () => {
          win.document.documentElement.setAttribute(
            'allow-viewer-render-template',
            true
          );
          hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
          expect(ssrTemplateHelper.isEnabled()).to.be.false;
        }
      );
    });

    describe('ssr', () => {
      it('Should refuse to SSR with an untrusted viewer', async () => {
        viewer.isTrustedViewer = () => Promise.resolve(false);
        const errorMsg = /Refused to attempt SSR in untrusted viewer: /;
        expectAsyncConsoleError(errorMsg);

        return ssrTemplateHelper.ssr({}, {}, {}).then(
          () => Promise.reject(),
          (err) => {
            expect(err).match(errorMsg);
          }
        );
      });

      it('should build payload', async () => {
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
        const sendMessage = env.sandbox
          .stub(viewer, 'sendMessageAwaitResponse')
          .returns(Promise.resolve({}));
        maybeFindTemplateStub.returns(null);
        const templates = {
          successTemplate: {'innerHTML': '<div>much success</div>'},
          errorTemplate: {'innerHTML': '<div>try again</div>'},
        };
        await ssrTemplateHelper.ssr({}, request, templates, {attr: 'test'});

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
        win.document.documentElement.setAttribute(
          'allow-viewer-render-template',
          true
        );
        hasCapabilityStub.withArgs('viewerRenderTemplate').returns(true);
        findAndSetHtmlForTemplate = env.sandbox.stub(
          templates,
          'findAndSetHtmlForTemplate'
        );
        findAndRenderTemplate = env.sandbox.stub(
          templates,
          'findAndRenderTemplate'
        );
        findAndRenderTemplateArray = env.sandbox.stub(
          templates,
          'findAndRenderTemplateArray'
        );
      });

      describe('applySsrOrCsrTemplate', () => {
        it('should set html template', () => {
          // Not a real document element. This variable is used to ensure the
          // value returned by findAndSetHtmlForTemplate is returned by
          // applySsrOrCsrTemplate.
          const element = {};
          findAndSetHtmlForTemplate.returns(element);

          return ssrTemplateHelper
            .applySsrOrCsrTemplate({}, {html: '<div>some template</div>'})
            .then((renderedHTML) => {
              expect(findAndSetHtmlForTemplate).to.have.been.calledWith(
                {},
                '<div>some template</div>'
              );
              expect(renderedHTML).to.equal(element);
            });
        });

        it('should throw error if html template is not defined', () => {
          allowConsoleError(() => {
            expect(() => {
              ssrTemplateHelper.applySsrOrCsrTemplate({}, {html: null});
            }).to.throw(/Server side html response must be defined/);
          });
        });

        it('should throw if trying to ssr from an untrusted viewer', () => {
          viewer.isTrustedViewer = () => Promise.resolve(false);
          const errorMsg = /Refused to attempt SSR in untrusted viewer: /;
          expectAsyncConsoleError(errorMsg);

          ssrTemplateHelper
            .applySsrOrCsrTemplate({}, {html: '<div>some templates</div>'})
            .then(
              () => Promise.reject(),
              (error) => expect(error).to.match(errorMsg)
            );
        });

        it('should render template ', () => {
          hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
          ssrTemplateHelper.applySsrOrCsrTemplate(
            {},
            {data: '<div>some template</div>'}
          );
          expect(findAndRenderTemplate).to.have.been.calledWith(
            {},
            {data: '<div>some template</div>'}
          );
        });

        it('should set template array ', () => {
          hasCapabilityStub.withArgs('viewerRenderTemplate').returns(false);
          ssrTemplateHelper.applySsrOrCsrTemplate({}, [
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
