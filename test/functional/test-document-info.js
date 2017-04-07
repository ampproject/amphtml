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
import {documentInfoForDoc} from '../../src/services';
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

  function getWin(links) {
    return createIframePromise().then(iframe => {
      if (links) {
        for (const rel in links) {
          const hrefs = links[rel];
          for (let i = 0; i < hrefs.length; i++) {
            const link = iframe.doc.createElement('link');
            link.setAttribute('rel', rel);
            link.setAttribute('href', hrefs[i]);
            iframe.doc.head.appendChild(link);
          }
        }
      }
      const win = iframe.win;
      installDocService(win, /* isSingleDoc */ true);
      sandbox.stub(win.Math, 'random', () => 0.123456789);
      installDocumentInfoServiceForDoc(win.document);
      return iframe.win;
    });
  }

  it('should provide the canonicalUrl', () => {
    return getWin({'canonical': ['https://twitter.com/']}).then(win => {
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
    installDocService(win, /* isSingleDoc */ true);
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
    installDocService(win, /* isSingleDoc */ true);
    installDocumentInfoServiceForDoc(win.document);
    expect(documentInfoForDoc(win.document).sourceUrl).to.equal(
        'http://www.origin.com/foo/?f=0');
    win.location.href = 'https://cdn.ampproject.org/v/www.origin.com/foo/?f=1';
    expect(documentInfoForDoc(win.document).sourceUrl).to.equal(
        'http://www.origin.com/foo/?f=1');
  });

  it('should provide the pageViewId', () => {
    return getWin({'canonical': ['https://twitter.com/']}).then(win => {
      expect(documentInfoForDoc(win.document).pageViewId).to.equal('1234');
      expect(documentInfoForDoc(win.document).pageViewId).to.equal('1234');
    });
  });

  it('should provide the relative canonicalUrl as absolute', () => {
    return getWin({'canonical': ['./foo.html']}).then(win => {
      expect(documentInfoForDoc(win.document).canonicalUrl).to.equal(
          'http://localhost:' + location.port + '/foo.html');
    });
  });

  it('should provide the linkRels containing link tag rels', () => {
    return getWin({
      'canonical': ['https://twitter.com/'],
      'icon': ['https://foo.html/bar.gif'],
    }).then(win => {
      expect(documentInfoForDoc(win.document).linkRels['canonical'])
          .to.equal('https://twitter.com/');
      expect(documentInfoForDoc(win.document).linkRels['icon'])
          .to.equal('https://foo.html/bar.gif');
    });
  });

  it('should provide empty linkRels if there are no link tags', () => {
    return getWin().then(win => {
      expect(documentInfoForDoc(win.document).linkRels).to.be.empty;
    });
  });

  it('should provide the linkRels containing link tag rels as absolute', () => {
    return getWin({
      'canonical': ['./foo.html'],
      'icon': ['./bar.gif'],
    }).then(win => {
      expect(documentInfoForDoc(win.document).linkRels['canonical'])
          .to.equal('http://localhost:' + location.port + '/foo.html');
      expect(documentInfoForDoc(win.document).linkRels['icon'])
          .to.equal('http://localhost:' + location.port + '/bar.gif');
    });
  });

  it('should provide the linkRels containing link tag rels with ' +
      'space in rel', () => {
    return getWin({
      'sharelink canonical': ['https://twitter.com/'],
      'icon': ['https://foo.html/bar.gif'],
    }).then(win => {
      expect(documentInfoForDoc(win.document).linkRels['sharelink'])
          .to.equal('https://twitter.com/');
      expect(documentInfoForDoc(win.document).linkRels['canonical'])
          .to.equal('https://twitter.com/');
      expect(documentInfoForDoc(win.document).linkRels['icon'])
          .to.equal('https://foo.html/bar.gif');
    });
  });

  it('should provide the linkRels containing link tag rels with multiple ' +
      'hrefs', () => {
    return getWin({
      'canonical': ['https://twitter.com/'],
      'icon': ['https://foo.html/bar.gif'],
      'stylesheet': [
        'https://foo.html/style1.css',
        'https://foo.html/style2.css',
      ],
    }).then(win => {
      expect(documentInfoForDoc(win.document).linkRels['canonical'])
          .to.equal('https://twitter.com/');
      expect(documentInfoForDoc(win.document).linkRels['icon'])
          .to.equal('https://foo.html/bar.gif');
      expect(documentInfoForDoc(win.document).linkRels['stylesheet'].length)
          .to.equal(2);
      expect(documentInfoForDoc(win.document).linkRels['stylesheet'][0])
          .to.equal('https://foo.html/style1.css');
      expect(documentInfoForDoc(win.document).linkRels['stylesheet'][1])
          .to.equal('https://foo.html/style2.css');
    });
  });

  it('should provide the linkRels containing link tag rels but drop ' +
      'prefetch/preload/preconnect rels', () => {
    return getWin({
      'canonical': ['https://twitter.com/'],
      'icon': ['https://foo.html/bar.gif'],
      'prefetch': ['https://foo1.com'],
      'preload': ['https://foo2.com'],
      'preconnect': ['https://foo3.com'],
    }).then(win => {
      expect(documentInfoForDoc(win.document).linkRels['canonical'])
          .to.equal('https://twitter.com/');
      expect(documentInfoForDoc(win.document).linkRels['icon'])
          .to.equal('https://foo.html/bar.gif');
      expect(documentInfoForDoc(win.document).linkRels['prefetch'])
          .to.be.undefined;
      expect(documentInfoForDoc(win.document).linkRels['preload'])
          .to.be.undefined;
      expect(documentInfoForDoc(win.document).linkRels['preconnect'])
          .to.be.undefined;
    });
  });

});
