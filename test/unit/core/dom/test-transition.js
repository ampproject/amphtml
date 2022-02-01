import {
  concat,
  numeric,
  px,
  scale,
  setStyles,
  translate,
} from '#core/dom/transition';

describes.sandboxed('DOM - transition helpers', {}, () => {
  const numericLow = numeric(0, 10);
  const numericHigh = numeric(20, 30);
  const scaling = scale(numericLow);
  const translation = translate(numericLow, numericHigh);

  describe('concat', () => {
    it('should concat two string transitions', () => {
      const func = concat([translation, scaling]);

      expect(func(0, false)).to.equal('translate(0px, 20px) scale(0)');
      expect(func(0.5, false)).to.equal('translate(5px, 25px) scale(5)');
      expect(func(1, true)).to.equal('translate(10px, 30px) scale(10)');
    });

    it('should handle single transitions', () => {
      const func = concat([translation]);

      expect(func(0, false)).to.equal('translate(0px, 20px)');
      expect(func(0.5, false)).to.equal('translate(5px, 25px)');
      expect(func(1, true)).to.equal('translate(10px, 30px)');
    });

    it('should handle empty input', () => {
      const func = concat([]);

      expect(func(0, false)).to.equal('');
      expect(func(0.5, false)).to.equal('');
      expect(func(1, true)).to.equal('');
    });

    it('should ignore non-string transitions', () => {
      const func = concat([translation, numericLow]);

      expect(func(0, false)).to.equal('translate(0px, 20px)');
      expect(func(0.5, false)).to.equal('translate(5px, 25px)');
      expect(func(1, true)).to.equal('translate(10px, 30px)');
    });

    it('should support other delimeters', () => {
      const func = concat([px(numericLow), px(numericHigh)], ', ');

      expect(func(0, false)).to.equal('0px, 20px');
      expect(func(0.5, false)).to.equal('5px, 25px');
      expect(func(1, true)).to.equal('10px, 30px');
    });
  });

  it('setStyles', () => {
    const element = document.createElement('div');
    const func = setStyles(element, {
      width: px((n) => n * 100 + 1),
      height: px((n) => n * 100 + 2),
    });

    func(0);
    expect(element.style.width).to.equal('1px');
    expect(element.style.height).to.equal('2px');

    func(0.2);
    expect(element.style.width).to.equal('21px');
    expect(element.style.height).to.equal('22px');

    func(0.9);
    expect(element.style.width).to.equal('91px');
    expect(element.style.height).to.equal('92px');

    func(1);
    expect(element.style.width).to.equal('101px');
    expect(element.style.height).to.equal('102px');
  });

  it('numeric', () => {
    let func = numeric(2, 10);
    expect(func(0)).to.equal(2);
    expect(func(0.3)).to.be.closeTo(4.4, 1e-3);
    expect(func(0.6)).to.be.closeTo(6.8, 1e-3);
    expect(func(0.9)).to.be.closeTo(9.2, 1e-3);
    expect(func(1)).to.equal(10);

    func = numeric(2, -10);
    expect(func(0)).to.equal(2);
    expect(func(0.3)).to.be.closeTo(-1.6, 1e-3);
    expect(func(0.6)).to.be.closeTo(-5.2, 1e-3);
    expect(func(0.9)).to.be.closeTo(-8.8, 1e-3);
    expect(func(1)).to.equal(-10);
  });

  it('px', () => {
    const func = px(numericLow);
    expect(func(0)).to.equal('0px');
    expect(func(0.3)).to.equal('3px');
    expect(func(0.6)).to.equal('6px');
    expect(func(0.9)).to.equal('9px');
    expect(func(1)).to.equal('10px');
  });

  it('should translate with X and Y', () => {
    let func = translate(numericLow, numericHigh);
    expect(func(0)).to.equal('translate(0px, 20px)');
    expect(func(0.3)).to.equal('translate(3px, 23px)');
    expect(func(0.6)).to.equal('translate(6px, 26px)');
    expect(func(0.9)).to.equal('translate(9px, 29px)');
    expect(func(1)).to.equal('translate(10px, 30px)');

    func = translate(
      () => '101vw',
      () => '201em'
    );
    expect(func(0)).to.equal('translate(101vw, 201em)');
  });

  it('should translate with only X', () => {
    let func = translate(numericLow);
    expect(func(0)).to.equal('translate(0px)');
    expect(func(0.3)).to.equal('translate(3px)');
    expect(func(0.6)).to.equal('translate(6px)');
    expect(func(0.9)).to.equal('translate(9px)');
    expect(func(1)).to.equal('translate(10px)');

    func = translate(() => '101vw');
    expect(func(0)).to.equal('translate(101vw)');
  });
});
