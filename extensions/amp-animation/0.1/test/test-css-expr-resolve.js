import * as ast from '../parsers/css-expr-ast';

describes.sandboxed('CSS resolve', {}, (env) => {
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

  it('should not resolve value for a const', () => {
    const node = new ast.CssNode();
    const nodeMock = env.sandbox.mock(node);
    nodeMock.expects('css').returns('CSS').atLeast(1);
    nodeMock.expects('isConst').returns(true).atLeast(1);
    nodeMock.expects('calc').never();
    expect(node.css()).to.equal('CSS');
    expect(node.resolve(context)).to.equal(node);
    expect(resolvedCss(node)).to.equal('CSS');
    nodeMock.verify();
  });

  it('should resolve value for a non-const', () => {
    const node = new ast.CssNode();
    const node2 = new ast.CssNode();
    node2.css = () => 'CSS2';
    const nodeMock = env.sandbox.mock(node);
    nodeMock.expects('isConst').returns(false).atLeast(1);
    nodeMock.expects('css').returns('CSS').atLeast(1);
    nodeMock.expects('calc').returns(node2).atLeast(1);
    expect(node.css()).to.equal('CSS');
    expect(node.resolve(context)).to.equal(node2);
    expect(resolvedCss(node)).to.equal('CSS2');
    nodeMock.verify();
  });

  it('should resolve a const concat node', () => {
    expect(ast.isVarCss('css1 css2', false)).to.be.false;
    expect(ast.isVarCss('css1 10px', false)).to.be.false;
    expect(ast.isVarCss('css1 10em', false)).to.be.false;
    expect(ast.isVarCss('css1 css2', normalize)).to.be.false;
    expect(ast.isVarCss('css1 10px', normalize)).to.be.false;
    expect(ast.isVarCss('css1 10em', normalize)).to.be.true;
    expect(ast.isVarCss('css1 10EM', normalize)).to.be.true;
    const node = new ast.CssConcatNode([
      new ast.CssPassthroughNode('css1'),
      new ast.CssPassthroughNode('css2'),
    ]);
    expect(node.isConst()).to.be.true;
    expect(node.isConst(normalize)).to.be.true;
    expect(node.resolve(context)).to.equal(node);
    expect(node.resolve(context, normalize)).to.equal(node);
    expect(node.css()).to.equal('css1 css2');
    expect(resolvedCss(node)).to.equal('css1 css2');
    expect(resolvedCss(node, normalize)).to.equal('css1 css2');
  });

  it('should resolve a var concat node', () => {
    expect(ast.isVarCss('var(--x)', false)).to.be.true;
    expect(ast.isVarCss('var(--x) css2', false)).to.be.true;
    expect(ast.isVarCss('VAR(--x)', false)).to.be.true;
    expect(ast.isVarCss('Var(--x)', false)).to.be.true;
    expect(ast.isVarCss('var(--x)', normalize)).to.be.true;
    contextMock
      .expects('getVar')
      .withExactArgs('--var1')
      .returns(new ast.CssPassthroughNode('val1'))
      .twice();
    const node = new ast.CssConcatNode([
      new ast.CssPassthroughNode('css1'),
      new ast.CssVarNode('--var1'),
    ]);
    expect(node.isConst()).to.be.false;
    expect(node.isConst(normalize)).to.be.false;
    expect(node.css()).to.equal('css1 var(--var1)');
    expect(resolvedCss(node)).to.equal('css1 val1');
    expect(resolvedCss(node, normalize)).to.equal('css1 val1');
  });

  it('should resolve a null concat node', () => {
    contextMock.expects('getVar').withExactArgs('--var1').returns(null).twice();
    const node = new ast.CssConcatNode([
      new ast.CssPassthroughNode('css1'),
      new ast.CssVarNode('--var1'),
    ]);
    expect(node.isConst()).to.be.false;
    expect(node.isConst(normalize)).to.be.false;
    expect(node.css()).to.equal('css1 var(--var1)');
    expect(resolvedCss(node)).to.be.null;
    expect(resolvedCss(node, normalize)).to.be.null;
  });

  it('should resolve a number node', () => {
    expect(ast.isVarCss('11.5', false)).to.be.false;
    expect(ast.isVarCss('11.5', normalize)).to.be.false;
    const node = new ast.CssNumberNode(11.5);
    expect(node.isConst()).to.be.true;
    expect(node.isConst(normalize)).to.be.true;
    expect(node.css()).to.equal('11.5');
    expect(resolvedCss(node)).to.equal('11.5');
    expect(resolvedCss(node, normalize)).to.equal('11.5');
    expect(node.createSameUnits(20.5).css()).to.equal('20.5');
  });

  it('should resolve a percent node w/o dimension', () => {
    expect(ast.isVarCss('11.5%', false)).to.be.false;
    expect(ast.isVarCss('11.5%', normalize)).to.be.true;
    const node = new ast.CssPercentNode(11.5);
    expect(node.isConst()).to.be.true;
    expect(node.isConst(normalize)).to.be.false;
    expect(node.css()).to.equal('11.5%');
    expect(resolvedCss(node)).to.equal('11.5%');
    expect(resolvedCss(node, normalize)).to.equal('11.5%');
    expect(node.createSameUnits(20.5).css()).to.equal('20.5%');
  });

  it('should resolve a percent node w/dimension', () => {
    contextMock.expects('getDimension').returns('w').twice();
    contextMock
      .expects('getCurrentElementRect')
      .returns({width: 110, height: 220});
    expect(ast.isVarCss('11.5%', false)).to.be.false;
    const node = new ast.CssPercentNode(11.5);
    expect(node.isConst()).to.be.true;
    expect(node.isConst(normalize)).to.be.false;
    expect(node.css()).to.equal('11.5%');
    expect(resolvedCss(node)).to.equal('11.5%');
    expect(resolvedCss(node, normalize)).to.equal('12.65px');
    expect(node.createSameUnits(20.5).css()).to.equal('20.5%');
  });

  describe('url', () => {
    it('should always consider as non-const', () => {
      expect(ast.isVarCss('url("https://acme.org")', false)).to.be.true;
      expect(ast.isVarCss('url("https://acme.org")', normalize)).to.be.true;
    });

    it('should resolve an absolute HTTPS URL', () => {
      const node = new ast.CssUrlNode('https://acme.org/img');
      expect(node.isConst()).to.be.true;
      expect(node.isConst(normalize)).to.be.true;
      expect(node.css()).to.equal('url("https://acme.org/img")');
    });

    it('should resolve an data URL', () => {
      const node = new ast.CssUrlNode('data:abc');
      expect(node.isConst()).to.be.true;
      expect(node.isConst(normalize)).to.be.true;
      expect(node.css()).to.equal('url("data:abc")');
    });

    it('should resolve an empty URL', () => {
      const node = new ast.CssUrlNode('');
      expect(node.isConst()).to.be.true;
      expect(node.isConst(normalize)).to.be.true;
      expect(node.css()).to.equal('');
    });

    it('should re-resolve an HTTP url', () => {
      contextMock
        .expects('resolveUrl')
        .withExactArgs('http://acme.org/non-secure')
        .returns('broken')
        .twice();
      const node = new ast.CssUrlNode('http://acme.org/non-secure');
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.css()).to.equal('url("http://acme.org/non-secure")');
      expect(node.calc(context).css()).to.equal('url("broken")');
      expect(node.calc(context, normalize).css()).to.equal('url("broken")');
    });

    it('should re-resolve a relative url', () => {
      contextMock
        .expects('resolveUrl')
        .withExactArgs('/relative')
        .returns('https://acme.org/relative')
        .twice();
      const node = new ast.CssUrlNode('/relative');
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.css()).to.equal('url("/relative")');
      expect(node.calc(context).css()).to.equal(
        'url("https://acme.org/relative")'
      );
      expect(node.calc(context, normalize).css()).to.equal(
        'url("https://acme.org/relative")'
      );
    });

    it('should fail when context resolution fails', () => {
      contextMock
        .expects('resolveUrl')
        .withExactArgs('http://acme.org/non-secure')
        .throws(new Error('intentional'))
        .once();
      const node = new ast.CssUrlNode('http://acme.org/non-secure');
      expect(() => {
        node.calc(context);
      }).to.throw(/intentional/);
    });
  });

  describe('length', () => {
    it('should always consider as const', () => {
      expect(ast.isVarCss('11.5px', false)).to.be.false;
      expect(ast.isVarCss('11.5em', false)).to.be.false;

      expect(ast.isVarCss('11.5px', normalize)).to.be.false;
      expect(ast.isVarCss('11.5em', normalize)).to.be.true;
      expect(ast.isVarCss('11.5rem', normalize)).to.be.true;
      expect(ast.isVarCss('11.5vh', normalize)).to.be.true;
      expect(ast.isVarCss('11.5vw', normalize)).to.be.true;
      expect(ast.isVarCss('11.5vmin', normalize)).to.be.true;
      expect(ast.isVarCss('11.5vmax', normalize)).to.be.true;
      expect(ast.isVarCss('11.5EM', normalize)).to.be.true;
    });

    it('should resolve a px-length node', () => {
      const node = new ast.CssLengthNode(11.5, 'px');
      expect(node.isConst()).to.be.true;
      expect(node.isConst(normalize)).to.be.true;
      expect(node.css()).to.equal('11.5px');
      expect(resolvedCss(node)).to.equal('11.5px');
      expect(resolvedCss(node, normalize)).to.equal('11.5px');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5px');
      expect(node.norm()).to.equal(node);
      expect(node.norm().css()).to.equal('11.5px');
    });

    it('should resolve a em-length node', () => {
      const node = new ast.CssLengthNode(11.5, 'em');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5em');
      expect(resolvedCss(node)).to.equal('11.5em');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5em');

      contextMock.expects('getCurrentFontSize').returns(10).twice();
      const norm = node.norm(context);
      expect(norm).to.not.equal(node);
      expect(norm.css()).to.equal('115px');
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('115px');
    });

    it('should resolve a rem-length node', () => {
      const node = new ast.CssLengthNode(11.5, 'rem');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5rem');
      expect(resolvedCss(node)).to.equal('11.5rem');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5rem');

      contextMock.expects('getRootFontSize').returns(2).twice();
      const norm = node.norm(context);
      expect(norm).to.not.equal(node);
      expect(norm.css()).to.equal('23px');
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('23px');
    });

    describe('vw-length', () => {
      beforeEach(() => {
        contextMock
          .expects('getViewportSize')
          .returns({width: 200, height: 400})
          .atLeast(1);
      });

      it('should resolve a vw-length node', () => {
        const node = new ast.CssLengthNode(11.5, 'vw');
        expect(node.isConst()).to.be.true;
        expect(node.css()).to.equal('11.5vw');
        expect(resolvedCss(node)).to.equal('11.5vw');
        expect(node.createSameUnits(20.5).css()).to.equal('20.5vw');
        expect(node.norm(context).css()).to.equal('23px');
        expect(node.isConst(normalize)).to.be.false;
        expect(resolvedCss(node, normalize)).to.equal('23px');
      });

      it('should resolve a vh-length node', () => {
        const node = new ast.CssLengthNode(11.5, 'vh');
        expect(node.isConst()).to.be.true;
        expect(node.css()).to.equal('11.5vh');
        expect(resolvedCss(node)).to.equal('11.5vh');
        expect(node.createSameUnits(20.5).css()).to.equal('20.5vh');
        expect(node.norm(context).css()).to.equal('46px');
        expect(node.isConst(normalize)).to.be.false;
        expect(resolvedCss(node, normalize)).to.equal('46px');
      });

      it('should resolve a vmin-length node', () => {
        const node = new ast.CssLengthNode(11.5, 'vmin');
        expect(node.isConst()).to.be.true;
        expect(node.css()).to.equal('11.5vmin');
        expect(resolvedCss(node)).to.equal('11.5vmin');
        expect(node.createSameUnits(20.5).css()).to.equal('20.5vmin');
        expect(node.norm(context).css()).to.equal('23px');
        expect(node.isConst(normalize)).to.be.false;
        expect(resolvedCss(node, normalize)).to.equal('23px');
      });

      it('should resolve a vmax-length node', () => {
        const node = new ast.CssLengthNode(11.5, 'vmax');
        expect(node.isConst()).to.be.true;
        expect(node.css()).to.equal('11.5vmax');
        expect(resolvedCss(node)).to.equal('11.5vmax');
        expect(node.createSameUnits(20.5).css()).to.equal('20.5vmax');
        expect(node.norm(context).css()).to.equal('46px');
        expect(node.isConst(normalize)).to.be.false;
        expect(resolvedCss(node, normalize)).to.equal('46px');
      });
    });

    it('should disallow a real-length node', () => {
      expect(() => {
        new ast.CssLengthNode(1, 'cm').norm(context);
      }).to.throw(/unknown/);
      expect(() => {
        new ast.CssLengthNode(1, 'mm').norm(context);
      }).to.throw(/unknown/);
      expect(() => {
        new ast.CssLengthNode(1, 'in').norm(context);
      }).to.throw(/unknown/);
      expect(() => {
        new ast.CssLengthNode(1, 'pt').norm(context);
      }).to.throw(/unknown/);
      expect(() => {
        new ast.CssLengthNode(1, 'q').norm(context);
      }).to.throw(/unknown/);
    });

    it('should resolve a percent-length in w-direction', () => {
      contextMock.expects('getDimension').returns('w');
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssLengthNode(11.5, 'px');
      const percent = node.calcPercent(10, context);
      expect(percent.css()).to.equal('11px');
    });

    it('should resolve a percent-length in h-direction', () => {
      contextMock.expects('getDimension').returns('h');
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssLengthNode(11.5, 'px');
      const percent = node.calcPercent(10, context);
      expect(percent.css()).to.equal('22px');
    });

    it('should resolve a percent-length in unknown direction', () => {
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .once();
      const node = new ast.CssLengthNode(11.5, 'px');
      const percent = node.calcPercent(10, context);
      expect(percent.css()).to.equal('0px');
    });
  });

  describe('angle', () => {
    it('should always consider as const', () => {
      expect(ast.isVarCss('11.5rad', false)).to.be.false;
      expect(ast.isVarCss('11.5deg', false)).to.be.false;
      expect(ast.isVarCss('11.5grad', false)).to.be.false;

      expect(ast.isVarCss('11.5rad', normalize)).to.be.false;
      expect(ast.isVarCss('11.5deg', normalize)).to.be.true;
      expect(ast.isVarCss('11.5grad', normalize)).to.be.true;
    });

    it('should resolve a rad-angle node', () => {
      const node = new ast.CssAngleNode(11.5, 'rad');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5rad');
      expect(resolvedCss(node)).to.equal('11.5rad');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5rad');
      expect(node.norm()).to.equal(node);
      expect(node.norm().css()).to.equal('11.5rad');
      expect(node.isConst(normalize)).to.be.true;
      expect(resolvedCss(node, normalize)).to.equal('11.5rad');
    });

    it('should resolve a deg-length node', () => {
      const node = new ast.CssAngleNode(11.5, 'deg');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5deg');
      expect(resolvedCss(node)).to.equal('11.5deg');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5deg');

      const norm = node.norm(context);
      expect(norm).to.not.equal(node);
      expect(norm.css()).to.match(/[\d\.]*rad/);
      expect(norm.num_).to.closeTo(0.2007, 1e-4);
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context, normalize).units_).to.equal('rad');
      expect(node.calc(context, normalize).num_).to.closeTo(0.2007, 1e-4);
    });

    it('should resolve a grad-length node', () => {
      const node = new ast.CssAngleNode(11.5, 'grad');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5grad');
      expect(resolvedCss(node)).to.equal('11.5grad');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5grad');

      const norm = node.norm(context);
      expect(norm).to.not.equal(node);
      expect(norm.css()).to.match(/[\d\.]*rad/);
      expect(norm.num_).to.closeTo(0.1806, 1e-4);
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context, normalize).units_).to.equal('rad');
      expect(node.calc(context, normalize).num_).to.closeTo(0.1806, 1e-4);
    });
  });

  describe('time', () => {
    it('should always consider as const', () => {
      expect(ast.isVarCss('11.5ms', false)).to.be.false;
      expect(ast.isVarCss('11.5s', false)).to.be.false;

      expect(ast.isVarCss('11.5ms', normalize)).to.be.false;
      expect(ast.isVarCss('11.5s', normalize)).to.be.true;
    });

    it('should resolve a milliseconds node', () => {
      const node = new ast.CssTimeNode(11.5, 'ms');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5ms');
      expect(resolvedCss(node)).to.equal('11.5ms');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5ms');
      expect(node.norm()).to.equal(node);
      expect(node.norm().css()).to.equal('11.5ms');
      expect(node.isConst(normalize)).to.be.true;
      expect(resolvedCss(node, normalize)).to.equal('11.5ms');
    });

    it('should resolve a seconds node', () => {
      const node = new ast.CssTimeNode(11.5, 's');
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('11.5s');
      expect(resolvedCss(node)).to.equal('11.5s');
      expect(node.createSameUnits(20.5).css()).to.equal('20.5s');

      const norm = node.norm(context);
      expect(norm).to.not.equal(node);
      expect(norm.css()).to.equal('11500ms');
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('11500ms');
    });
  });

  describe('function', () => {
    it('should resolve a const-arg function', () => {
      contextMock.expects('withDimension').never();
      const node = new ast.CssFuncNode('rgb', [
        new ast.CssNumberNode(201),
        new ast.CssNumberNode(202),
        new ast.CssNumberNode(203),
      ]);
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('rgb(201,202,203)');
      expect(resolvedCss(node)).to.equal('rgb(201,202,203)');
      expect(node.resolve(context)).to.equal(node);
      expect(node.isConst(normalize)).to.be.true;
      expect(resolvedCss(node, normalize)).to.equal('rgb(201,202,203)');
    });

    it('should resolve a var-arg function', () => {
      contextMock.expects('withDimension').never();
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssNumberNode(11))
        .twice();
      const node = new ast.CssFuncNode('rgb', [
        new ast.CssNumberNode(201),
        new ast.CssNumberNode(202),
        new ast.CssVarNode('--var1'),
      ]);
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('rgb(201,202,var(--var1))');
      expect(resolvedCss(node)).to.equal('rgb(201,202,11)');
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('rgb(201,202,11)');
    });

    it('should norm function', () => {
      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock.expects('getCurrentFontSize').returns(10).atLeast(1);
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .atLeast(1);
      const node = new ast.CssFuncNode('xyz', [
        new ast.CssLengthNode(11, 'px'),
        new ast.CssLengthNode(11.5, 'em'),
        new ast.CssPercentNode(11.5),
      ]);
      expect(node.isConst()).to.be.true;
      expect(node.css()).to.equal('xyz(11px,11.5em,11.5%)');
      expect(resolvedCss(node)).to.equal('xyz(11px,11.5em,11.5%)');
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.equal('xyz(11px,115px,12.65px)');
    });

    it('should push a dimension when specified', () => {
      let index = 0;
      const stack = [];
      context.withDimension = function (dim, callback) {
        stack.push(dim);
        const res = callback();
        stack.pop();
        return res;
      };

      const arg1 = new ast.CssNumberNode(201);
      arg1.resolve = function () {
        expect(index).to.equal(0);
        expect(stack).to.deep.equal(['w']);
        index++;
        return new ast.CssPassthroughNode('w');
      };

      const arg2 = new ast.CssNumberNode(202);
      arg2.resolve = function () {
        expect(index).to.equal(1);
        expect(stack).to.deep.equal(['h']);
        index++;
        return new ast.CssPassthroughNode('h');
      };

      const arg3 = new ast.CssNumberNode(203);
      arg3.resolve = function () {
        expect(index).to.equal(2);
        expect(stack).to.deep.equal([]);
        index++;
        return new ast.CssPassthroughNode('-');
      };

      const node = new ast.CssFuncNode('rgb', [arg1, arg2, arg3], ['w', 'h']);
      expect(node.calc(context).css()).to.equal('rgb(w,h,-)');
      expect(index).to.equal(3);
    });

    it('should resolve a var-arg function with nulls', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .atLeast(1);
      const node = new ast.CssFuncNode('rgb', [
        new ast.CssNumberNode(201),
        new ast.CssNumberNode(202),
        new ast.CssVarNode('--var1'),
      ]);
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('rgb(201,202,var(--var1))');
      expect(resolvedCss(node)).to.be.null;
      expect(node.isConst(normalize)).to.be.false;
      expect(resolvedCss(node, normalize)).to.be.null;
    });
  });

  describe('translate', () => {
    let dimStack;

    beforeEach(() => {
      dimStack = [];
      context.withDimension = function (dim, callback) {
        dimStack.push(dim);
        const res = callback();
        dimStack.pop();
        return res;
      };
      env.sandbox
        .stub(ast.CssPassthroughNode.prototype, 'resolve')
        .callsFake(function () {
          return new ast.CssPassthroughNode(this.css_ + dimStack.join(''));
        });
    });

    it('should always consider as const', () => {
      expect(ast.isVarCss('translate(10px)', false)).to.be.false;
      expect(ast.isVarCss('translateX(10px)', false)).to.be.false;
      expect(ast.isVarCss('translateY(10px)', false)).to.be.false;
      expect(ast.isVarCss('translate3d(10px)', false)).to.be.false;

      expect(ast.isVarCss('translate(10px)', normalize)).to.be.false;
      expect(ast.isVarCss('translate(10%)', normalize)).to.be.true;
      expect(ast.isVarCss('translate(10em)', normalize)).to.be.true;
      expect(ast.isVarCss('translate(10EM)', normalize)).to.be.true;
    });

    it('should resolve 2d translate', () => {
      const node = new ast.CssTranslateNode('', [
        new ast.CssPassthroughNode('X'),
        new ast.CssPassthroughNode('Y'),
      ]);
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('translate(Xw,Yh)');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('translate(Xw,Yh)');
    });

    it('should resolve abbreviated 2d translate', () => {
      const node = new ast.CssTranslateNode('', [
        new ast.CssPassthroughNode('X'),
      ]);
      expect(node.calc(context).css()).to.equal('translate(Xw)');
    });

    it('should resolve translateX', () => {
      const node = new ast.CssTranslateNode('x', [
        new ast.CssPassthroughNode('X'),
      ]);
      expect(node.calc(context).css()).to.equal('translatex(Xw)');
    });

    it('should resolve translateY', () => {
      const node = new ast.CssTranslateNode('y', [
        new ast.CssPassthroughNode('Y'),
      ]);
      expect(node.calc(context).css()).to.equal('translatey(Yh)');
    });

    it('should resolve translateZ', () => {
      const node = new ast.CssTranslateNode('z', [
        new ast.CssPassthroughNode('Z'),
      ]);
      expect(node.calc(context).css()).to.equal('translatez(Zz)');
    });

    it('should resolve translate3d', () => {
      const node = new ast.CssTranslateNode('3d', [
        new ast.CssPassthroughNode('X'),
        new ast.CssPassthroughNode('Y'),
        new ast.CssPassthroughNode('Z'),
      ]);
      expect(node.calc(context).css()).to.equal('translate3d(Xw,Yh,Zz)');
    });

    it('should resolve translate with null args to null', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      const node = new ast.CssTranslateNode('', [
        new ast.CssPassthroughNode('X'),
        new ast.CssVarNode('--var1'),
      ]);
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context)).to.be.null;
    });
  });

  describe('dimension', () => {
    let rects;

    beforeEach(() => {
      rects = {
        'null(.class)': {x: 10, y: 20, width: 111, height: 222},
        'closest(.class > div)': {x: 11, y: 12, width: 112, height: 224},
      };
      context.getCurrentElementRect = function () {
        return {x: 13, y: 14, width: 110, height: 220};
      };
      context.getElementRect = function (selector, selectionMethod) {
        return rects[`${selectionMethod}(${selector})`];
      };
    });

    it('should always consider as non-const', () => {
      expect(ast.isVarCss('width()', false)).to.be.true;
      expect(ast.isVarCss('height()', false)).to.be.true;
      expect(ast.isVarCss('x()', false)).to.be.true;
      expect(ast.isVarCss('y()', false)).to.be.true;
      expect(ast.isVarCss('width("")')).to.be.true;
      expect(ast.isVarCss('height("")')).to.be.true;
      expect(ast.isVarCss('x("")')).to.be.true;
      expect(ast.isVarCss('y("")')).to.be.true;
    });

    it('should be always a non-const and no css', () => {
      const node = new ast.CssRectNode('?');
      expect(node.isConst()).to.be.false;
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve width on the current node', () => {
      const node = new ast.CssRectNode('w');
      expect(node.calc(context).css()).to.equal('110px');
    });

    it('should resolve height on the current node', () => {
      const node = new ast.CssRectNode('h');
      expect(node.calc(context).css()).to.equal('220px');
    });

    it('should resolve width on the selected node', () => {
      const node = new ast.CssRectNode('w', '.class');
      expect(node.calc(context).css()).to.equal('111px');
    });

    it('should resolve height on the selected node', () => {
      const node = new ast.CssRectNode('h', '.class');
      expect(node.calc(context).css()).to.equal('222px');
    });

    it('should resolve width on the selected closest node', () => {
      const node = new ast.CssRectNode('w', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('112px');
    });

    it('should resolve height on the selected closest node', () => {
      const node = new ast.CssRectNode('h', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('224px');
    });

    it('should resolve x coord on the current node', () => {
      const node = new ast.CssRectNode('x');
      expect(node.calc(context).css()).to.equal('13px');
    });

    it('should resolve y coord on the current node', () => {
      const node = new ast.CssRectNode('y');
      expect(node.calc(context).css()).to.equal('14px');
    });

    it('should resolve x coord on the selected node', () => {
      const node = new ast.CssRectNode('x', '.class');
      expect(node.calc(context).css()).to.equal('10px');
    });

    it('should resolve y coord on the selected node', () => {
      const node = new ast.CssRectNode('y', '.class');
      expect(node.calc(context).css()).to.equal('20px');
    });

    it('should resolve x coord on the selected closest node', () => {
      const node = new ast.CssRectNode('x', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('11px');
    });

    it('should resolve y coord on the selected closest node', () => {
      const node = new ast.CssRectNode('y', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('12px');
    });
  });

  describe('num-convert', () => {
    it('should always consider as non-const', () => {
      expect(ast.isVarCss('num(10px)')).to.be.true;
      expect(ast.isVarCss('num(10em)', normalize)).to.be.true;
    });

    it('should always be a non-const and no css', () => {
      const node = new ast.CssNumConvertNode();
      expect(node.isConst()).to.equal(false);
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve num from a number', () => {
      const node = new ast.CssNumConvertNode(new ast.CssNumberNode(10));
      expect(resolvedCss(node)).to.equal('10');
    });

    it('should resolve num from a zero', () => {
      const node = new ast.CssNumConvertNode(new ast.CssNumberNode(0));
      expect(resolvedCss(node)).to.equal('0');
    });

    it('should resolve num from a length', () => {
      const node = new ast.CssNumConvertNode(new ast.CssLengthNode(10, 'px'));
      expect(resolvedCss(node)).to.equal('10');
    });

    it('should resolve num from a zero length', () => {
      const node = new ast.CssNumConvertNode(new ast.CssLengthNode(0, 'px'));
      expect(resolvedCss(node)).to.equal('0');
    });

    it('should resolve num from a time', () => {
      const node = new ast.CssNumConvertNode(new ast.CssTimeNode(10, 's'));
      expect(resolvedCss(node)).to.equal('10');
      expect(resolvedCss(node, normalize)).to.equal('10000');
    });

    it('should resolve num from a percent', () => {
      const node = new ast.CssNumConvertNode(new ast.CssPercentNode(10));
      expect(resolvedCss(node)).to.equal('10');

      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .atLeast(1);
      expect(resolvedCss(node, normalize)).to.equal('11');
    });

    it('should resolve num from an expression', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(100, 'px'))
        .once();
      const node = new ast.CssNumConvertNode(new ast.CssVarNode('--var1'));
      expect(resolvedCss(node)).to.equal('100');
    });

    it('should resolve num with a null arg', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      const node = new ast.CssNumConvertNode(new ast.CssVarNode('--var1'));
      expect(resolvedCss(node)).to.be.null;
    });

    it('should resolve num from a string', () => {
      const node = new ast.CssNumConvertNode(new ast.CssPassthroughNode('11x'));
      expect(resolvedCss(node)).to.equal('11');
    });

    it('should resolve num from a non-parseable string', () => {
      const node = new ast.CssNumConvertNode(new ast.CssPassthroughNode('A'));
      expect(resolvedCss(node)).to.be.null;
    });
  });

  describe('rand', () => {
    beforeEach(() => {
      env.sandbox.stub(Math, 'random').callsFake(() => 0.25);
    });

    it('should always consider as non-const', () => {
      expect(ast.isVarCss('rand()')).to.be.true;
      expect(ast.isVarCss('rand(10px, 20px)')).to.be.true;
      expect(ast.isVarCss('rand(10px, 20px)', normalize)).to.be.true;
      expect(ast.isVarCss('rand(10em, 20em)', normalize)).to.be.true;
    });

    it('should always be a non-const and no css', () => {
      const node = new ast.CssRandNode();
      expect(node.isConst()).to.equal(false);
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve a no-arg rand', () => {
      const node = new ast.CssRandNode();
      expect(resolvedCss(node)).to.equal('0.25');
    });

    it('should rand two numbers', () => {
      const node = new ast.CssRandNode(
        new ast.CssNumberNode(10),
        new ast.CssNumberNode(20)
      );
      expect(resolvedCss(node)).to.equal('12.5');
    });

    it('should rand two numbers in opposite direction', () => {
      const node = new ast.CssRandNode(
        new ast.CssNumberNode(200),
        new ast.CssNumberNode(100)
      );
      expect(resolvedCss(node)).to.equal('125');
    });

    it('should rand two same-unit values - length', () => {
      const node = new ast.CssRandNode(
        new ast.CssLengthNode(10, 'px'),
        new ast.CssLengthNode(20, 'px')
      );
      expect(resolvedCss(node)).to.equal('12.5px');
    });

    it('should rand two same-unit values - times', () => {
      const node = new ast.CssRandNode(
        new ast.CssTimeNode(10, 's'),
        new ast.CssTimeNode(20, 's')
      );
      expect(resolvedCss(node)).to.equal('12.5s');
      expect(resolvedCss(node, normalize)).to.equal('12500ms');
    });

    it('should rand two same-unit values - percent', () => {
      const node = new ast.CssRandNode(
        new ast.CssPercentNode(10),
        new ast.CssPercentNode(20)
      );
      expect(resolvedCss(node)).to.equal('12.5%');

      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .atLeast(1);
      expect(resolvedCss(node, normalize)).to.equal('13.75px');
    });

    it('should resolve both parts', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(100, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(new ast.CssLengthNode(200, 'px'))
        .once();
      const node = new ast.CssRandNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2')
      );
      expect(resolvedCss(node)).to.equal('125px');
    });

    it('should resolve to null with null args', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssLengthNode(100, 'px'))
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(null)
        .once();
      const node = new ast.CssRandNode(
        new ast.CssVarNode('--var1'),
        new ast.CssVarNode('--var2')
      );
      expect(resolvedCss(node)).to.be.null;
    });

    it('should only allow numerics', () => {
      const node = new ast.CssRandNode(
        new ast.CssPassthroughNode('A'),
        new ast.CssPassthroughNode('B')
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/both numerical/);
    });

    it('should only allow same-type', () => {
      const node = new ast.CssRandNode(
        new ast.CssLengthNode(30, 'px'),
        new ast.CssTimeNode(20, 's')
      );
      expect(() => {
        resolvedCss(node);
      }).to.throw(/same type/);
    });

    it('should normalize units', () => {
      contextMock.expects('getCurrentFontSize').returns(1).once();
      contextMock.expects('getRootFontSize').returns(2).once();
      const node = new ast.CssRandNode(
        new ast.CssLengthNode(10, 'em'),
        new ast.CssLengthNode(10, 'rem')
      );
      expect(resolvedCss(node)).to.equal('12.5px');
    });
  });

  describe('index', () => {
    it('should always consider as non-const', () => {
      expect(ast.isVarCss('index()', false)).to.be.true;
      expect(ast.isVarCss('index()', normalize)).to.be.true;
    });

    it('should always be a non-const and no css', () => {
      const node = new ast.CssIndexNode();
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve a no-arg', () => {
      contextMock.expects('getCurrentIndex').withExactArgs().returns(11);
      const node = new ast.CssIndexNode();
      expect(resolvedCss(node)).to.equal('11');
    });

    it('should combine with calc', () => {
      contextMock.expects('getCurrentIndex').withExactArgs().returns(11);
      const node = new ast.CssCalcProductNode(
        new ast.CssTimeNode(2, 's'),
        new ast.CssIndexNode(),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(resolvedCss(node)).to.equal('22s');
    });
  });

  describe('length', () => {
    it('should always consider as non-const', () => {
      expect(ast.isVarCss('length()', false)).to.be.true;
      expect(ast.isVarCss('length()', normalize)).to.be.true;
    });

    it('should always be a non-const and no css', () => {
      const node = new ast.CssLengthFuncNode();
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve a no-arg', () => {
      contextMock.expects('getTargetLength').withExactArgs().returns(12);
      const node = new ast.CssLengthFuncNode();
      expect(resolvedCss(node)).to.equal('12');
    });

    it('should combine with calc', () => {
      contextMock.expects('getTargetLength').withExactArgs().returns(12);
      const node = new ast.CssCalcProductNode(
        new ast.CssTimeNode(2, 's'),
        new ast.CssLengthFuncNode(),
        '*'
      );
      expect(node.isConst()).to.be.false;
      expect(resolvedCss(node)).to.equal('24s');
    });
  });

  describe('var', () => {
    it('should always consider as non-const', () => {
      expect(ast.isVarCss('var(--x)')).to.be.true;
      expect(ast.isVarCss('var(--x)', normalize)).to.be.true;
      expect(ast.isVarCss('var(--x, 10px)', normalize)).to.be.true;
      expect(ast.isVarCss('var(--x, 10em)', normalize)).to.be.true;
    });

    it('should resolve a var node', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssPassthroughNode('val1'))
        .once();
      const node = new ast.CssVarNode('--var1');
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1)');
      expect(resolvedCss(node)).to.equal('val1');
    });

    it('should resolve a var node and normalize', () => {
      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock
        .expects('getCurrentElementRect')
        .returns({width: 110, height: 220})
        .atLeast(1);
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssPercentNode(11.5))
        .atLeast(1);
      const node = new ast.CssVarNode('--var1');
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.css()).to.equal('var(--var1)');
      expect(resolvedCss(node)).to.equal('11.5%');
      expect(resolvedCss(node, normalize)).to.equal('12.65px');
    });

    it('should resolve a var node with def', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(new ast.CssPassthroughNode('val1'))
        .once();
      const node = new ast.CssVarNode(
        '--var1',
        new ast.CssPassthroughNode('10px')
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,10px)');
      expect(resolvedCss(node)).to.equal('val1');
    });

    it('should resolve a var node by fallback to def', () => {
      contextMock.expects('getVar').returns(null).once();
      const node = new ast.CssVarNode(
        '--var1',
        new ast.CssPassthroughNode('10px')
      );
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,10px)');
      expect(resolvedCss(node)).to.equal('10px');
    });

    it('should resolve a var node with def as var', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      contextMock
        .expects('getVar')
        .withExactArgs('--var2')
        .returns(new ast.CssPassthroughNode('val2'))
        .once();
      const node = new ast.CssVarNode('--var1', new ast.CssVarNode('--var2'));
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,var(--var2))');
      expect(resolvedCss(node)).to.equal('val2');
    });

    it('should resolve a var node w/o fallback to def', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .atLeast(1);
      const node = new ast.CssVarNode('--var1');
      expect(node.css()).to.equal('var(--var1)');
      expect(node.isConst()).to.be.false;
      expect(node.resolve(context)).to.be.null;
      expect(node.calc(context)).to.be.null;
      expect(resolvedCss(node)).to.be.null;
    });
  });
});
