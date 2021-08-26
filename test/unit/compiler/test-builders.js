import {getBuilders} from '#compiler/builders';

describes.sandboxed('getBuilders', {}, () => {
  it('should return an empty list for empty component list', () => {
    const components = {};
    expect(getBuilders(components)).to.eql({});
  });

  it('should return eligible builtins when provided them as components', () => {
    const components = {'amp-layout': 'v0'};
    const builders = getBuilders(components);
    expect(builders).have.all.keys(['amp-layout']);
  });

  it('eligible component with ineligible version is not used', () => {
    const components = {'amp-fit-text': '1.0'};
    const builders = getBuilders(components);
    expect(builders).to.eql({});
  });

  it('should return eligible components', () => {
    const components = {'amp-fit-text': '0.1', 'amp-layout': 'v0'};
    const builders = getBuilders(components);
    expect(builders).have.all.keys(['amp-layout', 'amp-fit-text']);
  });
});
