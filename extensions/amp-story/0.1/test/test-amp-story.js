import '../amp-story';

describes.realWin('amp-story', {
  amp: {
    extensions: ['amp-story'],
  },
}, env => {

  let win;
  let element;

  beforeEach(() => {
    win = env.win;
    element = win.document.createElement('amp-story');
    win.document.body.appendChild(element);
  });

  it('passes', () => {});
});
