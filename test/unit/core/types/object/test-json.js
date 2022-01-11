import {deepEquals, tryParseJson} from '#core/types/object/json';

describes.sandboxed('type helpers - objects - json', {}, () => {
  describe('tryParseJson', () => {
    it('should return object for valid json', () => {
      const json = '{"key": "value"}';
      const result = tryParseJson(json);
      expect(result.key).to.equal('value');
    });

    it('should not throw and return null for invalid json', () => {
      const json = '{"key": "val';
      expect(tryParseJson.bind(null, json)).to.not.throw();
      const result = tryParseJson(json);
      expect(result).to.be.null;
    });

    it('should call onFailed for invalid and not call for valid json', () => {
      let onFailedCalled = false;
      const validJson = '{"key": "value"}';
      tryParseJson(validJson, () => {
        onFailedCalled = true;
      });
      expect(onFailedCalled).to.be.false;

      const invalidJson = '{"key": "val';
      tryParseJson(invalidJson, (err) => {
        onFailedCalled = true;
        expect(err).to.exist;
      });
      expect(onFailedCalled).to.be.true;
    });
  });

  describe('deepEquals', () => {
    it('should throw on non-finite depth arg', () => {
      expect(() => {
        deepEquals({}, {}, Number.POSITIVE_INFINITY);
      }).to.throw(/Invalid depth/);
    });

    it('should handle null and empty objects', () => {
      expect(deepEquals(null, null)).to.be.true;

      expect(deepEquals({}, {})).to.be.true;
      expect(deepEquals({}, null)).to.be.false;

      expect(deepEquals([], [])).to.be.true;
      expect(deepEquals([], null)).to.be.false;
    });

    it('should check strict equality', () => {
      expect(deepEquals({x: 1}, {x: 1})).to.be.true;
      expect(deepEquals({x: false}, {x: false})).to.be.true;
      expect(deepEquals({x: 'abc'}, {x: 'abc'})).to.be.true;

      expect(deepEquals({x: ''}, {x: false})).to.be.false;
      expect(deepEquals({x: false}, {x: ''})).to.be.false;

      expect(deepEquals({x: ''}, {x: 0})).to.be.false;
      expect(deepEquals({x: 0}, {x: ''})).to.be.false;

      expect(deepEquals({x: 1}, {x: true})).to.be.false;
      expect(deepEquals({x: true}, {x: 1})).to.be.false;

      expect(deepEquals({x: 1}, {x: '1'})).to.be.false;
      expect(deepEquals({x: '1'}, {x: 1})).to.be.false;

      expect(deepEquals({x: undefined}, {x: null})).to.be.false;
      expect(deepEquals({x: null}, {x: undefined})).to.be.false;

      expect(deepEquals({x: {}}, {x: '[object Object]'})).to.be.false;
      expect(deepEquals({x: '[object Object]'}, {x: {}})).to.be.false;
    });

    it('should check deep equality in nested arrays and objects', () => {
      expect(deepEquals({x: {y: 1}}, {x: {y: 1}})).to.be.true;
      expect(deepEquals({x: {y: 1}}, {x: {}})).to.be.false;
      expect(deepEquals({x: {y: 1}}, {x: {y: 0}})).to.be.false;
      expect(deepEquals({x: {y: 1}}, {x: {y: 1, z: 2}})).to.be.false;

      expect(deepEquals({x: [1, 2, 3]}, {x: [1, 2, 3]})).to.be.true;
      expect(deepEquals({x: [1, 2, 3]}, {x: []})).to.be.false;
      expect(deepEquals({x: [1, 2, 3]}, {x: [1, 2, 3, 4]})).to.be.false;

      expect(deepEquals([1, 2, [3, 4]], [1, 2, [3, 4]])).to.be.true;
      expect(deepEquals([1, 2, []], [1, 2, []])).to.be.true;
      expect(deepEquals([1, 2, [3, 4]], [1, 2, [3, 4, 5]])).to.be.false;
    });

    it('should check array order', () => {
      expect(deepEquals([1, 2], [2, 1])).to.be.false;
      expect(deepEquals([1, 2, [3, 4]], [1, 2, [4, 3]])).to.be.false;
    });

    it('should not check object key order', () => {
      expect(deepEquals({x: 1, y: 2, z: 3}, {y: 2, z: 3, x: 1})).to.be.true;
    });

    it('should stop diving once depth arg is exceeded', () => {
      let depth = 0;
      expect(deepEquals(1, 1, depth)).to.be.true;
      expect(deepEquals('a', 'a', depth)).to.be.true;
      expect(deepEquals([], [], depth)).to.be.false;
      expect(deepEquals({}, {}, depth)).to.be.false;

      depth = 1;
      expect(deepEquals({x: 1}, {x: 1}, depth)).to.be.true;
      expect(deepEquals([1, 2], [1, 2], depth)).to.be.true;
      expect(deepEquals({x: {y: 1}}, {x: {y: 1}}, depth)).to.be.false;
      expect(deepEquals({x: []}, {x: []}, depth)).to.be.false;
    });
  });
});
