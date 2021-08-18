import {parseCss} from '../parsers/css-expr';
import * as ast from '../parsers/css-expr-ast';

describes.sandboxed('CSS parse', {}, () => {
  /**
   * @param {string} cssString
   * @return {string}
   */
  function parsePseudo(cssString) {
    const node = parseCss(cssString);
    if (node == null) {
      return null;
    }
    return pseudo(node);
  }

  /**
   * @param {!CssNode} n
   * @return {string}
   */
  function pseudo(n) {
    if (n instanceof ast.CssPassthroughNode) {
      return n.css_;
    }
    if (n instanceof ast.CssUrlNode) {
      return `URL<${n.url_}>`;
    }
    if (n instanceof ast.CssConcatNode) {
      return `CON<${pseudoArray(n.array_, n.dimensions_, ' ')}>`;
    }
    if (n instanceof ast.CssNumericNode) {
      return (
        `${n.type_}<${n.num_}` +
        `${n.units_ && n.units_ != '%' ? ' ' + n.units_.toUpperCase() : ''}>`
      );
    }
    if (n instanceof ast.CssTranslateNode) {
      return (
        'TRANSLATE' +
        `${n.suffix_ ? '-' + n.suffix_.toUpperCase() : ''}` +
        `<${pseudoArray(n.args_, n.dimensions_)}>`
      );
    }
    if (n instanceof ast.CssRectNode) {
      return (
        `RECT<${n.field_}` +
        `, ${n.selector_ ? '"' + n.selector_ + '"' : null}` +
        `, ${n.selectionMethod_}>`
      );
    }
    if (n instanceof ast.CssNumConvertNode) {
      return `NUMC<${n.value_ ? pseudo(n.value_) : null}>`;
    }
    if (n instanceof ast.CssRandNode) {
      return (
        `RAND<${n.left_ ? pseudo(n.left_) : null}` +
        `, ${n.right_ ? pseudo(n.right_) : null}>`
      );
    }
    if (n instanceof ast.CssIndexNode) {
      return 'INDEX<>';
    }
    if (n instanceof ast.CssLengthFuncNode) {
      return 'LENGTH<>';
    }
    if (n instanceof ast.CssVarNode) {
      return `VAR<${n.varName_}${n.def_ ? ', ' + pseudo(n.def_) : ''}>`;
    }
    if (n instanceof ast.CssCalcNode) {
      return `CALC<${pseudo(n.expr_)}>`;
    }
    if (n instanceof ast.CssCalcSumNode) {
      return (
        `${n.op_ == '+' ? 'ADD' : 'SUB'}` +
        `<${pseudo(n.left_)}, ${pseudo(n.right_)}>`
      );
    }
    if (n instanceof ast.CssCalcProductNode) {
      return (
        `${n.op_ == '*' ? 'MUL' : 'DIV'}` +
        `<${pseudo(n.left_)}, ${pseudo(n.right_)}>`
      );
    }
    if (n instanceof ast.CssFuncNode) {
      return `${n.name_.toUpperCase()}<${pseudoArray(n.args_, n.dimensions_)}>`;
    }
    throw new Error('unknown node: ' + n);
  }

  /**
   * @param {!Array<!CssNode>} array
   * @param {?Array<string>} dims
   * @param {string=} delim
   * @return {string}
   */
  function pseudoArray(array, dims = null, delim = ', ') {
    if (!array || array.length == 0) {
      return '';
    }
    return array
      .map((n, i) => {
        const v = pseudo(n);
        if (dims && i < dims.length) {
          return `${v}|${dims[i]}`;
        }
        return v;
      })
      .join(delim);
  }

  it('should parse empty string as null', () => {
    expect(parsePseudo('')).to.be.null;
  });

  it('should parse string', () => {
    expect(parsePseudo('"abc"')).to.equal('"abc"');
    expect(parsePseudo("'abc'")).to.equal("'abc'");
  });

  it('should parse "none" ident', () => {
    expect(parsePseudo('none')).to.equal('none');
  });

  it('should parse ident', () => {
    expect(parsePseudo('abc')).to.equal('abc');
    expect(parsePseudo('-abc')).to.equal('-abc');
    expect(parsePseudo('-abc1')).to.equal('-abc1');
    expect(parsePseudo('-abc1a')).to.equal('-abc1a');
  });

  it('should parse number', () => {
    expect(parsePseudo('0')).to.equal('NUM<0>');
    expect(parsePseudo('1')).to.equal('NUM<1>');
    expect(parsePseudo('10')).to.equal('NUM<10>');
    expect(parsePseudo('0.5')).to.equal('NUM<0.5>');
    expect(parsePseudo('.5')).to.equal('NUM<0.5>');
    expect(parsePseudo('1.5')).to.equal('NUM<1.5>');
    expect(parsePseudo('-0.5')).to.equal('NUM<-0.5>');
    expect(parsePseudo('-.5')).to.equal('NUM<-0.5>');
    expect(parsePseudo('+.5')).to.equal('NUM<0.5>');
    expect(parsePseudo('+1.5')).to.equal('NUM<1.5>');
    expect(parsePseudo('1e2')).to.equal('NUM<100>');
    expect(parsePseudo('.1e2')).to.equal('NUM<10>');
    expect(parsePseudo('1e+2')).to.equal('NUM<100>');
    expect(parsePseudo('1e-2')).to.equal('NUM<0.01>');
  });

  it('should parse percent', () => {
    expect(parsePseudo('0%')).to.equal('PRC<0>');
    expect(parsePseudo('1%')).to.equal('PRC<1>');
    expect(parsePseudo('0.5%')).to.equal('PRC<0.5>');
    expect(parsePseudo('.5%')).to.equal('PRC<0.5>');
    expect(parsePseudo('1e2%')).to.equal('PRC<100>');
  });

  it('should parse length', () => {
    expect(parsePseudo('100px')).to.equal('LEN<100 PX>');
    expect(parsePseudo('-100px')).to.equal('LEN<-100 PX>');
    expect(parsePseudo('+100px')).to.equal('LEN<100 PX>');
    expect(parsePseudo('100.5px')).to.equal('LEN<100.5 PX>');
    expect(parsePseudo('0.5px')).to.equal('LEN<0.5 PX>');
    expect(parsePseudo('.5px')).to.equal('LEN<0.5 PX>');

    // Non-px units:
    expect(parsePseudo('100em')).to.equal('LEN<100 EM>');
    expect(parsePseudo('100rem')).to.equal('LEN<100 REM>');
    expect(parsePseudo('100vh')).to.equal('LEN<100 VH>');
    expect(parsePseudo('100vw')).to.equal('LEN<100 VW>');
    expect(parsePseudo('100vmin')).to.equal('LEN<100 VMIN>');
    expect(parsePseudo('100vmax')).to.equal('LEN<100 VMAX>');
    expect(parsePseudo('100cm')).to.equal('LEN<100 CM>');
    expect(parsePseudo('100mm')).to.equal('LEN<100 MM>');
    expect(parsePseudo('100q')).to.equal('LEN<100 Q>');
    expect(parsePseudo('100in')).to.equal('LEN<100 IN>');
    expect(parsePseudo('100pc')).to.equal('LEN<100 PC>');
    expect(parsePseudo('100pt')).to.equal('LEN<100 PT>');
  });

  it('should parse angle', () => {
    expect(parsePseudo('10deg')).to.equal('ANG<10 DEG>');
    expect(parsePseudo('-10deg')).to.equal('ANG<-10 DEG>');
    expect(parsePseudo('+10deg')).to.equal('ANG<10 DEG>');
    expect(parsePseudo('1.5deg')).to.equal('ANG<1.5 DEG>');
    expect(parsePseudo('0.5deg')).to.equal('ANG<0.5 DEG>');
    expect(parsePseudo('.5deg')).to.equal('ANG<0.5 DEG>');

    // Non-deg units:
    expect(parsePseudo('10rad')).to.equal('ANG<10 RAD>');
    expect(parsePseudo('10grad')).to.equal('ANG<10 GRAD>');
  });

  it('should parse time', () => {
    expect(parsePseudo('10ms')).to.equal('TME<10 MS>');
    expect(parsePseudo('10s')).to.equal('TME<10 S>');
  });

  it('should parse url', () => {
    expect(parsePseudo('url("https://acme.org/abc")')).to.equal(
      'URL<https://acme.org/abc>'
    );
    expect(parsePseudo("url('https://acme.org/abc')")).to.equal(
      'URL<https://acme.org/abc>'
    );
    expect(parsePseudo("url('data:abc')")).to.equal('URL<data:abc>');
    // HTTP and relative are allowed at this stage.
    expect(parsePseudo("url('http://acme.org/abc')")).to.equal(
      'URL<http://acme.org/abc>'
    );
    expect(parsePseudo("url('/relative')")).to.equal('URL</relative>');
  });

  it('should parse hexcolor', () => {
    expect(parsePseudo('#123456')).to.equal('#123456');
    expect(parsePseudo('#AB3456')).to.equal('#AB3456');
    expect(parsePseudo('#ABCDEF')).to.equal('#ABCDEF');
    // Alpha-format:
    expect(parsePseudo('#ABCDEF01')).to.equal('#ABCDEF01');
    // Abbrv:
    expect(parsePseudo('#FFF')).to.equal('#FFF');
    expect(parsePseudo('#fff')).to.equal('#fff');
  });

  it('should parse a function', () => {
    expect(parsePseudo('unknown()')).to.equal('UNKNOWN<>');
    expect(parsePseudo('unknown( )')).to.equal('UNKNOWN<>');
    expect(parsePseudo('rgb(10, 20, 30)')).to.equal(
      'RGB<NUM<10>, NUM<20>, NUM<30>>'
    );
    expect(parsePseudo('translate(100px, 200px)')).to.equal(
      'TRANSLATE<LEN<100 PX>|w, LEN<200 PX>|h>'
    );
  });

  it('should parse a translate()', () => {
    expect(parsePseudo('translate(100px)')).to.equal(
      'TRANSLATE<LEN<100 PX>|w>'
    );
    expect(parsePseudo('translate(100px, 200px)')).to.equal(
      'TRANSLATE<LEN<100 PX>|w, LEN<200 PX>|h>'
    );
    expect(parsePseudo('translateX(100px)')).to.equal(
      'TRANSLATE-X<LEN<100 PX>|w>'
    );
    expect(parsePseudo('TRANSLATEX(100px)')).to.equal(
      'TRANSLATE-X<LEN<100 PX>|w>'
    );
    expect(parsePseudo('translatex(100px)')).to.equal(
      'TRANSLATE-X<LEN<100 PX>|w>'
    );
    expect(parsePseudo('translateY(100px)')).to.equal(
      'TRANSLATE-Y<LEN<100 PX>|h>'
    );
    expect(parsePseudo('translateZ(100px)')).to.equal(
      'TRANSLATE-Z<LEN<100 PX>|z>'
    );
    expect(parsePseudo('translate3d(1px, 2px, 3px)')).to.equal(
      'TRANSLATE-3D<LEN<1 PX>|w, LEN<2 PX>|h, LEN<3 PX>|z>'
    );
  });

  it('should parse a concat of functions', () => {
    expect(parsePseudo('translateX(100px) rotate(45deg)')).to.equal(
      'CON<TRANSLATE-X<LEN<100 PX>|w> ROTATE<ANG<45 DEG>>>'
    );
  });

  it('should allow two-way concatenation', () => {
    // This is currently doesn't happen in parse, but by API possible with
    // minor changes to parsing order. Thus it's re-tested separately here.
    expect(
      pseudo(
        ast.CssConcatNode.concat(
          new ast.CssConcatNode([new ast.CssPassthroughNode('A')]),
          new ast.CssConcatNode([new ast.CssPassthroughNode('B')])
        )
      )
    ).to.equal('CON<A B>');
    expect(
      pseudo(
        ast.CssConcatNode.concat(
          new ast.CssPassthroughNode('A'),
          new ast.CssConcatNode([new ast.CssPassthroughNode('B')])
        )
      )
    ).to.equal('CON<A B>');
  });

  it('should parse a rect function', () => {
    // Current.
    expect(parsePseudo('width()')).to.equal('RECT<w, null, null>');
    expect(parsePseudo('height()')).to.equal('RECT<h, null, null>');
    expect(parsePseudo('x()')).to.equal('RECT<x, null, null>');
    expect(parsePseudo('y()')).to.equal('RECT<y, null, null>');

    // Query.
    expect(parsePseudo('width(".sel")')).to.equal('RECT<w, ".sel", null>');
    expect(parsePseudo('WIDTH(".sel > div")')).to.equal(
      'RECT<w, ".sel > div", null>'
    );
    expect(parsePseudo('height(".sel")')).to.equal('RECT<h, ".sel", null>');
    expect(parsePseudo('x(".sel")')).to.equal('RECT<x, ".sel", null>');
    expect(parsePseudo('x(".sel > div")')).to.equal(
      'RECT<x, ".sel > div", null>'
    );
    expect(parsePseudo('y(".sel")')).to.equal('RECT<y, ".sel", null>');

    // Closest.
    expect(parsePseudo('width(closest(".sel"))')).to.equal(
      'RECT<w, ".sel", closest>'
    );
    expect(parsePseudo('height(closest(".sel"))')).to.equal(
      'RECT<h, ".sel", closest>'
    );
    expect(parsePseudo('x(closest(".sel"))')).to.equal(
      'RECT<x, ".sel", closest>'
    );
    expect(parsePseudo('y(closest(".sel"))')).to.equal(
      'RECT<y, ".sel", closest>'
    );
  });

  it('should parse a num-convert function', () => {
    expect(parsePseudo('num(10)')).to.equal('NUMC<NUM<10>>');
    expect(parsePseudo('num(10px)')).to.equal('NUMC<LEN<10 PX>>');
    expect(parsePseudo('num(10em)')).to.equal('NUMC<LEN<10 EM>>');
    expect(parsePseudo('num(10s)')).to.equal('NUMC<TME<10 S>>');
    expect(parsePseudo('num(10rad)')).to.equal('NUMC<ANG<10 RAD>>');
    expect(parsePseudo('num(10%)')).to.equal('NUMC<PRC<10>>');
    expect(parsePseudo('num(var(--x))')).to.equal('NUMC<VAR<--x>>');
  });

  it('should parse a rand function', () => {
    expect(parsePseudo('rand()')).to.equal('RAND<null, null>');
    expect(parsePseudo('rand(10, 20)')).to.equal('RAND<NUM<10>, NUM<20>>');
    expect(parsePseudo('rand(10px, 20px)')).to.equal(
      'RAND<LEN<10 PX>, LEN<20 PX>>'
    );
    expect(parsePseudo('rand(10em, 20em)')).to.equal(
      'RAND<LEN<10 EM>, LEN<20 EM>>'
    );
    expect(parsePseudo('rand(10px, 20em)')).to.equal(
      'RAND<LEN<10 PX>, LEN<20 EM>>'
    );
    expect(parsePseudo('rand(10s, 20s)')).to.equal(
      'RAND<TME<10 S>, TME<20 S>>'
    );
    expect(parsePseudo('rand(10rad, 20rad)')).to.equal(
      'RAND<ANG<10 RAD>, ANG<20 RAD>>'
    );
    expect(parsePseudo('rand(10%, 20%)')).to.equal('RAND<PRC<10>, PRC<20>>');
    expect(parsePseudo('rand(var(--x), var(--y))')).to.equal(
      'RAND<VAR<--x>, VAR<--y>>'
    );
    expect(parsePseudo('rand(10px, var(--y))')).to.equal(
      'RAND<LEN<10 PX>, VAR<--y>>'
    );
  });

  it('should parse an index function', () => {
    expect(parsePseudo('index()')).to.equal('INDEX<>');
    expect(parsePseudo('INDEX()')).to.equal('INDEX<>');
  });

  it('should parse a length function', () => {
    expect(parsePseudo('length()')).to.equal('LENGTH<>');
    expect(parsePseudo('LENGTH()')).to.equal('LENGTH<>');
  });

  it('should parse clip-path:inset', () => {
    // No radius.
    // inset(<all>)
    expect(parsePseudo('inset(10%)')).to.equal(
      'INSET<CON<PRC<10>|h PRC<10>|w>>'
    );
    // inset(<vert horiz>)
    expect(parsePseudo('inset(10% 10%)')).to.equal(
      'INSET<CON<PRC<10>|h PRC<10>|w>>'
    );
    // inset(<top horiz bottom>)
    expect(parsePseudo('inset(10% 20% 30%)')).to.equal(
      'INSET<CON<PRC<10>|h PRC<20>|w PRC<30>|h>>'
    );
    // inset(<top right bottom left>)
    expect(parsePseudo('inset(10% 20% 30% 40%)')).to.equal(
      'INSET<CON<PRC<10>|h PRC<20>|w PRC<30>|h PRC<40>|w>>'
    );

    // With radius.
    // inset(<all> round 50%)
    expect(parsePseudo('inset(10% round 50% 20%)')).to.equal(
      'INSET<CON<CON<PRC<10>|h PRC<10>|w> round CON<PRC<50> PRC<20>>>>'
    );

    // inset(<all> round 10px / 20px)
    expect(parsePseudo('inset(10% round 10px / 20px)')).to.equal(
      'INSET<CON<CON<PRC<10>|h PRC<10>|w> round CON<CON<LEN<10 PX>> / CON<LEN<20 PX>>>>>'
    );

    // Do not allow empty box.
    expect(() => {
      parsePseudo('inset()');
    }).to.throw(/Parse error/);

    // Do not allow more than 4 components in a box.
    expect(() => {
      parsePseudo('inset(1px 2px 3px 4px 5px)');
    }).to.throw(/must have between 1 and 4 components/);

    // Do not allow empty radius.
    expect(() => {
      parsePseudo('inset(10% round)');
    }).to.throw(/Parse error/);

    // Do not allow radius with more than 4 components.
    expect(() => {
      parsePseudo('inset(10% round 1px 2px 3px 4px 5px)');
    }).to.throw(/must have between 1 and 4 components/);
  });

  it('should parse clip-path:circle', () => {
    // No position.
    // circle()
    expect(parsePseudo('circle()')).to.equal('CIRCLE<>');
    // circle(50%)
    expect(parsePseudo('circle(50%)')).to.equal('CIRCLE<PRC<50>>');
    // circle(50px)
    expect(parsePseudo('circle(50px)')).to.equal('CIRCLE<LEN<50 PX>>');
    // circle(farthest-side)
    expect(parsePseudo('circle(farthest-side)')).to.equal(
      'CIRCLE<farthest-side>'
    );

    // With radius.
    // circle(at 10% 20%)
    expect(parsePseudo('circle(at 10% 20%)')).to.equal(
      'CIRCLE<CON<at CON<PRC<10>|w PRC<20>|h>>>'
    );
    // circle(50% at 10% 20%)
    expect(parsePseudo('circle(50% at 10% 20%)')).to.equal(
      'CIRCLE<CON<PRC<50> at CON<PRC<10>|w PRC<20>|h>>>'
    );
    // circle(50% at left top)
    expect(parsePseudo('circle(50% at left top)')).to.equal(
      'CIRCLE<CON<PRC<50> at CON<left|w top|h>>>'
    );
    // circle(50% at left 20%)
    expect(parsePseudo('circle(50% at left 20%)')).to.equal(
      'CIRCLE<CON<PRC<50> at CON<left|w PRC<20>|h>>>'
    );
    // circle(50% at 10% top)
    expect(parsePseudo('circle(50% at 10% top)')).to.equal(
      'CIRCLE<CON<PRC<50> at CON<PRC<10>|w top|h>>>'
    );
    // circle(50% at left 10% top 20%)
    expect(parsePseudo('circle(50% at left 10% top 20%)')).to.equal(
      'CIRCLE<CON<PRC<50> at CON<left|w PRC<10>|w top|h PRC<20>|h>>>'
    );
  });

  it('should parse clip-path:ellipse', () => {
    // No position.
    // ellipse()
    expect(parsePseudo('ellipse()')).to.equal('ELLIPSE<>');
    // ellipse(50%)
    expect(parsePseudo('ellipse(20% 30%)')).to.equal(
      'ELLIPSE<CON<PRC<20> PRC<30>>>'
    );
    // ellipse(50px)
    expect(parsePseudo('ellipse(20px 30px)')).to.equal(
      'ELLIPSE<CON<LEN<20 PX> LEN<30 PX>>>'
    );
    // ellipse(farthest-side)
    expect(parsePseudo('ellipse(closest-side farthest-side)')).to.equal(
      'ELLIPSE<CON<closest-side farthest-side>>'
    );

    // With radius.
    // ellipse(at 10% 20%)
    expect(parsePseudo('ellipse(at 10% 20%)')).to.equal(
      'ELLIPSE<CON<at CON<PRC<10>|w PRC<20>|h>>>'
    );
    // ellipse(30% 40% at 10% 20%)
    expect(parsePseudo('ellipse(30% 40% at 10% 20%)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<PRC<10>|w PRC<20>|h>>>'
    );
    // ellipse(30% 40% at left top)
    expect(parsePseudo('ellipse(30% 40% at left top)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<left|w top|h>>>'
    );
    // ellipse(30% 40% at left 20%)
    expect(parsePseudo('ellipse(30% 40% at left 20%)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<left|w PRC<20>|h>>>'
    );
    // ellipse(30% 40% at 10% top)
    expect(parsePseudo('ellipse(30% 40% at 10% top)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<PRC<10>|w top|h>>>'
    );
    // ellipse(30% 40% at left 10% top 20%)
    expect(parsePseudo('ellipse(30% 40% at left 10% top 20%)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<left|w PRC<10>|w top|h PRC<20>|h>>>'
    );
    // ellipse(30% 40% at top 10% left 20%)
    expect(parsePseudo('ellipse(30% 40% at top 10% left 20%)')).to.equal(
      'ELLIPSE<CON<CON<PRC<30> PRC<40>> at CON<top|h PRC<10>|h left|w PRC<20>|w>>>'
    );
  });

  it('should parse clip-path:polygon', () => {
    // 1 tuple.
    expect(parsePseudo('polygon(10px 20px)')).to.equal(
      'POLYGON<CON<LEN<10 PX>|w LEN<20 PX>|h>>'
    );
    expect(parsePseudo('polygon(10% 20%)')).to.equal(
      'POLYGON<CON<PRC<10>|w PRC<20>|h>>'
    );

    // 2 tuples.
    expect(parsePseudo('polygon(10px 20px, 30px 40px)')).to.equal(
      'POLYGON<CON<LEN<10 PX>|w LEN<20 PX>|h>, CON<LEN<30 PX>|w LEN<40 PX>|h>>'
    );
    expect(parsePseudo('polygon(10% 20%, 30% 40%)')).to.equal(
      'POLYGON<CON<PRC<10>|w PRC<20>|h>, CON<PRC<30>|w PRC<40>|h>>'
    );
  });

  it('should parse a var()', () => {
    expect(parsePseudo('var(--abc)')).to.equal('VAR<--abc>');
    expect(parsePseudo('var(--abc1)')).to.equal('VAR<--abc1>');
    expect(parsePseudo('var(--abc-d)')).to.equal('VAR<--abc-d>');
    expect(parsePseudo('VAR(--abc)')).to.equal('VAR<--abc>');
    expect(parsePseudo('var(--ABC)')).to.equal('VAR<--ABC>');
    expect(parsePseudo('var(--abc, 100px)')).to.equal(
      'VAR<--abc, LEN<100 PX>>'
    );
    expect(parsePseudo('var(--abc, var(--def))')).to.equal(
      'VAR<--abc, VAR<--def>>'
    );
    expect(parsePseudo('var(--abc, var(--def, 200px))')).to.equal(
      'VAR<--abc, VAR<--def, LEN<200 PX>>>'
    );
    expect(parsePseudo('var(--abc, rgb(1, 2, 3))')).to.equal(
      'VAR<--abc, RGB<NUM<1>, NUM<2>, NUM<3>>>'
    );
  });

  it('should parse a calc()', () => {
    expect(parsePseudo('calc(100px)')).to.equal('CALC<LEN<100 PX>>');
    expect(parsePseudo('calc((100px))')).to.equal('CALC<LEN<100 PX>>');

    // calc_sum
    expect(parsePseudo('calc(100px + 200px)')).to.equal(
      'CALC<ADD<LEN<100 PX>, LEN<200 PX>>>'
    );
    expect(parsePseudo('calc(100px - 200px)')).to.equal(
      'CALC<SUB<LEN<100 PX>, LEN<200 PX>>>'
    );
    expect(parsePseudo('calc((100px + 200px))')).to.equal(
      'CALC<ADD<LEN<100 PX>, LEN<200 PX>>>'
    );

    // calc_product
    expect(parsePseudo('calc(100px * 2)')).to.equal(
      'CALC<MUL<LEN<100 PX>, NUM<2>>>'
    );
    expect(parsePseudo('calc(2 * 100px)')).to.equal(
      'CALC<MUL<NUM<2>, LEN<100 PX>>>'
    );
    expect(parsePseudo('calc(100px / 2)')).to.equal(
      'CALC<DIV<LEN<100 PX>, NUM<2>>>'
    );
    expect(parsePseudo('calc((100px * 2))')).to.equal(
      'CALC<MUL<LEN<100 PX>, NUM<2>>>'
    );

    // precedence
    expect(parsePseudo('calc(100px + 200px + 300px)')).to.equal(
      'CALC<ADD<ADD<LEN<100 PX>, LEN<200 PX>>, LEN<300 PX>>>'
    );
    expect(parsePseudo('calc(100px * 2 * 3)')).to.equal(
      'CALC<MUL<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>>'
    );
    expect(parsePseudo('calc(100px * 2 / 3)')).to.equal(
      'CALC<DIV<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>>'
    );
    expect(parsePseudo('calc(100px + 200px * 0.5)')).to.equal(
      'CALC<ADD<LEN<100 PX>, MUL<LEN<200 PX>, NUM<0.5>>>>'
    );
    expect(parsePseudo('calc(100px - 200px / 0.5)')).to.equal(
      'CALC<SUB<LEN<100 PX>, DIV<LEN<200 PX>, NUM<0.5>>>>'
    );
    expect(parsePseudo('calc((100px + 200px) * 0.5)')).to.equal(
      'CALC<MUL<ADD<LEN<100 PX>, LEN<200 PX>>, NUM<0.5>>>'
    );
    expect(parsePseudo('calc((100px - 200px) / 0.5)')).to.equal(
      'CALC<DIV<SUB<LEN<100 PX>, LEN<200 PX>>, NUM<0.5>>>'
    );
    expect(parsePseudo('calc(100px * 0.5 + 200px)')).to.equal(
      'CALC<ADD<MUL<LEN<100 PX>, NUM<0.5>>, LEN<200 PX>>>'
    );
    expect(parsePseudo('calc(100px / 0.5 - 200px)')).to.equal(
      'CALC<SUB<DIV<LEN<100 PX>, NUM<0.5>>, LEN<200 PX>>>'
    );
    expect(parsePseudo('calc(0.5 * (100px + 200px))')).to.equal(
      'CALC<MUL<NUM<0.5>, ADD<LEN<100 PX>, LEN<200 PX>>>>'
    );

    // func
    expect(parsePseudo('calc(var(--abc, 100px) + 200px)')).to.equal(
      'CALC<ADD<VAR<--abc, LEN<100 PX>>, LEN<200 PX>>>'
    );
  });

  it('should parse a min()/max()', () => {
    expect(parsePseudo('min(100px)')).to.equal('MIN<LEN<100 PX>>');
    expect(parsePseudo('max(100px)')).to.equal('MAX<LEN<100 PX>>');

    // 2+ components.
    expect(parsePseudo('min(100px, 200px, 300px)')).to.equal(
      'MIN<LEN<100 PX>, LEN<200 PX>, LEN<300 PX>>'
    );
    expect(parsePseudo('max(100px, 200px, 300px)')).to.equal(
      'MAX<LEN<100 PX>, LEN<200 PX>, LEN<300 PX>>'
    );

    // With calc_sum.
    expect(parsePseudo('min(100px + 200px, 100px + 300px)')).to.equal(
      'MIN<ADD<LEN<100 PX>, LEN<200 PX>>, ADD<LEN<100 PX>, LEN<300 PX>>>'
    );

    // With calc_product.
    expect(parsePseudo('min(100px * 2, 100px / 2)')).to.equal(
      'MIN<MUL<LEN<100 PX>, NUM<2>>, DIV<LEN<100 PX>, NUM<2>>>'
    );

    // With precedence.
    expect(parsePseudo('min(100px + 200px + 300px, 250px)')).to.equal(
      'MIN<ADD<ADD<LEN<100 PX>, LEN<200 PX>>, LEN<300 PX>>, LEN<250 PX>>'
    );
    expect(parsePseudo('min(100px * 2 * 3, 250px)')).to.equal(
      'MIN<MUL<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>, LEN<250 PX>>'
    );
    expect(parsePseudo('max(100px * 2 / 3, 250px)')).to.equal(
      'MAX<DIV<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>, LEN<250 PX>>'
    );
    expect(parsePseudo('min(100px + 200px * 0.5, 250px)')).to.equal(
      'MIN<ADD<LEN<100 PX>, MUL<LEN<200 PX>, NUM<0.5>>>, LEN<250 PX>>'
    );
    expect(parsePseudo('max((100px + 200px) * 0.5, 250px)')).to.equal(
      'MAX<MUL<ADD<LEN<100 PX>, LEN<200 PX>>, NUM<0.5>>, LEN<250 PX>>'
    );

    // With func.
    expect(parsePseudo('min(var(--abc, 100px) + 200px, 250px)')).to.equal(
      'MIN<ADD<VAR<--abc, LEN<100 PX>>, LEN<200 PX>>, LEN<250 PX>>'
    );

    // With calc.
    expect(parsePseudo('calc(0.5 * max(100px, 200px))')).to.equal(
      'CALC<MUL<NUM<0.5>, MAX<LEN<100 PX>, LEN<200 PX>>>>'
    );
  });

  it('should parse a clamp()', () => {
    expect(parsePseudo('clamp(100px, 200px, 300px)')).to.equal(
      'CLAMP<LEN<100 PX>, LEN<200 PX>, LEN<300 PX>>'
    );

    // With calc_sum.
    expect(
      parsePseudo('clamp(100px + 1px, 100px + 2px, 100px + 3px)')
    ).to.equal(
      'CLAMP<ADD<LEN<100 PX>, LEN<1 PX>>, ADD<LEN<100 PX>, LEN<2 PX>>, ADD<LEN<100 PX>, LEN<3 PX>>>'
    );

    // With calc.
    expect(parsePseudo('calc(0.5 * clamp(1px, 2px, 3px))')).to.equal(
      'CALC<MUL<NUM<0.5>, CLAMP<LEN<1 PX>, LEN<2 PX>, LEN<3 PX>>>>'
    );
  });
});
