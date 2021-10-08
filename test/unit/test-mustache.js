import mustache from '#third_party/mustache/mustache';

describes.sandboxed('Mustache', {}, () => {
  let savedSanitizer;

  beforeEach(() => {
    savedSanitizer = mustache.sanitizeUnescaped;
    mustache.setUnescapedSanitizer(function (value) {
      return value.toUpperCase();
    });
  });

  afterEach(() => {
    mustache.setUnescapedSanitizer(savedSanitizer);
  });

  it('should escape html', () => {
    expect(mustache.render('{{value}}', {value: '<b>abc</b>'})).to.equal(
      '&lt;b&gt;abc&lt;&#x2F;b&gt;'
    );
  });

  it('should transform unescaped html', () => {
    expect(mustache.render('{{{value}}}', {value: '<b>abc</b>'})).to.equal(
      '<B>ABC</B>'
    );
  });

  it('should only expand own properties', () => {
    const parent = {value: 'bc'};
    const child = Object.create(parent);
    const container = {parent, child};
    expect(mustache.render('a{{value}}', parent)).to.equal('abc');
    expect(mustache.render('a{{value}}', child)).to.equal('a');
    expect(mustache.render('a{{parent.value}}', container)).to.equal('abc');
    expect(mustache.render('a{{child.value}}', container)).to.equal('a');
  });

  it('should NOT allow calls to builtin functions', () => {
    // Calls on x.pop in classical Mustache would lead to builtin call and
    // mutate on the 't' object. Here we will not allow it. We explicitly
    // prohibit such calls.
    const obj = {
      't': {
        '0': '0',
        '1': '1',
        'length': 2,
        'x': [],
      },
    };
    expect(
      mustache.render(
        '{{#t}}{{x.pop}}X{{x.pop}}{{/t}}{{#t}}{{0}}Y{{1}}{{/t}}',
        obj
      )
    ).to.equal('X0Y1');
  });

  it('should NOT allow delimiter substituion', () => {
    expect(
      mustache.render('{{value}}{{=<% %>=}}<% value %>', {
        value: 'abc',
      })
    ).to.equal('abc<% value %>');
  });
});
