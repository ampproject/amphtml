import {AmpAccessEvaluator} from '../access-expr';

describes.sandboxed('evaluate', {}, () => {
  let evaluator;
  beforeEach(() => {
    evaluator = new AmpAccessEvaluator();
  });

  it('should NOT allow double equal', () => {
    expect(() => {
      evaluator.evaluate('access == true', {});
    }).to.throw(/\"\=\=\" is not allowed, use \"\=\"/);
  });

  it('should evaluate simple boolean expressions', () => {
    expect(evaluator.evaluate('access = true', {access: true})).to.be.true;
    expect(evaluator.evaluate('access = TRUE', {access: true})).to.be.true;
    expect(evaluator.evaluate('access = false', {access: true})).to.be.false;
    expect(evaluator.evaluate('access = FALSE', {access: true})).to.be.false;
    expect(evaluator.evaluate('access != false', {access: true})).to.be.true;

    expect(evaluator.evaluate('access = FALSE', {access: false})).to.be.true;
    expect(evaluator.evaluate('access != TRUE', {access: false})).to.be.true;
    expect(evaluator.evaluate('access = TRUE', {access: false})).to.be.false;
  });

  it('should evaluate boolean expressions over undefined', () => {
    expect(evaluator.evaluate('access = true', {})).to.be.false;
    expect(evaluator.evaluate('access != true', {})).to.be.true;

    expect(evaluator.evaluate('access = false', {})).to.be.false;
    expect(evaluator.evaluate('access != false', {})).to.be.true;
  });

  it('should evaluate simple numeric expressions', () => {
    expect(evaluator.evaluate('num = 1', {num: 1})).to.be.true;
    expect(evaluator.evaluate('num > 1', {num: 1})).to.be.false;
    expect(evaluator.evaluate('num < 1', {num: 1})).to.be.false;
    expect(evaluator.evaluate('num >= 1', {num: 1})).to.be.true;
    expect(evaluator.evaluate('num <= 1', {num: 1})).to.be.true;
  });

  it('should evaluate negative numerics', () => {
    expect(evaluator.evaluate('num = -1', {num: -1})).to.be.true;
    expect(evaluator.evaluate('num = -1', {num: 0})).to.be.false;
    expect(evaluator.evaluate('num < -1', {num: -1})).to.be.false;
    expect(evaluator.evaluate('num < -1', {num: -2})).to.be.true;
    expect(evaluator.evaluate('num > -1', {num: 0})).to.be.true;
  });

  it('should evaluate numeric expressions over mistamtching type', () => {
    expect(evaluator.evaluate('num = 1', {})).to.be.false;
    expect(evaluator.evaluate('num > 1', {})).to.be.false;
    expect(evaluator.evaluate('num < 1', {})).to.be.false;
    expect(evaluator.evaluate('num >= 1', {})).to.be.false;
    expect(evaluator.evaluate('num <= 1', {})).to.be.false;
    expect(evaluator.evaluate('num != 1', {})).to.be.true;

    expect(evaluator.evaluate('num = 0', {num: 0})).to.be.true;
    expect(evaluator.evaluate('num > 0', {num: 0})).to.be.false;
    expect(evaluator.evaluate('num < 0', {num: 0})).to.be.false;
    expect(evaluator.evaluate('num >= 0', {num: 0})).to.be.true;
    expect(evaluator.evaluate('num <= 0', {num: 0})).to.be.true;
    expect(evaluator.evaluate('num != 0', {num: 0})).to.be.false;

    expect(evaluator.evaluate('num = 0', {})).to.be.false;
    expect(evaluator.evaluate('num > 0', {})).to.be.false;
    expect(evaluator.evaluate('num < 0', {})).to.be.false;
    expect(evaluator.evaluate('num >= 0', {})).to.be.false;
    expect(evaluator.evaluate('num <= 0', {})).to.be.false;
    expect(evaluator.evaluate('num != 0', {})).to.be.true;

    expect(evaluator.evaluate('num = 0', {num: false})).to.be.false;
    expect(evaluator.evaluate('num > 0', {num: false})).to.be.false;
    expect(evaluator.evaluate('num < 0', {num: false})).to.be.false;
    expect(evaluator.evaluate('num >= 0', {num: false})).to.be.false;
    expect(evaluator.evaluate('num <= 0', {num: false})).to.be.false;
    expect(evaluator.evaluate('num != 0', {num: false})).to.be.true;

    expect(evaluator.evaluate('num = 0', {num: ''})).to.be.false;
    expect(evaluator.evaluate('num > 0', {num: ''})).to.be.false;
    expect(evaluator.evaluate('num < 0', {num: ''})).to.be.false;
    expect(evaluator.evaluate('num >= 0', {num: ''})).to.be.false;
    expect(evaluator.evaluate('num <= 0', {num: ''})).to.be.false;
    expect(evaluator.evaluate('num != 0', {num: ''})).to.be.true;

    expect(evaluator.evaluate('num = 0', {num: '0'})).to.be.false;
    expect(evaluator.evaluate('num > 0', {num: '0'})).to.be.false;
    expect(evaluator.evaluate('num < 0', {num: '0'})).to.be.false;
    expect(evaluator.evaluate('num >= 0', {num: '0'})).to.be.false;
    expect(evaluator.evaluate('num <= 0', {num: '0'})).to.be.false;
    expect(evaluator.evaluate('num != 0', {num: '0'})).to.be.true;
  });

  it('should evaluate simple string expressions', () => {
    expect(evaluator.evaluate('str = "A"', {str: 'A'})).to.be.true;
    expect(evaluator.evaluate("str = 'A'", {str: 'A'})).to.be.true;
    expect(evaluator.evaluate('str != "A"', {str: 'A'})).to.be.false;
  });

  it('should evaluate string expressions with wrong type', () => {
    expect(evaluator.evaluate('str = "A"', {})).to.be.false;
    expect(evaluator.evaluate("str = 'A'", {})).to.be.false;
    expect(evaluator.evaluate('str != "A"', {})).to.be.true;

    expect(evaluator.evaluate('str = "A"', {str: 1})).to.be.false;
    expect(evaluator.evaluate("str = 'A'", {str: 1})).to.be.false;
    expect(evaluator.evaluate('str != "A"', {str: 1})).to.be.true;

    expect(evaluator.evaluate('str = ""', {str: false})).to.be.false;
    expect(evaluator.evaluate("str = ''", {str: false})).to.be.false;
    expect(evaluator.evaluate('str != ""', {str: false})).to.be.true;

    expect(evaluator.evaluate('str = "A"', {str: true})).to.be.false;
    expect(evaluator.evaluate("str = 'A'", {str: true})).to.be.false;
    expect(evaluator.evaluate('str != "A"', {str: true})).to.be.true;
  });

  it('should evaluate simple NULL expressions', () => {
    expect(evaluator.evaluate('access = NULL', {})).to.be.true;
    expect(evaluator.evaluate('access != NULL', {})).to.be.false;

    expect(evaluator.evaluate('access = NULL', {access: null})).to.be.true;
    expect(evaluator.evaluate('access != NULL', {access: null})).to.be.false;
  });

  it('should evaluate NULL expressions with wrong type', () => {
    expect(evaluator.evaluate('n = NULL', {n: ''})).to.be.false;
    expect(evaluator.evaluate('n != NULL', {n: ''})).to.be.true;

    expect(evaluator.evaluate('n = NULL', {n: 0})).to.be.false;
    expect(evaluator.evaluate('n != NULL', {n: 0})).to.be.true;

    expect(evaluator.evaluate('n = NULL', {n: false})).to.be.false;
    expect(evaluator.evaluate('n != NULL', {n: false})).to.be.true;
  });

  it('should evaluate truthy expressions', () => {
    expect(evaluator.evaluate('t', {})).to.be.false;
    expect(evaluator.evaluate('NOT t', {})).to.be.true;
    expect(evaluator.evaluate('t', {t: null})).to.be.false;
    expect(evaluator.evaluate('NOT t', {t: null})).to.be.true;

    expect(evaluator.evaluate('t', {t: true})).to.be.true;
    expect(evaluator.evaluate('NOT t', {t: true})).to.be.false;
    expect(evaluator.evaluate('t', {t: false})).to.be.false;
    expect(evaluator.evaluate('NOT t', {t: false})).to.be.true;

    expect(evaluator.evaluate('t', {t: 1})).to.be.true;
    expect(evaluator.evaluate('NOT t', {t: 1})).to.be.false;
    expect(evaluator.evaluate('t', {t: 0})).to.be.false;
    expect(evaluator.evaluate('NOT t', {t: 0})).to.be.true;

    expect(evaluator.evaluate('t', {t: '1'})).to.be.true;
    expect(evaluator.evaluate('NOT t', {t: '1'})).to.be.false;
    expect(evaluator.evaluate('t', {t: ''})).to.be.false;
    expect(evaluator.evaluate('NOT t', {t: ''})).to.be.true;
  });

  it('should evaluate NOT expressions', () => {
    expect(evaluator.evaluate('NOT (access = true)', {})).to.be.true;

    expect(evaluator.evaluate('NOT (access = true)', {access: true})).to.be
      .false;
    expect(evaluator.evaluate('NOT (access = true)', {access: false})).to.be
      .true;

    expect(evaluator.evaluate('NOT (access = 1)', {access: 1})).to.be.false;
    expect(evaluator.evaluate('NOT (access = 1)', {access: 0})).to.be.true;
    expect(evaluator.evaluate('NOT (access > 1)', {access: 1})).to.be.true;
    expect(evaluator.evaluate('NOT (access > 0)', {access: 1})).to.be.false;

    expect(evaluator.evaluate('NOT (access = "a")', {access: 'a'})).to.be.false;
    expect(evaluator.evaluate('NOT (access = "b")', {access: 'a'})).to.be.true;
  });

  it('should evaluate AND/OR expressions', () => {
    expect(evaluator.evaluate('a = 1 AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.evaluate('a = 1 AND b != 2', {a: 1, b: 2})).to.be.false;

    expect(evaluator.evaluate('a = 1 OR b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.evaluate('a = 1 OR b != 2', {a: 1, b: 2})).to.be.true;

    expect(evaluator.evaluate('NOT (a = 1 OR b != 2)', {a: 1, b: 2})).to.be
      .false;

    expect(evaluator.evaluate('a AND b = 2', {a: 1, b: 2})).to.be.true;
    expect(evaluator.evaluate('a AND b', {a: 1, b: 2})).to.be.true;
    expect(evaluator.evaluate('a AND c', {a: 1, b: 2})).to.be.false;
  });

  it('should evaluate nested expressions', () => {
    const resp = {
      obj: {
        str: 'A',
        num: 11,
        bool: true,
      },
    };

    expect(evaluator.evaluate('obj.bool = true', resp)).to.be.true;
    expect(evaluator.evaluate('obj.num = 11', resp)).to.be.true;
    expect(evaluator.evaluate('obj.str = "A"', resp)).to.be.true;

    expect(evaluator.evaluate('obj.other = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj.str = NULL', resp)).to.be.false;

    expect(evaluator.evaluate('obj.bool', resp)).to.be.true;
    expect(evaluator.evaluate('obj.str', resp)).to.be.true;
    expect(evaluator.evaluate('obj.num', resp)).to.be.true;
    expect(evaluator.evaluate('obj.other', resp)).to.be.false;

    expect(evaluator.evaluate('NOT obj.bool', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj.str', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj.num', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj.other', resp)).to.be.true;
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

    expect(evaluator.evaluate('obj.str = "A"', resp)).to.be.true;
    expect(evaluator.evaluate('obj.child.str = "B"', resp)).to.be.true;
    expect(evaluator.evaluate('obj.child.other = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj.child2 = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj.child2.other = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj.child2.other.x = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj2.child2.other.x = NULL', resp)).to.be.true;
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

    expect(evaluator.evaluate('obj["bool"] = true', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a bool"] = true', resp)).to.be.true;
    expect(evaluator.evaluate('obj["num"] = 11', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a num"] = 11', resp)).to.be.true;
    expect(evaluator.evaluate('obj["str"] = "A"', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a str"] = "A"', resp)).to.be.true;

    expect(evaluator.evaluate("obj['bool'] = true", resp)).to.be.true;
    expect(evaluator.evaluate("obj['a bool'] = true", resp)).to.be.true;
    expect(evaluator.evaluate("obj['num'] = 11", resp)).to.be.true;
    expect(evaluator.evaluate("obj['a num'] = 11", resp)).to.be.true;
    expect(evaluator.evaluate("obj['str'] = 'A'", resp)).to.be.true;
    expect(evaluator.evaluate("obj['a str'] = 'A'", resp)).to.be.true;

    expect(evaluator.evaluate('obj["other"] = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a other"] = NULL', resp)).to.be.true;
    expect(evaluator.evaluate('obj["str"] = NULL', resp)).to.be.false;
    expect(evaluator.evaluate('obj["a str"] = NULL', resp)).to.be.false;

    expect(evaluator.evaluate('obj["bool"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a bool"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["str"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a str"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["num"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["a num"]', resp)).to.be.true;
    expect(evaluator.evaluate('obj["other"]', resp)).to.be.false;
    expect(evaluator.evaluate('obj["a other"]', resp)).to.be.false;

    expect(evaluator.evaluate('NOT obj["bool"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["a bool"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["str"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["a str"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["num"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["a num"]', resp)).to.be.false;
    expect(evaluator.evaluate('NOT obj["other"]', resp)).to.be.true;
    expect(evaluator.evaluate('NOT obj["a other"]', resp)).to.be.true;

    expect(evaluator.evaluate('obj2["bool"] = NULL', resp)).to.be.true;
  });

  it('should NOT evaluate nested expressions with wrong type', function () {
    expect(evaluator.evaluate('obj.bool = true', {obj: true})).to.be.false;
    expect(evaluator.evaluate('obj.num = 11', {obj: 11})).to.be.false;
    expect(evaluator.evaluate('obj.str = "A"', {obj: 'A'})).to.be.false;
    expect(evaluator.evaluate('obj.str = "A"', {})).to.be.false;

    expect(evaluator.evaluate('obj.other = NULL', {obj: 11})).to.be.true;

    expect(() => {
      evaluator.evaluate('obj.NULL', {});
    }).to.throw();
    expect(() => {
      evaluator.evaluate('NULL.obj', {});
    }).to.throw();
    expect(() => {
      evaluator.evaluate('1.obj', {});
    }).to.throw();
    expect(() => {
      evaluator.evaluate('TRUE.obj', {});
    }).to.throw();
  });

  it('should evaluate nested expressions securely', () => {
    expect(evaluator.evaluate('obj.__bool__ = NULL', {obj: {}})).to.be.true;
  });

  it('should accept name grammar', () => {
    expect(evaluator.evaluate('num = 10', {num: 10})).to.be.true;
    expect(evaluator.evaluate('num1 = 10', {num1: 10})).to.be.true;
    expect(evaluator.evaluate('num_ = 10', {num_: 10})).to.be.true;
    expect(evaluator.evaluate('_num = 10', {_num: 10})).to.be.true;

    expect(() => {
      evaluator.evaluate('1num = 10', {'1num': 10});
    }).to.throw();
    expect(() => {
      evaluator.evaluate('num-a = 10', {'num-a': 10});
    }).to.throw();
    expect(() => {
      evaluator.evaluate('num-1 = 10', {'num-1': 10});
    }).to.throw();
  });

  describe('caching', () => {
    let count;
    const data = {
      get field() {
        count++;
        return true;
      },
    };
    beforeEach(() => {
      count = 0;
    });

    it('should use the cache on subsequent calls for the same expression and data', () => {
      evaluator.evaluate('field', data);
      evaluator.evaluate('field', data);
      expect(count).equal(1);
    });

    it('should not use the cache if the data is referentially unequal', () => {
      evaluator.evaluate('obj.field', {obj: data});
      evaluator.evaluate('obj.field', {obj: data});
      expect(count).equal(2);
    });
  });
});
