import * as ast from '../parsers/css-expr-ast';

describes.sandboxed('CSS resolve calc', {}, (env) => {
  const normalize = true;
  let context;
  let contextMock;

  beforeEach(() => {
    context = new ast.CssContext();
    contextMock = env.sandbox.mock(context);
  });

  afterEach(() => {
    contextMock.verify();
  });

  function resolvedCss(node, opt_normalize) {
    const resolved = node.resolve(context, opt_normalize);
    return resolved ? resolved.css() : null;
  }

  it('should always consider as non-const', () => {
    expect(ast.isVarCss('calc()')).to.be.true;
    expect(ast.isVarCss('calc()', normalize)).to.be.true;
    expect(ast.isVarCss('calc(10px)', normalize)).to.be.true;
    expect(ast.isVarCss('calc(10em)', normalize)).to.be.true;
  });

  it('should resolve a single-value calc', () => {
    const node = new ast.CssCalcNode(new ast.CssLengthNode(10, 'px'));
    expect(node.isConst()).to.be.false;
    expect(node.css()).to.equal('calc(10px)');
    expect(resolvedCss(node)).to.equal('10px');
  });

  describe('sum', () => {
    it('should add two same-unit values', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssLengthNode(20, 'px'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10px + 20px');
      expect(resolvedCss(node)).to.equal('30px');
    });

    it('should add two same-unit values and normalize', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssLengthNode(20, 'em'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10em + 20em');
      expect(resolvedCss(node)).to.equal('30em');

      contextMock.expects('getCurrentFontSize').returns(10).atLeast(1);
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('300px');
    });

    it('should add two same-unit values - times', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssTimeNode(10, 's'),
        new ast.CssTimeNode(20, 's'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10s + 20s');
      expect(resolvedCss(node)).to.equal('30s');
    });

    it('should subtract two same-unit values', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(30, 'px'),
        new ast.CssLengthNode(20, 'px'),
        '-'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('30px - 20px');
      expect(resolvedCss(node)).to.equal('10px');
    });

    it('should resolve both parts', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(5, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(new ast.CssLengthNode(1, 'px'))
        .once();
      const node = new ast.CssCalcSumNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1) + var(--var2)');
      expect(resolvedCss(node)).to.equal('6px');
    });

    it('should resolve to null with null args', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(5, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(null)
        .once();
      const node = new ast.CssCalcSumNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1) + var(--var2)');
      expect(resolvedCss(node)).to.be.null;
    });

    it('should only allow numerics', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssPassthroughNode('A'),
        new ast.CssPassthroughNode('B'),
        '+'
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/both numerical/);
    });

    it('should only allow same-type', () => {
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(30, 'px'),
        new ast.CssTimeNode(20, 's'),
        '+'
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/same type/);
    });

    it('should normalize units', () => {
      contextMock.expects('getCurrentFontSize').returns(1).once();
      contextMock.expects('getRootFontSize').returns(2).once();
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssLengthNode(10, 'rem'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10em + 10rem');
      // 1 * 10px + 2 * 10px = 30px
      expect(resolvedCss(node)).to.equal('30px');
    });

    it('should resolve left as percent', () => {
      contextMock.expects('getDimension').returns('w');
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssCalcSumNode(
        new ast.CssPercentNode(10),
        new ast.CssLengthNode(10, 'px'),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10% + 10px');
      // 10% * 110 + 10px = 11px + 10px = 21px
      expect(resolvedCss(node)).to.equal('21px');
    });

    it('should resolve right as percent', () => {
      contextMock.expects('getDimension').returns('h');
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssPercentNode(10),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10px + 10%');
      // 10px + 10% * 220 = 10px + 22px = 32px
      expect(resolvedCss(node)).to.equal('32px');
    });

    it('should normalize the non-percent part', () => {
      contextMock.expects('getCurrentFontSize').returns(2).once();
      contextMock.expects('getDimension').returns('h');
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssCalcSumNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssPercentNode(10),
        '+'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10em + 10%');
      // 10em * 2px + 10% * 220 = 20px + 22px = 42px
      expect(resolvedCss(node)).to.equal('42px');
    });

    it('should resolve with dimension function', () => {
      contextMock
        .expects('getElementRect')
        .returns({width: 111, height: 222})
        .twice();
      const node = new ast.CssCalcSumNode(
        new ast.CssRectNode('w', '.sel'),
        new ast.CssRectNode('h', '.sel'),
        '+'
      );
      // 111px + 222px = 333px
      expect(resolvedCss(node)).to.equal('333px');
    });
  });

  describe('product', () => {
    it('should only allow numerics', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssPassthroughNode('A'),
        new ast.CssPassthroughNode('B'),
        '*'
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/both numerical/);
    });

    it('should multiply with right number', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssNumberNode(2),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10px * 2');
      expect(resolvedCss(node)).to.equal('20px');
    });

    it('should multiply with left number', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssNumberNode(2),
        new ast.CssLengthNode(10, 'px'),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('2 * 10px');
      expect(resolvedCss(node)).to.equal('20px');
    });

    it('should multiply for non-norm', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssNumberNode(2),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10em * 2');
      expect(resolvedCss(node)).to.equal('20em');
    });

    it('should multiply for time', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssTimeNode(10, 's'),
        new ast.CssNumberNode(2),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10s * 2');
      expect(resolvedCss(node)).to.equal('20s');
    });

    it('should require at least one number', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssLengthNode(20, 'px'),
        '*'
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/one of sides in multiplication must be a number/);
    });

    it('should divide with right number', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssNumberNode(2),
        '/'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10px / 2');
      expect(resolvedCss(node)).to.equal('5px');
    });

    it('should divide for non-norm', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssNumberNode(2),
        '/'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10em / 2');
      expect(resolvedCss(node)).to.equal('5em');
    });

    it('should divide for time', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssTimeNode(10, 's'),
        new ast.CssNumberNode(2),
        '/'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10s / 2');
      expect(resolvedCss(node)).to.equal('5s');
    });

    it('should only allow number denominator', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssTimeNode(10, 's'),
        new ast.CssTimeNode(2, 's'),
        '/'
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/denominator must be a number/);
    });

    it('should resolve divide-by-zero as null', () => {
      const node = new ast.CssCalcProductNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssNumberNode(0),
        '/'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('10px / 0');
      expect(resolvedCss(node)).to.be.null;
    });

    it('should resolve both parts', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(10, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(new ast.CssNumberNode(2))
        .once();
      const node = new ast.CssCalcProductNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1) * var(--var2)');
      expect(resolvedCss(node)).to.equal('20px');
    });

    it('should resolve to null for null args', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(10, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(null)
        .once();
      const node = new ast.CssCalcProductNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1) * var(--var2)');
      expect(resolvedCss(node)).to.be.null;
    });
  });

  describe('min/max/clamp', () => {
    function test(name, argsOrFunc, css, results) {
      it(`min: ${name}`, () => {
        const args =
          typeof argsOrFunc == 'function' ? argsOrFunc() : argsOrFunc;
        const min = new ast.CssMinMaxNode('min', args);
        expect(min.isConst()).to.be.false;
        if (css) {
          expect(min.css()).to.equal(`min(${css})`);
        }
        expect(resolvedCss(min)).to.equal(results[0]);
      });

      it(`max: ${name}`, () => {
        const args =
          typeof argsOrFunc == 'function' ? argsOrFunc() : argsOrFunc;
        const max = new ast.CssMinMaxNode('max', args);
        expect(max.isConst()).to.be.false;
        if (css) {
          expect(max.css()).to.equal(`max(${css})`);
        }
        expect(resolvedCss(max)).to.equal(results[1]);
      });

      if (results.length > 2) {
        it(`clamp: ${name}`, () => {
          const args =
            typeof argsOrFunc == 'function' ? argsOrFunc() : argsOrFunc;
          const clamp = new ast.CssMinMaxNode('clamp', args);
          expect(clamp.isConst()).to.be.false;
          if (css) {
            expect(clamp.css()).to.equal(`clamp(${css})`);
          }
          expect(resolvedCss(clamp)).to.equal(results[2]);
        });
      }
    }

    it('should always consider as non-const', () => {
      expect(ast.isVarCss('min(10px)')).to.be.true;
      expect(ast.isVarCss('max(10px)', normalize)).to.be.true;
      expect(ast.isVarCss('clamp(10px 20px 30px)', normalize)).to.be.true;
      expect(ast.isVarCss('min(10em)', normalize)).to.be.true;
    });

    test(
      'should return for a single value',
      [new ast.CssLengthNode(10, 'px')],
      '10px',
      ['10px', '10px']
    );

    test(
      'should return for a single value as percent',
      [new ast.CssPercentNode(10)],
      '10%',
      ['10%', '10%']
    );

    test(
      'should calc two same-unit values',
      [new ast.CssLengthNode(20, 'px'), new ast.CssLengthNode(10, 'px')],
      '20px,10px',
      ['10px', '20px']
    );

    test(
      'should calc two percent values',
      [new ast.CssPercentNode(20), new ast.CssPercentNode(10)],
      '20%,10%',
      ['10%', '20%']
    );

    test(
      'should calc two same-unit values',
      [new ast.CssLengthNode(20, 'em'), new ast.CssLengthNode(10, 'em')],
      '20em,10em',
      ['10em', '20em']
    );

    test(
      'should calc three same-unit values',
      [
        new ast.CssLengthNode(10, 'em'),
        new ast.CssLengthNode(20, 'em'),
        new ast.CssLengthNode(30, 'em'),
      ],
      '10em,20em,30em',
      ['10em', '30em', '20em']
    );

    test(
      'should calc two same-unit values - times',
      [new ast.CssLengthNode(20, 's'), new ast.CssLengthNode(10, 's')],
      '20s,10s',
      ['10s', '20s']
    );

    test(
      'should normalize units',
      () => {
        contextMock.expects('getCurrentFontSize').returns(1).atLeast(1);
        contextMock.expects('getRootFontSize').returns(2).atLeast(1);
        return [
          new ast.CssLengthNode(10, 'em'),
          new ast.CssLengthNode(10, 'rem'),
        ];
      },
      '10em,10rem',
      // minmax(1 * 10px, 2 * 10px) = 10px / 20px
      ['10px', '20px']
    );

    test(
      'should normalize units for three args',
      () => {
        contextMock.expects('getCurrentFontSize').returns(1).atLeast(1);
        contextMock.expects('getRootFontSize').returns(2).atLeast(1);
        return [
          new ast.CssLengthNode(10, 'em'),
          new ast.CssLengthNode(15, 'px'),
          new ast.CssLengthNode(10, 'rem'),
        ];
      },
      '10em,15px,10rem',
      // minmax(1 * 10px, 15px, 2 * 10px) = 10px / 20px / 15px
      ['10px', '20px', '15px']
    );

    test(
      'should resolve first arg percent',
      () => {
        contextMock.expects('getDimension').returns('w').atLeast(1);
        contextMock
          .expects('getCurrentElementRect')
          .returns({width: 110, height: 220})
          .atLeast(1);
        return [
          new ast.CssPercentNode(10),
          new ast.CssLengthNode(12, 'px'),
          new ast.CssLengthNode(15, 'px'),
        ];
      },
      '10%,12px,15px',
      // minmax(10% * 110, 12px) = min(11px, 12px) = 11px / 15px / 12px
      ['11px', '15px', '12px']
    );

    test(
      'should resolve second arg as percent',
      () => {
        contextMock.expects('getDimension').returns('h').atLeast(1);
        contextMock
          .expects('getCurrentElementRect')
          .returns({width: 110, height: 220})
          .atLeast(1);
        return [new ast.CssLengthNode(25, 'px'), new ast.CssPercentNode(10)];
      },
      '25px,10%',
      // minmax(25px, 10% * 220) = min(25px, 22px) = 22px / 25px
      ['22px', '25px']
    );

    test(
      'should normalize the non-percent part',
      () => {
        contextMock.expects('getCurrentFontSize').returns(2).atLeast(1);
        contextMock.expects('getDimension').returns('h').atLeast(1);
        contextMock
          .expects('getCurrentElementRect')
          .returns({width: 110, height: 220})
          .atLeast(1);
        return [new ast.CssLengthNode(10, 'em'), new ast.CssPercentNode(10)];
      },
      '10em,10%',
      // minmax(10em * 2px, 10% * 220) = min(20px, 22px) = 20px / 22px
      ['20px', '22px']
    );

    test(
      'should resolve with dimension function',
      () => {
        contextMock
          .expects('getElementRect')
          .returns({width: 111, height: 222})
          .atLeast(1);
        return [
          new ast.CssRectNode('w', '.sel'),
          new ast.CssRectNode('h', '.sel'),
        ];
      },
      // No CSS.
      null,
      // minmax(111px, 222px) = 111px / 222px
      ['111px', '222px']
    );

    test(
      'should normalize units for clamp',
      () => {
        contextMock.expects('getDimension').returns('w').atLeast(1);
        contextMock
          .expects('getCurrentElementRect')
          .returns({width: 110, height: 220})
          .atLeast(1);
        contextMock.expects('getCurrentFontSize').returns(1).atLeast(1);
        contextMock.expects('getRootFontSize').returns(2).atLeast(1);
        return [
          new ast.CssPercentNode(5),
          new ast.CssLengthNode(10, 'em'),
          new ast.CssLengthNode(10, 'rem'),
        ];
      },
      '5%,10em,10rem',
      // minmax(5% * 110, 1 * 10px, 2 * 10px) = minmax(5.5px, 10px, 20px)
      ['5.5px', '20px', '10px']
    );

    test(
      'should normalize units for more args',
      () => {
        contextMock.expects('getDimension').returns('w').atLeast(1);
        contextMock
          .expects('getCurrentElementRect')
          .returns({width: 110, height: 220})
          .atLeast(1);
        contextMock.expects('getCurrentFontSize').returns(1).atLeast(1);
        contextMock.expects('getRootFontSize').returns(2).atLeast(1);
        return [
          new ast.CssPercentNode(5),
          new ast.CssLengthNode(10, 'em'),
          new ast.CssLengthNode(10, 'rem'),
          new ast.CssLengthNode(10, 'px'),
        ];
      },
      '5%,10em,10rem,10px',
      // minmax(5% * 110, 1 * 10px, 2 * 10px, 10px) = minmax(5.5px, 10px, 20px, 10px)
      ['5.5px', '20px']
    );

    it('should normalize same-unit values when requested', () => {
      contextMock.expects('getCurrentFontSize').returns(10).atLeast(1);
      const node = new ast.CssMinMaxNode('min', [
        new ast.CssLengthNode(20, 'em'),
        new ast.CssLengthNode(10, 'em'),
      ]);
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('100px');
    });

    it('should resolve all parts', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(5, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(new ast.CssLengthNode(1, 'px'))
        .once();
      const node = new ast.CssMinMaxNode('min', [
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
      ]);
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('min(var(--var1),var(--var2))');
      expect(resolvedCss(node)).to.equal('1px');
    });

    it('should resolve to null with null args', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(5, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(null)
        .once();
      const node = new ast.CssMinMaxNode('min', [
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2'),
      ]);
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('min(var(--var1),var(--var2))');
      expect(resolvedCss(node)).to.be.null;
    });

    it('should only allow numerics', () => {
      const node = new ast.CssMinMaxNode('min', [
        new ast.CssPassthroughNode('A'),
        new ast.CssPassthroughNode('B'),
      ]);
      expect(() => {
        resolvedCss(node);
      }).to.throw(/numerical/);
    });

    it('should only allow same-type', () => {
      const node = new ast.CssMinMaxNode('min', [
        new ast.CssLengthNode(30, 'px'),
        new ast.CssTimeNode(20, 's'),
      ]);
      expect(() => {
        resolvedCss(node);
      }).to.throw(/same type/);
    });
  });
});
