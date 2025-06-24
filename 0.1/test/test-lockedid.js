import {LockedId} from '../lockedid';

describes.realWin('LockedId', {amp: false}, () => {
  let result;
  beforeEach(() => {
    result = new LockedId().getLockedIdData();
  });

  it('should return an array with correct number of items', () => {
    expect(result).to.be.an('array');
    expect(result).to.have.length(7);
  });

  it('should include valid timezone format', () => {
    expect(result[0]).to.match(/^[+-]\d{2}$/);
  });

  it('should include canvas print data URI', () => {
    const canvasData = result[1];
    expect(canvasData).to.be.a('string');
    expect(canvasData).to.match(/^data:image\/png;base64,/);
  });

  it('should include GPU info with tilde separator', () => {
    const gpuInfo = result[2];
    expect(gpuInfo).to.be.a('string');
    expect(gpuInfo).to.include('~');
  });

  it('should include navigator info', () => {
    const data = result;
    expect(data[3]).to.equal(navigator.language);
    expect(data[4]).to.equal(navigator.languages.join(','));
    expect(data[5]).to.be.oneOf([
      navigator.systemLanguage,
      window.navigator.language,
    ]);
    expect(data[6]).to.equal(navigator.hardwareConcurrency);
  });
});
