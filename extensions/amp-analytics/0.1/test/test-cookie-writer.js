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

import * as cookie from '../../../../src/cookies';
import {CookieWriter} from '../cookie-writer';
import {dict} from '../../../../src/utils/object';
import {installLinkerReaderService} from '../linker-reader';
import {
  installVariableServiceForDoc,
  variableServiceForDoc,
} from '../variables';



const TAG = '[amp-analytics/cookie-writer]';

describes.realWin('amp-analytics.cookie-writer', {
  amp: true,
  runtimeOn: true,
}, env => {

  let sandbox;
  let win;
  let doc;
  let setCookieSpy;
  let element;

  beforeEach(() => {
    sandbox = env.sandbox;
    setCookieSpy = sandbox.spy();
    win = env.win;
    doc = win.document;
    sandbox.stub(cookie, 'setCookie').callsFake(
        (win, name, value) => {
          setCookieSpy(name, value);
        });
    element = doc.createElement('div');
    doc.body.appendChild(element);
    installVariableServiceForDoc(doc);
    installLinkerReaderService(win);
  });

  describe('write with condition', () => {
    let expandAndWriteSpy;

    it('Resolve when no config', () => {
      const config = dict({});
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resovle when config is invalid', () => {
      const config = dict({
        'cookies': 'invalid',
      });
      expectAsyncConsoleError(TAG + ' cookies config must be an object');
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve when element is in FIE', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(test)',
          },
        },
      });
      const parent = doc.createElement('div');
      parent.classList.add('i-amphtml-fie');
      doc.body.appendChild(parent);
      parent.appendChild(element);
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve when in viewer', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(test)',
          },
        },
      });
      const mockWin = {
        location: 'https://www-example-com.cdn.ampproject.org',
      };
      installLinkerReaderService(mockWin);
      installVariableServiceForDoc(doc);
      const cookieWriter = new CookieWriter(mockWin, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve when in inabox ad', () => {
      env.win.AMP_MODE.runtime = 'inabox';
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(test)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve when disabled', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(test)',
          },
          'enabled': false,
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve with nothing to write', () => {
      const config = dict({
        'cookies': {},
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve with invalid cookieValue (not object)', () => {
      const config = dict({
        'cookies': {
          'testId': 'QUERY_PARAM(test)',
        },
      });
      expectAsyncConsoleError(TAG +
          ' cookieValue must be configured in an object');
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });


    it('Resolve when no value in cookieValue object', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'novalue': 'QUERY_PARAM(test)',
          },
        },
      });
      expectAsyncConsoleError(TAG +
          ' value is required in the cookieValue object');
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Ignore reserved keys', () => {
      const config = dict({
        'cookies': {
          'cookiePath': {
            'value': 'QUERY_PARAM(test)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });

    it('Resolve when cookie value is not supported', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'RANDOM',
          },
          'testId1': {
            'value': 'static',
          },
          'testId2': {
            'value': 'QUERY_PARAM(abc)-suf',
          },
          'testId3': {
            'value': 'pre-QUERY_PARAM(abc)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expectAsyncConsoleError(TAG + ' cookie value RANDOM not supported. ' +
          'Only QUERY_PARAM and LINKER_PARAM is supported');
      expectAsyncConsoleError(TAG + ' cookie value static not supported. ' +
          'Only QUERY_PARAM and LINKER_PARAM is supported');
      expectAsyncConsoleError(TAG + ' cookie value QUERY_PARAM(abc)-suf not ' +
          'supported. Only QUERY_PARAM and LINKER_PARAM is supported');
      expectAsyncConsoleError(TAG + ' cookie value pre-QUERY_PARAM(abc) not ' +
          'supported. Only QUERY_PARAM and LINKER_PARAM is supported');
      expandAndWriteSpy = sandbox.spy(cookieWriter, 'expandAndWrite_');
      return cookieWriter.write().then(() => {
        expect(expandAndWriteSpy).to.not.be.called;
      });
    });
  });

  describe('Cookie value', () => {
    it('Write cookie', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(abc)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      sandbox.stub(cookieWriter.urlReplacementService_,
          'expandStringAsync').callsFake(string => {
        return Promise.resolve(string);});
      return cookieWriter.write().then(() => {
        expect(setCookieSpy).to.be.calledOnce;
        expect(setCookieSpy).to.be.calledWith('testId', 'QUERY_PARAM(abc)');
      });
    });

    it('Write LINKER_PARAM value to cookie', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'LINKER_PARAM(testlinker, testid)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      const variableService = variableServiceForDoc(doc);
      sandbox.stub(variableService.linkerReader_,
          'get').callsFake((name, id) => {
        return `${name}-${id}`;
      });
      return cookieWriter.write().then(() => {
        expect(setCookieSpy).to.be.calledOnce;
        expect(setCookieSpy).to.be.calledWith('testId', 'testlinker-testid');
      });
    });

    it('Write multiple cookie', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(abc)',
          },
          'testId2': {
            'value': 'QUERY_PARAM(def)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      sandbox.stub(cookieWriter.urlReplacementService_,
          'expandStringAsync').callsFake(string => {
        return Promise.resolve(string);});
      return cookieWriter.write().then(() => {
        expect(setCookieSpy).to.be.calledTwice;
        expect(setCookieSpy).to.be.calledWith('testId', 'QUERY_PARAM(abc)');
        expect(setCookieSpy).to.be.calledWith('testId2', 'QUERY_PARAM(def)');
      });
    });



    it('Do not write when string is empty', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM(noexist)',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      sandbox.stub(cookieWriter.urlReplacementService_,
          'expandStringAsync').callsFake(() => {
        return Promise.resolve('');});
      return cookieWriter.write().then(() => {
        // Both cookie value resolve to empty string
        expect(setCookieSpy).to.not.be.called;
      });
    });

    it('Handle expandString error', () => {
      const config = dict({
        'cookies': {
          'testId': {
            'value': 'QUERY_PARAM',
          },
        },
      });
      const cookieWriter = new CookieWriter(win, element, config);
      expectAsyncConsoleError(TAG + ' Error expanding cookie string ' +
          'Error: The first argument to QUERY_PARAM, ' +
          'the query string param is required​​​');
      expectAsyncConsoleError('The first argument to QUERY_PARAM, ' +
          'the query string param is required');
      return cookieWriter.write().then(() => {
        // Both cookie value resolve to empty string
        expect(setCookieSpy).to.not.be.called;
      });
    });
  });
});
