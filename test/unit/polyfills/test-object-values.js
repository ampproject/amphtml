import {values} from '#polyfills/object-values';

describes.sandboxed('Object.values', {}, () => {
  it('should disallow null and undefined', () => {
    expect(() => values(null)).to.throw();
    expect(() => values(undefined)).to.throw();
  });

  it('should allow primitives', () => {
    expect(values(1)).to.deep.equal([]);
    expect(values('A')).to.deep.equal(['A']);
    expect(values(true)).to.deep.equal([]);
    expect(values(false)).to.deep.equal([]);
  });

  it('should return values of objects', () => {
    expect(values({a: 1, b: 2, c: 1})).to.deep.equal([1, 2, 1]);
  });
});
