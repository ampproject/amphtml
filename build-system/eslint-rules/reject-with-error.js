/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

var astUtils = require('eslint/lib/ast-utils');

function leadingCommentMatches(leadingComments, regex) {
  if (!leadingComments) {
    return false;
  }

  return leadingComments.some(function(comment) {
    return regex.test(comment.value);
  });
}

function isLogCreateErrorCall(node) {
  if (node.type != 'CallExpression') {
    return false;
  }

  var call = node.callee;
  return call.type == 'MemberExpression' &&
      call.object.type === 'CallExpression' &&
      /(user|dev)/.test(call.object.callee.name) &&
      call.property.name === 'createError';
}

function isLogAssertErrorCall(node) {
  if (node.type != 'CallExpression') {
    return false;
  }

  var call = node.callee;
  return call.type == 'MemberExpression' &&
      call.object.type === 'CallExpression' &&
      /(user|dev)/.test(call.object.callee.name) &&
      call.property.name === 'assertError';
}

function isCancellationCall(node, context) {
  if (node.type != 'CallExpression') {
    return false;
  }

  var call = node.callee;
  if (call.name !== 'cancellation') {
    return false;
  }

  var variable = astUtils.getVariableByName(context.getScope(), call.name);
  if (!variable || variable.defs.length != 1) {
    return false;
  }

  var def = variable.defs[0];
  if (def.type == 'ImportBinding' && /\/error$/.test(def.node.parent.source.value)) {
    return true;
  }

  return false;
}

function isPromiseOnRejected(node) {
  var parent = node.parent;
  if (parent.type != 'CallExpression') {
    return false;
  }

  var call = parent.callee;
  if (call.type != 'MemberExpression') {
    return false;
  }

  // promise.then(() => {}, e => {... throw e; });
  if (call.property.name == 'then' && parent.arguments[1] == node) {
    return true;
  }

  // promise.catch(e => {... throw e; });
  if (call.property.name == 'catch') {
    return true;
  }

  return false;
}

function parameterIsExplicitlyError(param) {
  var func = param.parent;
  var regex = new RegExp('@param {!(Type)?Error} ' + param.name);
  return leadingCommentMatches(func.leadingComments, regex) ||
      leadingCommentMatches(func.parent.leadingComments, regex);
}

function isError(node, context) {
  return isNewError(node) || // throw new Error()
      isLogCreateErrorCall(node) || // throw user().createError()
      isLogAssertErrorCall(node) || // throw dev().assertError()
      isCancellationCall(node, context); // throw cancellation()
}

function variableIsError(variable, context) {
  var declaration = variable.parent;
  if (declaration.kind != 'const') {
    return false;
  }

  var init = variable.init;
  return !!init && isError(init, context);
}

function isNewError(node) {
  return node.type == 'NewExpression' && /(Type)?Error/.test(node.callee.name);
}

module.exports = function(context) {

  function isErrorThrown(node, message) {
    var argument = node.argument;
    // throw new Error('...')
    if (isNewError(node.argument)) {
      return;
    }

    if (argument.type == 'CallExpression') {
      // throw user().createError(...)
      if (isError(argument, context)) {
        return;
      }

      return context.report(node, 'Unable to determine the return type. Please ' + message + ' an error.');
    }

    if (argument.type != 'Identifier' || argument.name == 'undefined') {
      return context.report(node, 'MUST ' + message + ' an Error instance!');
    }

    var variable = astUtils.getVariableByName(context.getScope(), argument.name);
    if (!variable || variable.defs.length != 1) {
      return context.report(node, 'Unable to determine type. Please ' + message + ' an error.');
    }

    var def = variable.defs[0];

    if (def.type == 'CatchClause') {
      return;
    }

    if (def.type === 'Parameter') {
      // promise.then(() => {}, e => {... throw e; });
      // promise.catch(e => {... throw e; });
      if (isPromiseOnRejected(def.node)) {
        return;
      }

      // Function with explicit type parameter
      if (parameterIsExplicitlyError(def.name)) {
        return;
      }

      return context.report(node, 'Unable to determine parameter type. Please ' + message + ' an error.');
    } else if (def.type === 'Variable') {
      if (variableIsError(def.node, context)) {
        return;
      }
      variableIsError(def.node, context);

      return context.report(node, 'Unable to determine variable type. Please ' + message + ' an error.');
    }

    return context.report(node, 'Unable to determine type. Please ' + message + ' an error.');
  }

  return {
    ThrowStatement: function(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      isErrorThrown({
        argument: node.argument,
        loc: node.loc,
      }, 'throw');
    },

    CallExpression: function(node) {
      if (/test-/.test(context.getFilename())) {
        return;
      }

      var call = node.callee;
      if (!(call.name == 'reject' ||
          (call.type == 'MemberExpression' && /[Rr]eject/.test(call.property.name)))) {
        return;
      }

      if (node.arguments.length != 1) {
        return context.report(node, 'MUST reject with an error.')
      }

      isErrorThrown({
        argument: node.arguments[0],
        loc: node.loc,
      }, 'reject');
    }
  };
};
