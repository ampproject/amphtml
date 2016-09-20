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
  final boolean isProd;

  public AmpPass(AbstractCompiler compiler, boolean isProd,
        Map<String, Set<String>> stripTypeSuffixes,
        Map<String, Node> assignmentReplacements) {
    this.compiler = compiler;
    this.stripTypeSuffixes = stripTypeSuffixes;
    this.isProd = isProd;
    this.assignmentReplacements = assignmentReplacements;
  }

  @Override public void process(Node externs, Node root) {
    hotSwapScript(root, null);
  }

  @Override public void hotSwapScript(Node scriptRoot, Node originalRoot) {
    NodeTraversal.traverseEs6(compiler, scriptRoot, this);
  }

  @Override public void visit(NodeTraversal t, Node n, Node parent) {
    if (isCallRemovable(n)) {
      Node rootcall = n.getGrandparent();
      maybeEliminateCallExceptFirstParam(rootcall, rootcall.getParent());
    // Remove any `getMode().localDev` and `getMode().test` calls and replace it with `false`.
    } else if (isProd && isFunctionInvokeAndPropAccess(n, "$mode.getMode",
        ImmutableSet.of("localDev", "test"))) {
      replaceWithBooleanExpression(false, n, parent);
    // Remove any `getMode().minified` calls and replace it with `true`.
    } else if (isProd && isFunctionInvokeAndPropAccess(n, "$mode.getMode",
        ImmutableSet.of("minified"))) {
      replaceWithBooleanExpression(true, n, parent);
    } else if (isProd) {
      maybeReplaceRValueInVar(n, assignmentReplacements);
    }
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
    if (n != null && n.isCall()) {
      Node grandparent = n.getGrandparent();
      // We want to make sure an `Log.prototype` method is actually invoked and not just
      // a pointer to it.
      if (grandparent == null || !grandparent.isCall()) {
        return false;
      }
      Node callname = n.getFirstChild();
      Node getprop = n.getNext();
      if (callname != null && callname.isGetProp()) {
       Set<String> methodCallNames = stripTypeSuffixes
          .get(callname.getQualifiedName());
       if (methodCallNames != null) {
         for (String methodCallName : methodCallNames) {
           if (getprop != null && getprop.isString() &&
               methodCallName == getprop.getString()) {
             return true;
           }
         }
       }
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
            compiler.reportCodeChange();
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
    compiler.reportCodeChange();
  }

  private void removeExpression(Node n, Node parent) {
    if (parent.isExprResult()) {
      Node grandparent = parent.getParent();
      grandparent.removeChild(parent);
    } else {
      parent.removeChild(n);
    }
    compiler.reportCodeChange();
  }

  private void maybeEliminateCallExceptFirstParam(Node call, Node p) {
    if (call == null) {
      return;
    }
    Node getprop = call.getFirstChild();
    if (getprop == null) {
      return;
    }
    Node firstArg = getprop.getNext();
    if (firstArg == null) {
      removeExpression(call, p);
      return;
    }

    firstArg.detachFromParent();
    p.replaceChild(call, firstArg);
    compiler.reportCodeChange();
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
