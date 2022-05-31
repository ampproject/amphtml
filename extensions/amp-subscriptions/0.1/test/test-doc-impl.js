import {DocImpl} from '../doc-impl';

describes.realWin('DocImpl', {amp: true}, (env) => {
  let ampdoc;
  let configDoc;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    configDoc = new DocImpl(ampdoc);
  });

  it('should proxy inteface to ampdoc', () => {
    expect(configDoc.getWin()).to.equal(ampdoc.win);
    expect(configDoc.getRootNode()).to.equal(ampdoc.getRootNode());
    expect(configDoc.getRootElement()).to.equal(
      ampdoc.getRootNode().documentElement
    );
    expect(configDoc.getHead()).to.equal(ampdoc.getHeadNode());
  });

  it('should resolve body correctly', () => {
    const body = {};
    let bodyAvailable = false;
    const bodyStub = env.sandbox.stub(ampdoc, 'getBody').callsFake(() => body);
    env.sandbox.stub(ampdoc, 'isBodyAvailable').callsFake(() => bodyAvailable);

    // Body not available yet.
    expect(configDoc.getBody()).to.be.null;
    expect(bodyStub).to.not.be.called;

    // Body is now available.
    bodyAvailable = true;
    expect(configDoc.getBody()).to.equal(body);
    expect(bodyStub).to.be.calledOnce;
  });

  it('should delegate ready signals to ampdoc', () => {
    const readyStub = env.sandbox.stub(ampdoc, 'isReady');
    const whenReadyStub = env.sandbox.stub(ampdoc, 'whenReady');

    configDoc.isReady();
    expect(readyStub).to.be.calledOnce;

    configDoc.whenReady();
    expect(whenReadyStub).to.be.calledOnce;
  });
});
