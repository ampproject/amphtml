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

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.DiagnosticType;
import com.google.javascript.jscomp.Es6SyntacticScopeCreator;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;
import com.google.javascript.rhino.jstype.JSType;
import com.google.javascript.rhino.jstype.JSTypeRegistry;

class AmpPassJSONObjectCastFinder implements NodeTraversal.Callback, CompilerPass {

  final AbstractCompiler compiler;
  final JSTypeRegistry typeRegistry;

  public AmpPassJSONObjectCastFinder(AbstractCompiler compiler) {
    this.compiler = compiler;
    this.typeRegistry = compiler.getTypeRegistry();
  }

  @Override
  public void process(Node externsRoot, Node jsRoot) {
    check(jsRoot);
  }

  void check(Node jsRoot) {
    Es6SyntacticScopeCreator scopeCreator = new Es6SyntacticScopeCreator(this.compiler);
    NodeTraversal t = new NodeTraversal(compiler, this, scopeCreator);
    t.traverse(jsRoot);
  }

  public void visit(NodeTraversal t, Node n, Node parent) {
    if (n != null && n.isCast()) {
      Node castNode = n;
      Node exprNode = castNode.getFirstChild();

      JSType castType = castNode.getJSType();
      JSType exprType = exprNode.getJSType();
      String error = "cast from type: " + exprType + " " + this.typeRegistry.getReadableTypeName(exprNode) +
          " to " + castType + " " +  this.typeRegistry.getReadableTypeName(exprNode) + ". " + castNode.getSourceFileName() + ":" + castNode.getLineno() + "\n";
      JSError err = JSError.make(DiagnosticType.warning("JSERROR", "{0}"), error);
      this.compiler.report(err);
    }
  }

  @Override
  public boolean shouldTraverse(NodeTraversal nodeTraversal, Node n, Node parent) {
    return true;
  }
}
