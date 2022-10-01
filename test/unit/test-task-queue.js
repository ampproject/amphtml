import {TaskQueue} from '#service/task-queue';

describes.sandboxed('TaskQueue', {}, (env) => {
  let clock;
  let queue;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    queue = new TaskQueue();
  });

  it('should enqueue and dequeue', () => {
    clock.tick(1000);
    expect(queue.getSize()).to.equal(0);
    expect(queue.getLastEnqueueTime()).to.equal(0);
    expect(queue.getLastDequeueTime()).to.equal(0);

    queue.enqueue({id: '1'});
    expect(queue.getTaskById('1').id).to.equal('1');
    expect(queue.getSize()).to.equal(1);
    expect(queue.getLastEnqueueTime()).to.equal(1000);
    expect(queue.getLastDequeueTime()).to.equal(0);

    allowConsoleError(() => {
      expect(() => {
        queue.enqueue({id: '1'});
      }).to.throw(/Task already enqueued/);
    });

    queue.dequeue({id: '1'});
    expect(queue.getTaskById('1')).to.equal(null);
    expect(queue.getSize()).to.equal(0);
    expect(queue.getLastEnqueueTime()).to.equal(1000);
    expect(queue.getLastDequeueTime()).to.equal(1000);
  });

  it('should perform score-based peek', () => {
    queue.enqueue({id: 'A', v: 0});
    queue.enqueue({id: 'B', v: 2});
    queue.enqueue({id: 'C', v: 1});

    const task = queue.peek((task) => 10 - task.v);
    expect(task.id).to.equal('B');
  });
});
