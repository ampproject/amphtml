package org.ampproject;


import java.util.Set;

import com.google.common.collect.ImmutableMap;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.Es6CompilerTestCase;


/**
 * Tests {@link AmpPass}.
 */
public class AmpPassTestEnvTest extends Es6CompilerTestCase {

  ImmutableMap<String, Set<String>> suffixTypes = ImmutableMap.of();
  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of(
      "IS_MINIFIED",
      IR.trueNode());

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of(
      "IS_DEV",
      IR.falseNode());
  
  ImmutableSet<String> blacklist = ImmutableSet.of();

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ false, suffixTypes, assignmentReplacements,
        prodAssignmentReplacements, blacklist);
  }

  @Override protected int getNumRepetitions() {
    // This pass only runs once.
    return 1;
  }

  public void testGetModeLocalDevPropertyReplacementInTestingEnv() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { localDev: true } }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().localDev) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { localDev: true }; }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().localDev) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  public void testGetModeTestPropertyReplacementInTestingEnv() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { test: true } }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().test) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { test: true }; }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().test) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  public void testGetModeMinifiedPropertyReplacementInTestingEnv() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false } }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().minified) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false }; }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().minified) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  public void testOptimizeGetModeFunction() throws Exception {
    testEs6(
        LINE_JOINER.join(
             "(function() {",
             "const IS_DEV = true;",
             "const IS_MINIFIED = false;",
             "const IS_SOMETHING = true;",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "const IS_DEV = true;",
             "const IS_MINIFIED = true;",
             "const IS_SOMETHING = true;",
            "})()"));
  }
}
