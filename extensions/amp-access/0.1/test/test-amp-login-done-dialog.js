import {LoginDoneDialog, buildLangSelector} from '../amp-login-done-dialog';

describes.sandboxed('LoginDoneDialog', {}, (env) => {
  let clock;
  let windowApi;
  let dialog;
  let messageListener;
  let openerMock;
  let closeButton;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();

    messageListener = undefined;
    closeButton = {};
    windowApi = {
      close: env.sandbox.spy(),
      navigator: {
        language: 'fr-FR',
      },
      location: {
        hash: '#result1',
        search: '',
        replace: env.sandbox.spy(),
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
      setInterval: (callback, t) => window.setInterval(callback, t),
      clearInterval: (callback, t) => window.clearInterval(callback, t),
      document: {
        documentElement: document.createElement('div'),
        getElementById: (id) => {
          if (id == 'closeButton') {
            return closeButton;
          }
          return null;
        },
        querySelector: (sel) => {
          if (sel == '[lang="unk"]') {
            return null;
          }
          return {};
        },
      },
    };
    openerMock = env.sandbox.mock(windowApi.opener);

    dialog = new LoginDoneDialog(windowApi);
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
        '[lang="fr"], [lang="fr-FR"] {display: block}'
      );
    });

    it('should prioritize query parameter first', () => {
      windowApi.navigator.language = 'fr-FR';
      windowApi.location.search = '?hl=en-US';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="en"], [lang="en-US"] {display: block}'
      );
    });

    it('should fallback to navigator.lang if no DOM nodes exist', () => {
      windowApi.navigator.language = 'fr-FR';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="fr"], [lang="fr-FR"] {display: block}'
      );
    });

    it('should fallback to navigator.userLang if no DOM nodes exist', () => {
      windowApi.navigator.userLanguage = 'de-DE';
      windowApi.navigator.language = 'unk';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="de"], [lang="de-DE"] {display: block}'
      );
    });

    it('should fallback to en-US if no DOM nodes exist', () => {
      windowApi.navigator.userLanguage = 'unk';
      windowApi.navigator.language = 'unk';
      windowApi.location.search = '?hl=unk';
      expect(dialog.buildStyles_()).to.equal(
        '[lang="en"], [lang="en-US"] {display: block}'
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
          env.sandbox.match((arg) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
          expect(res).to.match(/No opener or return location available/);
          expect(messageListener).to.not.exist;
        });
    });

    it('should fail with timeout', () => {
      openerMock
        .expects('postMessage')
        .withExactArgs(
          env.sandbox.match((arg) => {
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
        .then(
          () => 'SUCCESS',
          (error) => 'ERROR ' + error
        )
        .then((res) => {
          expect(res).to.match(/Timed out/);
          expect(messageListener).to.not.exist;
        });
    });

    it('should keep trying to close window for a minute', () => {
      dialog.postbackSuccess_();
      expect(windowApi.close).to.have.callCount(1);
      clock.tick(60000);
      expect(windowApi.close).to.have.callCount(121);
      windowApi.close.resetHistory();
      // After 60 seconds it'll stop trying.
      clock.tick(60000);
      expect(windowApi.close).to.not.be.called;
    });

    it('should stop trying to close window after it is closed', () => {
      dialog.postbackSuccess_();
      clock.tick(30000);
      expect(windowApi.close).to.have.callCount(61);
      windowApi.close.resetHistory();
      windowApi.closed = true;
      // After the window is closed it'll stop trying.
      clock.tick(30000);
      expect(windowApi.close).to.not.be.called;
    });

    it('should revert to error mode if window is not closed', () => {
      dialog.postbackError_ = env.sandbox.spy();
      dialog.postbackSuccess_();
      expect(windowApi.close).to.be.calledOnce;
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

      closeButton.onclick();
      expect(windowApi.close).to.be.calledOnce;
    });

    it('should configure error mode for "close"', () => {
      dialog.postbackError_(new Error());

      expect(windowApi.document.documentElement).to.have.class('amp-error');
      expect(
        windowApi.document.documentElement.getAttribute('data-error')
      ).to.equal('postback');
      closeButton.onclick();
      expect(windowApi.close).to.be.calledOnce;

      clock.tick(3000);
      expect(windowApi.document.documentElement).to.have.class('amp-error');
      expect(
        windowApi.document.documentElement.getAttribute('data-error')
      ).to.equal('close');
    });
  });
});
