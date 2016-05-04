package org.ampproject;

import java.util.Set;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.HotSwapCompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
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

  public AmpPass(AbstractCompiler compiler, Set<String> stripTypeSuffixes) {
    this.compiler = compiler;
    this.stripTypeSuffixes = stripTypeSuffixes;
  }

  @Override public void process(Node externs, Node root) {
    hotSwapScript(root, null);
  }

  @Override public void hotSwapScript(Node scriptRoot, Node originalRoot) {
    NodeTraversal.traverseEs6(compiler, scriptRoot, this);
  }

  @Override public void visit(NodeTraversal t, Node n, Node parent) {
    if (isDevAssertCall(n)) {
      maybeEliminateCallExceptFirstParam(n, parent);
    } else if (n.isExprResult()) {
      maybeEliminateExpressionBySuffixName(n, parent);
    }
  }

  private boolean isDevAssertCall(Node n) {
    if (n.isCall()) {
      Node expression = n.getFirstChild();
      if (expression == null) {
        return false;
      }

      String name = expression.getQualifiedName();
      if (name == null) {
        return false;
      }

      if (name.endsWith("dev.assert")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Checks if expression is a GETPROP() (method invocation) and the property
   * name ends with one of the items in stripTypeSuffixes.
   */
  private void maybeEliminateExpressionBySuffixName(Node n, Node parent) {
    // n = EXPRESSION_RESULT > CALL > GETPROP
    Node call = n.getFirstChild();
    if (call == null) {
      return;
    }
    Node expression = call.getFirstChild();
    if (expression == null) {
      return;
    }

    if (qualifiedNameEndsWithStripType(expression)) {
      if (parent.isExprResult()) {
        Node grandparent = parent.getParent();
        grandparent.removeChild(parent);
      } else {
        parent.removeChild(n);
      }
      compiler.reportCodeChange();
    }
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
  boolean qualifiedNameEndsWithStripType(Node n) {
    String name = n.getQualifiedName();
    return qualifiedNameEndsWithStripType(name);
  }

  /**
   * Checks if the string ends with one of the items in stripTypeSuffixes
   */
  boolean qualifiedNameEndsWithStripType(String name) {
    if (name != null) {
      for (String suffix : stripTypeSuffixes) {
        if (name.endsWith(suffix)) {
          return true;
        }
      }
    }
    return false;
  }
}
