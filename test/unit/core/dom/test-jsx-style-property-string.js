import {jsxStylePropertyString} from '#core/dom/jsx/style-property-string';

describes.sandboxed('jsxStylePropertyString', {}, () => {
  it('returns empty string with nullish', () => {
    expect(jsxStylePropertyString('a', null)).to.equal('');
    expect(jsxStylePropertyString('b', undefined)).to.equal('');
    expect(
      jsxStylePropertyString('c', null, /* isDimensional */ true)
    ).to.equal('');
    expect(
      jsxStylePropertyString('d', undefined, /* isDimensional */ true)
    ).to.equal('');
  });

  it('returns empty string with empty string', () => {
    expect(jsxStylePropertyString('a', '')).to.equal('');
    expect(jsxStylePropertyString('b', '')).to.equal('');
    expect(jsxStylePropertyString('c', '', /* isDimensional */ true)).to.equal(
      ''
    );
    expect(jsxStylePropertyString('d', '', /* isDimensional */ true)).to.equal(
      ''
    );
  });

  it('returns string value', () => {
    expect(jsxStylePropertyString('background', 'red')).to.equal(
      'background:red;'
    );
    expect(
      jsxStylePropertyString('background', 'red', /* isDimensional */ true)
    ).to.equal('background:red;');
  });

  it('returns non-dimensional number value as-is', () => {
    expect(jsxStylePropertyString('flex', 1)).to.equal('flex:1;');
    expect(jsxStylePropertyString('opacity', 0.5)).to.equal('opacity:0.5;');
  });

  it('returns dimensional number value with px', () => {
    expect(
      jsxStylePropertyString('width', 150, /* isDimensional */ true)
    ).to.equal('width:150px;');
    expect(
      jsxStylePropertyString('height', 321, /* isDimensional */ true)
    ).to.equal('height:321px;');
  });
});
