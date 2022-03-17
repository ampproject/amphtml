import {Observable} from '#core/data-structures/observable';

describes.sandboxed('data structures - Observable', {}, () => {
  let observable;

  beforeEach(() => {
    observable = new Observable();
  });

  it('add-remove-fire', () => {
    let observer1Called = 0;
    const observer1 = () => {
      observer1Called++;
    };
    observable.add(observer1);

    let observer2Called = 0;
    const observer2 = () => {
      observer2Called++;
    };
    const observer2Key = observable.add(observer2);

    expect(observer1Called).to.equal(0);
    expect(observer2Called).to.equal(0);

    observable.fire('A');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(1);

    observable.remove(observer1);
    observable.fire('B');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);

    observer2Key();
    observable.fire('C');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);

    observable.add(observer1);
    observable.add(observer2);
    observable.removeAll();
    observable.fire('D');
    expect(observer1Called).to.equal(1);
    expect(observer2Called).to.equal(2);
  });

  it('remove while firing', () => {
    let observer1Called = 0;
    const observer1 = () => {
      observer1Called++;
    };
    observable.add(observer1);
    const remove = observable.add(() => {
      remove();
    });
    observable.add(observer1);

    observable.fire();

    expect(observer1Called).to.equal(2);
  });

  it('remove while firing on multiple depths', () => {
    // First depth of iteration will remove the handler, should not stop second depth.
    let observer1Called = 0;
    let iterations = 0;
    const observer1 = () => {
      observer1Called++;
    };
    const secondRemove = observable.add(observer1);
    observable.add(() => {
      iterations++;
      if (iterations == 1) {
        secondRemove();
        observable.fire();
      }
    });

    // At this point handlers are: [increaseByOne, removePreviousHandler]
    // When firing the first time, handler should not be removed until the end.
    observable.fire();
    expect(observer1Called).to.equal(2);
    expect(iterations).to.equal(2);

    // When firing again, handler should have been removed.
    observable.fire();
    expect(observer1Called).to.equal(2);
    expect(iterations).to.equal(3);
  });
});
