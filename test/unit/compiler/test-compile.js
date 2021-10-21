import {compile} from '#compiler/compile';

describes.sandboxed('compile', {}, () => {
  it('should throw if provided invalid input', () => {
    const errorMsg = /Must provide either document or nodes/;

    expect(() => compile()).throw(errorMsg);
    expect(() => compile({})).throw(errorMsg);
    expect(() => compile({unknown: {}})).throw(errorMsg);
    expect(() => compile({versions: []})).throw(errorMsg);
  });

  it('should return compiled document', () => {
    const document = {
      root: 0,
      tree: [{tagid: 92, children: []}],
      'quirks_mode': false,
    };
    expect(compile({document})).to.deep.equal({document});
  });

  it('should return compiled nodes', () => {
    const nodes = [
      {tagid: 1, value: 'a', children: [], attributes: []},
      {tagid: 7, value: 'b', children: [], attributes: []},
    ];
    expect(compile({nodes})).to.deep.equal({nodes});
  });
});
