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
  private final Set<String> stripTypeSuffixes;
  private final Map<String, Node> assignmentReplacements;
  final boolean isProd;

  public AmpPass(AbstractCompiler compiler, boolean isProd, Set<String> stripTypeSuffixes,
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
    // Remove `dev.assert` calls and preserve first argument if any.
    if (isNameStripType(n, ImmutableSet.of( "dev.assert"))) {
      maybeEliminateCallExceptFirstParam(n, parent);
    // Remove any `stripTypes` passed in outright like `dev.warn`.
    } else if (isNameStripType(n, stripTypeSuffixes)) {
      removeExpression(n, parent);
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

  /**
   * Checks if expression is a GETPROP() (method invocation) and the property
   * name ends with one of the items in stripTypeSuffixes.
   * This method does not do a deep check and will only do a shallow
   * expression -> property -> call check.
   */
  private boolean isNameStripType(Node n, Set<String> suffixes) {
    if (!n.isCall()) {
      return false;
    }
    Node getprop = n.getFirstChild();
    if (getprop == null) {
      return false;
    }
    return qualifiedNameEndsWithStripType(getprop, suffixes);
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

  private void maybeEliminateCallExceptFirstParam(Node n, Node p) {
    Node call = n.getFirstChild();
    if (call == null) {
      return;
    }

    Node firstArg = call.getNext();
    if (firstArg == null) {
      p.removeChild(n);
      compiler.reportCodeChange();
      return;
    }

    firstArg.detachFromParent();
    p.replaceChild(n, firstArg);
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
