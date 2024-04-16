import {Deferred, LastAddedResolver} from '#core/data-structures/promise';

describes.sandboxed('data structures - PromiseUtils', {}, () => {
  const getPromiseObject = () => new Deferred();

  describe('LastAddedResolver', () => {
    it('should resolve when its only promise resolves', () => {
      const one = getPromiseObject();
      const resolver = new LastAddedResolver();
      resolver.add(one.promise);

      setTimeout(() => one.resolve('one'), 0);

      return resolver.then((result) => {
        expect(result).to.equal('one');
      });
    });

    it('should resolve when its last promise added resolves', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const firstResolver = new LastAddedResolver();
      firstResolver.add(one.promise);
      firstResolver.add(two.promise);

      setTimeout(() => one.resolve('one'), 0);
      setTimeout(() => two.resolve('two'), 10);

      const three = getPromiseObject();
      const four = getPromiseObject();
      const five = getPromiseObject();
      const secondResolver = new LastAddedResolver();
      secondResolver.add(three.promise);
      secondResolver.add(four.promise);
      secondResolver.add(five.promise);

      setTimeout(() => three.resolve('three'), 0);
      setTimeout(() => four.resolve('four'), 20);
      setTimeout(() => five.resolve('five'), 10);

      return Promise.all([
        firstResolver.then((result) => {
          expect(result).to.equal('two');
        }),
        secondResolver.then((result) => {
          expect(result).to.equal('five');
        }),
      ]);
    });

    it('should support adding initial promises in the constructor', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const resolver = new LastAddedResolver([one.promise, two.promise]);

      setTimeout(() => one.resolve('one'), 0);
      setTimeout(() => two.resolve('two'), 10);

      return resolver.then((result) => {
        expect(result).to.equal('two');
      });
    });

    it('should reject only when the last promise rejects', () => {
      const one = getPromiseObject();
      const two = getPromiseObject();
      const firstResolver = new LastAddedResolver();
      firstResolver.add(one.promise);
      firstResolver.add(two.promise);

      setTimeout(() => one.resolve('one'), 0);
      setTimeout(() => two.reject('two'), 20);
      setTimeout(() => two.resolve('three'), 10);

      const four = getPromiseObject();
      const five = getPromiseObject();
      const six = getPromiseObject();
      const secondResolver = new LastAddedResolver();
      secondResolver.add(four.promise);
      secondResolver.add(five.promise);
      secondResolver.add(six.promise);

      setTimeout(() => four.resolve('four'), 0);
      setTimeout(() => five.resolve('five'), 20);
      setTimeout(() => six.reject('six'), 10);

      return Promise.all([
        firstResolver.then(
          (result) => {
            expect(result).to.equal('three');
          },
          (unusedError) => {
            // shouldn't run
            expect(false).to.be.true;
          }
        ),
        secondResolver.then(
          (unusedResult) => {
            // shouldn't run
            expect(false).to.be.true;
          },
          (error) => {
            expect(error).to.equal('six');
          }
        ),
      ]);
    });
  });
});
