import {Services} from '#service';

import * as eventHelper from '#utils/event-helper';

import {CSS} from '../../../../build/amp-form-0.1.css';
import {installStylesForDoc} from '../../../../src/style-installer';
import {
  AmpFormTextarea,
  getHasOverflow,
  handleInitialOverflowElements,
  maybeResizeTextarea,
} from '../amp-form-textarea';

describes.realWin(
  'amp-form textarea[autoexpand]',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let doc;
    beforeEach(() => {
      doc = env.ampdoc.getRootNode();
      installStylesForDoc(env.ampdoc, CSS, () => {}, false, 'amp-form');
    });

    describe('handleInitialOverflowElements', () => {
      it('should remove autoexpand on elements with initial overflow', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '1');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'big text'.repeat(30);
        doc.body.appendChild(textarea);

        return handleInitialOverflowElements([textarea]).then(() => {
          expect(textarea).to.not.have.attribute('autoexpand');
        });
      });
    });

    describe('getHasOverflow', () => {
      it('should detect if an element has overflow', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '1');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'big text'.repeat(30);
        doc.body.appendChild(textarea);

        return expect(getHasOverflow(textarea)).to.eventually.be.true;
      });

      it('should detect if an element does not have overflow', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '1');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'small text';
        doc.body.appendChild(textarea);

        return expect(getHasOverflow(textarea)).to.eventually.be.false;
      });
    });

    describe('maybeResizeTextarea', () => {
      it('should not resize an element that has not expanded', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '4');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'small text';
        doc.body.appendChild(textarea);

        const fakeMutator = {
          measureMutateElement(unusedElement, measurer, mutator) {
            measurer();
            return mutator() || Promise.resolve();
          },
        };
        env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

        const initialHeight = textarea.clientHeight;
        return maybeResizeTextarea(textarea).then(() => {
          expect(textarea.clientHeight).to.equal(initialHeight);
        });
      });

      it('should expand an element that exceeds its boundary', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '4');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'big text'.repeat(100);
        doc.body.appendChild(textarea);

        const fakeMutator = {
          measureMutateElement(unusedElement, measurer, mutator) {
            measurer();
            return mutator() || Promise.resolve();
          },
        };
        env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

        const initialHeight = textarea.clientHeight;
        return maybeResizeTextarea(textarea).then(() => {
          expect(textarea.clientHeight).to.be.greaterThan(initialHeight);
        });
      });

      it('should shrink an element that expands and then reduces', () => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '4');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'big text'.repeat(100);
        doc.body.appendChild(textarea);

        const fakeMutator = {
          measureMutateElement(unusedElement, measurer, mutator) {
            measurer();
            return mutator() || Promise.resolve();
          },
        };
        env.sandbox.stub(Services, 'mutatorForDoc').returns(fakeMutator);

        const initialHeight = textarea.clientHeight;
        let increasedHeight;
        return maybeResizeTextarea(textarea)
          .then(() => {
            increasedHeight = textarea.clientHeight;
            expect(increasedHeight).to.be.greaterThan(initialHeight);
          })
          .then(() => {
            textarea.innerHTML = 'small text';
            return maybeResizeTextarea(textarea);
          })
          .then(() => {
            expect(textarea.clientHeight).to.be.lessThan(increasedHeight);
          });
      });
    });

    describe('handleTextareaDrag', () => {
      it('should handle text area drag', (done) => {
        const textarea = doc.createElement('textarea');
        textarea.setAttribute('autoexpand', '');
        textarea.setAttribute('rows', '4');
        textarea.setAttribute('cols', '80');
        textarea.innerHTML = 'small text';
        doc.body.appendChild(textarea);
        new AmpFormTextarea(doc);
        let callCount = 0;
        const fakeResources = {
          measureElement(unused) {
            return Promise.resolve();
          },
          measureMutateElement(unusedElement, measurer, mutator) {
            callCount++;
            measurer();
            return mutator() || Promise.resolve();
          },
        };
        env.sandbox.stub(Services, 'resourcesForDoc').returns(fakeResources);
        env.sandbox
          .stub(eventHelper, 'listenOncePromise')
          .returns(Promise.resolve());

        let mouseDownEvent;
        if (doc.createEvent) {
          mouseDownEvent = new MouseEvent('mousedown');
        } else {
          mouseDownEvent = doc.createEventObject();
          mouseDownEvent.type = 'mousedown';
        }
        env.sandbox.defineProperty(mouseDownEvent, 'target', {
          value: textarea,
        });
        // Given 2 mousedown events on the textarea.
        doc.dispatchEvent(mouseDownEvent);
        doc.dispatchEvent(mouseDownEvent);
        done();
        // Expect measure mutate to have been called twice.
        expect(callCount).to.equal(2);
      });
    });
  }
);
