import {ControllerPromise} from '../../build-system/tasks/e2e/controller-promise';

describe('e2e expect', () => {
  describe('ControllerPromise', () => {
    it('should accept controller promises', async () => {
      const p = new ControllerPromise(Promise.resolve(5));
      await expect(p).to.equal(5);
    });

    it('should accept controller promises with sync waitForValue', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(() => getIncrementingValueFunction())
      );
      /*OK*/ expect(await p).to.equal(0); // expect the usual sync syntax to work
      await expect(await p).to.equal(0);
      await expect(p).to.equal(5);
    });

    it('should accept controller promises with async waitForValue', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(() =>
          getAsyncValueFunction(getIncrementingValueFunction())
        )
      );
      /*OK*/ expect(await p).to.equal(0);
      await expect(await p).to.equal(0);
      await expect(p).to.equal(5);
    });

    it('should accept `then`', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(() =>
          getAsyncValueFunction(getIncrementingValueFunction())
        )
      );

      const testPromise = p.then((x) => (x + 1) * 2);

      /*OK*/ expect(await testPromise).to.equal(2);
      await expect(await testPromise).to.equal(2);
      await expect(testPromise).to.equal(10);
    });

    it('should accept multiple `then`s', async () => {
      const p = new ControllerPromise(
        Promise.resolve(0),
        getWaitFunction(() =>
          getAsyncValueFunction(getIncrementingValueFunction())
        )
      );

      const testPromise = p.then((x) => (x + 1) * 2).then((x) => x + 1);

      /*OK*/ expect(await testPromise).to.equal(3);
      await expect(await testPromise).to.equal(3);
      await expect(testPromise).to.equal(11);
    });
  });

  describe('Chai API methods', () => {
    describe('a, an', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('message'),
          getWaitFunction(() => getArrayValueFunction('message'))
        );

        /*OK*/ expect(await p).to.be.a('string');
        await expect(p).to.be.a('string');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 'message'))
        );

        /*OK*/ expect(await p).to.be.a('null');
        await expect(p).to.be.a('string');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('message'),
          getWaitFunction(() => getArrayValueFunction(null, 'message'))
        );

        /*OK*/ expect(await p).to.not.be.a('null');
        await expect(p).to.not.be.a('null');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 'message'))
        );

        /*OK*/ expect(await p).to.be.a('null');
        await expect(p).to.not.be.a('null');
      });
    });

    describe('above, gt, greaterThan', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1))
        );

        /*OK*/ expect(await p).to.be.above(0);
        await expect(p).to.be.above(0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.above(0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.not.be.above(0);
        await expect(p).to.not.be.above(0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.be.above(0);
        await expect(p).to.not.be.above(0);
      });
    });

    describe('arguments, Arguments', () => {
      it('should work in the immediate positive case', async () => {
        function getArguments() {
          return arguments;
        }
        const p = new ControllerPromise(
          Promise.resolve(getArguments()),
          getWaitFunction(() => getArrayValueFunction(getArguments()))
        );

        /*OK*/ expect(await p).to.be.arguments;
        await expect(p).to.be.arguments;
      });

      it('should work in the eventual positive case', async () => {
        function getArguments() {
          return arguments;
        }
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, getArguments()))
        );

        /*OK*/ expect(await p).to.be.deep.equal({});
        await expect(p).to.be.arguments;
      });

      it('should work in the immediate negative case', async () => {
        function getArguments() {
          return arguments;
        }
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, getArguments()))
        );

        /*OK*/ expect(await p).to.not.be.arguments;
        await expect(p).to.not.be.arguments;
      });

      it('should work in the eventual negative case', async () => {
        function getArguments() {
          return arguments;
        }
        const p = new ControllerPromise(
          Promise.resolve(getArguments({})),
          getWaitFunction(() => getArrayValueFunction(getArguments(), {}))
        );

        /*OK*/ expect(await p).to.be.arguments;
        await expect(p).to.not.be.arguments;
      });
    });
    describe('below, lt, lessThan', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(-1),
          getWaitFunction(() => getArrayValueFunction(-1))
        );

        /*OK*/ expect(await p).to.be.below(0);
        await expect(p).to.be.below(0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, -1))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.below(0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, -1))
        );

        /*OK*/ expect(await p).to.not.be.below(0);
        await expect(p).to.not.be.below(0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(-1),
          getWaitFunction(() => getArrayValueFunction(-1, 0))
        );

        /*OK*/ expect(await p).to.be.below(0);
        await expect(p).to.not.be.below(0);
      });
    });
    describe('change, changes', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve());

        /*OK*/ expect(() => /*OK*/ expect(p).to.change({a: 0}, 'a')).to.throw(
          'ControllerPromise used with unsupported expectation'
        );
      });
    });
    describe('closeTo, approximately', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0.5),
          getWaitFunction(() => getArrayValueFunction(0.5))
        );

        /*OK*/ expect(await p).to.be.closeTo(1, 0.5);
        await expect(p).to.be.closeTo(1, 0.5);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 0.5))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.closeTo(1, 0.5);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 0.5))
        );

        /*OK*/ expect(await p).to.not.be.closeTo(1, 0.5);
        await expect(p).to.not.be.closeTo(1, 0.5);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0.5),
          getWaitFunction(() => getArrayValueFunction(0.5, 0))
        );

        /*OK*/ expect(await p).to.be.closeTo(1, 0.5);
        await expect(p).to.not.be.closeTo(1, 0.5);
      });
    });
    describe('decrease, decreases', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve());

        /*OK*/ expect(() => /*OK*/ expect(p).to.decrease({a: 0}, 'a')).to.throw(
          'ControllerPromise used with unsupported expectation'
        );
      });
    });
    describe('empty', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([]))
        );

        /*OK*/ expect(await p).to.be.empty;
        await expect(p).to.be.empty;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.deep.equal([0]);
        await expect(p).to.be.empty;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.not.be.empty;
        await expect(p).to.not.be.empty;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([], [0]))
        );

        /*OK*/ expect(await p).to.be.empty;
        await expect(p).to.not.be.empty;
      });
    });
    describe('eql, eqls (deep equal)', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: {b: 0}}),
          getWaitFunction(() => getArrayValueFunction({a: {b: 0}}))
        );

        /*OK*/ expect(await p).to.eql({a: {b: 0}});
        await expect(p).to.eql({a: {b: 0}});
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: {b: 0}}))
        );

        /*OK*/ expect(await p).to.eql({});
        await expect(p).to.eql({a: {b: 0}});
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: {b: 0}}))
        );

        /*OK*/ expect(await p).to.not.eql({a: {b: 0}});
        await expect(p).to.not.eql({a: {b: 0}});
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: {b: 0}}),
          getWaitFunction(() => getArrayValueFunction({a: {b: 0}}, {}))
        );

        /*OK*/ expect(await p).to.eql({a: {b: 0}});
        await expect(p).to.not.equal({a: {b: 0}});
      });
    });
    describe('equal, equals, eq', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.equal(0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.equal(1);
        await expect(p).to.equal(0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.not.equal(0);
        await expect(p).to.not.equal(0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.not.equal(0);
      });
    });
    describe('exist', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0))
        );

        /*OK*/ expect(await p).to.exist;
        await expect(p).to.exist;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 0))
        );

        /*OK*/ expect(await p).to.equal(null);
        await expect(p).to.exist;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 0))
        );

        /*OK*/ expect(await p).to.not.exist;
        await expect(p).to.not.exist;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, null))
        );

        /*OK*/ expect(await p).to.exist;
        await expect(p).to.not.exist;
      });
    });
    describe('extensible', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}))
        );

        /*OK*/ expect(await p).to.be.extensible;
        await expect(p).to.be.extensible;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Object.freeze({})),
          getWaitFunction(() => getArrayValueFunction(Object.freeze({}), {}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.be.extensible;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Object.freeze({})),
          getWaitFunction(() => getArrayValueFunction(Object.freeze({}), {}))
        );

        /*OK*/ expect(await p).to.not.be.extensible;
        await expect(p).to.not.be.extensible;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, Object.freeze({})))
        );

        /*OK*/ expect(await p).to.be.extensible;
        await expect(p).to.not.be.extensible;
      });
    });
    describe('false', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false))
        );

        /*OK*/ expect(await p).to.be.false;
        await expect(p).to.be.false;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.be.true;
        await expect(p).to.be.false;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.not.be.false;
        await expect(p).to.not.be.false;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false, true))
        );

        /*OK*/ expect(await p).to.be.false;
        await expect(p).to.not.be.false;
      });
    });
    describe('finite', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0))
        );

        /*OK*/ expect(await p).to.be.finite;
        await expect(p).to.be.finite;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Infinity),
          getWaitFunction(() => getArrayValueFunction(Infinity, 0))
        );

        /*OK*/ expect(await p).to.equal(Infinity);
        await expect(p).to.be.finite;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Infinity),
          getWaitFunction(() => getArrayValueFunction(Infinity, 0))
        );

        /*OK*/ expect(await p).to.not.be.finite;
        await expect(p).to.not.be.finite;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, Infinity))
        );

        /*OK*/ expect(await p).to.be.finite;
        await expect(p).to.not.be.finite;
      });
    });
    describe('frozen', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Object.freeze({})),
          getWaitFunction(() => getArrayValueFunction(Object.freeze({}), {}))
        );

        /*OK*/ expect(await p).to.be.frozen;
        await expect(p).to.be.frozen;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, Object.freeze({})))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.be.frozen;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, Object.freeze({})))
        );

        /*OK*/ expect(await p).to.not.be.frozen;
        await expect(p).to.not.be.frozen;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(Object.freeze({})),
          getWaitFunction(() => getArrayValueFunction(Object.freeze({}), {}))
        );

        /*OK*/ expect(await p).to.be.frozen;
        await expect(p).to.not.be.frozen;
      });
    });
    describe('include, includes, contain, contains', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.include({a: 0});
        await expect(p).to.include({a: 0});
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.include({a: 0});
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.not.include({a: 0});
        await expect(p).to.not.include({a: 0});
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.include({a: 0});
        await expect(p).to.not.include({a: 0});
      });
    });
    describe('increase, increases', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve());

        /*OK*/ expect(() => /*OK*/ expect(p).to.increase({a: 0}, 'a')).to.throw(
          'ControllerPromise used with unsupported expectation'
        );
      });
    });
    describe('by', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve());

        /*OK*/ expect(() =>
          /*OK*/ expect(p).to.change({a: 0}, 'a').by(1)
        ).to.throw('ControllerPromise used with unsupported expectation');
      });
    });
    describe('instanceof, instanceOf', () => {
      it('should work in the immediate positive case', async () => {
        class TestInstance {}

        const p = new ControllerPromise(
          Promise.resolve(new TestInstance()),
          getWaitFunction(() => getArrayValueFunction(new TestInstance(), {}))
        );

        /*OK*/ expect(await p).to.be.an.instanceof(TestInstance);
        await expect(p).to.be.an.instanceof(TestInstance);
      });

      it('should work in the eventual positive case', async () => {
        class TestInstance {}

        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, new TestInstance()))
        );

        /*OK*/ expect(await p).to.be.an.instanceof(Object);
        await expect(p).to.be.an.instanceof(TestInstance);
      });

      it('should work in the immediate negative case', async () => {
        class TestInstance {}

        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, new TestInstance()))
        );

        /*OK*/ expect(await p).to.not.be.an.instanceof(TestInstance);
        await expect(p).to.not.be.an.instanceof(TestInstance);
      });

      it('should work in the eventual negative case', async () => {
        class TestInstance {}

        const p = new ControllerPromise(
          Promise.resolve(new TestInstance()),
          getWaitFunction(() => getArrayValueFunction(new TestInstance(), {}))
        );

        /*OK*/ expect(await p).to.be.an.instanceof(TestInstance);
        await expect(p).to.not.be.an.instanceof(TestInstance);
      });
    });
    describe('keys, key', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0, b: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0, b: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.all.keys('a', 'b');
        await expect(p).to.have.all.keys('a', 'b');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0, b: 0}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.have.all.keys('a', 'b');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0, b: 0}))
        );

        /*OK*/ expect(await p).to.not.have.all.keys('a', 'b');
        await expect(p).to.not.have.all.keys('a', 'b');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0, b: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0, b: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.all.keys('a', 'b');
        await expect(p).to.not.have.all.keys('a', 'b');
      });
    });
    describe('least, gte', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1))
        );

        /*OK*/ expect(await p).to.be.at.least(1);
        await expect(p).to.be.at.least(1);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.at.least(1);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.not.be.at.least(1);
        await expect(p).to.not.be.at.least(1);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.be.at.least(1);
        await expect(p).to.not.be.at.least(1);
      });
    });
    describe('length', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([]))
        );

        /*OK*/ expect(await p).to.have.length(0);
        await expect(p).to.have.length(0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.have.length(1);
        await expect(p).to.have.length(0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.not.have.length(0);
        await expect(p).to.not.have.length(0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([], [0]))
        );

        /*OK*/ expect(await p).to.have.length(0);
        await expect(p).to.not.have.length(0);
      });
    });
    describe('lengthOf', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([]))
        );

        /*OK*/ expect(await p).to.have.a.lengthOf(0);
        await expect(p).to.have.a.lengthOf(0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.have.a.lengthOf(1);
        await expect(p).to.have.a.lengthOf(0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.not.have.a.lengthOf(0);
        await expect(p).to.not.have.a.lengthOf(0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([], [0]))
        );

        /*OK*/ expect(await p).to.have.a.lengthOf(0);
        await expect(p).to.not.have.a.lengthOf(0);
      });
    });
    describe('match, matches', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('1'),
          getWaitFunction(() => getArrayValueFunction('1'))
        );

        /*OK*/ expect(await p).to.match(/\d/);
        await expect(p).to.match(/\d/);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('a'),
          getWaitFunction(() => getArrayValueFunction('a', '1'))
        );

        /*OK*/ expect(await p).to.equal('a');
        await expect(p).to.match(/\d/);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('a'),
          getWaitFunction(() => getArrayValueFunction('a', '1'))
        );

        /*OK*/ expect(await p).to.not.match(/\d/);
        await expect(p).to.not.match(/\d/);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('1'),
          getWaitFunction(() => getArrayValueFunction('1', 'a'))
        );

        /*OK*/ expect(await p).to.match(/\d/);
        await expect(p).to.not.match(/\d/);
      });
    });
    describe('members', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0]))
        );

        /*OK*/ expect(await p).to.have.members([0]);
        await expect(p).to.have.members([0]);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([], [0]))
        );

        /*OK*/ expect(await p).to.deep.equal([]);
        await expect(p).to.have.members([0]);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([]),
          getWaitFunction(() => getArrayValueFunction([], [0]))
        );

        /*OK*/ expect(await p).to.not.have.members([0]);
        await expect(p).to.not.have.members([0]);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve([0]),
          getWaitFunction(() => getArrayValueFunction([0], []))
        );

        /*OK*/ expect(await p).to.have.members([0]);
        await expect(p).to.not.have.members([0]);
      });
    });
    describe('most, lte', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1))
        );

        /*OK*/ expect(await p).to.be.at.most(1);
        await expect(p).to.be.at.most(1);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(2),
          getWaitFunction(() => getArrayValueFunction(2, 1))
        );

        /*OK*/ expect(await p).to.equal(2);
        await expect(p).to.be.at.most(1);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(2),
          getWaitFunction(() => getArrayValueFunction(2, 1))
        );

        /*OK*/ expect(await p).to.not.be.at.most(1);
        await expect(p).to.not.be.at.most(1);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 2))
        );

        /*OK*/ expect(await p).to.be.at.most(1);
        await expect(p).to.not.be.at.most(1);
      });
    });
    describe('NaN', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(NaN),
          getWaitFunction(() => getArrayValueFunction(NaN, 0))
        );

        /*OK*/ expect(await p).to.be.NaN;
        await expect(p).to.be.NaN;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, NaN))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.NaN;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, NaN))
        );

        /*OK*/ expect(await p).to.not.be.NaN;
        await expect(p).to.not.be.NaN;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(NaN),
          getWaitFunction(() => getArrayValueFunction(NaN, 0))
        );

        /*OK*/ expect(await p).to.be.NaN;
        await expect(p).to.not.be.NaN;
      });
    });
    describe('null', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 0))
        );

        /*OK*/ expect(await p).to.be.null;
        await expect(p).to.be.null;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, null))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.null;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, null))
        );

        /*OK*/ expect(await p).to.not.be.null;
        await expect(p).to.not.be.null;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(null),
          getWaitFunction(() => getArrayValueFunction(null, 0))
        );

        /*OK*/ expect(await p).to.be.null;
        await expect(p).to.not.be.null;
      });
    });
    describe('ok', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.be.ok;
        await expect(p).to.be.ok;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false, true))
        );

        /*OK*/ expect(await p).to.equal(false);
        await expect(p).to.be.ok;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false, true))
        );

        /*OK*/ expect(await p).to.not.be.ok;
        await expect(p).to.not.be.ok;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.be.ok;
        await expect(p).to.not.be.ok;
      });
    });
    describe('oneOf', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.be.oneOf([1, 2]);
        await expect(p).to.be.oneOf([1, 2]);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.oneOf([1, 2]);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );

        /*OK*/ expect(await p).to.not.be.oneOf([1, 2]);
        await expect(p).to.not.be.oneOf([1, 2]);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );

        /*OK*/ expect(await p).to.be.oneOf([1, 2]);
        await expect(p).to.not.be.oneOf([1, 2]);
      });
    });
    describe('ownProperty, haveOwnProperty', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.ownProperty('a');
        await expect(p).to.have.ownProperty('a');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.have.ownProperty('a');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.not.have.ownProperty('a');
        await expect(p).to.not.have.ownProperty('a');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.ownProperty('a');
        await expect(p).to.not.have.ownProperty('a');
      });
    });
    describe('ownPropertyDescriptor, haveOwnPropertyDescriptor', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.ownPropertyDescriptor('a');
        await expect(p).to.have.ownPropertyDescriptor('a');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.have.ownPropertyDescriptor('a');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.not.have.ownPropertyDescriptor('a');
        await expect(p).to.not.have.ownPropertyDescriptor('a');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.ownPropertyDescriptor('a');
        await expect(p).to.not.have.ownPropertyDescriptor('a');
      });
    });
    describe('property', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.property('a');
        await expect(p).to.have.property('a');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.have.property('a');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, {a: 0}))
        );

        /*OK*/ expect(await p).to.not.have.property('a');
        await expect(p).to.not.have.property('a');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({a: 0}),
          getWaitFunction(() => getArrayValueFunction({a: 0}, {}))
        );

        /*OK*/ expect(await p).to.have.property('a');
        await expect(p).to.not.have.property('a');
      });
    });
    describe('respondTo, respondsTo', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve({}));

        /*OK*/ expect(() =>
          /*OK*/ expect(p).to.respondTo('this will break')
        ).to.throw('ControllerPromise used with unsupported expectation');
      });
    });
    describe('satisfy, satisfies', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(2),
          getWaitFunction(() => getArrayValueFunction(2, 1))
        );

        /*OK*/ expect(await p).to.satisfy((x) => x % 2 == 0);
        await expect(p).to.satisfy((x) => x % 2 == 0);
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 2))
        );

        /*OK*/ expect(await p).to.equal(1);
        await expect(p).to.satisfy((x) => x % 2 == 0);
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 2))
        );

        /*OK*/ expect(await p).to.not.satisfy((x) => x % 2 == 0);
        await expect(p).to.not.satisfy((x) => x % 2 == 0);
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(2),
          getWaitFunction(() => getArrayValueFunction(2, 1))
        );

        /*OK*/ expect(await p).to.satisfy((x) => x % 2 == 0);
        await expect(p).to.not.satisfy((x) => x % 2 == 0);
      });
    });
    describe('sealed', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, {}))
        );

        /*OK*/ expect(await p).to.be.sealed;
        await expect(p).to.be.sealed;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, 0))
        );

        /*OK*/ expect(await p).to.deep.equal({});
        await expect(p).to.be.sealed;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve({}),
          getWaitFunction(() => getArrayValueFunction({}, 0))
        );

        /*OK*/ expect(await p).to.not.be.sealed;
        await expect(p).to.not.be.sealed;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, {}))
        );

        /*OK*/ expect(await p).to.be.sealed;
        await expect(p).to.not.be.sealed;
      });
    });
    describe('string', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('string'),
          getWaitFunction(() => getArrayValueFunction('string', 'x'))
        );

        /*OK*/ expect(await p).to.have.string('ring');
        await expect(p).to.have.string('ring');
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('x'),
          getWaitFunction(() => getArrayValueFunction('x', 'string'))
        );

        /*OK*/ expect(await p).to.equal('x');
        await expect(p).to.have.string('ring');
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('x'),
          getWaitFunction(() => getArrayValueFunction('x', 'string'))
        );

        /*OK*/ expect(await p).to.not.have.string('ring');
        await expect(p).to.not.have.string('ring');
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve('string'),
          getWaitFunction(() => getArrayValueFunction('string', 'x'))
        );

        /*OK*/ expect(await p).to.have.string('ring');
        await expect(p).to.not.have.string('ring');
      });
    });
    describe('throw, throws, Throw', () => {
      it('should throw that it is unsupported', async () => {
        const p = new ControllerPromise(Promise.resolve('string'));

        /*OK*/ expect(() =>
          /*OK*/ expect(p).to.throw('this will break')
        ).to.throw('ControllerPromise used with unsupported expectation');
      });
    });
    describe('true', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.be.true;
        await expect(p).to.be.true;
      });

      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false, true))
        );

        /*OK*/ expect(await p).to.be.false;
        await expect(p).to.be.true;
      });

      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(false),
          getWaitFunction(() => getArrayValueFunction(false, true))
        );

        /*OK*/ expect(await p).to.not.be.true;
        await expect(p).to.not.be.true;
      });

      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(true),
          getWaitFunction(() => getArrayValueFunction(true, false))
        );

        /*OK*/ expect(await p).to.be.true;
        await expect(p).to.not.be.true;
      });
    });
    describe('undefined', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(undefined),
          getWaitFunction(() => getArrayValueFunction(undefined, 0))
        );
        /*OK*/ expect(await p).to.be.undefined;
        await expect(p).to.be.undefined;
      });
      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, undefined))
        );
        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.undefined;
      });
      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, undefined))
        );
        /*OK*/ expect(await p).to.not.be.undefined;
        await expect(p).to.not.be.undefined;
      });
      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(undefined),
          getWaitFunction(() => getArrayValueFunction(undefined, 0))
        );
        /*OK*/ expect(await p).to.be.undefined;
        await expect(p).to.not.be.undefined;
      });
    });
    describe('within', () => {
      it('should work in the immediate positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );
        /*OK*/ expect(await p).to.be.within(1, 2);
        await expect(p).to.be.within(1, 2);
      });
      it('should work in the eventual positive case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );
        /*OK*/ expect(await p).to.equal(0);
        await expect(p).to.be.within(1, 2);
      });
      it('should work in the immediate negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(0),
          getWaitFunction(() => getArrayValueFunction(0, 1))
        );
        /*OK*/ expect(await p).to.not.be.within(1, 2);
        await expect(p).to.not.be.within(1, 2);
      });
      it('should work in the eventual negative case', async () => {
        const p = new ControllerPromise(
          Promise.resolve(1),
          getWaitFunction(() => getArrayValueFunction(1, 0))
        );
        /*OK*/ expect(await p).to.be.within(1, 2);
        await expect(p).to.not.be.within(1, 2);
      });
    });
  });
});

/**
 * Returns a method that resolves the numbers 0 through 6.
 * @return {function():!Promise<number>}
 */
function getIncrementingValueFunction() {
  let value = 0;
  return function () {
    return value++;
  };
}

/**
 * Returns a method that resolves the numbers 0 through 6.
 * @return {function():!Promise<T>}
 * @template T
 */
function getAsyncValueFunction(valueFunction) {
  return async () => valueFunction();
}

/**
 * Returns a method that resolves each of its given arguments
 * @return {function():!Promise<T>}
 * @template T
 */
function getArrayValueFunction(...args) {
  let i = 0;
  const lastIndex = args.length - 1;
  return function () {
    const index = i++;
    return args[index > lastIndex ? lastIndex : index];
  };
}

/**
 * Simulate the WebDriver polling functionality to get the latest value
 * and mutate it with any `then` blocks that have been chained to the
 * ControllerPromise.
 * See {@link ../../build-system/tasks/e2e/expect.js} for real usage
 * @param {function(): function():(!Promise<T>|T)}
 * @template T
 */
function getWaitFunction(valueFunctionGetter) {
  return (conditionFn, opt_mutate) => {
    /**
     * Each call to `waitForValue` gets its own value function thunk.
     * This simulates the value returned by a WebDriver framework for
     * a request for a value e.g. from the DOM.
     * See {@link ../../build-system/tasks/e2e/selenium-webdriver-controller.js#getElementText}
     */
    const valueFunction = valueFunctionGetter();

    opt_mutate = opt_mutate || ((x) => x);
    return new Promise((resolve, reject) => {
      /**
       * Poll for the new value.
       * See {@link ../../build-system/tasks/e2e/selenium-webdriver-controller.js#getWaitFn_}
       */
      const id = setInterval(async () => {
        let value;
        try {
          value = await opt_mutate(await valueFunction());
        } catch (e) {
          clearInterval(id);
          reject(e);
          return;
        }

        /**
         * This resolves the promise that the Chai wrapper `expect.js` awaits.
         * The condition is passed in by the expectations and it
         * stops polling when the condition matches.
         * See {@link ../../build-system/tasks/e2e/expect.js#valueSatisfiesExpectation}
         */
        if (conditionFn(value)) {
          clearInterval(id);
          resolve(value);
        }
      }, 4);
    });
  };
}
