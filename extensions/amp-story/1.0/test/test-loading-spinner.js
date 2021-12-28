import {renderLoadingSpinner, toggleLoadingSpinner} from '../loading-spinner';

describes.realWin('loading-spinner', {}, () => {
  let loadingSpinnerEl;

  beforeEach(() => {
    loadingSpinnerEl = renderLoadingSpinner();
  });

  it('should build the loading spinner', () => {
    expect(loadingSpinnerEl.className).to.contain('i-amphtml-story-spinner');
  });

  it('should be hidden by default', () => {
    expect(loadingSpinnerEl).not.to.have.attribute('active');
    expect(loadingSpinnerEl).to.have.attribute('aria-hidden');
    expect(loadingSpinnerEl.getAttribute('aria-hidden')).to.equal('true');
  });

  it('should toggle the loading spinner', () => {
    toggleLoadingSpinner(loadingSpinnerEl, true);

    expect(loadingSpinnerEl).to.have.attribute('active');
    expect(loadingSpinnerEl).to.have.attribute('aria-hidden');
    expect(loadingSpinnerEl.getAttribute('aria-hidden')).to.equal('false');
  });
});
