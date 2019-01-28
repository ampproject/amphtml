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

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.Es6SyntacticScopeCreator;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.jstype.JSType;
import com.google.javascript.rhino.jstype.JSTypeRegistry;

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
	System.out.println(n.getToken());
    if (isCast(n)) {
    	Node castNode = n;
    	Node exprNode = castNode.getFirstChild();
    	
    	JSType castType = castNode.getJSType();
    	JSType exprType = exprNode.getJSType();
    	String errorPoint = "castNode type: " + castType + ", " + this.typeRegistry.getReadableTypeName(castNode);
    	System.out.println(errorPoint);
    	//System.out.println("exprNode type: " + exprType + ", " + this.typeRegistry.getReadableTypeName(exprNode));

    
    	try {
			usingPath(errorPoint);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

    }
  }

  private boolean isCast(Node n) {
	  return n != null && n.isCast();
  }
  
  public static void usingPath(String str) throws IOException {       
      Path path = Paths.get("/Users/erwinm/dev/amphtml/build-system/runner/types.txt");
      Files.write(path, str.getBytes());
  }

  @Override
  public boolean shouldTraverse(NodeTraversal nodeTraversal, Node n, Node parent) {
	return true;
  }
}
