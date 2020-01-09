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

import java.util.Set;

import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.HotSwapCompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;

/**
 * Eliminates removable calls like `assert`, `assertElement`, `assertString`, etc.
 */
class AmpPass extends AbstractPostOrderCallback implements HotSwapCompilerPass {

  final AbstractCompiler compiler;
  private final ImmutableSet<String> stripTypeSuffixes;
  final boolean isProd;

  public AmpPass(AbstractCompiler compiler, boolean isProd,
        ImmutableSet<String> stripTypeSuffixes) {
    this.compiler = compiler;
    this.stripTypeSuffixes = stripTypeSuffixes;
    this.isProd = isProd;
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
    }
  }

  /**
   */
  private boolean isCallRemovable(Node n) {
    if (n == null || !n.isCall()) {
      return false;
    }

    String name = buildQualifiedName(n);
    for (String removable : stripTypeSuffixes) {
      if (name.equals(removable)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Builds a string representation of MemberExpression and CallExpressions.
   */
  private String buildQualifiedName(Node n) {
    StringBuilder sb = new StringBuilder();
    buildQualifiedNameInternal(n, sb);
    return sb.toString();
  }

  private void buildQualifiedNameInternal(Node n, StringBuilder sb) {
    if (n == null) {
      sb.append("NULL");
      return;
    }

    if (n.isCall()) {
      buildQualifiedNameInternal(n.getFirstChild(), sb);
      sb.append("()");
    } else if (n.isGetProp()) {
      buildQualifiedNameInternal(n.getFirstChild(), sb);
      sb.append(".");
      buildQualifiedNameInternal(n.getSecondChild(), sb);
    } else if (n.isName() || n.isString()) {
      sb.append(n.getString());
    } else {
      sb.append("UNKNOWN");
    }
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
