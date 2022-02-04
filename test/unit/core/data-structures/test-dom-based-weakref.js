import {DomBasedWeakRef} from '#core/data-structures/dom-based-weakref';

describes.realWin('data structures - DOM-based weakref', {}, (env) => {
  let element;
  beforeEach(() => {
    element = document.createElement('div');
    env.win.document.body.appendChild(element);
  });

  it('should use a real WeakRef if available', () => {
    if (!window.WeakRef) {
      return;
    }
    const weakref = DomBasedWeakRef.make(env.win, element);
    expect(weakref).to.be.instanceof(env.win.WeakRef);
    expect(weakref.deref()).to.equal(element);
  });

  describe('fallback', () => {
    beforeEach(() => {
      delete env.win.WeakRef;
    });

    it('should use the fallback when WeakRef is NOT available', () => {
      const weakref = DomBasedWeakRef.make(env.win, element);
      expect(weakref.deref()).to.equal(element);
    });

    it('it should use the id of the element if available', () => {
      element.id = 'some-id';
      const weakref = DomBasedWeakRef.make(env.win, element);
      expect(weakref.deref()).to.equal(element);
      expect(element.id).to.equal('some-id');
    });

    it('should fail to deref if the element has been removed from the DOM', () => {
      const weakref = DomBasedWeakRef.make(env.win, element);
      env.win.document.body.removeChild(element);
      expect(weakref.deref()).to.equal(undefined);
    });
  });
});
