import {applyBreakpointClassname} from '../breakpoints';

describes.realWin('Synthetic Breakpoints', {amp: false}, (env) => {
  const huge = 'foo-huge';
  const large = 'foo-large';
  const small = 'foo-small';
  const tiny = 'foo-tiny';

  describe('applyBreakpointClassname', () => {
    const breakpoints = [
      {minWidth: 0, className: tiny},
      {minWidth: 100, className: small},
      {minWidth: 200, className: large},
      {minWidth: 400, className: huge},
    ];

    [
      {width: 1, expected: tiny},
      {width: 100, expected: small},
      {width: 120, expected: small},
      {width: 200, expected: large},
      {width: 300, expected: large},
      {width: 400, expected: huge},
      {width: 200000, expected: huge},
    ].forEach(({expected, width}) => {
      const unexpected = Object.values(breakpoints)
        .filter(({className}) => className != expected)
        .map(({className}) => className);

      it(
        `applies classname (${expected}) for width = ${width} with ` +
          'multiple breakpoints',
        () => {
          const element = env.win.document.createElement('div');

          applyBreakpointClassname(element, width, breakpoints);

          expect(element.classList.contains(expected)).to.be.true;
        }
      );

      it(
        `removes classnames that do not apply (${unexpected.join(', ')}) ` +
          `for width = ${width} with multiple breakpoints`,
        () => {
          const element = env.win.document.createElement('div');

          unexpected.forEach((className) => {
            element.classList.add(className);
          });

          applyBreakpointClassname(element, width, breakpoints);

          unexpected.forEach((className) => {
            expect(element.classList.contains(className)).to.be.false;
          });
        }
      );
    });

    Object.values(breakpoints).forEach(({className}) => {
      [0, 1, 1000, 200000].forEach((width) => {
        [0, 1, 50, 1000, 1400, 100000].forEach((minWidth) => {
          const applies = minWidth <= width;
          const verb = applies ? 'applies' : 'does not apply';
          it(
            `${verb} classname (${className}) with single breakpoint ` +
              `(${minWidth})`,
            () => {
              const element = env.win.document.createElement('div');

              applyBreakpointClassname(element, width, [{minWidth, className}]);

              expect(element.classList.contains(className)).to.equal(applies);
            }
          );
        });
      });
    });
  });
});
