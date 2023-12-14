import {
  PositionObserver,
  getPositionObserver,
} from '#ads/inabox/position-observer';

import {layoutRectLtwh} from '#core/dom/layout/rect';

import {sleep} from '#testing/helpers';

describes.realWin('inabox-host:position-observer', {}, (env) => {
  let win;
  let observer;
  let target1;
  let target2;

  beforeEach(() => {
    win = env.win;

    const div = win.document.createElement('div');
    div.style.width = '200vw';
    div.style.height = '200vh';
    win.document.body.appendChild(div);

    win.innerWidth = 200;
    win.innerHeight = 300;

    observer = new PositionObserver(win);

    target1 = {
      getBoundingClientRect: () => layoutRectLtwh(1, 2, 30, 40),
      ownerDocument: {
        defaultView: win,
      },
    };

    target2 = {
      getBoundingClientRect: () => layoutRectLtwh(3, 4, 30, 40),
      ownerDocument: {
        defaultView: win,
      },
    };
  });

  it('observe should work', async () => {
    let position1 = {
      viewportRect: layoutRectLtwh(0, 0, 200, 300),
      targetRect: layoutRectLtwh(1, 2, 30, 40),
    };
    let position2 = {
      viewportRect: layoutRectLtwh(0, 0, 200, 300),
      targetRect: layoutRectLtwh(3, 4, 30, 40),
    };
    const callbackSpy11 = env.sandbox.stub();
    const callbackSpy12 = env.sandbox.stub();
    const callbackSpy21 = env.sandbox.stub();
    observer.observe(target1, callbackSpy11);
    expect(callbackSpy11).to.be.calledWith(position1);
    observer.observe(target1, callbackSpy12);
    expect(callbackSpy12).to.be.calledWith(position1);
    observer.observe(target2, callbackSpy21);
    expect(callbackSpy21).to.be.calledWith(position2);
    win.scrollTo(10, 20);
    await sleep(100);
    position1 = {
      viewportRect: layoutRectLtwh(10, 20, 200, 300),
      targetRect: layoutRectLtwh(1, 2, 30, 40),
    };
    position2 = {
      viewportRect: layoutRectLtwh(10, 20, 200, 300),
      targetRect: layoutRectLtwh(3, 4, 30, 40),
    };
    expect(callbackSpy11).to.be.calledWith(position1);
    expect(callbackSpy12).to.be.calledWith(position1);
    expect(callbackSpy21).to.be.calledWith(position2);
  });

  it('getTargetRect should work within nested iframes', () => {
    const iframe1 = win.document.createElement('iframe');
    const iframe2 = win.document.createElement('iframe');
    const iframe3 = win.document.createElement('iframe');
    const element = win.document.createElement('div');
    element.getBoundingClientRect = () => layoutRectLtwh(1, 2, 30, 40);
    win.document.body.appendChild(iframe1);
    iframe1.contentDocument.body.appendChild(iframe2);
    iframe2.contentDocument.body.appendChild(iframe3);
    iframe3.contentDocument.body.appendChild(element);
    iframe1.getBoundingClientRect = () => layoutRectLtwh(1, 2, 70, 80);
    iframe2.getBoundingClientRect = () => layoutRectLtwh(5, 6, 30, 40);
    iframe3.getBoundingClientRect = () => layoutRectLtwh(7, 8, 10, 20);
    expect(observer.getTargetRect(element)).to.deep.equal(
      layoutRectLtwh(14, 18, 30, 40)
    );
  });

  it('should get existing observer', () => {
    const observer1 = getPositionObserver(win);
    const observer2 = getPositionObserver(win);
    const observer3 = new PositionObserver(win);
    expect(observer1).to.equal(observer2);
    expect(observer2).to.not.equal(observer3);
  });
});
