import {install} from '#polyfills/array-includes';

describes.fakeWin('Array.includes', {}, (env) => {
  beforeEach(() => {
    env.win.Array = Array;
    install(env.win);
  });

  it('finds primitives when they are present', () => {
    const arrayWithPrimitives = [false, 17, 'hello world'];
    expect(arrayWithPrimitives.includes(17)).to.be.true;
    expect(arrayWithPrimitives.includes(28)).to.be.false;
    expect(arrayWithPrimitives.includes(false)).to.be.true;
    expect(arrayWithPrimitives.includes(true)).to.be.false;
    expect(arrayWithPrimitives.includes('hello world')).to.be.true;
    expect(arrayWithPrimitives.includes('google')).to.be.false;
  });

  it('finds objects when they are present', () => {
    const point = {x: 47, y: 8472};
    const arrayWithObject = [point];
    expect(arrayWithObject.includes(point)).to.be.true;
    // Same properties, different objects
    expect(arrayWithObject.includes({x: 47, y: 8472})).to.be.false;
  });

  it('finds NaN when NaN is present', () => {
    const arrayWithNaN = [NaN];
    expect(arrayWithNaN.includes(NaN)).to.be.true;
  });

  it('should only find null when null is desired', () => {
    const arrayWithNull = [null];
    const arrayWithUndefined = [undefined];
    expect(arrayWithNull.includes(null)).to.be.true;
    expect(arrayWithUndefined.includes(null)).to.be.false;
  });

  it('should only find undefined when undefined is desired', () => {
    const arrayWithNull = [null];
    const arrayWithUndefined = [undefined];
    expect(arrayWithUndefined.includes(undefined)).to.be.true;
    expect(arrayWithNull.includes(undefined)).to.be.false;
  });

  it('should treat 0 and -0 as equal', () => {
    const arrayWithZero = [0];
    const arrayWithNegativeZero = [-0];
    expect(arrayWithZero.includes(0)).to.be.true;
    expect(arrayWithZero.includes(-0)).to.be.true;
    expect(arrayWithNegativeZero.includes(0)).to.be.true;
    expect(arrayWithNegativeZero.includes(-0)).to.be.true;
  });

  it('should respect the fromIndex argument', () => {
    const arrayWithNumbers = [0, 1, 2, 3, 4, 5];
    expect(arrayWithNumbers.includes(2, 0)).to.be.true;
    expect(arrayWithNumbers.includes(2, 1)).to.be.true;
    expect(arrayWithNumbers.includes(2, 2)).to.be.true;
    expect(arrayWithNumbers.includes(2, 3)).to.be.false;
    expect(arrayWithNumbers.includes(2, 4)).to.be.false;
    expect(arrayWithNumbers.includes(2, 5)).to.be.false;
    expect(arrayWithNumbers.includes(2, 6)).to.be.false;

    expect(arrayWithNumbers.includes(2, -1)).to.be.false;
    expect(arrayWithNumbers.includes(2, -2)).to.be.false;
    expect(arrayWithNumbers.includes(2, -3)).to.be.false;
    expect(arrayWithNumbers.includes(2, -4)).to.be.true;
    expect(arrayWithNumbers.includes(2, -5)).to.be.true;
    expect(arrayWithNumbers.includes(2, -6)).to.be.true;
    expect(arrayWithNumbers.includes(2, -6)).to.be.true;
  });
});
