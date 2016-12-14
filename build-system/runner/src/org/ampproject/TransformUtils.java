package org.ampproject;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.jstype.JSType;

class TransformUtils {

  static boolean isJSTypeNodeGetProp(AbstractCompiler compiler, NodeTraversal t, Node n,
      Node parent,
      ImmutableSet<String> blacklist) {
    
    if (n == null || !n.isGetProp()) {
      return false;
    }

    // Don't do anything if this is actually an assignment.
    if (parent != null && parent.isAssign()) {
      return false;
    }
    
    Preconditions.checkArgument(n.getSecondChild().isString());
    // If its not in the blacklist we don't do any transformation.
    if (!blacklist.contains(n.getSecondChild().getString())) {
      return false;
    }
    
    Node firstChild = n.getFirstChild();
    
    // Should we handle this? this occurs when we do something like
    // window.document.querySelector('#form-1').getAttribute('data-hello')
    if (firstChild.isCall()) {
      return false;
    }

    JSType typeOfAccess = n.getFirstChild().getJSType();
    // Bail out if we have no type information.
    if (typeOfAccess == null) {
      return false;
    }

    // Property access or array index access
    Preconditions.checkArgument(firstChild.isName() ||
        firstChild.isGetElem() || firstChild.isGetProp() || firstChild.isCall());

    JSType nodeType = compiler.getTypeRegistry().getType("Node");
    
    // Iterate if its a Union ex. {Element|null}
    if (typeOfAccess.isUnionType()) {
      for (JSType type : typeOfAccess.getUnionMembers()) {
        if (type.isSubtypeOf(nodeType)) {
          return true;
        }
      }
      return false;
    }
    return typeOfAccess.isSubtype(nodeType);
  }
  /**
   * Where `n` is 
   */
  static boolean transformNodeTypeToProxyExpression(AbstractCompiler compiler, Node n) {
    // Access here could e a simple property read or a GET_ELEM (array index access for example).
    Node access = n.getFirstChild();
    Node string = n.getSecondChild();
    n.detachChildren();
    Node access1 = access.cloneTree(true);
    Node access2 = access.cloneTree(true);
    Node access3 = access.cloneTree(true);
    Node or = IR.or(
        IR.and(
            access1,
            IR.getprop(
                access2,
                "$p")),
        access3);
    or.useSourceInfoIfMissingFromForTree(n);
    n.addChildToBack(or);
    n.addChildAfter(string, or);
    Preconditions.checkArgument(n.getFirstChild().isOr());
    compiler.reportCodeChange();
    return false;
  }
}
