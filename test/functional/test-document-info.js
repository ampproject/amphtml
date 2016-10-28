/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {createIframePromise} from '../../testing/iframe';
import {documentInfoForDoc} from '../../src/document-info';
import {installDocumentInfoServiceForDoc,} from
    '../../src/service/document-info-impl';
import {installDocService} from '../../src/service/ampdoc-impl';
import * as sinon from 'sinon';

describe('document-info', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getWin(canonical) {
    return createIframePromise().then(iframe => {
      if (canonical) {
        const link = iframe.doc.createElement('link');
        link.setAttribute('href', canonical);
        link.setAttribute('rel', 'canonical');
        iframe.doc.head.appendChild(link);
      }
      const win = iframe.win;
      installDocService(win, true);
      sandbox.stub(win.Math, 'random', () => 0.123456789);
      installDocumentInfoServiceForDoc(win.document);
      return iframe.win;
    });
  }

  it('should provide the canonicalUrl', () => {
    return getWin('https://twitter.com/').then(win => {
      expect(documentInfoForDoc(win.document).canonicalUrl).to.equal(
          'https://twitter.com/');
    });
  });

  it('should provide the sourceUrl', () => {
    const win = {
      document: {
        nodeType: /* document */ 9,
        querySelector() { return 'http://www.origin.com/foo/?f=0'; },
      },
      Math: {random() { return 0.123456789; }},
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
    };
    win.document.defaultView = win;
    installDocService(win, true);
    installDocumentInfoServiceForDoc(win.document);
    expect(documentInfoForDoc(win.document).sourceUrl).to.equal(
        'http://www.origin.com/foo/?f=0');
  });

  it('should provide the updated sourceUrl', () => {
    const win = {
      document: {
        nodeType: /* document */ 9,
        querySelector() { return 'http://www.origin.com/foo/?f=0'; },
      },
      Math: {random() { return 0.123456789; }},
      location: {
        href: 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=0',
      },
    };
    win.document.defaultView = win;
    installDocService(win, true);
    installDocumentInfoServiceForDoc(win.document);
    expect(documentInfoForDoc(win.document).sourceUrl).to.equal(
        'http://www.origin.com/foo/?f=0');
    win.location.href = 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=1';
    expect(documentInfoForDoc(win.document).sourceUrl).to.equal(
        'http://www.origin.com/foo/?f=1');
  });

  it('should provide the pageViewId', () => {
    return getWin('https://twitter.com/').then(win => {
      expect(documentInfoForDoc(win.document).pageViewId).to.equal('1234');
      expect(documentInfoForDoc(win.document).pageViewId).to.equal('1234');
    });
  });

  it('should provide the relative canonicalUrl as absolute', () => {
    return getWin('./foo.html').then(win => {
      expect(documentInfoForDoc(win.document).canonicalUrl).to.equal(
          'http://localhost:' + location.port + '/foo.html');
    });
  });
});
