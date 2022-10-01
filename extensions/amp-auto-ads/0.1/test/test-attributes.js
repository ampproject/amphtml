import {Attributes, getAttributesFromConfigObj} from '../attributes';

describes.sandboxed('attributes', {}, () => {
  it('should ignore attributes field if an array', () => {
    const configObj = {
      attributes: ['val1', 'val2'],
    };

    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({});
  });

  it('should get only allowlisted attributes', () => {
    const configObj = {
      attributes: {
        'not-allowed': 'val1',
        'type': 'val2',
        'layout': 'val3',
        '-key': 'val4',
        'data-something': 'val5',
        'data-1234': 'val6',
      },
    };

    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({
      'type': 'val2',
      'layout': 'val3',
      'data-something': 'val5',
      'data-1234': 'val6',
    });
  });

  it('should get sticky ad attributes', () => {
    const configObj = {
      stickyAdAttributes: {
        'data-no-fill': 'val1',
      },
    };

    expect(
      getAttributesFromConfigObj(configObj, Attributes.STICKY_AD_ATTRIBUTES)
    ).to.deep.equal({
      'data-no-fill': 'val1',
    });
  });

  it('should accept number values', () => {
    const configObj = {
      attributes: {
        'data-key': 1,
      },
    };
    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({
      'data-key': '1',
    });
  });

  it('should accept string values', () => {
    const configObj = {
      attributes: {
        'data-key': 'one',
      },
    };
    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({
      'data-key': 'one',
    });
  });

  it('should accept boolean values', () => {
    const configObj = {
      attributes: {
        'data-key1': true,
        'data-key2': false,
      },
    };
    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({
      'data-key1': 'true',
      'data-key2': 'false',
    });
  });

  it('should not accept non-(number, string or boolean values)', () => {
    const configObj = {
      attributes: {
        'data-key1': {},
        'data-key2': [],
      },
    };
    expect(
      getAttributesFromConfigObj(configObj, Attributes.BASE_ATTRIBUTES)
    ).to.deep.equal({});
  });
});
