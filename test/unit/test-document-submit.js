import {Services} from '#service';

import {
  installGlobalSubmitListenerForDoc,
  onDocumentFormSubmit_,
} from '../../src/document-submit';

describes.sandboxed('test-document-submit', {}, (env) => {
  describe('installGlobalSubmitListenerForDoc', () => {
    let ampdoc;
    let headNode;
    let rootNode;
    beforeEach(() => {
      headNode = document.createElement('head');
      rootNode = document.createElement('html');
      ampdoc = {
        getHeadNode: () => headNode,
        getRootNode: () => rootNode,
        whenExtensionsKnown: () => Promise.resolve(),
        declaresExtension: () => false,
      };
    });

    it('should not register submit listener if amp-form is not registered.', () => {
      env.sandbox
        .stub(ampdoc, 'declaresExtension')
        .withArgs('amp-form')
        .returns(false);
      env.sandbox.spy(rootNode, 'addEventListener');
      return installGlobalSubmitListenerForDoc(ampdoc).then(() => {
        expect(rootNode.addEventListener).not.to.have.been.called;
      });
    });

    it('should register submit listener if amp-form extension is registered.', () => {
      env.sandbox
        .stub(ampdoc, 'declaresExtension')
        .withArgs('amp-form')
        .returns(true);
      env.sandbox.spy(rootNode, 'addEventListener');
      return installGlobalSubmitListenerForDoc(ampdoc).then(() => {
        expect(rootNode.addEventListener).called;
      });
    });
  });

  describes.realWin('onDocumentFormSubmit_', {amp: true}, (env) => {
    let window, document;
    let evt;
    let tgt;
    let preventDefaultSpy;
    let stopImmediatePropagationSpy;

    beforeEach(() => {
      window = env.win;
      document = window.document;
      preventDefaultSpy = env.sandbox.spy();
      stopImmediatePropagationSpy = env.sandbox.spy();
      tgt = document.createElement('form');
      tgt.action = 'https://www.google.com';
      tgt.target = '_blank';
      tgt.checkValidity = env.sandbox.stub().returns(true);
      evt = {
        target: tgt,
        preventDefault: preventDefaultSpy,
        stopImmediatePropagation: stopImmediatePropagationSpy,
        defaultPrevented: false,
      };
      document.body.appendChild(tgt);
    });

    it('should check target and action attributes', () => {
      tgt.removeAttribute('action');
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /form action-xhr or action attribute is required for method=GET/
        );
      });

      tgt.setAttribute('action', 'http://example.com');
      tgt.__AMP_INIT_ACTION__ = undefined;
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /form action must start with "https:/
        );
      });

      tgt.setAttribute('action', 'https://cdn.ampproject.org');
      tgt.__AMP_INIT_ACTION__ = undefined;
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /form action should not be on AMP CDN/
        );
      });

      tgt.setAttribute('action', 'https://valid.example.com');
      tgt.__AMP_INIT_ACTION__ = undefined;
      tgt.removeAttribute('target');
      expect(() => onDocumentFormSubmit_(evt)).to.not.throw();

      tgt.setAttribute('action', 'https://valid.example.com');
      tgt.__AMP_INIT_ACTION__ = undefined;
      tgt.setAttribute('target', '_self');
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /form target=_self is invalid/
        );
      });

      tgt.setAttribute('action', 'https://valid.example.com');
      tgt.__AMP_INIT_ACTION__ = undefined;
      tgt.setAttribute('target', '_blank');
      expect(() => onDocumentFormSubmit_(evt)).to.not.throw();
    });

    it('should assert none of the inputs named __amp_source_origin', () => {
      const illegalInput = document.createElement('input');
      illegalInput.setAttribute('type', 'hidden');
      illegalInput.setAttribute('name', '__amp_source_origin');
      illegalInput.value = 'https://example.com';
      tgt.appendChild(illegalInput);
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /Illegal input name, __amp_source_origin found/
        );
      });
    });

    it('should assert __amp_source_origin is not set in action', () => {
      evt.target.setAttribute(
        'action',
        'https://example.com/?__amp_source_origin=12'
      );
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /Source origin is not allowed in/
        );
      });
    });

    it('should fail when POST and action-xhr is not set', () => {
      evt.target.removeAttribute('action');
      evt.target.setAttribute('method', 'post');
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(
          /Only XHR based \(via action-xhr attribute\) submissions/
        );
      });
      expect(preventDefaultSpy).to.have.been.called;
      const {callCount} = preventDefaultSpy;

      evt.target.setAttribute('method', 'post');
      evt.target.setAttribute('action-xhr', 'https://example.com');
      expect(() => onDocumentFormSubmit_(evt)).to.not.throw();
      expect(preventDefaultSpy.callCount).to.equal(callCount + 1);
    });

    it('should do nothing if already prevented', () => {
      evt.defaultPrevented = true;
      onDocumentFormSubmit_(evt);
      expect(preventDefaultSpy).to.have.not.been.called;
      expect(tgt.checkValidity).to.have.not.been.called;
    });

    it('should default target to _top when missing', () => {
      evt.target.removeAttribute('target');
      onDocumentFormSubmit_(evt);
      expect(evt.target.getAttribute('target')).to.equal('_top');
    });

    it('should throw if no target', () => {
      evt.target = null;
      allowConsoleError(() => {
        expect(() => onDocumentFormSubmit_(evt)).to.throw(/Element expected/);
      });
      expect(preventDefaultSpy).to.have.not.been.called;
      expect(tgt.checkValidity).to.have.not.been.called;
    });

    it('should prevent submit', () => {
      tgt.checkValidity = env.sandbox.stub().returns(false);
      onDocumentFormSubmit_(evt);
      expect(preventDefaultSpy).to.be.calledOnce;
      expect(tgt.checkValidity).to.be.calledOnce;
      preventDefaultSpy.resetHistory();
      tgt.checkValidity.reset();

      tgt.checkValidity = env.sandbox.stub().returns(false);
      onDocumentFormSubmit_(evt);
      expect(preventDefaultSpy).to.be.calledOnce;
      expect(tgt.checkValidity).to.be.calledOnce;
    });

    it('should not check validity if novalidate provided', () => {
      tgt.setAttribute('novalidate', '');
      tgt.checkValidity = env.sandbox.stub().returns(false);
      onDocumentFormSubmit_(evt);
      expect(preventDefaultSpy).to.have.not.been.called;
      expect(tgt.checkValidity).to.have.not.been.called;
    });

    it('should not prevent default', () => {
      tgt.checkValidity = env.sandbox.stub().returns(true);
      onDocumentFormSubmit_(evt);
      expect(preventDefaultSpy).to.have.not.been.called;
      expect(tgt.checkValidity).to.be.calledOnce;
    });

    it('should delegate xhr submit through action service', () => {
      evt.target.setAttribute('action-xhr', 'https://example.com');
      const actionService = Services.actionServiceForDoc(tgt);
      env.sandbox.stub(actionService, 'execute');
      onDocumentFormSubmit_(evt);
      expect(actionService.execute).to.have.been.calledOnce;
      expect(actionService.execute).to.have.been.calledWith(
        tgt,
        'submit',
        null,
        tgt,
        tgt,
        evt
      );
      expect(preventDefaultSpy).to.have.been.calledOnce;
      expect(stopImmediatePropagationSpy).to.have.been.calledOnce;
    });

    it('should not delegate non-XHR submit through action service', () => {
      const actionService = Services.actionServiceForDoc(tgt);
      env.sandbox.stub(actionService, 'execute');
      onDocumentFormSubmit_(evt);
      expect(actionService.execute).to.have.not.been.called;
    });
  });
});
