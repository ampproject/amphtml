import {
  LayoutType,
  getAutoConfig,
  getPubControlConfig,
} from '#ads/google/a4a/shared/content-recommendation';

describes.sandboxed('getAutoConfig', {}, function () {
  it('should use image_stacked on wide slots', function () {
    const runTest = (availableWidth, expectedWidth, expectedHeight) => {
      expect(
        getAutoConfig(availableWidth, /* isMobile= */ false)
      ).to.deep.equal({
        layoutType: LayoutType.IMAGE_STACKED,
        numberOfColumns: 4,
        numberOfRows: 2,
        slotWidth: expectedWidth,
        slotHeight: expectedHeight,
      });
    };
    runTest(
      /* availableWidth= */ 1440,
      /* expectedWidth= */ 1200,
      /* expectedHeight= */ 600
    );
    runTest(
      /* availableWidth= */ 1200,
      /* expectedWidth= */ 1200,
      /* expectedHeight= */ 600
    );
    runTest(
      /* availableWidth= */ 800,
      /* expectedWidth= */ 800,
      /* expectedHeight= */ 480
    );
    runTest(
      /* availableWidth= */ 500,
      /* expectedWidth= */ 500,
      /* expectedHeight= */ 350
    );
    runTest(
      /* availableWidth= */ 468,
      /* expectedWidth= */ 468,
      /* expectedHeight= */ 327
    );
  });

  it('should use mobile_banner_image_sidebyside on narrow slots on mobile', function () {
    const runTest = (availableWidth, expectedWidth, expectedHeight) => {
      expect(getAutoConfig(availableWidth, /* isMobile= */ true)).to.deep.equal(
        {
          layoutType: LayoutType.MOBILE_BANNER_IMAGE_SIDEBYSIDE,
          numberOfColumns: 1,
          numberOfRows: 12,
          slotWidth: expectedWidth,
          slotHeight: expectedHeight,
        }
      );
    };
    runTest(
      /* availableWidth= */ 467,
      /* expectedWidth= */ 467,
      /* expectedHeight= */ 1700
    );
    runTest(
      /* availableWidth= */ 414,
      /* expectedWidth= */ 414,
      /* expectedHeight= */ 1520
    );
    runTest(
      /* availableWidth= */ 360,
      /* expectedWidth= */ 360,
      /* expectedHeight= */ 1336
    );
    runTest(
      /* availableWidth= */ 320,
      /* expectedWidth= */ 320,
      /* expectedHeight= */ 1200
    );
    runTest(
      /* availableWidth= */ 300,
      /* expectedWidth= */ 300,
      /* expectedHeight= */ 1131
    );
    runTest(
      /* availableWidth= */ 200,
      /* expectedWidth= */ 200,
      /* expectedHeight= */ 791
    );
    runTest(
      /* availableWidth= */ 120,
      /* expectedWidth= */ 120,
      /* expectedHeight= */ 519
    );
  });

  it('should use image_sidebyside on narrow slots on desktop', function () {
    const runTest = (availableWidth, expectedWidth, expectedHeight) => {
      expect(
        getAutoConfig(availableWidth, /* isMobile= */ false)
      ).to.deep.equal({
        layoutType: LayoutType.IMAGE_SIDEBYSIDE,
        numberOfColumns: 1,
        numberOfRows: 13,
        slotWidth: expectedWidth,
        slotHeight: expectedHeight,
      });
    };
    runTest(
      /* availableWidth= */ 467,
      /* expectedWidth= */ 467,
      /* expectedHeight= */ 1606
    );
    runTest(
      /* availableWidth= */ 414,
      /* expectedWidth= */ 414,
      /* expectedHeight= */ 1424
    );
    runTest(
      /* availableWidth= */ 360,
      /* expectedWidth= */ 360,
      /* expectedHeight= */ 1238
    );
    runTest(
      /* availableWidth= */ 320,
      /* expectedWidth= */ 320,
      /* expectedHeight= */ 1100
    );
    runTest(
      /* availableWidth= */ 300,
      /* expectedWidth= */ 300,
      /* expectedHeight= */ 1032
    );
    runTest(
      /* availableWidth= */ 250,
      /* expectedWidth= */ 250,
      /* expectedHeight= */ 860
    );
    runTest(
      /* availableWidth= */ 200,
      /* expectedWidth= */ 200,
      /* expectedHeight= */ 688
    );
    runTest(
      /* availableWidth= */ 120,
      /* expectedWidth= */ 120,
      /* expectedHeight= */ 412
    );
  });
});

describes.sandboxed('getPubControlConfig', {}, function () {
  it('should use setting when only one provided', function () {
    const rawPubControlParams = {
      numberOfColumns: '4',
      numberOfRows: '2',
      layoutType: LayoutType.IMAGE_STACKED,
    };
    const runTest = (availableWidth, expectedWidth, expectedHeight) => {
      expect(
        getPubControlConfig(availableWidth, rawPubControlParams)
      ).to.deep.equal({
        layoutType: LayoutType.PUB_CONTROL_IMAGE_STACKED,
        numberOfColumns: 4,
        numberOfRows: 2,
        slotWidth: expectedWidth,
        slotHeight: expectedHeight,
      });
    };
    runTest(
      /* availableWidth= */ 1300,
      /* expectedWidth= */ 1300,
      /* expectedHeight= */ 513
    );
    runTest(
      /* availableWidth= */ 1200,
      /* expectedWidth= */ 1200,
      /* expectedHeight= */ 487
    );
    runTest(
      /* availableWidth= */ 800,
      /* expectedWidth= */ 800,
      /* expectedHeight= */ 382
    );
    runTest(
      /* availableWidth= */ 500,
      /* expectedWidth= */ 500,
      /* expectedHeight= */ 304
    );
    runTest(
      /* availableWidth= */ 400,
      /* expectedWidth= */ 400,
      /* expectedHeight= */ 278
    );
  });

  it('should use different settings for mobile and desktop when two provided', function () {
    const rawPubControlParams = {
      numberOfColumns: '1,4',
      numberOfRows: '3,2',
      layoutType: `${LayoutType.IMAGE_SIDEBYSIDE},${LayoutType.IMAGE_STACKED}`,
    };
    const expectedDesktopConfig = {
      layoutType: LayoutType.PUB_CONTROL_IMAGE_STACKED,
      numberOfColumns: 4,
      numberOfRows: 2,
    };
    const expectedMobileConfig = {
      layoutType: LayoutType.PUB_CONTROL_IMAGE_SIDEBYSIDE,
      numberOfColumns: 1,
      numberOfRows: 3,
    };
    const runTest = (
      availableWidth,
      expectedWidth,
      expectedHeight,
      expectedConfig
    ) => {
      expectedConfig.slotWidth = expectedWidth;
      expectedConfig.slotHeight = expectedHeight;
      expect(
        getPubControlConfig(availableWidth, rawPubControlParams)
      ).to.deep.equal(expectedConfig);
    };

    // Above 468px the logic should use desktop setting.
    runTest(
      /* availableWidth= */ 1300,
      /* expectedWidth= */ 1300,
      /* expectedHeight= */ 513,
      expectedDesktopConfig
    );
    runTest(
      /* availableWidth= */ 1200,
      /* expectedWidth= */ 1200,
      /* expectedHeight= */ 487,
      expectedDesktopConfig
    );
    runTest(
      /* availableWidth= */ 800,
      /* expectedWidth= */ 800,
      /* expectedHeight= */ 382,
      expectedDesktopConfig
    );
    runTest(
      /* availableWidth= */ 500,
      /* expectedWidth= */ 500,
      /* expectedHeight= */ 304,
      expectedDesktopConfig
    );

    // Below 468px the logic should use mobile setting.
    runTest(
      /* availableWidth= */ 400,
      /* expectedWidth= */ 400,
      /* expectedHeight= */ 333,
      expectedMobileConfig
    );
    runTest(
      /* availableWidth= */ 300,
      /* expectedWidth= */ 300,
      /* expectedHeight= */ 255,
      expectedMobileConfig
    );
  });

  it('should return different sizes for different layouts', function () {
    // sanity check that when publisher provides different layouts we use
    // apply different coefficients and get different ad slot sizes.
    const runTest = (layout, expectedHeight) => {
      const width = 800;
      const rawPubParams = {
        numberOfColumns: '4',
        numberOfRows: '2',
        layoutType: layout,
      };
      expect(getPubControlConfig(width, rawPubParams)).to.deep.equal({
        layoutType: 'pub_control_' + layout,
        numberOfColumns: 4,
        numberOfRows: 2,
        slotWidth: width,
        slotHeight: expectedHeight,
      });
    };

    runTest(LayoutType.IMAGE_SIDEBYSIDE, /* expectedHeight= */ 123);
    runTest(LayoutType.IMAGE_STACKED, /* expectedHeight= */ 382);
    runTest('text_card', /* expectedHeight= */ 184);
  });

  it('should reject invalid pub params', function () {
    const runTest = (pubControlParams, expectedErrorRegex) => {
      const coreConfig = getPubControlConfig(100, pubControlParams);
      expect(coreConfig.validationError).to.match(expectedErrorRegex);
    };
    // One of pub control params is missing.
    runTest(
      {numberOfRows: '1', numberOfColumns: '1'},
      /Tags .* should be set together/
    );
    runTest(
      {numberOfColumns: '1', layoutType: 'foo'},
      /Tags .* should be set together/
    );
    runTest(
      {numberOfRows: '1', layoutType: 'foo'},
      /Tags .* should be set together/
    );

    // Length of parameters doesn't match
    runTest(
      {numberOfRows: '1', numberOfColumns: '1', layoutType: 'foo,bar'},
      /Lengths of parameters .* must match/
    );
    runTest(
      {numberOfRows: '1', numberOfColumns: '1,2', layoutType: 'foo'},
      /Lengths of parameters .* must match/
    );
    runTest(
      {numberOfRows: '1,2', numberOfColumns: '1', layoutType: 'foo'},
      /Lengths of parameters .* must match/
    );

    // Length is more than 2.
    runTest(
      {
        numberOfRows: '1,2,3',
        numberOfColumns: '1,2,3',
        layoutType: 'foo,bar,baz',
      },
      /At most 2 parameters for each attribute are needed/
    );

    // Passed non-number for rows/columns.
    runTest(
      {numberOfRows: 'foo', numberOfColumns: '1', layoutType: 'foo'},
      /Wrong value 'foo' for/
    );
    runTest(
      {numberOfRows: '1', numberOfColumns: 'foo', layoutType: 'foo'},
      /Wrong value 'foo' for/
    );
  });

  it('limits number of columns if publisher chose too many', function () {
    const rawPubControlParams = {
      numberOfColumns: '5', // want 5 columns.
      numberOfRows: '2',
      layoutType: LayoutType.IMAGE_STACKED,
    };
    expect(getPubControlConfig(300, rawPubControlParams)).to.deep.equal({
      numberOfColumns: 3, // only 3 columns fit at the end.
      numberOfRows: 2,
      layoutType: LayoutType.PUB_CONTROL_IMAGE_STACKED,
      slotWidth: 300,
      slotHeight: 277,
    });
  });
});
