import {Curves_Enum, bezierCurve, getCurve} from '#core/data-structures/curve';

describes.sandboxed('data structures - Curve', {}, () => {
  it('bezierCurve', () => {
    let curve = bezierCurve(0.75, 0, 0.75, 0.9);
    expect(curve(0.2)).to.be.closeTo(0.024374631, 1e-6);
    expect(curve(0.6)).to.be.closeTo(0.317459494, 1e-6);
    expect(curve(0.9)).to.be.closeTo(0.905205002, 1e-6);

    curve = bezierCurve(0, 0, 0.58, 1);
    expect(curve(0.2)).to.be.closeTo(0.308366667, 1e-6);
    expect(curve(0.6)).to.be.closeTo(0.785139061, 1e-6);
    expect(curve(0.9)).to.be.closeTo(0.982973389, 1e-6);
  });

  it('getCurve on common curves', () => {
    // Null case.
    expect(getCurve(null)).to.equal(null);
    expect(getCurve(undefined)).to.equal(null);

    // Function is passed through.
    const func = () => {};
    expect(getCurve(func)).to.equal(func);

    // String is translated.
    expect(getCurve('linear')).to.equal(Curves_Enum.LINEAR);
    expect(getCurve('ease')).to.equal(Curves_Enum.EASE);
    expect(getCurve('ease-in')).to.equal(Curves_Enum.EASE_IN);
    expect(getCurve('ease-out')).to.equal(Curves_Enum.EASE_OUT);
    expect(getCurve('ease-in-out')).to.equal(Curves_Enum.EASE_IN_OUT);
  });

  it('getCurve on cubic-bezier curves', () => {
    expect(getCurve('cubic-bezier(1)')).to.equal(null);
    expect(getCurve('cubic-bezier(a)')).to.equal(null);
    expect(getCurve('cubic-bezier(0.4, 0, 0.2)')).to.equal(null);
    expect(getCurve('cubic-bezier(0.4, 0, 0.2, a)')).to.equal(null);

    const curveExpected = bezierCurve(0.4, 0, 0.2, 1);
    const curveGet = getCurve('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(curveExpected(0.2)).to.be.closeTo(curveGet(0.2), 1e-6);
    expect(curveExpected(0.6)).to.be.closeTo(curveGet(0.6), 1e-6);
    expect(curveExpected(0.9)).to.be.closeTo(curveGet(0.9), 1e-6);
  });
});
