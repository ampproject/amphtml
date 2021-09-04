import {CanPlay, CanRender, LoadingProp} from '#preact/contextprops';

describes.sandboxed('contextprops - common props', {}, () => {
  describe('CanRender', () => {
    it('check config', () => {
      expect(CanRender.defaultValue).to.be.true;
      expect(CanRender.deps).to.have.lengthOf(0);
    });

    it('should calc recursive', () => {
      expect(CanRender.recursive([true])).to.be.true;
      expect(CanRender.recursive([false])).to.be.false;

      expect(CanRender.recursive([true, true])).to.be.true;
      expect(CanRender.recursive([true, false])).to.be.false;
      expect(CanRender.recursive([false, false])).to.be.false;
    });

    it('should compute from the parent value', () => {
      expect(CanRender.compute(null, [true], /* parentValue */ true)).to.be
        .true;
      expect(CanRender.compute(null, [true], /* parentValue */ false)).to.be
        .false;
    });

    it('should compute from the onput', () => {
      const parentValue = true;
      expect(CanRender.compute(null, [], parentValue)).to.be.true;
      expect(CanRender.compute(null, [true], parentValue)).to.be.true;
      expect(CanRender.compute(null, [true, true], parentValue)).to.be.true;
      expect(CanRender.compute(null, [false], parentValue)).to.be.false;
      expect(CanRender.compute(null, [true, false], parentValue)).to.be.false;
    });
  });

  describe('CanPlay', () => {
    it('check config', () => {
      expect(CanPlay.defaultValue).to.be.true;
      expect(CanPlay.deps).to.deep.equal([CanRender]);
    });

    it('should calc recursive', () => {
      expect(CanPlay.recursive([true])).to.be.true;
      expect(CanPlay.recursive([false])).to.be.false;

      expect(CanPlay.recursive([true, true])).to.be.true;
      expect(CanPlay.recursive([true, false])).to.be.false;
      expect(CanPlay.recursive([false, false])).to.be.false;
    });

    it('should compute from the parent value', () => {
      const canRender = true;
      expect(CanPlay.compute(null, [true], /* parentValue */ true, canRender))
        .to.be.true;
      expect(CanPlay.compute(null, [true], /* parentValue */ false, canRender))
        .to.be.false;
    });

    it('should compute from the canRender dep', () => {
      const parentValue = true;
      expect(CanPlay.compute(null, [true], parentValue, /* canRender */ true))
        .to.be.true;
      expect(CanPlay.compute(null, [true], parentValue, /* canRender */ false))
        .to.be.false;
    });

    it('should compute from the onput', () => {
      const parentValue = true;
      const canRender = true;
      expect(CanPlay.compute(null, [], parentValue, canRender)).to.be.true;
      expect(CanPlay.compute(null, [true], parentValue, canRender)).to.be.true;
      expect(CanPlay.compute(null, [true, true], parentValue, canRender)).to.be
        .true;
      expect(CanPlay.compute(null, [false], parentValue, canRender)).to.be
        .false;
      expect(CanPlay.compute(null, [true, false], parentValue, canRender)).to.be
        .false;
    });
  });

  describe('LoadingProp', () => {
    it('check config', () => {
      expect(LoadingProp.defaultValue).to.equal('auto');
      expect(LoadingProp.deps).to.deep.equal([CanRender]);
    });

    it('should be always recursive', () => {
      expect(LoadingProp.recursive).to.be.true;
    });

    it('should compute from the parent value', () => {
      const canRender = true;
      const parentValue = 'lazy';
      expect(
        LoadingProp.compute(null, ['auto'], parentValue, canRender)
      ).to.equal('lazy');
      expect(
        LoadingProp.compute(null, ['eager'], parentValue, canRender)
      ).to.equal('eager');
    });

    it('should compute from the canRender dep', () => {
      const parentValue = 'auto';
      expect(
        LoadingProp.compute(null, ['auto'], parentValue, /* canRender */ true)
      ).to.equal('auto');
      expect(
        LoadingProp.compute(null, ['auto'], parentValue, /* canRender */ false)
      ).to.equal('lazy');
    });

    it('should compute from the onput', () => {
      const parentValue = 'auto';
      const canRender = true;
      expect(LoadingProp.compute(null, [], parentValue, canRender)).to.equal(
        'auto'
      );
      expect(
        LoadingProp.compute(null, ['auto'], parentValue, canRender)
      ).to.equal('auto');
      expect(
        LoadingProp.compute(null, ['lazy'], parentValue, canRender)
      ).to.equal('lazy');
      expect(
        LoadingProp.compute(null, ['auto', 'lazy'], parentValue, canRender)
      ).to.equal('lazy');
      expect(
        LoadingProp.compute(null, ['eager', 'lazy'], parentValue, canRender)
      ).to.equal('eager');
      expect(
        LoadingProp.compute(null, ['eager', 'unload'], parentValue, canRender)
      ).to.equal('unload');
    });
  });
});
