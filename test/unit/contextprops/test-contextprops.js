/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {CanPlay, CanRender, LoadingProp} from '../../../src/contextprops';

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
