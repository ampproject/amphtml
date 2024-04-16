import {BindExpression} from './bind-expression';

/**
 * A single parsed Bind macro.
 */
export class BindMacro {
  /**
   * @param {!BindMacroDef} data
   * @param {!{[key: string]: !BindMacro}} referableMacros
   */
  constructor(data, referableMacros) {
    /** @const @private {!Array<string>} */
    this.argumentNames_ = data.argumentNames || [];

    /** @const @private {!BindExpression} */
    this.expression_ = new BindExpression(
      data.expressionString,
      referableMacros
    );
  }

  /**
   * @param {!JsonObject} scope
   * @param {!Array} args
   * @throws {Error} On illegal function invocation.
   * @return {BindExpressionResultDef}
   */
  evaluate(scope, args) {
    const copy = /** @type {!JsonObject} */ ({...scope});
    for (let i = 0; i < this.argumentNames_.length; i++) {
      copy[this.argumentNames_[i]] = args[i];
    }
    return this.expression_.evaluate(copy);
  }

  /**
   * @return {number}
   */
  getExpressionSize() {
    return this.expression_.expressionSize;
  }
}
