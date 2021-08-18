import {ResponsiveAttributes} from '../responsive-attributes';

describes.sandboxed('ResponsiveAttributes', {}, (env) => {
  let matchMediaStub;

  beforeEach(() => {
    matchMediaStub = env.sandbox.stub(window, 'matchMedia');
    matchMediaStub.returns({matches: false});
    matchMediaStub.withArgs('').returns({matches: true});
  });

  it('should choose the first matching media query', () => {
    matchMediaStub.withArgs('(min-width: 600px)').returns({matches: true});
    matchMediaStub.withArgs('(min-width: 300px)').returns({matches: true});

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute(
      'one',
      '(min-width: 600px) foo, (min-width: 300px) bar, baz'
    );
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('foo');
  });

  it('should pass non-matching media queries', () => {
    matchMediaStub.withArgs('(min-width: 300px)').returns({matches: true});

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute(
      'one',
      '(min-width: 600px) foo, (min-width: 300px) bar, baz'
    );
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('bar');
  });

  it('should fall back to the default value', () => {
    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute(
      'one',
      '(min-width: 600px) foo, (min-width: 300px) bar, baz'
    );
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('baz');
  });

  it('should handle empty groups', () => {
    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute('one', '(min-width: 600px) foo, , baz');
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('baz');
  });

  it('should update when the matching value changes', () => {
    matchMediaStub.withArgs('(min-width: 600px)').returns({matches: true});

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute('one', '(min-width: 600px) foo, bar');
    ra.updateAttribute('one', '(min-width: 600px) hello, world');

    expect(spy).to.have.been.calledTwice;
    expect(spy).to.have.been.calledWith('hello');
  });

  it('should update when the media query triggers onchange', async () => {
    let callback;
    let matches = false;

    matchMediaStub.withArgs('(min-width: 600px)').returns({
      get matches() {
        return matches;
      },
      set onchange(cb) {
        callback = cb;
      },
    });

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute('one', '(min-width: 600px) foo, bar');

    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('bar');

    matches = true;
    callback();
    await Promise.resolve();

    expect(spy).to.have.been.calledTwice;
    expect(spy).to.have.been.calledWith('foo');
  });

  it('should clear onchange when the attribute value changes', async () => {
    const onchangeSpy = env.sandbox.spy();

    matchMediaStub.withArgs('(min-width: 600px)').returns({
      matches: false,
      set onchange(cb) {
        onchangeSpy(cb);
      },
    });

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute('one', '(min-width: 600px) foo, bar');

    expect(onchangeSpy).to.have.been.calledOnce;

    ra.updateAttribute('one', '(min-width: 700px) foo, bar');

    expect(onchangeSpy).to.have.been.calledTwice;
    expect(onchangeSpy.secondCall).to.have.been.calledWith(null);
  });

  it('should handle number values', () => {
    matchMediaStub.withArgs('(min-width: 600px)').returns({matches: true});

    const spy = env.sandbox.spy();
    const ra = new ResponsiveAttributes({
      'one': spy,
    });

    ra.updateAttribute('one', '(min-width: 600px) 4.2, 7');
    expect(spy).to.have.been.calledOnce;
    expect(spy).to.have.been.calledWith('4.2');
  });
});
