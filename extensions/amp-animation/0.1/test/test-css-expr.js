/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as ast from '../css-expr-ast';
import {parseCss} from '../css-expr';


describe('CSS parse', () => {

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
      return `CON<${pseudoArray(n.array_)}>`;
    }
    if (n instanceof ast.CssNumericNode) {
      return `${n.type_}<${n.num_}` +
          `${n.units_ && n.units_ != '%' ? ' ' + n.units_.toUpperCase() : ''}>`;
    }
    if (n instanceof ast.CssTranslateNode) {
      return 'TRANSLATE' +
          `${n.suffix_ ? '-' + n.suffix_.toUpperCase() : ''}` +
          `<${pseudoArray(n.args_)}>`;
    }
    if (n instanceof ast.CssDimSizeNode) {
      return `DIM<${n.dim_}` +
          `, ${n.selector_ ? '"' + n.selector_ + '"' : null}` +
          `, ${n.selectionMethod_}>`;
    }
    if (n instanceof ast.CssNumConvertNode) {
      return `NUMC<${n.value_ ? pseudo(n.value_) : null}>`;
    }
    if (n instanceof ast.CssRandNode) {
      return `RAND<${n.left_ ? pseudo(n.left_) : null}` +
          `, ${n.right_ ? pseudo(n.right_) : null}>`;
    }
    if (n instanceof ast.CssIndexNode) {
      return 'INDEX<>';
    }
    if (n instanceof ast.CssVarNode) {
      return `VAR<${n.varName_}${n.def_ ? ', ' + pseudo(n.def_) : ''}>`;
    }
    if (n instanceof ast.CssCalcNode) {
      return `CALC<${pseudo(n.expr_)}>`;
    }
    if (n instanceof ast.CssCalcSumNode) {
      return `${n.op_ == '+' ? 'ADD' : 'SUB'}` +
          `<${pseudo(n.left_)}, ${pseudo(n.right_)}>`;
    }
    if (n instanceof ast.CssCalcProductNode) {
      return `${n.op_ == '*' ? 'MUL' : 'DIV'}` +
          `<${pseudo(n.left_)}, ${pseudo(n.right_)}>`;
    }
    if (n instanceof ast.CssFuncNode) {
      return `${n.name_.toUpperCase()}<${pseudoArray(n.args_)}>`;
    }
    throw new Error('unknown node: ' + n);
  }

  /**
   * @param {!Array<!CssNode>} array
   * @return {string}
   */
  function pseudoArray(array) {
    if (!array || array.length == 0) {
      return '';
    }
    return array.map(n => pseudo(n)).join(', ');
  }

  it('should parse empty string as null', () => {
    expect(parsePseudo('')).to.be.null;
  });

  it('should parse string', () => {
    expect(parsePseudo('"abc"')).to.equal('"abc"');
    expect(parsePseudo('\'abc\'')).to.equal('\'abc\'');
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
    expect(parsePseudo('url("https://acme.org/abc")'))
        .to.equal('URL<https://acme.org/abc>');
    expect(parsePseudo('url(\'https://acme.org/abc\')'))
        .to.equal('URL<https://acme.org/abc>');
    expect(parsePseudo('url(\'data:abc\')'))
        .to.equal('URL<data:abc>');
    // HTTP and relative are allowed at this stage.
    expect(parsePseudo('url(\'http://acme.org/abc\')'))
        .to.equal('URL<http://acme.org/abc>');
    expect(parsePseudo('url(\'/relative\')'))
        .to.equal('URL</relative>');
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
    expect(parsePseudo('rgb(10, 20, 30)'))
        .to.equal('RGB<NUM<10>, NUM<20>, NUM<30>>');
    expect(parsePseudo('translate(100px, 200px)'))
        .to.equal('TRANSLATE<LEN<100 PX>, LEN<200 PX>>');
  });

  it('should parse a translate()', () => {
    expect(parsePseudo('translate(100px)'))
        .to.equal('TRANSLATE<LEN<100 PX>>');
    expect(parsePseudo('translate(100px, 200px)'))
        .to.equal('TRANSLATE<LEN<100 PX>, LEN<200 PX>>');
    expect(parsePseudo('translateX(100px)'))
        .to.equal('TRANSLATE-X<LEN<100 PX>>');
    expect(parsePseudo('TRANSLATEX(100px)'))
        .to.equal('TRANSLATE-X<LEN<100 PX>>');
    expect(parsePseudo('translatex(100px)'))
        .to.equal('TRANSLATE-X<LEN<100 PX>>');
    expect(parsePseudo('translateY(100px)'))
        .to.equal('TRANSLATE-Y<LEN<100 PX>>');
    expect(parsePseudo('translateZ(100px)'))
        .to.equal('TRANSLATE-Z<LEN<100 PX>>');
    expect(parsePseudo('translate3d(1px, 2px, 3px)'))
        .to.equal('TRANSLATE-3D<LEN<1 PX>, LEN<2 PX>, LEN<3 PX>>');
  });

  it('should parse a concat of functions', () => {
    expect(parsePseudo('translateX(100px) rotate(45deg)'))
        .to.equal('CON<TRANSLATE-X<LEN<100 PX>>, ROTATE<ANG<45 DEG>>>');
  });

  it('should allow two-way concatenation', () => {
    // This is currently doesn't happen in parse, but by API possible with
    // minor changes to parsing order. Thus it's re-tested separately here.
    expect(pseudo(ast.CssConcatNode.concat(
        new ast.CssConcatNode([new ast.CssPassthroughNode('A')]),
        new ast.CssConcatNode([new ast.CssPassthroughNode('B')]))))
        .to.equal('CON<A, B>');
    expect(pseudo(ast.CssConcatNode.concat(
        new ast.CssPassthroughNode('A'),
        new ast.CssConcatNode([new ast.CssPassthroughNode('B')]))))
        .to.equal('CON<A, B>');
  });

  it('should parse a dimension function', () => {
    // Current.
    expect(parsePseudo('width()'))
        .to.equal('DIM<w, null, null>');
    expect(parsePseudo('height()'))
        .to.equal('DIM<h, null, null>');

    // Query.
    expect(parsePseudo('width(".sel")'))
        .to.equal('DIM<w, ".sel", null>');
    expect(parsePseudo('WIDTH(".sel > div")'))
        .to.equal('DIM<w, ".sel > div", null>');
    expect(parsePseudo('height(".sel")'))
        .to.equal('DIM<h, ".sel", null>');

    // Closest.
    expect(parsePseudo('width(closest(".sel"))'))
        .to.equal('DIM<w, ".sel", closest>');
    expect(parsePseudo('height(closest(".sel"))'))
        .to.equal('DIM<h, ".sel", closest>');
  });

  it('should parse a num-convert function', () => {
    expect(parsePseudo('num(10)'))
        .to.equal('NUMC<NUM<10>>');
    expect(parsePseudo('num(10px)'))
        .to.equal('NUMC<LEN<10 PX>>');
    expect(parsePseudo('num(10em)'))
        .to.equal('NUMC<LEN<10 EM>>');
    expect(parsePseudo('num(10s)'))
        .to.equal('NUMC<TME<10 S>>');
    expect(parsePseudo('num(10rad)'))
        .to.equal('NUMC<ANG<10 RAD>>');
    expect(parsePseudo('num(10%)'))
        .to.equal('NUMC<PRC<10>>');
    expect(parsePseudo('num(var(--x))'))
        .to.equal('NUMC<VAR<--x>>');
  });

  it('should parse a rand function', () => {
    expect(parsePseudo('rand()'))
        .to.equal('RAND<null, null>');
    expect(parsePseudo('rand(10, 20)'))
        .to.equal('RAND<NUM<10>, NUM<20>>');
    expect(parsePseudo('rand(10px, 20px)'))
        .to.equal('RAND<LEN<10 PX>, LEN<20 PX>>');
    expect(parsePseudo('rand(10em, 20em)'))
        .to.equal('RAND<LEN<10 EM>, LEN<20 EM>>');
    expect(parsePseudo('rand(10px, 20em)'))
        .to.equal('RAND<LEN<10 PX>, LEN<20 EM>>');
    expect(parsePseudo('rand(10s, 20s)'))
        .to.equal('RAND<TME<10 S>, TME<20 S>>');
    expect(parsePseudo('rand(10rad, 20rad)'))
        .to.equal('RAND<ANG<10 RAD>, ANG<20 RAD>>');
    expect(parsePseudo('rand(10%, 20%)'))
        .to.equal('RAND<PRC<10>, PRC<20>>');
    expect(parsePseudo('rand(var(--x), var(--y))'))
        .to.equal('RAND<VAR<--x>, VAR<--y>>');
    expect(parsePseudo('rand(10px, var(--y))'))
        .to.equal('RAND<LEN<10 PX>, VAR<--y>>');
  });

  it('should parse an index function', () => {
    expect(parsePseudo('index()')).to.equal('INDEX<>');
    expect(parsePseudo('INDEX()')).to.equal('INDEX<>');
  });

  it('should parse a var()', () => {
    expect(parsePseudo('var(--abc)')).to.equal('VAR<--abc>');
    expect(parsePseudo('var(--abc1)')).to.equal('VAR<--abc1>');
    expect(parsePseudo('var(--abc-d)')).to.equal('VAR<--abc-d>');
    expect(parsePseudo('VAR(--abc)')).to.equal('VAR<--abc>');
    expect(parsePseudo('var(--ABC)')).to.equal('VAR<--ABC>');
    expect(parsePseudo('var(--abc, 100px)'))
        .to.equal('VAR<--abc, LEN<100 PX>>');
    expect(parsePseudo('var(--abc, var(--def))'))
        .to.equal('VAR<--abc, VAR<--def>>');
    expect(parsePseudo('var(--abc, var(--def, 200px))'))
        .to.equal('VAR<--abc, VAR<--def, LEN<200 PX>>>');
    expect(parsePseudo('var(--abc, rgb(1, 2, 3))'))
        .to.equal('VAR<--abc, RGB<NUM<1>, NUM<2>, NUM<3>>>');
  });

  it('should parse a calc()', () => {
    expect(parsePseudo('calc(100px)'))
        .to.equal('CALC<LEN<100 PX>>');
    expect(parsePseudo('calc((100px))'))
        .to.equal('CALC<LEN<100 PX>>');

    // calc_sum
    expect(parsePseudo('calc(100px + 200px)'))
        .to.equal('CALC<ADD<LEN<100 PX>, LEN<200 PX>>>');
    expect(parsePseudo('calc(100px - 200px)'))
        .to.equal('CALC<SUB<LEN<100 PX>, LEN<200 PX>>>');
    expect(parsePseudo('calc((100px + 200px))'))
        .to.equal('CALC<ADD<LEN<100 PX>, LEN<200 PX>>>');

    // calc_product
    expect(parsePseudo('calc(100px * 2)'))
        .to.equal('CALC<MUL<LEN<100 PX>, NUM<2>>>');
    expect(parsePseudo('calc(2 * 100px)'))
        .to.equal('CALC<MUL<NUM<2>, LEN<100 PX>>>');
    expect(parsePseudo('calc(100px / 2)'))
        .to.equal('CALC<DIV<LEN<100 PX>, NUM<2>>>');
    expect(parsePseudo('calc((100px * 2))'))
        .to.equal('CALC<MUL<LEN<100 PX>, NUM<2>>>');

    // precedence
    expect(parsePseudo('calc(100px + 200px + 300px)'))
        .to.equal('CALC<ADD<ADD<LEN<100 PX>, LEN<200 PX>>, LEN<300 PX>>>');
    expect(parsePseudo('calc(100px * 2 * 3)'))
        .to.equal('CALC<MUL<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>>');
    expect(parsePseudo('calc(100px * 2 / 3)'))
        .to.equal('CALC<DIV<MUL<LEN<100 PX>, NUM<2>>, NUM<3>>>');
    expect(parsePseudo('calc(100px + 200px * 0.5)'))
        .to.equal('CALC<ADD<LEN<100 PX>, MUL<LEN<200 PX>, NUM<0.5>>>>');
    expect(parsePseudo('calc(100px - 200px / 0.5)'))
        .to.equal('CALC<SUB<LEN<100 PX>, DIV<LEN<200 PX>, NUM<0.5>>>>');
    expect(parsePseudo('calc((100px + 200px) * 0.5)'))
        .to.equal('CALC<MUL<ADD<LEN<100 PX>, LEN<200 PX>>, NUM<0.5>>>');
    expect(parsePseudo('calc((100px - 200px) / 0.5)'))
        .to.equal('CALC<DIV<SUB<LEN<100 PX>, LEN<200 PX>>, NUM<0.5>>>');
    expect(parsePseudo('calc(100px * 0.5 + 200px)'))
        .to.equal('CALC<ADD<MUL<LEN<100 PX>, NUM<0.5>>, LEN<200 PX>>>');
    expect(parsePseudo('calc(100px / 0.5 - 200px)'))
        .to.equal('CALC<SUB<DIV<LEN<100 PX>, NUM<0.5>>, LEN<200 PX>>>');
    expect(parsePseudo('calc(0.5 * (100px + 200px))'))
        .to.equal('CALC<MUL<NUM<0.5>, ADD<LEN<100 PX>, LEN<200 PX>>>>');

    // func
    expect(parsePseudo('calc(var(--abc, 100px) + 200px)'))
        .to.equal('CALC<ADD<VAR<--abc, LEN<100 PX>>, LEN<200 PX>>>');
  });
});


describes.sandboxed('CSS resolve', {}, () => {
  const normalize = true;
  let context;
  let contextMock;

  beforeEach(() => {
    context = new ast.CssContext();
    contextMock = sandbox.mock(context);
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
    const nodeMock = sandbox.mock(node);
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
    const nodeMock = sandbox.mock(node);
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
    contextMock.expects('getVar')
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
    contextMock.expects('getVar')
        .withExactArgs('--var1')
        .returns(null)
        .twice();
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
    contextMock.expects('getCurrentElementSize')
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
      expect(node.calc(context).css())
          .to.equal('url("https://acme.org/relative")');
      expect(node.calc(context, normalize).css())
          .to.equal('url("https://acme.org/relative")');
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
        contextMock.expects('getViewportSize')
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
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220})
          .once();
      const node = new ast.CssLengthNode(11.5, 'px');
      const percent = node.calcPercent(10, context);
      expect(percent.css()).to.equal('11px');
    });

    it('should resolve a percent-length in h-direction', () => {
      contextMock.expects('getDimension').returns('h');
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220})
          .once();
      const node = new ast.CssLengthNode(11.5, 'px');
      const percent = node.calcPercent(10, context);
      expect(percent.css()).to.equal('22px');
    });

    it('should resolve a percent-length in unknown direction', () => {
      contextMock.expects('getCurrentElementSize')
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
      contextMock.expects('getVar')
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
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220}).atLeast(1);
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
      context.withDimension = function(dim, callback) {
        stack.push(dim);
        const res = callback();
        stack.pop();
        return res;
      };

      const arg1 = new ast.CssNumberNode(201);
      arg1.resolve = function() {
        expect(index).to.equal(0);
        expect(stack).to.deep.equal(['w']);
        index++;
        return new ast.CssPassthroughNode('w');
      };

      const arg2 = new ast.CssNumberNode(202);
      arg2.resolve = function() {
        expect(index).to.equal(1);
        expect(stack).to.deep.equal(['h']);
        index++;
        return new ast.CssPassthroughNode('h');
      };

      const arg3 = new ast.CssNumberNode(203);
      arg3.resolve = function() {
        expect(index).to.equal(2);
        expect(stack).to.deep.equal([]);
        index++;
        return new ast.CssPassthroughNode('-');
      };

      const node = new ast.CssFuncNode('rgb',
          [arg1, arg2, arg3], ['w', 'h']);
      expect(node.calc(context).css()).to.equal('rgb(w,h,-)');
      expect(index).to.equal(3);
    });

    it('should resolve a var-arg function with nulls', () => {
      contextMock.expects('getVar')
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
      context.withDimension = function(dim, callback) {
        dimStack.push(dim);
        const res = callback();
        dimStack.pop();
        return res;
      };
      sandbox.stub(ast.CssPassthroughNode.prototype, 'resolve').callsFake(
          function() {
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
      contextMock.expects('getVar')
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
    let sizes;

    beforeEach(() => {
      sizes = {
        'null(.class)': {width: 111, height: 222},
        'closest(.class > div)': {width: 112, height: 224},
      };
      context.getCurrentElementSize = function() {
        return {width: 110, height: 220};
      };
      context.getElementSize = function(selector, selectionMethod) {
        return sizes[`${selectionMethod}(${selector})`];
      };
    });

    it('should always consider as non-const', () => {
      expect(ast.isVarCss('width()', false)).to.be.true;
      expect(ast.isVarCss('height()', false)).to.be.true;
      expect(ast.isVarCss('width("")')).to.be.true;
      expect(ast.isVarCss('height("")')).to.be.true;
    });

    it('should be always a non-const and no css', () => {
      const node = new ast.CssDimSizeNode('?');
      expect(node.isConst()).to.be.false;
      expect(() => node.css()).to.throw(/no css/);
    });

    it('should resolve width on the current node', () => {
      const node = new ast.CssDimSizeNode('w');
      expect(node.calc(context).css()).to.equal('110px');
    });

    it('should resolve height on the current node', () => {
      const node = new ast.CssDimSizeNode('h');
      expect(node.calc(context).css()).to.equal('220px');
    });

    it('should resolve width on the selected node', () => {
      const node = new ast.CssDimSizeNode('w', '.class');
      expect(node.calc(context).css()).to.equal('111px');
    });

    it('should resolve height on the selected node', () => {
      const node = new ast.CssDimSizeNode('h', '.class');
      expect(node.calc(context).css()).to.equal('222px');
    });

    it('should resolve width on the selected closest node', () => {
      const node = new ast.CssDimSizeNode('w', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('112px');
    });

    it('should resolve height on the selected closest node', () => {
      const node = new ast.CssDimSizeNode('h', '.class > div', 'closest');
      expect(node.calc(context).css()).to.equal('224px');
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
      const node = new ast.CssNumConvertNode(
          new ast.CssNumberNode(10));
      expect(resolvedCss(node)).to.equal('10');
    });

    it('should resolve num from a zero', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssNumberNode(0));
      expect(resolvedCss(node)).to.equal('0');
    });

    it('should resolve num from a length', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssLengthNode(10, 'px'));
      expect(resolvedCss(node)).to.equal('10');
    });

    it('should resolve num from a zero length', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssLengthNode(0, 'px'));
      expect(resolvedCss(node)).to.equal('0');
    });

    it('should resolve num from a time', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssTimeNode(10, 's'));
      expect(resolvedCss(node)).to.equal('10');
      expect(resolvedCss(node, normalize)).to.equal('10000');
    });

    it('should resolve num from a percent', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssPercentNode(10));
      expect(resolvedCss(node)).to.equal('10');

      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220}).atLeast(1);
      expect(resolvedCss(node, normalize)).to.equal('11');
    });

    it('should resolve num from an expression', () => {
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(new ast.CssLengthNode(100, 'px'))
          .once();
      const node = new ast.CssNumConvertNode(
          new ast.CssVarNode('--var1'));
      expect(resolvedCss(node)).to.equal('100');
    });

    it('should resolve num with a null arg', () => {
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(null)
          .once();
      const node = new ast.CssNumConvertNode(
          new ast.CssVarNode('--var1'));
      expect(resolvedCss(node)).to.be.null;
    });

    it('should resolve num from a string', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssPassthroughNode('11x'));
      expect(resolvedCss(node)).to.equal('11');
    });

    it('should resolve num from a non-parseable string', () => {
      const node = new ast.CssNumConvertNode(
          new ast.CssPassthroughNode('A'));
      expect(resolvedCss(node)).to.be.null;
    });
  });

  describe('rand', () => {
    beforeEach(() => {
      sandbox.stub(Math, 'random').callsFake(() => 0.25);
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
          new ast.CssNumberNode(20));
      expect(resolvedCss(node)).to.equal('12.5');
    });

    it('should rand two numbers in opposite direction', () => {
      const node = new ast.CssRandNode(
          new ast.CssNumberNode(200),
          new ast.CssNumberNode(100));
      expect(resolvedCss(node)).to.equal('125');
    });

    it('should rand two same-unit values - length', () => {
      const node = new ast.CssRandNode(
          new ast.CssLengthNode(10, 'px'),
          new ast.CssLengthNode(20, 'px'));
      expect(resolvedCss(node)).to.equal('12.5px');
    });

    it('should rand two same-unit values - times', () => {
      const node = new ast.CssRandNode(
          new ast.CssTimeNode(10, 's'),
          new ast.CssTimeNode(20, 's'));
      expect(resolvedCss(node)).to.equal('12.5s');
      expect(resolvedCss(node, normalize)).to.equal('12500ms');
    });

    it('should rand two same-unit values - percent', () => {
      const node = new ast.CssRandNode(
          new ast.CssPercentNode(10),
          new ast.CssPercentNode(20));
      expect(resolvedCss(node)).to.equal('12.5%');

      contextMock.expects('getDimension').returns('w').atLeast(1);
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220}).atLeast(1);
      expect(resolvedCss(node, normalize)).to.equal('13.75px');
    });

    it('should resolve both parts', () => {
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(new ast.CssLengthNode(100, 'px'))
          .once();
      contextMock.expects('getVar')
          .withExactArgs('--var2')
          .returns(new ast.CssLengthNode(200, 'px'))
          .once();
      const node = new ast.CssRandNode(
          new ast.CssVarNode('--var1'),
          new ast.CssVarNode('--var2'));
      expect(resolvedCss(node)).to.equal('125px');
    });

    it('should resolve to null with null args', () => {
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(new ast.CssLengthNode(100, 'px'))
          .once();
      contextMock.expects('getVar')
          .withExactArgs('--var2')
          .returns(null)
          .once();
      const node = new ast.CssRandNode(
          new ast.CssVarNode('--var1'),
          new ast.CssVarNode('--var2'));
      expect(resolvedCss(node)).to.be.null;
    });

    it('should only allow numerics', () => {
      const node = new ast.CssRandNode(
          new ast.CssPassthroughNode('A'),
          new ast.CssPassthroughNode('B'));
      expect(() => {
        resolvedCss(node);
      }).to.throw(/both numerical/);
    });

    it('should only allow same-type', () => {
      const node = new ast.CssRandNode(
          new ast.CssLengthNode(30, 'px'),
          new ast.CssTimeNode(20, 's'));
      expect(() => {
        resolvedCss(node);
      }).to.throw(/same type/);
    });

    it('should normalize units', () => {
      contextMock.expects('getCurrentFontSize').returns(1).once();
      contextMock.expects('getRootFontSize').returns(2).once();
      const node = new ast.CssRandNode(
          new ast.CssLengthNode(10, 'em'),
          new ast.CssLengthNode(10, 'rem'));
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
          '*');
      expect(node.isConst()).to.be.false;
      expect(resolvedCss(node)).to.equal('22s');
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
      contextMock.expects('getVar')
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
      contextMock.expects('getCurrentElementSize')
          .returns({width: 110, height: 220}).atLeast(1);
      contextMock.expects('getVar')
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
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(new ast.CssPassthroughNode('val1'))
          .once();
      const node = new ast.CssVarNode('--var1',
          new ast.CssPassthroughNode('10px'));
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,10px)');
      expect(resolvedCss(node)).to.equal('val1');
    });

    it('should resolve a var node by fallback to def', () => {
      contextMock.expects('getVar').returns(null).once();
      const node = new ast.CssVarNode('--var1',
          new ast.CssPassthroughNode('10px'));
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,10px)');
      expect(resolvedCss(node)).to.equal('10px');
    });

    it('should resolve a var node with def as var', () => {
      contextMock.expects('getVar')
          .withExactArgs('--var1')
          .returns(null)
          .once();
      contextMock.expects('getVar')
          .withExactArgs('--var2')
          .returns(new ast.CssPassthroughNode('val2'))
          .once();
      const node = new ast.CssVarNode('--var1',
          new ast.CssVarNode('--var2'));
      expect(node.isConst()).to.be.false;
      expect(node.css()).to.equal('var(--var1,var(--var2))');
      expect(resolvedCss(node)).to.equal('val2');
    });

    it('should resolve a var node w/o fallback to def', () => {
      contextMock.expects('getVar')
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

  describe('calc', () => {
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
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10px + 20px');
        expect(resolvedCss(node)).to.equal('30px');
      });

      it('should add two same-unit values and normalize', () => {
        const node = new ast.CssCalcSumNode(
            new ast.CssLengthNode(10, 'em'),
            new ast.CssLengthNode(20, 'em'),
            '+');
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
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10s + 20s');
        expect(resolvedCss(node)).to.equal('30s');
      });

      it('should subtract two same-unit values', () => {
        const node = new ast.CssCalcSumNode(
            new ast.CssLengthNode(30, 'px'),
            new ast.CssLengthNode(20, 'px'),
            '-');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('30px - 20px');
        expect(resolvedCss(node)).to.equal('10px');
      });

      it('should resolve both parts', () => {
        contextMock.expects('getVar')
            .withExactArgs('--var1')
            .returns(new ast.CssLengthNode(5, 'px'))
            .once();
        contextMock.expects('getVar')
            .withExactArgs('--var2')
            .returns(new ast.CssLengthNode(1, 'px'))
            .once();
        const node = new ast.CssCalcSumNode(
            new ast.CssVarNode('--var1'),
            new ast.CssVarNode('--var2'),
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('var(--var1) + var(--var2)');
        expect(resolvedCss(node)).to.equal('6px');
      });

      it('should resolve to null with null args', () => {
        contextMock.expects('getVar')
            .withExactArgs('--var1')
            .returns(new ast.CssLengthNode(5, 'px'))
            .once();
        contextMock.expects('getVar')
            .withExactArgs('--var2')
            .returns(null)
            .once();
        const node = new ast.CssCalcSumNode(
            new ast.CssVarNode('--var1'),
            new ast.CssVarNode('--var2'),
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('var(--var1) + var(--var2)');
        expect(resolvedCss(node)).to.be.null;
      });

      it('should only allow numerics', () => {
        const node = new ast.CssCalcSumNode(
            new ast.CssPassthroughNode('A'),
            new ast.CssPassthroughNode('B'),
            '+');
        expect(() => {
          resolvedCss(node);
        }).to.throw(/both numerical/);
      });

      it('should only allow same-type', () => {
        const node = new ast.CssCalcSumNode(
            new ast.CssLengthNode(30, 'px'),
            new ast.CssTimeNode(20, 's'),
            '+');
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
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10em + 10rem');
        // 1 * 10px + 2 * 10px = 30px
        expect(resolvedCss(node)).to.equal('30px');
      });

      it('should resolve left as percent', () => {
        contextMock.expects('getDimension').returns('w');
        contextMock.expects('getCurrentElementSize')
            .returns({width: 110, height: 220})
            .once();
        const node = new ast.CssCalcSumNode(
            new ast.CssPercentNode(10),
            new ast.CssLengthNode(10, 'px'),
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10% + 10px');
        // 10% * 110 + 10px = 11px + 10px = 21px
        expect(resolvedCss(node)).to.equal('21px');
      });

      it('should resolve right as percent', () => {
        contextMock.expects('getDimension').returns('h');
        contextMock.expects('getCurrentElementSize')
            .returns({width: 110, height: 220})
            .once();
        const node = new ast.CssCalcSumNode(
            new ast.CssLengthNode(10, 'px'),
            new ast.CssPercentNode(10),
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10px + 10%');
        // 10px + 10% * 220 = 10px + 22px = 32px
        expect(resolvedCss(node)).to.equal('32px');
      });

      it('should normalize the non-percent part', () => {
        contextMock.expects('getCurrentFontSize').returns(2).once();
        contextMock.expects('getDimension').returns('h');
        contextMock.expects('getCurrentElementSize')
            .returns({width: 110, height: 220})
            .once();
        const node = new ast.CssCalcSumNode(
            new ast.CssLengthNode(10, 'em'),
            new ast.CssPercentNode(10),
            '+');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10em + 10%');
        // 10em * 2px + 10% * 220 = 20px + 22px = 42px
        expect(resolvedCss(node)).to.equal('42px');
      });

      it('should resolve with dimension function', () => {
        contextMock.expects('getElementSize')
            .returns({width: 111, height: 222})
            .twice();
        const node = new ast.CssCalcSumNode(
            new ast.CssDimSizeNode('w', '.sel'),
            new ast.CssDimSizeNode('h', '.sel'),
            '+');
        // 111px + 222px = 333px
        expect(resolvedCss(node)).to.equal('333px');
      });
    });

    describe('product', () => {
      it('should only allow numerics', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssPassthroughNode('A'),
            new ast.CssPassthroughNode('B'),
            '*');
        expect(() => {
          resolvedCss(node);
        }).to.throw(/both numerical/);
      });

      it('should multiply with right number', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'px'),
            new ast.CssNumberNode(2),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10px * 2');
        expect(resolvedCss(node)).to.equal('20px');
      });

      it('should multiply with left number', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssNumberNode(2),
            new ast.CssLengthNode(10, 'px'),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('2 * 10px');
        expect(resolvedCss(node)).to.equal('20px');
      });

      it('should multiply for non-norm', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'em'),
            new ast.CssNumberNode(2),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10em * 2');
        expect(resolvedCss(node)).to.equal('20em');
      });

      it('should multiply for time', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssTimeNode(10, 's'),
            new ast.CssNumberNode(2),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10s * 2');
        expect(resolvedCss(node)).to.equal('20s');
      });

      it('should require at least one number', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'px'),
            new ast.CssLengthNode(20, 'px'),
            '*');
        expect(() => {
          resolvedCss(node);
        }).to.throw(/one of sides in multiplication must be a number/);
      });

      it('should divide with right number', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'px'),
            new ast.CssNumberNode(2),
            '/');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10px / 2');
        expect(resolvedCss(node)).to.equal('5px');
      });

      it('should divide for non-norm', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'em'),
            new ast.CssNumberNode(2),
            '/');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10em / 2');
        expect(resolvedCss(node)).to.equal('5em');
      });

      it('should divide for time', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssTimeNode(10, 's'),
            new ast.CssNumberNode(2),
            '/');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10s / 2');
        expect(resolvedCss(node)).to.equal('5s');
      });

      it('should only allow number denominator', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssTimeNode(10, 's'),
            new ast.CssTimeNode(2, 's'),
            '/');
        expect(() => {
          resolvedCss(node);
        }).to.throw(/denominator must be a number/);
      });

      it('should resolve divide-by-zero as null', () => {
        const node = new ast.CssCalcProductNode(
            new ast.CssLengthNode(10, 'px'),
            new ast.CssNumberNode(0),
            '/');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('10px / 0');
        expect(resolvedCss(node)).to.be.null;
      });

      it('should resolve both parts', () => {
        contextMock.expects('getVar')
            .withExactArgs('--var1')
            .returns(new ast.CssLengthNode(10, 'px'))
            .once();
        contextMock.expects('getVar')
            .withExactArgs('--var2')
            .returns(new ast.CssNumberNode(2))
            .once();
        const node = new ast.CssCalcProductNode(
            new ast.CssVarNode('--var1'),
            new ast.CssVarNode('--var2'),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('var(--var1) * var(--var2)');
        expect(resolvedCss(node)).to.equal('20px');
      });

      it('should resolve to null for null args', () => {
        contextMock.expects('getVar')
            .withExactArgs('--var1')
            .returns(new ast.CssLengthNode(10, 'px'))
            .once();
        contextMock.expects('getVar')
            .withExactArgs('--var2')
            .returns(null)
            .once();
        const node = new ast.CssCalcProductNode(
            new ast.CssVarNode('--var1'),
            new ast.CssVarNode('--var2'),
            '*');
        expect(node.isConst()).to.be.false;
        expect(node.css()).to.equal('var(--var1) * var(--var2)');
        expect(resolvedCss(node)).to.be.null;
      });
    });
  });
});
