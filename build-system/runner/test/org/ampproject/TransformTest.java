package org.ampproject;

import java.util.Set;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;
import com.google.javascript.rhino.Node;


/**
 * Tests {@link AmpPass}.
 */
public class TransformTest extends CompilerTestCase {

  ImmutableMap<String, Set<String>> suffixTypes = ImmutableMap.of();

  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of();

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of();
  
  ImmutableSet<String> blacklist = ImmutableSet.of();
  
  public TransformTest() {
    super(DEFAULT_EXTERNS);
    parseTypeInfo = true;
    runTypeCheckAfterProcessing = true;
  }

  @Override
  public void setUp() throws Exception {
    super.setUp();
    disableTypeCheck();
  }


  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ true, suffixTypes, assignmentReplacements,
        prodAssignmentReplacements, blacklist);
  }

  @Override protected int getNumRepetitions() {
    // This pass only runs once.
    return 1;
  }

  public void testProxyTransformSimple() throws Exception {
    enableTypeCheck();
    test(
        LINE_JOINER.join(
            "function getAttr(el) {",
            "  return el.getAttribute('id')",
            "}",
            ""),
        LINE_JOINER.join(
            "function getAttr(el) {",
            "  return (el && el.$p || el).getAttribute('id')",
            "}",
            ""));
  }
}
