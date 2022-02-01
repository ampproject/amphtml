import {install} from '#polyfills/document-contains';

describes.sandboxed('HTMLDocument.contains', {}, () => {
  let fakeWinWithContains;
  let fakeWinWithoutContains;
  let nativeContains;
  let polyfillContains;
  let connectedElement;
  let connectedChild;
  let disconnectedElement;
  let disconnectedChild;

  beforeEach(() => {
    fakeWinWithContains = {
      HTMLDocument: class {
        contains() {}
      },
      Object: window.Object,
    };
    nativeContains = fakeWinWithContains.HTMLDocument.prototype.contains;

    fakeWinWithoutContains = {
      HTMLDocument: class {},
      Object: window.Object,
    };
    install(fakeWinWithoutContains);
    polyfillContains = fakeWinWithoutContains.HTMLDocument.prototype.contains;

    connectedElement = document.createElement('div');
    connectedChild = document.createElement('div');
    disconnectedElement = document.createElement('div');
    disconnectedChild = document.createElement('div');

    connectedElement.appendChild(connectedChild);
    disconnectedElement.appendChild(disconnectedChild);
    document.body.appendChild(connectedElement);
  });

  afterEach(() => {
    if (connectedElement.parentNode) {
      connectedElement.parentNode.removeChild(connectedElement);
    }
  });

  it('should NOT override an existing method', () => {
    install(fakeWinWithContains);
    expect(fakeWinWithContains.HTMLDocument.prototype.contains).to.equal(
      nativeContains
    );
  });

  it('should override a existing method', () => {
    expect(polyfillContains).to.be.ok;
    expect(polyfillContains).to.not.equal(nativeContains);
  });

  it('should polyfill document.contains API', () => {
    expect(polyfillContains.call(document, connectedElement)).to.be.true;
    expect(polyfillContains.call(document, connectedChild)).to.be.true;
    expect(polyfillContains.call(document, disconnectedElement)).to.be.false;
    expect(polyfillContains.call(document, disconnectedChild)).to.be.false;
  });

  it('should allow a null arg', () => {
    expect(document.contains(null)).to.be.false;
    expect(polyfillContains.call(document, null)).to.be.false;
  });

  it('should be inclusionary for documentElement', () => {
    expect(document.contains(document.documentElement)).to.be.true;
    expect(polyfillContains.call(document, document.documentElement)).to.be
      .true;
  });

  it('should be inclusionary for document itself', () => {
    expect(document.contains(document)).to.be.true;
    expect(polyfillContains.call(document, document)).to.be.true;
  });
});
