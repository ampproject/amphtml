import {VariableSource, getTimingDataAsync} from '#service/variable-source';

describes.fakeWin(
  'VariableSource',
  {
    amp: {
      ampdoc: 'single',
    },
  },
  (env) => {
    let varSource;
    beforeEach(() => {
      varSource = new VariableSource(env.ampdoc);
    });

    it('Works without any variables', () => {
      expect(varSource.getExpr()).to.be.ok;
      expect(varSource.get('')).to.be.undefined;
    });

    it('Works with sync variables', () => {
      varSource.set('Foo', () => 'bar');
      expect(varSource.getExpr()).to.be.ok;
      expect(varSource.get('Foo')['sync']()).to.equal('bar');
      expect(varSource.get('foo')).to.be.undefined;
      expect(varSource.get('AFoo')).to.be.undefined;
    });

    it('Works with async variables', () => {
      varSource.setAsync('Foo', () => Promise.resolve('bar'));
      expect(varSource.getExpr()).to.be.ok;

      return varSource
        .get('Foo')
        ['async']()
        .then((value) => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with both sync and async variables', () => {
      varSource.setBoth(
        'Foo',
        () => 'bar',
        () => Promise.resolve('bar')
      );
      expect(varSource.getExpr()).to.be.ok;

      expect(varSource.get('Foo')['sync']()).to.equal('bar');
      return varSource
        .get('Foo')
        ['async']()
        .then((value) => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with multiple variables', () => {
      varSource.setBoth(
        'Foo',
        () => 'bar',
        () => Promise.resolve('bar')
      );
      varSource.set('Baz', () => 'Foo');
      expect(varSource.getExpr()).to.be.ok;

      expect(varSource.get('Foo')['sync']()).to.equal('bar');
      expect(varSource.get('Baz')['sync']()).to.equal('Foo');
      return varSource
        .get('Foo')
        ['async']()
        .then((value) => {
          expect(value).to.equal('bar');
        });
    });

    it('Works with sync variable that is set multiple times', () => {
      varSource.set('Foo', () => 'bar').set('Foo', () => 'baz');
      expect(varSource.getExpr()).to.be.ok;
      expect(varSource.get('Foo')['sync']()).to.equal('baz');
    });

    it('Works with async variable that is set multiple times', () => {
      varSource
        .setAsync('Foo', () => Promise.resolve('bar'))
        .setAsync('Foo', () => Promise.resolve('baz'));
      return varSource
        .get('Foo')
        ['async']()
        .then((value) => {
          expect(value).to.equal('baz');
        });
    });

    it('Does not cache a built Expr', () => {
      varSource.set('ONE', () => 'foo');
      const firstExpr = varSource.getExpr();
      varSource.set('TWO', () => 'bar');
      expect(firstExpr).not.to.equal(varSource.getExpr());
    });

    describes.realWin(
      'Allowlist of variable substitutions',
      {
        amp: {
          ampdoc: 'single',
        },
      },
      (env) => {
        let variableSource;
        beforeEach(() => {
          variableSource = new VariableSource(env.ampdoc);
          variableSource.variableAllowlist_ = ['ABC', 'ABCD', 'CANONICAL'];
        });

        it('Works with allowlisted variables', () => {
          variableSource.setAsync('ABCD', () => Promise.resolve('abcd'));
          expect(variableSource.getExpr()).to.be.ok;
          expect(variableSource.getExpr().toString()).to.contain('ABCD');

          return variableSource
            .get('ABCD')
            ['async']()
            .then((value) => {
              expect(value).to.equal('abcd');
            });
        });

        it('Should not work with unallowlisted variables', () => {
          variableSource.setAsync('RANDOM', () => Promise.resolve('0.1234'));
          expect(variableSource.getExpr()).to.be.ok;
          expect(variableSource.getExpr().toString()).not.to.contain('RANDOM');

          return variableSource
            .get('RANDOM')
            ['async']()
            .then((value) => {
              expect(value).to.equal('0.1234');
            });
        });

        it('Should ignore allowlisted variables for email documents', () => {
          env.win.document.documentElement.setAttribute('amp4email', '');
          expect(variableSource.getExpr()).to.be.ok;
          expect(variableSource.getExpr().toString()).not.to.contain('ABC');
          expect(variableSource.getExpr().toString()).not.to.contain('ABCD');
          expect(variableSource.getExpr().toString()).not.to.contain(
            'CANONICAL'
          );
        });
      }
    );

    it('Should not work with empty variable allowlist', () => {
      const variableSource = new VariableSource(env.ampdoc);
      variableSource.variableAllowlist_ = [''];

      variableSource.setAsync('RANDOM', () => Promise.resolve('0.1234'));
      expect(variableSource.getExpr()).to.be.ok;
      expect(variableSource.getExpr().toString()).not.to.contain('RANDOM');

      return variableSource
        .get('RANDOM')
        ['async']()
        .then((value) => {
          expect(value).to.equal('0.1234');
        });
    });

    describes.fakeWin('getTimingData', {}, (env) => {
      let win;

      beforeEach(() => {
        win = env.win;
        win.performance = {
          timing: {
            navigationStart: 1,
            loadEventStart: 0,
          },
        };
      });

      it('should wait for load event', () => {
        win.readyState = 'other';
        const p = getTimingDataAsync(win, 'navigationStart', 'loadEventStart');
        expect(win.eventListeners.count('load')).to.equal(1);
        win.performance.timing.loadEventStart = 12;
        win.eventListeners.fire({type: 'load'});
        return p.then((value) => {
          expect(value).to.equal(11);
        });
      });
    });
  }
);
