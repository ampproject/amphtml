import {Animation} from '#utils/animation';

describes.sandboxed('Animation', {}, (env) => {
  let vsync;
  let vsyncTasks;
  let anim;
  let clock;
  let contextNode;

  beforeEach(() => {
    clock = env.sandbox.useFakeTimers();
    vsyncTasks = [];
    vsync = {
      canAnimate: () => true,
      createAnimTask: (unusedContextNode, task) => {
        return () => {
          vsyncTasks.push(task);
        };
      },
    };
    contextNode = document.createElement('div');
    anim = new Animation(contextNode, vsync);
  });

  afterEach(() => {
    expect(vsyncTasks.length).to.equal(0);
  });

  function runVsync() {
    const tasks = vsyncTasks.slice(0);
    vsyncTasks = [];
    tasks.forEach(function (task) {
      const state = {};
      if (task.measure) {
        task.measure(state);
      }
      task.mutate(state);
    });
  }

  it('animation', () => {
    let tr1 = -1;
    let tr2 = -1;
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      0.8
    );
    anim.add(
      0.2,
      (time) => {
        tr2 = time;
      },
      0.8
    );

    const ap = anim.start(1000);
    let resolveCalled = false;
    ap.resolve_ = () => {
      resolveCalled = true;
    };

    tr1 = tr2 = -1;
    runVsync();
    expect(tr1).to.equal(0);
    expect(tr2).to.equal(-1);

    tr1 = tr2 = -1;
    clock.tick(100); // 100
    runVsync();
    expect(tr1).to.be.closeTo(0.1 / 0.8, 1e-3);
    expect(tr2).to.equal(-1);

    tr1 = tr2 = -1;
    clock.tick(100); // 200
    runVsync();
    expect(tr1).to.be.closeTo(0.2 / 0.8, 1e-3);
    expect(tr2).to.equal(0);

    tr1 = tr2 = -1;
    clock.tick(100); // 300
    runVsync();
    expect(tr1).to.be.closeTo(0.3 / 0.8, 1e-3);
    expect(tr2).to.be.closeTo(0.1 / 0.8, 1e-3);

    tr1 = tr2 = -1;
    clock.tick(200); // 500
    runVsync();
    expect(tr1).to.be.closeTo(0.5 / 0.8, 1e-3);
    expect(tr2).to.be.closeTo(0.3 / 0.8, 1e-3);

    tr1 = tr2 = -1;
    clock.tick(200); // 700
    runVsync();
    expect(tr1).to.be.closeTo(0.7 / 0.8, 1e-3);
    expect(tr2).to.be.closeTo(0.5 / 0.8, 1e-3);

    tr1 = tr2 = -1;
    clock.tick(100); // 800
    runVsync();
    expect(tr1).to.equal(1);
    expect(tr2).to.be.closeTo(0.6 / 0.8, 1e-3);

    tr1 = tr2 = -1;
    clock.tick(100); // 900
    runVsync();
    expect(tr1).to.equal(-1);
    expect(tr2).to.be.closeTo(0.7 / 0.8, 1e-3);

    tr1 = tr2 = -1;
    expect(resolveCalled).to.equal(false);
    clock.tick(100); // 1000
    runVsync();
    expect(tr1).to.equal(-1);
    expect(tr2).to.equal(1, 1e-3);
    expect(resolveCalled).to.equal(true);

    tr1 = tr2 = -1;
    clock.tick(100); // 1100
    runVsync();
    expect(tr1).to.equal(-1);
    expect(tr2).to.equal(-1);
  });

  it('should animate out-of-bounds time', () => {
    let tr1 = -1;
    // Linear curve between -0.5 and 1.5
    const curve = (time) => {
      return time * 2 - 0.5;
    };
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      1,
      curve
    );

    anim.start(1000);

    tr1 = -1;
    runVsync();
    expect(tr1).to.equal(-0.5);

    tr1 = -1;
    clock.tick(500); // 500
    runVsync();
    expect(tr1).to.be.closeTo(0.5, 1e-3);

    tr1 = -1;
    clock.tick(400); // 900
    runVsync();
    expect(tr1).to.be.closeTo(1.3, 1e-3);

    clock.tick(100); // 1000
    runVsync();
    expect(tr1).to.equal(1);
  });

  it('halt freeze', () => {
    let tr1 = -1;
    let tr2 = -1;
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      0.8
    );
    anim.add(
      0.2,
      (time) => {
        tr2 = time;
      },
      0.8
    );

    const ap = anim.start(1000);
    let rejectCalled = false;
    ap.reject_ = () => {
      rejectCalled = true;
    };

    tr1 = tr2 = -1;
    runVsync();
    expect(tr1).to.equal(0);
    expect(tr2).to.equal(-1);

    tr1 = tr2 = -1;
    ap.halt(0);
    expect(tr1).to.equal(-1);
    expect(tr2).to.equal(-1);

    runVsync();
    expect(rejectCalled).to.equal(true);
  });

  it('halt reset', () => {
    let tr1 = -1;
    let tr2 = -1;
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      0.8
    );
    anim.add(
      0.2,
      (time) => {
        tr2 = time;
      },
      0.8
    );

    const ap = anim.start(1000);
    let rejectCalled = false;
    ap.reject_ = () => {
      rejectCalled = true;
    };

    tr1 = tr2 = -1;
    runVsync();
    expect(tr1).to.equal(0);
    expect(tr2).to.equal(-1);

    tr1 = tr2 = -1;
    ap.halt(-1);
    expect(tr1).to.equal(0);
    expect(tr2).to.equal(0);

    runVsync();
    expect(rejectCalled).to.equal(true);
  });

  it('halt forward', () => {
    let tr1 = -1;
    let tr2 = -1;
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      0.8
    );
    anim.add(
      0.2,
      (time) => {
        tr2 = time;
      },
      0.8
    );

    const ap = anim.start(1000);
    let rejectCalled = false;
    ap.reject_ = () => {
      rejectCalled = true;
    };

    tr1 = tr2 = -1;
    runVsync();
    expect(tr1).to.equal(0);
    expect(tr2).to.equal(-1);

    tr1 = tr2 = -1;
    ap.halt(1);
    expect(tr1).to.equal(1);
    expect(tr2).to.equal(1);

    runVsync();
    expect(rejectCalled).to.equal(true);
  });

  it('should NOT start animation when cannot animate', () => {
    let tr1 = -1;
    let tr2 = -1;
    anim.add(
      0,
      (time) => {
        tr1 = time;
      },
      0.8
    );
    anim.add(
      0.2,
      (time) => {
        tr2 = time;
      },
      0.8
    );
    vsync.canAnimate = () => false;

    const ap = anim.start(1000);
    expect(vsyncTasks).to.have.length(0);
    expect(ap.running_).to.be.false;
    return ap
      .then(
        () => {
          return 'SUCCESS';
        },
        () => {
          return 'ERROR';
        }
      )
      .then((response) => {
        expect(tr1).to.equal(-1);
        expect(tr2).to.equal(-1);
        expect(response).to.equal('ERROR');
      });
  });

  it('should halt-freeze animation when cannot animate', () => {
    anim.add(0, () => {}, 0.8);
    anim.add(0.2, () => {}, 0.8);

    const ap = anim.start(1000);
    let rejectCalled = false;
    ap.reject_ = () => {
      rejectCalled = true;
    };
    expect(vsyncTasks).to.have.length(1);
    expect(ap.running_).to.be.true;
    expect(rejectCalled).to.be.false;

    vsync.canAnimate = () => false;
    runVsync();
    expect(ap.running_).to.be.false;
    expect(rejectCalled).to.be.true;
  });
});
