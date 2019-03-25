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
package org.ampproject;

import java.util.Map;
import java.util.Set;

import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.HotSwapCompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;

/**
 * Does a `stripTypeSuffix` which currently can't be done through
 * the normal `strip` mechanisms provided by closure compiler.
 * Some of the known mechanisms we tried before writing our own compiler pass
 * are setStripTypes, setStripTypePrefixes, setStripNameSuffixes, setStripNamePrefixes.
 * The normal mechanisms found in closure compiler can't strip the expressions we want because
 * they are either prefix based and/or operate on the es6 translated code which would mean they
 * operate on a qualifier string name that looks like
 * "module$__$__$__$extensions$amp_test$0_1$log.dev.fine".
 *
 * Other custom pass examples found inside closure compiler src:
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/PolymerPass.java
 * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/AngularPass.java
 */
class AmpPass extends AbstractPostOrderCallback implements HotSwapCompilerPass {

  final AbstractCompiler compiler;
  private final Map<String, Set<String>> stripTypeSuffixes;
  private final Map<String, Node> assignmentReplacements;
  private final Map<String, Node> prodAssignmentReplacements;
  final boolean isProd;

  public AmpPass(AbstractCompiler compiler, boolean isProd,
        Map<String, Set<String>> stripTypeSuffixes,
        Map<String, Node> assignmentReplacements, Map<String, Node> prodAssignmentReplacements) {
    this.compiler = compiler;
    this.stripTypeSuffixes = stripTypeSuffixes;
    this.isProd = isProd;
    this.assignmentReplacements = assignmentReplacements;
    this.prodAssignmentReplacements = prodAssignmentReplacements;
  }

  @Override public void process(Node externs, Node root) {
    hotSwapScript(root, null);
  }

  @Override public void hotSwapScript(Node scriptRoot, Node originalRoot) {
    NodeTraversal.traverse(compiler, scriptRoot, this);
  }

  @Override public void visit(NodeTraversal t, Node n, Node parent) {
    if (isCallRemovable(n)) {
      maybeEliminateCallExceptFirstParam(n, parent);
    } else if (isAmpExtensionCall(n)) {
      inlineAmpExtensionCall(n, parent);
    // Remove any `getMode().localDev` and `getMode().test` calls and replace it with `false`.
    } else if (isProd && isFunctionInvokeAndPropAccess(n, "$mode.getMode",
        ImmutableSet.of("localDev", "test"))) {
      replaceWithBooleanExpression(false, n, parent);
    // Remove any `getMode().minified` calls and replace it with `true`.
    } else if (isProd && isFunctionInvokeAndPropAccess(n, "$mode.getMode",
        ImmutableSet.of("minified"))) {
      replaceWithBooleanExpression(true, n, parent);
    } else {
      if (isProd) {
        maybeReplaceRValueInVar(n, prodAssignmentReplacements);
      }
      maybeReplaceRValueInVar(n, assignmentReplacements);
    }
  }

  /**
   * We don't care about the deep GETPROP. What we care about is finding a
   * call which has an `extension` name which then has `AMP` as its
   * previous getprop or name, and has a function as the 2nd argument.
   *
   * CALL 3 [length: 96] [source_file: input0]
   *   GETPROP 3 [length: 37] [source_file: input0]
   *     GETPROP 3 [length: 24] [source_file: input0]
   *       GETPROP 3 [length: 20] [source_file: input0]
   *         NAME self 3 [length: 4] [source_file: input0]
   *         STRING someproperty 3 [length: 15] [source_file: input0]
   *       STRING AMP 3 [length: 3] [source_file: input0]
   *     STRING extension 3 [length: 12] [source_file: input0]
   *   STRING some-string 3 [length: 9] [source_file: input0]
   *   FUNCTION  3 [length: 46] [source_file: input0]
   */
  private boolean isAmpExtensionCall(Node n) {
    if (n != null && n.isCall()) {
      Node getprop = n.getFirstChild();

      // The AST has the last getprop higher in the hierarchy.
      if (isGetPropName(getprop, "extension")) {
        Node firstChild = getprop.getFirstChild();
        // We have to handle both explicit/implicit top level `AMP`
        if ((firstChild != null && firstChild.isName() &&
               firstChild.getString() == "AMP") ||
            isGetPropName(firstChild, "AMP")) {
          // Child at index 1 should be the "string" value (first argument)
          Node func = getAmpExtensionCallback(n);
          return func != null && func.isFunction();
        }
      }
    }
    return false;
  }

  private boolean isGetPropName(Node n, String name) {
    if (n != null && n.isGetProp()) {
      Node nodeName = n.getSecondChild();
      return nodeName != null && nodeName.isString() &&
          nodeName.getString() == name;
    }
    return false;
  }

  /**
   * This operation should be guarded stringently by `isAmpExtensionCall`
   * predicate.
   *
   * AMP.extension('some-name', '0.1', function(AMP) {
   *   // BODY...
   * });
   *
   * is turned into:
   * (function(AMP) {
   *   // BODY...
   * })(self.AMP);
   */
  private void inlineAmpExtensionCall(Node n, Node expr) {
    if (expr == null || !expr.isExprResult()) {
      return;
    }
    Node func = getAmpExtensionCallback(n);
    func.detachFromParent();
    Node arg1 = IR.getprop(IR.name("self"), IR.string("AMP"));
    arg1.setLength("self.AMP".length());
    arg1.useSourceInfoIfMissingFromForTree(func);
    Node newcall = IR.call(func);
    newcall.putBooleanProp(Node.FREE_CALL, true);
    newcall.addChildToBack(arg1);
    expr.replaceChild(n, newcall);
    compiler.reportChangeToEnclosingScope(expr);
  }

  private Node getAmpExtensionCallback(Node n) {
    return n.getLastChild();
  }

  /**
   * For a function that looks like:
   * function fun(val) {
   *   return dev().assert(val);
   * }
   *
   * The AST would look like:
   * RETURN 24 [length: 25] [source_file: ./src/main.js]
   *   CALL 24 [length: 17] [source_file: ./src/main.js]
   *     GETPROP 24 [length: 12] [source_file: ./src/main.js]
   *       CALL 24 [length: 5] [source_file: ./src/main.js]
   *         NAME $dev$$module$src$log$$ 38 [length: 3] [originalname: dev] [source_file: ./src/log.js]
   *         STRING assert 24 [length: 6] [source_file: ./src/main.js]
   *     NAME $val$$ 24 [length: 3] [source_file: ./src/main.js]
   *
   * We are looking for the `CALL` that has a child NAME "$dev$$module$src$log$$" (or any signature from keys)
   * and a child STRING "assert" (or any other signature from Set<String> value)
   */
  private boolean isCallRemovable(Node n) {
    if (n == null || !n.isCall()) {
      return false;
    }

    Node callGetprop = n.getFirstChild();
    if (callGetprop == null || !callGetprop.isGetProp()) {
      return false;
    }

    // Temp hack not needed in single pass compiler because it can inline the
    // this itself.
    if ("module$src$log.devAssert".equals(callGetprop.getQualifiedName())) {
      return true;
    }

    Node parentCall = callGetprop.getFirstChild();
    if (parentCall == null || !parentCall.isCall()) {
      return false;
    }

    Node parentCallGetprop = parentCall.getFirstChild();
    Node methodName = parentCall.getNext();
    if (parentCallGetprop == null || !parentCallGetprop.isGetProp() ||
        methodName == null || !methodName.isString()) {
      return false;
    }

    String parentMethodName = parentCallGetprop.getQualifiedName();
    Set<String> methodCallNames = stripTypeSuffixes.get(parentMethodName);
    if (methodCallNames == null) {
      return false;
    }

    for (String methodCallName : methodCallNames) {
      if (methodCallName == methodName.getString()) {
        return true;
      }
    }
    return false;
  }

  private void maybeReplaceRValueInVar(Node n, Map<String, Node> map) {
    if (n != null && (n.isVar() || n.isLet() || n.isConst())) {
      Node varNode = n.getFirstChild();
      if (varNode != null) {
        for (Map.Entry<String, Node> mapping : map.entrySet()) {
          if (varNode.getString() == mapping.getKey()) {
            varNode.replaceChild(varNode.getFirstChild(), mapping.getValue());
            compiler.reportChangeToEnclosingScope(varNode);
            return;
          }
        }
      }
    }
  }

  /**
   * Predicate for any <code>fnQualifiedName</code>.<code>props</code> call.
   * example:
   *   isFunctionInvokeAndPropAccess(n, "getMode", "test"); // matches `getMode().test`
   */
  private boolean isFunctionInvokeAndPropAccess(Node n, String fnQualifiedName, Set<String> props) {
    // mode.getMode().localDev
    // mode [property] ->
    //   getMode [call]
    //   ${property} [string]
    if (!n.isGetProp()) {
      return false;
    }
    Node call = n.getFirstChild();
    if (!call.isCall()) {
      return false;
    }
    Node fullQualifiedFnName = call.getFirstChild();
    if (fullQualifiedFnName == null) {
      return false;
    }

    String qualifiedName = fullQualifiedFnName.getQualifiedName();
    if (qualifiedName != null && qualifiedName.endsWith(fnQualifiedName)) {
      Node maybeProp = n.getSecondChild();
      if (maybeProp != null && maybeProp.isString()) {
         String name = maybeProp.getString();
         for (String prop : props) {
           if (prop == name) {
             return true;
           }
         }
      }
    }

    return false;
  }

  private void replaceWithBooleanExpression(boolean bool, Node n, Node parent) {
    Node booleanNode = bool ? IR.trueNode() : IR.falseNode();
    booleanNode.useSourceInfoIfMissingFrom(n);
    parent.replaceChild(n, booleanNode);
    compiler.reportChangeToEnclosingScope(parent);
  }

  private void removeExpression(Node n, Node parent) {
    Node scope = parent;
    if (parent.isExprResult()) {
      Node grandparent = parent.getParent();
      grandparent.removeChild(parent);
      scope = grandparent;
    } else {
      parent.removeChild(n);
    }
    compiler.reportChangeToEnclosingScope(scope);
  }

  private void maybeEliminateCallExceptFirstParam(Node call, Node parent) {
    // Extra precaution if the item we're traversing has already been detached.
    if (call == null || parent == null) {
      return;
    }
    Node getprop = call.getFirstChild();
    if (getprop == null) {
      return;
    }
    Node firstArg = getprop.getNext();
    if (firstArg == null) {
      removeExpression(call, parent);
      return;
    }

    firstArg.detachFromParent();
    parent.replaceChild(call, firstArg);
    compiler.reportChangeToEnclosingScope(parent);
  }

  /**
   * Checks the nodes qualified name if it ends with one of the items in
   * stripTypeSuffixes
   */
  boolean qualifiedNameEndsWithStripType(Node n, Set<String> suffixes) {
    String name = n.getQualifiedName();
    return qualifiedNameEndsWithStripType(name, suffixes);
  }

  /**
   * Checks if the string ends with one of the items in stripTypeSuffixes
   */
  boolean qualifiedNameEndsWithStripType(String name, Set<String> suffixes) {
    if (name != null) {
      for (String suffix : suffixes) {
        if (name.endsWith(suffix)) {
          return true;
        }
      }
    }
    return false;
  }
}
