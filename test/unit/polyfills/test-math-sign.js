import {sign} from '#polyfills/math-sign';

describes.sandboxed('Math.sign', {}, () => {
  it('returns 1 for positive x', () => {
    expect(sign(1)).to.equal(1);
    expect(sign(10)).to.equal(1);
    expect(sign(100)).to.equal(1);
    expect(sign(Infinity)).to.equal(1);
  });

  it('returns -1 for negative x', () => {
    expect(sign(-1)).to.equal(-1);
    expect(sign(-10)).to.equal(-1);
    expect(sign(-100)).to.equal(-1);
    expect(sign(-Infinity)).to.equal(-1);
  });

  it('returns 0 for 0', () => {
    expect(sign(0)).to.deep.equal(0);
  });

  it('returns -0 for -0', () => {
    expect(sign(-0)).to.deep.equal(-0);
  });

  it('returns NaN for NaN', () => {
    expect(sign(NaN)).to.deep.equal(NaN);
  });

  it('returns NaN for non-numbers', () => {
    expect(sign({})).to.deep.equal(NaN);
    expect(sign(function () {})).to.deep.equal(NaN);
    expect(sign('test1')).to.deep.equal(NaN);
    expect(sign('1test')).to.deep.equal(NaN);
  });
});
