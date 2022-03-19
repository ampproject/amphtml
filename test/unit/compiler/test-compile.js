import {compile} from '#compiler/compile';

describes.sandboxed('compile', {}, () => {
  it('should throw if provided invalid input', () => {
    const errorMsg =
      /Must provide component_versions and either document or nodes/;

    expect(() => compile()).throw(errorMsg);
    expect(() => compile({})).throw(errorMsg);
    expect(() => compile({unknown: {}})).throw(errorMsg);
    expect(() => compile({component_versions: []})).throw(errorMsg); // eslint-disable-line local/camelcase
    expect(() => compile({nodes: []})).throw(errorMsg);
    expect(() => compile({document: {}})).throw(errorMsg);
  });

  it('should return compiled document', () => {
    const document = {
      root: 0,
      tree: [{tagid: 92, children: []}],
      'quirks_mode': false,
    };

    // eslint-disable-next-line local/camelcase
    expect(compile({document, component_versions: []})).to.deep.equal({
      document,
    });
  });

  it('should return compiled nodes', () => {
    const nodes = [
      {tagid: 1, value: 'a'},
      {tagid: 7, value: 'b'},
    ];

    // eslint-disable-next-line local/camelcase
    expect(compile({nodes, component_versions: []})).to.deep.equal({nodes});
  });
});
