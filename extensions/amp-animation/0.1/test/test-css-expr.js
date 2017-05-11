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

import {parseCss} from '../css-expr';
import * as ast from '../css-expr-ast';


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


describe('parse', () => {

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
    expect(parsePseudo('url("abc")')).to.equal('url("abc")');
    expect(parsePseudo('url(\'abc\')')).to.equal('url(\'abc\')');
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

  it('should parse a var()', () => {
    expect(parsePseudo('var(--abc)')).to.equal('VAR<--abc>');
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
