import {LoadingSpinner} from '../loading-spinner';

describes.realWin('loading-spinner', {}, (env) => {
  let win;
  let loadingSpinner;

  beforeEach(() => {
    win = env.win;
    loadingSpinner = new LoadingSpinner(win.document);
  });

  it('should build the loading spinner', () => {
    const loadingSpinnerEl = loadingSpinner.build();
    expect(loadingSpinnerEl.className).to.contain('i-amphtml-story-spinner');
  });

  it('should be hidden by default', () => {
    const loadingSpinnerEl = loadingSpinner.build();

    expect(loadingSpinnerEl).not.to.have.attribute('active');
    expect(loadingSpinnerEl).to.have.attribute('aria-hidden');
    expect(loadingSpinnerEl.getAttribute('aria-hidden')).to.equal('true');
  });

  it('should toggle the loading spinner', () => {
    const loadingSpinnerEl = loadingSpinner.build();
    loadingSpinner.toggle(true);

    expect(loadingSpinnerEl).to.have.attribute('active');
    expect(loadingSpinnerEl).to.have.attribute('aria-hidden');
    expect(loadingSpinnerEl.getAttribute('aria-hidden')).to.equal('false');
  });
});
