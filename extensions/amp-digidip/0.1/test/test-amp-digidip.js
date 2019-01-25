/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import * as DocumentReady from '../../../../src/document-ready';
import * as digidipOptionsModule from '../digidip-options';
import helpersMaker from './test-helpers';

describes.fakeWin('amp-digidip', {
  amp: {
    extensions: ['amp-digidip'],
  },
}, env => {

  let ampDigidip, digidipOpts, helpers;

  beforeEach(() => {
    digidipOpts = {
      'publisher-id': 'mysuperblog',
    };

    helpers = helpersMaker(env);
    ampDigidip = helpers.createAmpDigidip(digidipOpts);
  });

  afterEach(() => {
    env.sandbox.restore();
  });

  describe('digidipOptions', () => {
    it('Should show an error if publisher-id is missing', () => {
      ampDigidip = helpers.createAmpDigidip();

      allowConsoleError(() =>
        expect(() => {
          ampDigidip.buildCallback();
        }).to.throw()
      );
    });

    it('Should not show any error when specifying attr publisher-id', () => {
      ampDigidip = helpers.createAmpDigidip({
        'publisher-id': 'mysuperblog',
      });
      env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.reject());

      expect(() => {
        ampDigidip.buildCallback();
      }).to.not.throw();
    });
  });

  describe('At loading amp-digidip extension', () => {
    it('should call method letsRockIt on buildCallback', () => {
      env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.resolve());

      env.sandbox.stub(ampDigidip, 'letsRockIt_');

      return ampDigidip.buildCallback().then(() => {
        expect(ampDigidip.letsRockIt_.calledOnce).to.be.true;
      });
    });

    it('Should read and set options', () => {
      env.sandbox
          .stub(DocumentReady, 'whenDocumentReady')
          .returns(Promise.resolve());
      env.sandbox.spy(digidipOptionsModule, 'getDigidipOptions');

      const opts = {
        'publisher-id': 'mysuperblog',
        'new-tab': '1',
        'hosts-ignore': 'facebook.com|youtube.com|baidu.com|wikipedia.org',
        'reading-words-exclude': 'the|you|was|or|it|and|to|of|in|for|on|with',
        'element-clickhandler': '',
        'element-clickhandler-attribute': '',
        'element-ignore-attribute': '',
        'element-ignore-pattern': '',
        'element-ignore-consider-parents': '0',
      };

      ampDigidip = helpers.createAmpDigidip(opts);
      env.sandbox.stub(ampDigidip, 'letsRockIt_');

      return ampDigidip.buildCallback().then(() => {
        expect(digidipOptionsModule.getDigidipOptions.calledOnce).to.be.true;
        expect(ampDigidip.digidipOpts_).to.deep.include({
          publisherId: opts['publisher-id'],
          newTab: opts['new-tab'],
          hostsIgnore: opts['hosts-ignore'],
          readingWordsExclude: opts['reading-words-exclude'],
          elementClickhandler: opts['element-clickhandler'],
          elementClickhandlerAttribute: opts['element-clickhandler-attribute'],
          elementIgnoreAttribute: opts['element-ignore-attribute'],
          elementIgnorePattern: opts['element-ignore-pattern'],
          elementIgnoreConsiderParents: opts['element-ignore-consider-parents'],
        });
        expect(ampDigidip.digidipOpts_.hostsIgnore.split('|')).to.include
            .members(['facebook.com']);
      });
    });
  });
});
