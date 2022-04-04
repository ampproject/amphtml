import {
  devError,
  devExpectedError,
  duplicateErrorIfNecessary,
  rethrowAsync,
} from '#core/error';
import {isUserErrorMessage} from '#core/error/message-helpers';

import {setReportError, user} from '#utils/log';

describes.sandboxed('errors', {}, (env) => {
  describe('rethrowAsync', () => {
    let clock;

    beforeEach(() => {
      clock = env.sandbox.useFakeTimers();
      restoreAsyncErrorThrows();
    });

    afterEach(() => {
      stubAsyncErrorThrows();
    });

    it('should rethrow error with single message', () => {
      rethrowAsync('intended');
      expect(() => {
        clock.tick(1);
      }).to.throw(Error, /^intended/);
    });

    it('should rethrow a single error', () => {
      const orig = new Error('intended');
      rethrowAsync(orig);
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^intended/);
    });

    it('should rethrow error with many messages', () => {
      rethrowAsync('first', 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error.message).to.match(/^first second third/);
    });

    it('should rethrow error with original error and messages', () => {
      const orig = new Error('intended');
      rethrowAsync('first', orig, 'second', 'third');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(error.message).to.match(/^first second third: intended/);
    });

    it('should preserve error suffix', () => {
      const orig = user().createError('intended');
      expect(isUserErrorMessage(orig.message)).to.be.true;
      rethrowAsync('first', orig, 'second');
      let error;
      try {
        clock.tick(1);
      } catch (e) {
        error = e;
      }
      expect(error).to.equal(orig);
      expect(isUserErrorMessage(error.message)).to.be.true;
    });
  });

  describe('duplicateErrorIfNecessary', () => {
    it('should not duplicate if message is writeable', () => {
      const error = {message: 'test'};

      expect(duplicateErrorIfNecessary(error)).to.equal(error);
    });

    it('should duplicate if message is non-writable', () => {
      const error = {};
      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      expect(duplicateErrorIfNecessary(error)).to.not.equal(error);
    });

    it('copies all the tidbits', () => {
      const error = {
        stack: 'stack',
        args: [1, 2, 3],
        associatedElement: error,
      };

      Object.defineProperty(error, 'message', {
        value: 'test',
        writable: false,
      });

      const duplicate = duplicateErrorIfNecessary(error);
      expect(duplicate.stack).to.equal(error.stack);
      expect(duplicate.args).to.equal(error.args);
      expect(duplicate.associatedElement).to.equal(error.associatedElement);
    });
  });

  describe('helpers', () => {
    let reportedError;

    beforeEach(() =>
      setReportError((e) => {
        reportedError = e;
      })
    );

    describe('devError', () => {
      it('reuses errors', () => {
        let error = new Error('test');

        devError('TAG', error);
        expect(reportedError).to.equal(error);
        expect(error.message).to.equal('test');

        devError('TAG', 'should fail', 'XYZ', error);
        expect(reportedError).to.equal(error);
        expect(error.message).to.equal('should fail XYZ: test');

        // #8917
        try {
          // This is an intentionally bad query selector
          document.body.querySelector('#');
        } catch (e) {
          error = e;
        }

        devError('TAG', error);
        expect(reportedError).not.to.equal(error);
        expect(reportedError.message).to.equal(error.message);

        devError('TAG', 'should fail', 'XYZ', error);
        expect(reportedError).not.to.equal(error);
        expect(reportedError.message).to.contain('should fail XYZ:');
      });
    });

    describe('devExpectedError', () => {
      it('reuses errors', () => {
        let error = new Error('test');

        devExpectedError('TAG', error);
        expect(reportedError).to.equal(error);
        expect(error.message).to.equal('test');

        devExpectedError('TAG', 'should fail', 'XYZ', error);
        expect(reportedError).to.equal(error);
        expect(error.message).to.equal('should fail XYZ: test');

        // #8917
        try {
          // This is an intentionally bad query selector
          document.body.querySelector('#');
        } catch (e) {
          error = e;
        }

        devExpectedError('TAG', error);
        expect(reportedError).not.to.equal(error);
        expect(reportedError.message).to.equal(error.message);

        devExpectedError('TAG', 'should fail', 'XYZ', error);
        expect(reportedError).not.to.equal(error);
        expect(reportedError.message).to.contain('should fail XYZ:');
      });

      it('sets `expected` to true', () => {
        const error = new Error('test');

        devExpectedError('TAG', error);
        expect(error.expected).to.be.true;
      });
    });
  });
});
