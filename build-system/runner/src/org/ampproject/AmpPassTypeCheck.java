package org.ampproject;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.HotSwapCompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.jstype.JSType;

public class AmpPassTypeCheck implements HotSwapCompilerPass {
	final AbstractCompiler compiler;
	
	public AmpPassTypeCheck(AbstractCompiler compiler) {
		 this.compiler = compiler;
	}
	
	
	 @Override
	  public void process(Node externs, Node root) {
	    hotSwapScript(root, null);
	  }
	 
	 @Override
	 public void hotSwapScript(Node scriptRoot, Node originalRoot) {
	    NodeTraversal.traverse(compiler, scriptRoot, new ProcessCasts());
	  }

	
	private class ProcessCasts extends AbstractPostOrderCallback {

		@Override
		public void visit(NodeTraversal t, Node n, Node parent) {
			
			if (n.isCast()) {
			
				try {
					JSType current = n.getFirstChild().getJSType();
					JSType before = n.getFirstChild().getJSTypeBeforeCast();
					if (current != null) {
					String error = current.toMaybeNamedType().toString() + ":" + before.toMaybeNamedType().toString() + ", " + n.getLineno() + " " + n.getSourceFileName() + "\n";
					BufferedWriter writer = new BufferedWriter(new FileWriter("hello-world.txt", true));
					writer.write(error);
					writer.close();
					}
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}				
				}
			}
			
	}
}
