import * as ast from '../parsers/css-expr-ast';

describes.sandboxed('CSS resolve clip-path', {}, (env) => {
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

  describe('box', () => {
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
      expect(ast.isVarCss('10px', false)).to.be.false;
      expect(ast.isVarCss('10px 20%', false)).to.be.false;
      expect(ast.isVarCss('10px 20% 30em', false)).to.be.false;
      expect(ast.isVarCss('10px 20% 30em 40rem', false)).to.be.false;

      expect(ast.isVarCss('10px', normalize)).to.be.false;
      expect(ast.isVarCss('10%', normalize)).to.be.true;
      expect(ast.isVarCss('10em', normalize)).to.be.true;
      expect(ast.isVarCss('10EM', normalize)).to.be.true;
    });

    it('should resolve <all> inset box', () => {
      const node = ast.createBoxNode(new ast.CssPassthroughNode('A'));
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Ah Aw');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Ah Aw');
    });

    it('should resolve <vertical horizontal> inset box', () => {
      const node = ast.createBoxNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('V'),
          new ast.CssPassthroughNode('H'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Vh Hw');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Vh Hw');
    });

    it('should resolve <top horizontal bottom> inset box', () => {
      const node = ast.createBoxNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('T'),
          new ast.CssPassthroughNode('H'),
          new ast.CssPassthroughNode('B'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Th Hw Bh');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Th Hw Bh');
    });

    it('should resolve <top right bottom left> inset box', () => {
      const node = ast.createBoxNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('T'),
          new ast.CssPassthroughNode('R'),
          new ast.CssPassthroughNode('B'),
          new ast.CssPassthroughNode('L'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Th Rw Bh Lw');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Th Rw Bh Lw');
    });

    it('should resolve <top right bottom left> w/o dimensions', () => {
      const node = ast.createBoxNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('T'),
          new ast.CssPassthroughNode('R'),
          new ast.CssPassthroughNode('B'),
          new ast.CssPassthroughNode('L'),
        ]),
        []
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('T R B L');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('T R B L');
    });

    it('should resolve box with null args to null', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      const node = ast.createBoxNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('V'),
          new ast.CssVarNode('--var1'),
        ])
      );
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context)).to.be.null;
    });
  });

  describe('clip-path:inset', () => {
    let dimStack;
    let isConst;

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
      isConst = true;
      env.sandbox
        .stub(ast.CssPassthroughNode.prototype, 'isConst')
        .callsFake(function () {
          return isConst;
        });
    });

    it('should always consider as const', () => {
      expect(ast.isVarCss('inset(10px)', false)).to.be.false;
      expect(ast.isVarCss('inset(10px 20%)', false)).to.be.false;
      expect(ast.isVarCss('inset(10px 20px 30px)', false)).to.be.false;
      expect(ast.isVarCss('inset(10px 20px 30px 40px)', false)).to.be.false;

      expect(ast.isVarCss('inset(10px)', normalize)).to.be.false;
      expect(ast.isVarCss('inset(10%)', normalize)).to.be.true;
      expect(ast.isVarCss('inset(10em)', normalize)).to.be.true;
      expect(ast.isVarCss('inset(10EM)', normalize)).to.be.true;
    });

    it('should resolve the <all> inset box', () => {
      const node = ast.createInsetNode(new ast.CssPassthroughNode('A'));
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('inset(A A)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal('inset(Ah Aw)');
    });

    it('should resolve the non-<all> inset box', () => {
      const node = ast.createInsetNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('V'),
          new ast.CssPassthroughNode('H'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('inset(V H)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal('inset(Vh Hw)');
    });

    it('should resolve inset with null args to null', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      const node = ast.createInsetNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('V'),
          new ast.CssVarNode('--var1'),
        ])
      );
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context)).to.be.null;
    });

    it('should resolve inset with one border', () => {
      const node = ast.createInsetNode(
        new ast.CssPassthroughNode('A'),
        new ast.CssPassthroughNode('R')
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('inset(A A round R)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal(
        'inset(Ah Aw round R)'
      );
    });

    it('should resolve inset with two borders', () => {
      const node = ast.createInsetNode(
        new ast.CssPassthroughNode('A'),
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('R1'),
          new ast.CssPassthroughNode('/'),
          new ast.CssPassthroughNode('R2'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('inset(A A round R1 / R2)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal(
        'inset(Ah Aw round R1 / R2)'
      );
    });
  });

  describe('ellipse position', () => {
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
      expect(ast.isVarCss('top 10% left 20%', false)).to.be.false;
      expect(ast.isVarCss('left 20%', false)).to.be.false;

      expect(ast.isVarCss('top 10px left 20px', normalize)).to.be.false;
      expect(ast.isVarCss('top 10px left 20%', normalize)).to.be.true;
      expect(ast.isVarCss('top 10px left 20em', normalize)).to.be.true;
    });

    it('should resolve a position-1', () => {
      const node = ast.createPositionNode(new ast.CssPassthroughNode('H'));
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Hw');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Hw');
    });

    it('should resolve a position-2', () => {
      const node = ast.createPositionNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('H'),
          new ast.CssPassthroughNode('V'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('Hw Vh');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('Hw Vh');
    });

    it('should disallow a position-3', () => {
      expect(() => {
        ast.createPositionNode(
          new ast.CssConcatNode([
            new ast.CssPassthroughNode('H'),
            new ast.CssPassthroughNode('V'),
            new ast.CssPassthroughNode('X'),
          ])
        );
      }).to.throw(/1, 2, or 4/);
    });

    it('should resolve a position-4 left/top', () => {
      const node = ast.createPositionNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('left'),
          new ast.CssPassthroughNode('H'),
          new ast.CssPassthroughNode('top'),
          new ast.CssPassthroughNode('V'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('leftw Hw toph Vh');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('leftw Hw toph Vh');
    });

    it('should resolve a position-4 top/left', () => {
      const node = ast.createPositionNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('top'),
          new ast.CssPassthroughNode('V'),
          new ast.CssPassthroughNode('left'),
          new ast.CssPassthroughNode('H'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('toph Vh leftw Hw');
      expect(node.isConst(normalize)).to.be.true;
      expect(node.calc(context, normalize).css()).to.equal('toph Vh leftw Hw');
    });

    it('should resolve a position with null args to null', () => {
      contextMock
        .expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .once();
      const node = ast.createPositionNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('V'),
          new ast.CssVarNode('--var1'),
        ])
      );
      expect(node.isConst()).to.be.false;
      expect(node.isConst(normalize)).to.be.false;
      expect(node.calc(context)).to.be.null;
    });
  });

  describe('clip-path:ellipse', () => {
    let dimStack;
    let isConst;

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
      isConst = true;
      env.sandbox
        .stub(ast.CssPassthroughNode.prototype, 'isConst')
        .callsFake(function () {
          return isConst;
        });
    });

    it('should always consider as const', () => {
      expect(ast.isVarCss('ellipse(10px 20px)', false)).to.be.false;
      expect(ast.isVarCss('ellipse(10px 20%)', false)).to.be.false;

      expect(ast.isVarCss('ellipse(10px 20px)', normalize)).to.be.false;
      expect(ast.isVarCss('ellipse(10% 20%)', normalize)).to.be.true;
      expect(ast.isVarCss('ellipse(10em 20em)', normalize)).to.be.true;
    });

    it('should resolve ellipse with radii and w/o position', () => {
      const node = ast.createEllipseNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('R1'),
          new ast.CssPassthroughNode('R2'),
        ])
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('ellipse(R1 R2)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal('ellipse(R1 R2)');
    });

    it('should resolve ellipse with position and w/o radii', () => {
      const node = ast.createEllipseNode(null, new ast.CssPassthroughNode('H'));
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('ellipse(at H)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal('ellipse(at Hw)');
    });

    it('should resolve ellipse with position and radii', () => {
      const node = ast.createEllipseNode(
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('R1'),
          new ast.CssPassthroughNode('R2'),
        ]),
        new ast.CssPassthroughNode('H')
      );
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('ellipse(R1 R2 at H)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal(
        'ellipse(R1 R2 at Hw)'
      );
    });
  });

  describe('clip-path:polygon', () => {
    let dimStack;
    let isConst;

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
      isConst = true;
      env.sandbox
        .stub(ast.CssPassthroughNode.prototype, 'isConst')
        .callsFake(function () {
          return isConst;
        });
    });

    it('should always consider as const', () => {
      expect(ast.isVarCss('polygon(10px 20px)', false)).to.be.false;
      expect(ast.isVarCss('polygon(10px 20%)', false)).to.be.false;

      expect(ast.isVarCss('polygon(10px 20px)', normalize)).to.be.false;
      expect(ast.isVarCss('polygon(10px 20px, 10% 20%)', normalize)).to.be.true;
      expect(ast.isVarCss('polygon(10px 20px, 10em 20em)', normalize)).to.be
        .true;
    });

    it('should resolve polygon with radii and w/o position', () => {
      const node = ast.createPolygonNode([
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('X1'),
          new ast.CssPassthroughNode('Y1'),
        ]),
        new ast.CssConcatNode([
          new ast.CssPassthroughNode('X2'),
          new ast.CssPassthroughNode('Y2'),
        ]),
      ]);
      expect(node.isConst()).to.be.true;
      expect(node.calc(context).css()).to.equal('polygon(X1 Y1,X2 Y2)');
      expect(node.isConst(normalize)).to.be.true;
      isConst = false;
      expect(node.calc(context, normalize).css()).to.equal(
        'polygon(X1w Y1h,X2w Y2h)'
      );
    });
  });
});
