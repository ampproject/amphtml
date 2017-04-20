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

  it('should evaluate nested expressions', () => {
    const resp = {
      obj: {
        str: 'A',
        num: 11,
        bool: true,
        12: true,
      },
    };

    expect(evaluateAccessExpr('obj.bool = true', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.num = 11', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.str = "A"', resp)).to.be.true;

    expect(evaluateAccessExpr('obj.other = NULL', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.str = NULL', resp)).to.be.false;

    expect(evaluateAccessExpr('obj.bool', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.str', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.num', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.other', resp)).to.be.false;
    expect(evaluateAccessExpr('obj.12', resp)).to.be.true;

    expect(evaluateAccessExpr('NOT obj.bool', resp)).to.be.false;
    expect(evaluateAccessExpr('NOT obj.str', resp)).to.be.false;
    expect(evaluateAccessExpr('NOT obj.num', resp)).to.be.false;
    expect(evaluateAccessExpr('NOT obj.other', resp)).to.be.true;
    expect(evaluateAccessExpr('NOT obj.12', resp)).to.be.false;
  });

  it('should shortcircuit nested expressions with missing parent', () => {
    const resp = {
      obj: {
        str: 'A',
        child: {
          str: 'B',
        },
      },
    };

    expect(evaluateAccessExpr('obj.str = "A"', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.child.str = "B"', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.child.other = NULL', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.child2 = NULL', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.child2.other = NULL', resp)).to.be.true;
    expect(evaluateAccessExpr('obj.child2.other.x = NULL', resp)).to.be.true;
    expect(evaluateAccessExpr('obj2.child2.other.x = NULL', resp)).to.be.true;
  });

  it('should NOT evaluate nested expressions with wrong type', () => {
    expect(evaluateAccessExpr('obj.bool = true', {obj: true})).to.be.false;
    expect(evaluateAccessExpr('obj.num = 11', {obj: 11})).to.be.false;
    expect(evaluateAccessExpr('obj.str = "A"', {obj: 'A'})).to.be.false;
    expect(evaluateAccessExpr('obj.str = "A"', {})).to.be.false;

    expect(evaluateAccessExpr('obj.other = NULL', {obj: 11})).to.be.true;

    expect(() => {
      evaluateAccessExpr('obj.NULL', {});
    }).to.throw();
    expect(() => {
      evaluateAccessExpr('NULL.obj', {});
    }).to.throw();
    expect(() => {
      evaluateAccessExpr('1.obj', {});
    }).to.throw();
    expect(() => {
      evaluateAccessExpr('TRUE.obj', {});
    }).to.throw();
  });

  it('should evaluate nested expressions securely', () => {
    expect(evaluateAccessExpr('obj.__bool__ = NULL', {obj: {}})).to.be.true;
  });

  it('should accept name grammar', () => {
    expect(evaluateAccessExpr('num = 10', {num: 10})).to.be.true;
    expect(evaluateAccessExpr('num1 = 10', {num1: 10})).to.be.true;
    expect(evaluateAccessExpr('num_ = 10', {num_: 10})).to.be.true;
    expect(evaluateAccessExpr('_num = 10', {_num: 10})).to.be.true;

    expect(() => {
      evaluateAccessExpr('1num = 10', {'1num': 10});
    }).to.throw();
    expect(() => {
      evaluateAccessExpr('num-a = 10', {'num-a': 10});
    }).to.throw();
  });
});
