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

import {LoginDoneDialog, buildLangSelector} from '../amp-login-done-dialog';

describe('LoginDoneDialog', () => {
  let sandbox;
  let clock;
  let windowApi;
  let windowMock;
  let dialog;
  let messageListener;
  let openerMock;
  let closeButton;

  beforeEach(() => {
    sandbox = sinon.sandbox;
    clock = sandbox.useFakeTimers();

    messageListener = undefined;
    closeButton = {};
    windowApi = {
      close: () => {},
      navigator: {
        language: 'fr-FR',
      },
      location: {
        hash: '#result1',
        search: '',
        replace: sandbox.spy(),
      },
      addEventListener: (type, callback) => {
        if (type == 'message') {
          messageListener = callback;
        }
      },
      removeEventListener: (type, callback) => {
        if (type == 'message' && messageListener == callback) {
          messageListener = undefined;
        }
      },
      opener: {
        postMessage: () => {},
      },
      open: () => {},
      postMessage: () => {},
      setTimeout: (callback, t) => window.setTimeout(callback, t),
      document: {
        documentElement: document.createElement('div'),
        getElementById: id => {
          if (id == 'closeButton') {
            return closeButton;
          }
          return null;
        },
        querySelector: sel => {
          if (sel == '[lang="unk"]') {
            return null;
          }
          return {};
        },
      },
    };
    windowMock = sandbox.mock(windowApi);
    openerMock = sandbox.mock(windowApi.opener);

    dialog = new LoginDoneDialog(windowApi);
  });

  afterEach(() => {
    sandbox.restore();
  });

  function succeed() {
    messageListener({
      origin: 'http://localhost:8000',
      data: {
        sentinel: 'amp',
        type: 'result-ack',
      },
    });
  }

  describe('buildStyles_', () => {
    it('should build complete CSS expression', () => {
      windowApi.navigator.language = 'fr-FR';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="fr"], [lang="fr-FR"] ' + '{display: block}'
      );
    });

    it('should prioritize query parameter first', () => {
      windowApi.navigator.language = 'fr-FR';
      windowApi.location.search = '?hl=en-US';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="en"], [lang="en-US"] ' + '{display: block}'
      );
    });

    it('should fallback to navigator.lang if no DOM nodes exist', () => {
      windowApi.navigator.language = 'fr-FR';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="fr"], [lang="fr-FR"] ' + '{display: block}'
      );
    });

    it('should fallback to navigator.userLang if no DOM nodes exist', () => {
      windowApi.navigator.userLanguage = 'de-DE';
      windowApi.navigator.language = 'unk';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="de"], [lang="de-DE"] ' + '{display: block}'
      );
    });

    it('should fallback to en-US if no DOM nodes exist', () => {
      windowApi.navigator.userLanguage = 'unk';
      windowApi.navigator.language = 'unk';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="en"], [lang="en-US"] ' + '{display: block}'
      );
    });
  });

  describe('buildLangSelector', () => {
    it('should enable every prefix', () => {
      expect(buildLangSelector('fr')).to.equal('[lang="fr"]');
      expect(buildLangSelector('fr-FR')).to.equal(
        '[lang="fr"], [lang="fr-FR"]'
      );
      expect(buildLangSelector('fr-FR-PR')).to.equal(
        '[lang="fr"], [lang="fr-FR"], [lang="fr-FR-PR"]'
      );
    });

    it('should normalize prefixes', () => {
      expect(buildLangSelector('FR-fr')).to.equal(
        '[lang="fr"], [lang="fr-FR"]'
      );
    });

    it('should protect form malformed prefixes', () => {
      expect(buildLangSelector('"fr"')).to.equal('[lang="fr"]');
      expect(buildLangSelector('\\fr\\')).to.equal('[lang="fr"]');
      expect(buildLangSelector('f r')).to.equal('[lang="fr"]');
    });
  });

  describe('postbackOrRedirect_', () => {
    it('should post message to opener', () => {
      openerMock
        .expects('postMessage')
        .withExactArgs(
          sinon.match(arg => {
            return (
              arg.sentinel == 'amp' &&
              arg.type == 'result' &&
              arg.result == '#result1'
            );
          }),
          '*'
        )
        .once();
      const promise = dialog.postbackOrRedirect_();
      return Promise.resolve()
        .then(() => {
          succeed();
          return promise;
        })
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.equal('SUCCESS');
          expect(messageListener).to.not.exist;
        });
    });

    it('should redirect to url without opener with HTTP', () => {
      windowApi.location.search =
        '?url=' + encodeURIComponent('http://acme.com/doc1');
      windowApi.opener = null;
      return dialog
        .postbackOrRedirect_()
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.equal('SUCCESS');
          expect(windowApi.location.replace).to.be.calledOnce;
          expect(windowApi.location.replace.firstCall.args[0]).to.equal(
            'http://acme.com/doc1'
          );
        });
    });

    it('should work around double-encoding of URL on redirect', () => {
      windowApi.location.search =
        '?url=' +
        encodeURIComponent(encodeURIComponent('http://acme.com/doc1'));
      windowApi.opener = null;
      return dialog
        .postbackOrRedirect_()
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.equal('SUCCESS');
          expect(windowApi.location.replace).to.be.calledOnce;
          expect(windowApi.location.replace.firstCall.args[0]).to.equal(
            'http://acme.com/doc1'
          );
        });
    });

    it('should redirect to url without opener with HTTPS', () => {
      windowApi.location.search =
        '?url=' + encodeURIComponent('https://acme.com/doc1');
      windowApi.opener = null;
      return dialog
        .postbackOrRedirect_()
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.equal('SUCCESS');
          expect(windowApi.location.replace).to.be.calledOnce;
          expect(windowApi.location.replace.firstCall.args[0]).to.equal(
            'https://acme.com/doc1'
          );
        });
    });

    it('should work around double-encoding of URL on redirect w/HTTPS', () => {
      windowApi.location.search =
        '?url=' +
        encodeURIComponent(encodeURIComponent('https://acme.com/doc1'));
      windowApi.opener = null;
      return dialog
        .postbackOrRedirect_()
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.equal('SUCCESS');
          expect(windowApi.location.replace).to.be.calledOnce;
          expect(windowApi.location.replace.firstCall.args[0]).to.equal(
            'https://acme.com/doc1'
          );
        });
    });

    it('should fail tripple-encoding of URL', () => {
      windowApi.location.search =
        '?url=' +
        encodeURIComponent(
          encodeURIComponent(encodeURIComponent('https://acme.com/doc1'))
        );
      windowApi.opener = null;
      allowConsoleError(() => {
        expect(() => {
          dialog.postbackOrRedirect_();
        }).to.throw(/URL must start with/);
      });
      expect(windowApi.location.replace).to.have.not.been.called;
    });

    it('should fail redirect to url without opener and invalid URL', () => {
      windowApi.location.search =
        '?url=' +
        encodeURIComponent(/*eslint no-script-url: 0*/ 'javascript:alert(1)');
      windowApi.opener = null;
      allowConsoleError(() => {
        expect(() => {
          dialog.postbackOrRedirect_();
        }).to.throw(/URL must start with/);
      });
      expect(windowApi.location.replace).to.have.not.been.called;
    });

    it('should fail without opener and redirect URL', () => {
      windowApi.opener = null;
      return dialog
        .postbackOrRedirect_()
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.match(/No opener or return location available/);
          expect(messageListener).to.not.exist;
        });
    });

    it('should fail with timeout', () => {
      openerMock
        .expects('postMessage')
        .withExactArgs(
          sinon.match(arg => {
            return (
              arg.sentinel == 'amp' &&
              arg.type == 'result' &&
              arg.result == '#result1'
            );
          }),
          '*'
        )
        .once();
      const promise = dialog.postback_();
      return Promise.resolve()
        .then(() => {
          clock.tick(10000);
          return promise;
        })
        .then(() => 'SUCCESS', error => 'ERROR ' + error)
        .then(res => {
          expect(res).to.match(/Timed out/);
          expect(messageListener).to.not.exist;
        });
    });

    it('should revert to error mode if window is not closed', () => {
      windowMock.expects('close').once();
      dialog.postbackError_ = sandbox.spy();
      dialog.postbackSuccess_();
      expect(dialog.postbackError_).to.have.not.been.called;

      clock.tick(10000);
      expect(dialog.postbackError_).to.be.calledOnce;
    });

    it('should configure error mode for "postback"', () => {
      dialog.postbackError_(new Error());

      expect(windowApi.document.documentElement).to.have.class('amp-error');
      expect(
        windowApi.document.documentElement.getAttribute('data-error')
      ).to.equal('postback');
      expect(closeButton.onclick).to.exist;

      windowMock.expects('close').once();
      closeButton.onclick();
    });

    it('should configure error mode for "close"', () => {
      dialog.postbackError_(new Error());

      expect(windowApi.document.documentElement).to.have.class('amp-error');
      expect(
        windowApi.document.documentElement.getAttribute('data-error')
      ).to.equal('postback');
      windowMock.expects('close').once();
      closeButton.onclick();

      clock.tick(3000);
      expect(windowApi.document.documentElement).to.have.class('amp-error');
      expect(
        windowApi.document.documentElement.getAttribute('data-error')
      ).to.equal('close');
    });
  });
});
