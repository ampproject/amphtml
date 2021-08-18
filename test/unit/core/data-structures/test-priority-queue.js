import {PriorityQueue} from '#core/data-structures/priority-queue';

describes.sandboxed('data structures - PriorityQueue', {}, (env) => {
  let pq;

  beforeEach(() => {
    pq = new PriorityQueue();
  });

  /**
   * @param {PriorityQueue<T>} pq
   * @return {Array<T>}
   */
  function toArray(pq) {
    const array = [];
    while (pq.length) {
      array.push(pq.dequeue());
    }
    return array;
  }

  it('should return the correct length of the queue', () => {
    expect(pq.length).to.equal(0);
    pq.enqueue('a', 0);
    pq.enqueue('b', 1);
    expect(pq.length).to.equal(2);
    pq.dequeue();
    expect(pq.length).to.equal(1);
    pq.dequeue();
    expect(pq.length).to.equal(0);
  });

  it('should support enqueueing arbitrary data types', () => {
    pq.enqueue('abc', 0);
    pq.enqueue(123, 0);
    pq.enqueue(['x', 'y'], 0);
    pq.enqueue({foo: 'bar'}, 0);
    expect(toArray(pq)).to.deep.equal(['abc', 123, ['x', 'y'], {foo: 'bar'}]);
  });

  it('should support peeking at the max priority item', () => {
    pq.enqueue('a', 0);
    pq.enqueue('b', 10);
    pq.enqueue('c', 5);
    expect(pq.peek()).to.equal('b');
  });

  it('should dequeue items in descending priority order', () => {
    pq.enqueue('c', 0);
    pq.enqueue('a', Number.POSITIVE_INFINITY);
    pq.enqueue('d', -4);
    pq.enqueue('b', 200);
    pq.enqueue('e', Number.NEGATIVE_INFINITY);
    expect(toArray(pq)).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
  });

  it('should dequeue items with same priority in FIFO order', () => {
    pq.enqueue('b', 1);
    pq.enqueue('a', 2);
    pq.enqueue('c', 1);
    pq.enqueue('e', 0);
    pq.enqueue('d', 1);
    expect(toArray(pq)).to.deep.equal(['a', 'b', 'c', 'd', 'e']);
  });

  it('should return null when dequeueing an empty queue', () => {
    expect(pq.dequeue()).to.be.null;
    expect(pq.length).to.equal(0);
  });

  it('should throw error when priority is NaN', () => {
    expect(() => {
      pq.enqueue(NaN);
    }).to.throw(Error);
  });

  it('should iterate through queue', () => {
    const spy = env.sandbox.spy();
    pq.enqueue('p', 1);
    pq.enqueue('m', 2);
    pq.enqueue('a', 3);
    pq.forEach((letter) => {
      spy(letter);
    });
    expect(spy.firstCall).to.be.calledWith('a');
    expect(spy.secondCall).to.be.calledWith('m');
    expect(spy.thirdCall).to.be.calledWith('p');
  });
});
