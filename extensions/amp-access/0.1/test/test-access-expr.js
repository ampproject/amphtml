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

import {AmpAccessEvaluator} from '../access-expr';

describe('evaluate', () => {
  let evaluator;
  beforeEach(() => {
    evaluator = new AmpAccessEvaluator();
  });

  it('should NOT allow double equal', () => {
    expect(() => {
      evaluator.eval('access == true', {});
    }).to.throw(/\"\=\=\" is not allowed, use \"\=\"/);
  });

  it('should evaluate simple boolean expressions', () => {
    expect(evaluator.eval('access = true', {access: true})).to.be.true;
    expect(evaluator.eval('access = TRUE', {access: true})).to.be.true;
    expect(evaluator.eval('access = false', {access: true})).to.be.false;
    expect(evaluator.eval('access = FALSE', {access: true})).to.be.false;
    expect(evaluator.eval('access != false', {access: true})).to.be.true;

    expect(evaluator.eval('access = FALSE', {access: false})).to.be.true;
    expect(evaluator.eval('access != TRUE', {access: false})).to.be.true;
    expect(evaluator.eval('access = TRUE', {access: false})).to.be.false;
  });

  it('should evaluate boolean expressions over undefined', () => {
    expect(evaluator.eval('access = true', {})).to.be.false;
    expect(evaluator.eval('access != true', {})).to.be.true;

    expect(evaluator.eval('access = false', {})).to.be.false;
    expect(evaluator.eval('access != false', {})).to.be.true;
  });

  it('should evaluate simple numeric expressions', () => {
    expect(evaluator.eval('num = 1', {num: 1})).to.be.true;
    expect(evaluator.eval('num > 1', {num: 1})).to.be.false;
    expect(evaluator.eval('num < 1', {num: 1})).to.be.false;
    expect(evaluator.eval('num >= 1', {num: 1})).to.be.true;
    expect(evaluator.eval('num <= 1', {num: 1})).to.be.true;
  });

  it('should evaluate negative numerics', () => {
    expect(evaluator.eval('num = -1', {num: -1})).to.be.true;
    expect(evaluator.eval('num = -1', {num: 0})).to.be.false;
    expect(evaluator.eval('num < -1', {num: -1})).to.be.false;
    expect(evaluator.eval('num < -1', {num: -2})).to.be.true;
    expect(evaluator.eval('num > -1', {num: 0})).to.be.true;
  });

  it('should evaluate numeric expressions over mistamtching type', () => {
    expect(evaluator.eval('num = 1', {})).to.be.false;
    expect(evaluator.eval('num > 1', {})).to.be.false;
    expect(evaluator.eval('num < 1', {})).to.be.false;
    expect(evaluator.eval('num >= 1', {})).to.be.false;
    expect(evaluator.eval('num <= 1', {})).to.be.false;
    expect(evaluator.eval('num != 1', {})).to.be.true;

    expect(evaluator.eval('num = 0', {num: 0})).to.be.true;
    expect(evaluator.eval('num > 0', {num: 0})).to.be.false;
    expect(evaluator.eval('num < 0', {num: 0})).to.be.false;
    expect(evaluator.eval('num >= 0', {num: 0})).to.be.true;
    expect(evaluator.eval('num <= 0', {num: 0})).to.be.true;
    expect(evaluator.eval('num != 0', {num: 0})).to.be.false;

    expect(evaluator.eval('num = 0', {})).to.be.false;
    expect(evaluator.eval('num > 0', {})).to.be.false;
    expect(evaluator.eval('num < 0', {})).to.be.false;
    expect(evaluator.eval('num >= 0', {})).to.be.false;
    expect(evaluator.eval('num <= 0', {})).to.be.false;
    expect(evaluator.eval('num != 0', {})).to.be.true;

    expect(evaluator.eval('num = 0', {num: false})).to.be.false;
    expect(evaluator.eval('num > 0', {num: false})).to.be.false;
    expect(evaluator.eval('num < 0', {num: false})).to.be.false;
    expect(evaluator.eval('num >= 0', {num: false})).to.be.false;
    expect(evaluator.eval('num <= 0', {num: false})).to.be.false;
    expect(evaluator.eval('num != 0', {num: false})).to.be.true;

    expect(evaluator.eval('num = 0', {num: ''})).to.be.false;
    expect(evaluator.eval('num > 0', {num: ''})).to.be.false;
    expect(evaluator.eval('num < 0', {num: ''})).to.be.false;
    expect(evaluator.eval('num >= 0', {num: ''})).to.be.false;
    expect(evaluator.eval('num <= 0', {num: ''})).to.be.false;
    expect(evaluator.eval('num != 0', {num: ''})).to.be.true;

    expect(evaluator.eval('num = 0', {num: '0'})).to.be.false;
    expect(evaluator.eval('num > 0', {num: '0'})).to.be.false;
    expect(evaluator.eval('num < 0', {num: '0'})).to.be.false;
    expect(evaluator.eval('num >= 0', {num: '0'})).to.be.false;
    expect(evaluator.eval('num <= 0', {num: '0'})).to.be.false;
    expect(evaluator.eval('num != 0', {num: '0'})).to.be.true;
  });

  it('should evaluate simple string expressions', () => {
    expect(evaluator.eval('str = "A"', {str: 'A'})).to.be.true;
    expect(evaluator.eval("str = 'A'", {str: 'A'})).to.be.true;
    expect(evaluator.eval('str != "A"', {str: 'A'})).to.be.false;
  });

  it('should evaluate string expressions with wrong type', () => {
    expect(evaluator.eval('str = "A"', {})).to.be.false;
    expect(evaluator.eval("str = 'A'", {})).to.be.false;
    expect(evaluator.eval('str != "A"', {})).to.be.true;

    expect(evaluator.eval('str = "A"', {str: 1})).to.be.false;
    expect(evaluator.eval("str = 'A'", {str: 1})).to.be.false;
    expect(evaluator.eval('str != "A"', {str: 1})).to.be.true;

    expect(evaluator.eval('str = ""', {str: false})).to.be.false;
    expect(evaluator.eval("str = ''", {str: false})).to.be.false;
    expect(evaluator.eval('str != ""', {str: false})).to.be.true;

    expect(evaluator.eval('str = "A"', {str: true})).to.be.false;
    expect(evaluator.eval("str = 'A'", {str: true})).to.be.false;
    expect(evaluator.eval('str != "A"', {str: true})).to.be.true;
  });

  it('should evaluate simple NULL expressions', () => {
    expect(evaluator.eval('access = NULL', {})).to.be.true;
    expect(evaluator.eval('access != NULL', {})).to.be.false;

    expect(evaluator.eval('access = NULL', {access: null})).to.be.true;
    expect(evaluator.eval('access != NULL', {access: null})).to.be.false;
  });

  it('should evaluate NULL expressions with wrong type', () => {
    expect(evaluator.eval('n = NULL', {n: ''})).to.be.false;
    expect(evaluator.eval('n != NULL', {n: ''})).to.be.true;

    expect(evaluator.eval('n = NULL', {n: 0})).to.be.false;
    expect(evaluator.eval('n != NULL', {n: 0})).to.be.true;

    expect(evaluator.eval('n = NULL', {n: false})).to.be.false;
    expect(evaluator.eval('n != NULL', {n: false})).to.be.true;
  });

  it('should evaluate truthy expressions', () => {
    expect(evaluator.eval('t', {})).to.be.false;
    expect(evaluator.eval('NOT t', {})).to.be.true;
    expect(evaluator.eval('t', {t: null})).to.be.false;
    expect(evaluator.eval('NOT t', {t: null})).to.be.true;

    expect(evaluator.eval('t', {t: true})).to.be.true;
    expect(evaluator.eval('NOT t', {t: true})).to.be.false;
    expect(evaluator.eval('t', {t: false})).to.be.false;
    expect(evaluator.eval('NOT t', {t: false})).to.be.true;

    expect(evaluator.eval('t', {t: 1})).to.be.true;
    expect(evaluator.eval('NOT t', {t: 1})).to.be.false;
    expect(evaluator.eval('t', {t: 0})).to.be.false;
    expect(evaluator.eval('NOT t', {t: 0})).to.be.true;

    expect(evaluator.eval('t', {t: '1'})).to.be.true;
    expect(evaluator.eval('NOT t', {t: '1'})).to.be.false;
    expect(evaluator.eval('t', {t: ''})).to.be.false;
    expect(evaluator.eval('NOT t', {t: ''})).to.be.true;
  });

  it('should evaluate NOT expressions', () => {
    expect(evaluator.eval('NOT (access = true)', {})).to.be.true;

    expect(evaluator.eval('NOT (access = true)', {access: true})).to.be.false;
    expect(evaluator.eval('NOT (access = true)', {access: false})).to.be.true;

    expect(evaluator.eval('NOT (access = 1)', {access: 1})).to.be.false;
    expect(evaluator.eval('NOT (access = 1)', {access: 0})).to.be.true;
    expect(evaluator.eval('NOT (access > 1)', {access: 1})).to.be.true;
    expect(evaluator.eval('NOT (access > 0)', {access: 1})).to.be.false;

    expect(evaluator.eval('NOT (access = "a")', {access: 'a'})).to.be.false;
    expect(evaluator.eval('NOT (access = "b")', {access: 'a'})).to.be.true;
  });

  it('should evaluate AND/OR expressions', () => {
    expect(evaluator.eval('a = 1 AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.eval('a = 1 AND b != 2', {a: 1, b: 2})).to.be.false;

    expect(evaluator.eval('a = 1 OR b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.eval('a = 1 OR b != 2', {a: 1, b: 2})).to.be.true;

    expect(evaluator.eval('NOT (a = 1 OR b != 2)', {a: 1, b: 2})).to.be.false;

    expect(evaluator.eval('a AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.eval('a AND b', {a: 1, b: 2})).to.be.true;
    expect(evaluator.eval('a AND c', {a: 1, b: 2})).to.be.false;
  });

  it('should evaluate nested expressions', () => {
    const resp = {
      obj: {
        str: 'A',
        num: 11,
        bool: true,
      },
    };

    expect(evaluator.eval('obj.bool = true', resp)).to.be.true;
    expect(evaluator.eval('obj.num = 11', resp)).to.be.true;
    expect(evaluator.eval('obj.str = "A"', resp)).to.be.true;

    expect(evaluator.eval('obj.other = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj.str = NULL', resp)).to.be.false;

    expect(evaluator.eval('obj.bool', resp)).to.be.true;
    expect(evaluator.eval('obj.str', resp)).to.be.true;
    expect(evaluator.eval('obj.num', resp)).to.be.true;
    expect(evaluator.eval('obj.other', resp)).to.be.false;

    expect(evaluator.eval('NOT obj.bool', resp)).to.be.false;
    expect(evaluator.eval('NOT obj.str', resp)).to.be.false;
    expect(evaluator.eval('NOT obj.num', resp)).to.be.false;
    expect(evaluator.eval('NOT obj.other', resp)).to.be.true;
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

    expect(evaluator.eval('obj.str = "A"', resp)).to.be.true;
    expect(evaluator.eval('obj.child.str = "B"', resp)).to.be.true;
    expect(evaluator.eval('obj.child.other = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj.child2 = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj.child2.other = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj.child2.other.x = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj2.child2.other.x = NULL', resp)).to.be.true;
  });

  it('should evaluate nested expressions with brackets', () => {
    const resp = {
      obj: {
        str: 'A',
        'a str': 'A',
        num: 11,
        'a num': 11,
        bool: true,
        'a bool': true,
      },
    };

    expect(evaluator.eval('obj["bool"] = true', resp)).to.be.true;
    expect(evaluator.eval('obj["a bool"] = true', resp)).to.be.true;
    expect(evaluator.eval('obj["num"] = 11', resp)).to.be.true;
    expect(evaluator.eval('obj["a num"] = 11', resp)).to.be.true;
    expect(evaluator.eval('obj["str"] = "A"', resp)).to.be.true;
    expect(evaluator.eval('obj["a str"] = "A"', resp)).to.be.true;

    expect(evaluator.eval("obj['bool'] = true", resp)).to.be.true;
    expect(evaluator.eval("obj['a bool'] = true", resp)).to.be.true;
    expect(evaluator.eval("obj['num'] = 11", resp)).to.be.true;
    expect(evaluator.eval("obj['a num'] = 11", resp)).to.be.true;
    expect(evaluator.eval("obj['str'] = 'A'", resp)).to.be.true;
    expect(evaluator.eval("obj['a str'] = 'A'", resp)).to.be.true;

    expect(evaluator.eval('obj["other"] = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj["a other"] = NULL', resp)).to.be.true;
    expect(evaluator.eval('obj["str"] = NULL', resp)).to.be.false;
    expect(evaluator.eval('obj["a str"] = NULL', resp)).to.be.false;

    expect(evaluator.eval('obj["bool"]', resp)).to.be.true;
    expect(evaluator.eval('obj["a bool"]', resp)).to.be.true;
    expect(evaluator.eval('obj["str"]', resp)).to.be.true;
    expect(evaluator.eval('obj["a str"]', resp)).to.be.true;
    expect(evaluator.eval('obj["num"]', resp)).to.be.true;
    expect(evaluator.eval('obj["a num"]', resp)).to.be.true;
    expect(evaluator.eval('obj["other"]', resp)).to.be.false;
    expect(evaluator.eval('obj["a other"]', resp)).to.be.false;

    expect(evaluator.eval('NOT obj["bool"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["a bool"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["str"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["a str"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["num"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["a num"]', resp)).to.be.false;
    expect(evaluator.eval('NOT obj["other"]', resp)).to.be.true;
    expect(evaluator.eval('NOT obj["a other"]', resp)).to.be.true;

    expect(evaluator.eval('obj2["bool"] = NULL', resp)).to.be.true;
  });

  it('should NOT evaluate nested expressions with wrong type', function() {
    expect(evaluator.eval('obj.bool = true', {obj: true})).to.be.false;
    expect(evaluator.eval('obj.num = 11', {obj: 11})).to.be.false;
    expect(evaluator.eval('obj.str = "A"', {obj: 'A'})).to.be.false;
    expect(evaluator.eval('obj.str = "A"', {})).to.be.false;

    expect(evaluator.eval('obj.other = NULL', {obj: 11})).to.be.true;

    expect(() => {
      evaluator.eval('obj.NULL', {});
    }).to.throw();
    expect(() => {
      evaluator.eval('NULL.obj', {});
    }).to.throw();
    expect(() => {
      evaluator.eval('1.obj', {});
    }).to.throw();
    expect(() => {
      evaluator.eval('TRUE.obj', {});
    }).to.throw();
  });

  it('should evaluate nested expressions securely', () => {
    expect(evaluator.eval('obj.__bool__ = NULL', {obj: {}})).to.be.true;
  });

  it('should accept name grammar', () => {
    expect(evaluator.eval('num = 10', {num: 10})).to.be.true;
    expect(evaluator.eval('num1 = 10', {num1: 10})).to.be.true;
    expect(evaluator.eval('num_ = 10', {num_: 10})).to.be.true;
    expect(evaluator.eval('_num = 10', {_num: 10})).to.be.true;

    expect(() => {
      evaluator.eval('1num = 10', {'1num': 10});
    }).to.throw();
    expect(() => {
      evaluator.eval('num-a = 10', {'num-a': 10});
    }).to.throw();
    expect(() => {
      evaluator.eval('num-1 = 10', {'num-1': 10});
    }).to.throw();
  });

  describe('caching', () => {
    beforeEach(() => {
      window.sandbox.spy(evaluator, 'eval_');
    });

    it('first request should go through', () => {
      evaluator.eval('access = true', {access: true});
      expect(evaluator.eval_.callCount).to.equal(1);
    });

    it('should use the cache on subsequent calls for the same expression and data', () => {
      const data = {access: true};
      evaluator.eval('access = true', data);
      evaluator.eval('access = true', data);
      expect(evaluator.eval_.callCount).to.equal(1);
    });

    it('should not use the cache if the data is referentially unequal', () => {
      evaluator.eval('access = true', {access: true});
      evaluator.eval('access = true', {access: true});
      expect(evaluator.eval_.callCount).to.equal(2);
    });
  });
});
