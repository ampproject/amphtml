package org.ampproject;

import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;
import org.junit.Test;


/**
 * Tests {@link AmpPass}.
 */
public class AmpPassTestEnvTest extends CompilerTestCase {

  ImmutableSet<String> suffixTypes = ImmutableSet.of();

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ false, suffixTypes);
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
}
