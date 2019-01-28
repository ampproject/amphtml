
package org.ampproject;


import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;



/**
 * Tests {@link AmpPassJSONObjectCastFinder}.
 */
public class AmpPassJSONObjectCastFinderTest extends CompilerTestCase {

	 @Override protected CompilerPass getProcessor(Compiler compiler) {
		 return new AmpPassJSONObjectCastFinder(compiler);
	 }

	 @Override	protected int getNumRepetitions() {
		// This pass only runs once.
		return 1;
	 }	
	 
	  public void testFinder() throws Exception {
		  test(
				  LINE_JOINER.join(
						"/** @typedef {{key: string}} */",
						"let MyType;",
			            "/** @type {!Object} */ const a = {};",
			            "/** @type {!MyType} */ (a);"),
			        LINE_JOINER.join(
			        	"/** @typedef {{key: string}} */",
						"let MyType;",
			        	"/** @type {!Object} */ const a = {};",
			        	"/** @type {!MyType} */ (a);")
			        );
	  }
}
