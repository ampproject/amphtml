/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {evaluateAccessExpr} from '../access-expr';


describe('evaluateAccessExpr', () => {

  it('should NOT allow double equal', () => {
    expect(() => {
      evaluateAccessExpr('access == true', {});
    }).to.throw(/\"\=\=\" is not allowed, use \"\=\"/);
  });

  it('should evaluate simple boolean expressions', () => {
    expect(evaluateAccessExpr('access = true', {access: true})).to.be.true;
    expect(evaluateAccessExpr('access = TRUE', {access: true})).to.be.true;
    expect(evaluateAccessExpr('access = false', {access: true})).to.be.false;
    expect(evaluateAccessExpr('access = FALSE', {access: true})).to.be.false;
    expect(evaluateAccessExpr('access != false', {access: true})).to.be.true;

    expect(evaluateAccessExpr('access = FALSE', {access: false})).to.be.true;
    expect(evaluateAccessExpr('access != TRUE', {access: false})).to.be.true;
    expect(evaluateAccessExpr('access = TRUE', {access: false})).to.be.false;
  });

  it('should evaluate boolean expressions over undefined', () => {
    expect(evaluateAccessExpr('access = true', {})).to.be.false;
    expect(evaluateAccessExpr('access != true', {})).to.be.true;

    expect(evaluateAccessExpr('access = false', {})).to.be.false;
    expect(evaluateAccessExpr('access != false', {})).to.be.true;
  });

  it('should evaluate simple numeric expressions', () => {
    expect(evaluateAccessExpr('num = 1', {num: 1})).to.be.true;
    expect(evaluateAccessExpr('num > 1', {num: 1})).to.be.false;
    expect(evaluateAccessExpr('num < 1', {num: 1})).to.be.false;
    expect(evaluateAccessExpr('num >= 1', {num: 1})).to.be.true;
    expect(evaluateAccessExpr('num <= 1', {num: 1})).to.be.true;
  });

  it('should evaluate numeric expressions over mistamtching type', () => {
    expect(evaluateAccessExpr('num = 1', {})).to.be.false;
    expect(evaluateAccessExpr('num > 1', {})).to.be.false;
    expect(evaluateAccessExpr('num < 1', {})).to.be.false;
    expect(evaluateAccessExpr('num >= 1', {})).to.be.false;
    expect(evaluateAccessExpr('num <= 1', {})).to.be.false;
    expect(evaluateAccessExpr('num != 1', {})).to.be.true;

    expect(evaluateAccessExpr('num = 0', {num: 0})).to.be.true;
    expect(evaluateAccessExpr('num > 0', {num: 0})).to.be.false;
    expect(evaluateAccessExpr('num < 0', {num: 0})).to.be.false;
    expect(evaluateAccessExpr('num >= 0', {num: 0})).to.be.true;
    expect(evaluateAccessExpr('num <= 0', {num: 0})).to.be.true;
    expect(evaluateAccessExpr('num != 0', {num: 0})).to.be.false;

    expect(evaluateAccessExpr('num = 0', {})).to.be.false;
    expect(evaluateAccessExpr('num > 0', {})).to.be.false;
    expect(evaluateAccessExpr('num < 0', {})).to.be.false;
    expect(evaluateAccessExpr('num >= 0', {})).to.be.false;
    expect(evaluateAccessExpr('num <= 0', {})).to.be.false;
    expect(evaluateAccessExpr('num != 0', {})).to.be.true;

    expect(evaluateAccessExpr('num = 0', {num: false})).to.be.false;
    expect(evaluateAccessExpr('num > 0', {num: false})).to.be.false;
    expect(evaluateAccessExpr('num < 0', {num: false})).to.be.false;
    expect(evaluateAccessExpr('num >= 0', {num: false})).to.be.false;
    expect(evaluateAccessExpr('num <= 0', {num: false})).to.be.false;
    expect(evaluateAccessExpr('num != 0', {num: false})).to.be.true;

    expect(evaluateAccessExpr('num = 0', {num: ''})).to.be.false;
    expect(evaluateAccessExpr('num > 0', {num: ''})).to.be.false;
    expect(evaluateAccessExpr('num < 0', {num: ''})).to.be.false;
    expect(evaluateAccessExpr('num >= 0', {num: ''})).to.be.false;
    expect(evaluateAccessExpr('num <= 0', {num: ''})).to.be.false;
    expect(evaluateAccessExpr('num != 0', {num: ''})).to.be.true;

    expect(evaluateAccessExpr('num = 0', {num: '0'})).to.be.false;
    expect(evaluateAccessExpr('num > 0', {num: '0'})).to.be.false;
    expect(evaluateAccessExpr('num < 0', {num: '0'})).to.be.false;
    expect(evaluateAccessExpr('num >= 0', {num: '0'})).to.be.false;
    expect(evaluateAccessExpr('num <= 0', {num: '0'})).to.be.false;
    expect(evaluateAccessExpr('num != 0', {num: '0'})).to.be.true;
  });

  it('should evaluate simple string expressions', () => {
    expect(evaluateAccessExpr('str = "A"', {str: 'A'})).to.be.true;
    expect(evaluateAccessExpr('str = \'A\'', {str: 'A'})).to.be.true;
    expect(evaluateAccessExpr('str != "A"', {str: 'A'})).to.be.false;
  });

  it('should evaluate string expressions with wrong type', () => {
    expect(evaluateAccessExpr('str = "A"', {})).to.be.false;
    expect(evaluateAccessExpr('str = \'A\'', {})).to.be.false;
    expect(evaluateAccessExpr('str != "A"', {})).to.be.true;

    expect(evaluateAccessExpr('str = "A"', {str: 1})).to.be.false;
    expect(evaluateAccessExpr('str = \'A\'', {str: 1})).to.be.false;
    expect(evaluateAccessExpr('str != "A"', {str: 1})).to.be.true;

    expect(evaluateAccessExpr('str = ""', {str: false})).to.be.false;
    expect(evaluateAccessExpr('str = \'\'', {str: false})).to.be.false;
    expect(evaluateAccessExpr('str != ""', {str: false})).to.be.true;

    expect(evaluateAccessExpr('str = "A"', {str: true})).to.be.false;
    expect(evaluateAccessExpr('str = \'A\'', {str: true})).to.be.false;
    expect(evaluateAccessExpr('str != "A"', {str: true})).to.be.true;
  });

  it('should evaluate simple NULL expressions', () => {
    expect(evaluateAccessExpr('access = NULL', {})).to.be.true;
    expect(evaluateAccessExpr('access != NULL', {})).to.be.false;

    expect(evaluateAccessExpr('access = NULL', {access: null})).to.be.true;
    expect(evaluateAccessExpr('access != NULL', {access: null})).to.be.false;
  });

  it('should evaluate NULL expressions with wrong type', () => {
    expect(evaluateAccessExpr('n = NULL', {n: ''})).to.be.false;
    expect(evaluateAccessExpr('n != NULL', {n: ''})).to.be.true;

    expect(evaluateAccessExpr('n = NULL', {n: 0})).to.be.false;
    expect(evaluateAccessExpr('n != NULL', {n: 0})).to.be.true;

    expect(evaluateAccessExpr('n = NULL', {n: false})).to.be.false;
    expect(evaluateAccessExpr('n != NULL', {n: false})).to.be.true;
  });

  it('should evaluate truthy expressions', () => {
    expect(evaluateAccessExpr('t', {})).to.be.false;
    expect(evaluateAccessExpr('NOT t', {})).to.be.true;
    expect(evaluateAccessExpr('t', {t: null})).to.be.false;
    expect(evaluateAccessExpr('NOT t', {t: null})).to.be.true;

    expect(evaluateAccessExpr('t', {t: true})).to.be.true;
    expect(evaluateAccessExpr('NOT t', {t: true})).to.be.false;
    expect(evaluateAccessExpr('t', {t: false})).to.be.false;
    expect(evaluateAccessExpr('NOT t', {t: false})).to.be.true;

    expect(evaluateAccessExpr('t', {t: 1})).to.be.true;
    expect(evaluateAccessExpr('NOT t', {t: 1})).to.be.false;
    expect(evaluateAccessExpr('t', {t: 0})).to.be.false;
    expect(evaluateAccessExpr('NOT t', {t: 0})).to.be.true;

    expect(evaluateAccessExpr('t', {t: '1'})).to.be.true;
    expect(evaluateAccessExpr('NOT t', {t: '1'})).to.be.false;
    expect(evaluateAccessExpr('t', {t: ''})).to.be.false;
    expect(evaluateAccessExpr('NOT t', {t: ''})).to.be.true;
  });

  it('should evaluate NOT expressions', () => {
    expect(evaluateAccessExpr('NOT (access = true)', {})).to.be.true;

    expect(evaluateAccessExpr('NOT (access = true)', {access: true}))
        .to.be.false;
    expect(evaluateAccessExpr('NOT (access = true)', {access: false}))
        .to.be.true;

    expect(evaluateAccessExpr('NOT (access = 1)', {access: 1})).to.be.false;
    expect(evaluateAccessExpr('NOT (access = 1)', {access: 0})).to.be.true;
    expect(evaluateAccessExpr('NOT (access > 1)', {access: 1})).to.be.true;
    expect(evaluateAccessExpr('NOT (access > 0)', {access: 1})).to.be.false;

    expect(evaluateAccessExpr('NOT (access = "a")', {access: 'a'})).to.be.false;
    expect(evaluateAccessExpr('NOT (access = "b")', {access: 'a'})).to.be.true;
  });

  it('should evaluate AND/OR expressions', () => {
    expect(evaluateAccessExpr('a = 1 AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluateAccessExpr('a = 1 AND b != 2', {a: 1, b: 2})).to.be.false;

    expect(evaluateAccessExpr('a = 1 OR b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluateAccessExpr('a = 1 OR b != 2', {a: 1, b: 2})).to.be.true;

    expect(evaluateAccessExpr('NOT (a = 1 OR b != 2)', {a: 1, b: 2}))
        .to.be.false;

    expect(evaluateAccessExpr('a AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluateAccessExpr('a AND b', {a: 1, b: 2})).to.be.true;
    expect(evaluateAccessExpr('a AND c', {a: 1, b: 2})).to.be.false;
  });
});
