import {assign} from '#polyfills/object-assign';

describes.sandboxed('Object.assign', {}, () => {
  it('should throw an error if target is null or undefined', () => {
    expect(() => assign(null, {a: 1})).to.throw(
      /Cannot convert undefined or null to object/
    );
    expect(() => assign(undefined, {a: 1})).to.throw(
      /Cannot convert undefined or null to object/
    );
  });

  it('should ignore null or undefined sources', () => {
    expect(assign({}, null, undefined)).to.deep.equal({});
    expect(assign({a: 1}, null, undefined)).to.deep.equal({a: 1});
  });

  it('should copy and override keys from source to target', () => {
    expect(assign({a: 1}, {a: 2, b: 3})).to.deep.equal({a: 2, b: 3});
    expect(assign({a: 1}, {b: 3})).to.deep.equal({a: 1, b: 3});
    expect(assign({a: 1}, {b: 3}, {a: 2}, {a: 4})).to.deep.equal({a: 4, b: 3});

    const target = {a: 1, d: 3};
    const source = {a: 2, c: 5};
    assign(target, source);
    expect(target).to.deep.equal({a: 2, c: 5, d: 3});
    expect(source).to.deep.equal({a: 2, c: 5});
  });
});
