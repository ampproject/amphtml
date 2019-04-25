package org.ampproject;


import java.util.Set;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;
import org.junit.Test;


/**
 * Tests {@link AmpPass}.
 */
public class AmpPassTestEnvTest extends CompilerTestCase {

  ImmutableSet<String> suffixTypes = ImmutableSet.of();
  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of(
      "IS_MINIFIED",
      IR.trueNode());

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of(
      "IS_DEV",
      IR.falseNode());

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ false, suffixTypes, assignmentReplacements,
        prodAssignmentReplacements, "123");
  }

  @Override protected int getNumRepetitions() {
    // This pass only runs once.
    return 1;
  }

  @Test public void testGetModeLocalDevPropertyReplacementInTestingEnv() throws Exception {
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

  @Test public void testGetModeTestPropertyReplacementInTestingEnv() throws Exception {
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

  @Test public void testGetModeMinifiedPropertyReplacementInTestingEnv() throws Exception {
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

  @Test public void testOptimizeGetModeFunction() throws Exception {
    test(
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
