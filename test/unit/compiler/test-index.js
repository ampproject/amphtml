import '#compiler';

describes.sandboxed('compile', {}, () => {
  it('compile function should be added to global', () => {
    expect(globalThis['compile']).ok;
  });

  it('should throw if provided invalid input', () => {
    const compile = globalThis['compile'];
    const errorMsg = /Must provide either document or nodes/;

    expect(() => compile()).throw(errorMsg);
    expect(() => compile({})).throw(errorMsg);
    expect(() => compile({unknown: {}})).throw(errorMsg);
    expect(() => compile({versions: []})).throw(errorMsg);
  });

  it('should return compiled document', () => {
    const compile = globalThis['compile'];
    const document = {
      root: 0,
      tree: [{tagid: 92, children: []}],
      'quirks_mode': false,
    };
    expect(compile({document})).to.deep.equal({document});
  });

  it('should return compiled nodes', () => {
    const compile = globalThis['compile'];
    const nodes = [
      {tagid: 1, value: 'a', children: [], attributes: []},
      {tagid: 7, value: 'b', children: [], attributes: []},
    ];
    expect(compile({nodes})).to.deep.equal({nodes});
  });
});
