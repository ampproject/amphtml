import {
  BinarySearchPreference,
  BinarySearchStop,
  binarySearch,
} from '../binary-search';

describes.sandboxed('binarySearch', {}, () => {
  const {NEXT, PREV} = BinarySearchPreference;
  const {LEFT, RIGHT} = BinarySearchStop;

  /**
   * @param {!Array<number>} arr
   * @param {number} target
   * @param {BinarySearchStop=} stop
   * @param {BinarySearchPreference=} preference
   */
  function arrayBinarySearch(arr, target, stop, preference) {
    return binarySearch(
      0,
      arr.length,
      (index) => {
        return target - arr[index];
      },
      stop,
      preference
    );
  }

  it('should find existing items', () => {
    const arr = [1, 15, 17, 42, 99, 201, 401];
    const results = arr.map((val) => arrayBinarySearch(arr, val));

    expect(results).to.have.ordered.members([0, 1, 2, 3, 4, 5, 6]);
  });

  describe('BinarySearchPreference', () => {
    it('should return the greater index for HIGH', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => {
        return arrayBinarySearch(arr, val - 1, undefined, NEXT);
      });

      expect(results).to.have.ordered.members([-1, -2, -3, -4, -5, -6, -7]);
    });

    it('should ignore HIGH for existing items', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => {
        return arrayBinarySearch(arr, val, undefined, NEXT);
      });

      expect(results).to.have.ordered.members([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should return the lower index for LOW', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => {
        return arrayBinarySearch(arr, val + 1, undefined, PREV);
      });

      expect(results).to.have.ordered.members([-1, -2, -3, -4, -5, -6, -7]);
    });

    it('should ignore LOW for existing items', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => {
        return arrayBinarySearch(arr, val, undefined, PREV);
      });

      expect(results).to.have.ordered.members([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('BinarySearchStop', () => {
    it('should return the leftmost index for a LEFT stop', () => {
      const arr = [0, 1, 2, 2, 2, 3, 4];
      expect(arrayBinarySearch(arr, 2, LEFT)).to.equal(2);
    });

    it('should ignore LEFT for existing items', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => arrayBinarySearch(arr, val, LEFT));

      expect(results).to.have.ordered.members([0, 1, 2, 3, 4, 5, 6]);
    });

    it('should return the first matching index by default', () => {
      const arr = [0, 1, 2, 2, 2, 3, 4];
      expect(arrayBinarySearch(arr, 2)).to.equal(3);
    });

    it('should return the rightmost index for a RIGHT stop', () => {
      const arr = [0, 1, 2, 2, 2, 3, 4];
      expect(arrayBinarySearch(arr, 2, RIGHT)).to.equal(4);
    });

    it('should ignore RIGHT for existing items', () => {
      const arr = [1, 15, 17, 42, 99, 201, 401];
      const results = arr.map((val) => arrayBinarySearch(arr, val, RIGHT));

      expect(results).to.have.ordered.members([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('boundary conditions', () => {
    it('should return the first index for smaller values', () => {
      expect(arrayBinarySearch([1, 3], 0)).to.equal(-1);
    });

    it('should find the lower element', () => {
      expect(arrayBinarySearch([1, 3], 1)).to.equal(0);
    });

    it('should return the index upper index if no preference', () => {
      expect(arrayBinarySearch([1, 3], 2)).to.equal(-2);
    });

    it('should find the upper element', () => {
      expect(arrayBinarySearch([1, 3], 3)).to.equal(1);
    });

    it('should return the past the high index for larger values', () => {
      expect(arrayBinarySearch([1, 3], 4)).to.equal(-3);
    });

    describe('low preference', () => {
      it('should return the first index for smaller values', () => {
        expect(arrayBinarySearch([1, 3], 0, undefined, PREV)).to.satisfy(
          (i) => {
            return Object.is(i, -0);
          }
        );
      });

      it('should find the lower element', () => {
        expect(arrayBinarySearch([1, 3], 1, undefined, PREV)).to.satisfy(
          (i) => {
            return Object.is(i, +0);
          }
        );
      });

      it('should return lower index for the low preference', () => {
        expect(arrayBinarySearch([1, 3], 2, undefined, PREV)).to.equal(-1);
      });

      it('should find the upper element', () => {
        expect(arrayBinarySearch([1, 3], 3, undefined, PREV)).to.equal(1);
      });

      it('should return the upper index for larger values', () => {
        expect(arrayBinarySearch([1, 3], 4, undefined, PREV)).to.equal(-2);
      });
    });

    describe('high preference', () => {
      it('should return the first index for smaller values', () => {
        expect(arrayBinarySearch([1, 3], 0, undefined, NEXT)).to.equal(-1);
      });

      it('should find the lower element', () => {
        expect(arrayBinarySearch([1, 3], 1, undefined, NEXT)).to.equal(0);
      });

      it('should return upper index for the low preference', () => {
        expect(arrayBinarySearch([1, 3], 2, undefined, NEXT)).to.equal(-2);
      });

      it('should find the upper element', () => {
        expect(arrayBinarySearch([1, 3], 3, undefined, NEXT)).to.equal(1);
      });

      it('should return the past the upper index for larger values', () => {
        expect(arrayBinarySearch([1, 3], 4, undefined, NEXT)).to.equal(-3);
      });
    });
  });
});
