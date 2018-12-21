
package org.ampproject;


import java.util.Set;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;
import org.junit.Test;


/**
 * Tests {@link AmpPass}.
 */
public class AmpPassTest extends CompilerTestCase {

  ImmutableMap<String, Set<String>> suffixTypes = ImmutableMap.of(
      "module$src$log.dev",
          ImmutableSet.of("assert", "fine", "assertElement", "assertString", "assertNumber"),
      "module$src$log.user", ImmutableSet.of("fine"));

  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of(
      "IS_MINIFIED",
      IR.trueNode());

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of(
      "IS_DEV",
      IR.falseNode());

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ true, suffixTypes, assignmentReplacements,
        prodAssignmentReplacements);
  }

  @Override protected int getNumRepetitions() {
    // This pass only runs once.
    return 1;
  }

  @Test public void testDevFineRemoval() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { fine: function() {}} } };",
             "  module$src$log.dev().fine('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { fine: function() {}} } };",
             "  'hello world';",
             "  console.log('this is preserved');",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { fine: function() {}} } };",
             "  module$src$log.dev().fine();",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { fine: function() {}} } };",
             "  console.log('this is preserved');",
            "})()"));
  }

  @Test public void testDevErrorPreserve() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var log = { dev: { error: function() {} } };",
             "  log.dev.error('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var log = { dev: { error: function() {} } };",
             "  log.dev.error('hello world');",
             "  console.log('this is preserved');",
            "})()"));
  }

  @Test public void testDevAssertExpressionRemoval() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  module$src$log.dev().assert('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  \"hello world\";",
             "  console.log('this is preserved');",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = module$src$log.dev().assert();",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue;",
             "  console.log('this is preserved', someValue);",
            "})()"));
  }

  @Test public void testDevAssertPreserveFirstArg() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = module$src$log.dev().assert(true, 'This is an error');",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = true;",
             "  console.log('this is preserved', someValue);",
            "})()"));

    test(
        LINE_JOINER.join(
             "(function() {",
             "  function add(a, b) { return a + b; }",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = add(module$src$log.dev().assert(3), module$src$log.dev().assert(3));",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  function add(a, b) { return a + b; }",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = add(3, 3);",
             "  console.log('this is preserved', someValue);",
            "})()"));
  }

  @Test public void testShouldPreserveNoneCalls() throws Exception {
    test(
        // Does reliasing
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = module$src$log.dev().assert;",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var module$src$log = { dev: function() { return { assert: function() {}} } };",
             "  var someValue = module$src$log.dev().assert;",
             "  console.log('this is preserved', someValue);",
            "})()"));
  }

  @Test public void testGetModeLocalDevPropertyReplacement() throws Exception {
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
             "  if (false) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  @Test public void testGetModeTestPropertyReplacement() throws Exception {
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
             "  if (false) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  @Test public void testGetModeMinifiedPropertyReplacement() throws Exception {
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
             "  if (true) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  @Test public void testGetModeWinTestPropertyReplacement() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { test: true } }",
             "var win = {};",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode(win).test) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { test: true }; }",
             "var win = {};",
             "var $mode = { getMode: getMode };",
             "  if (false) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  @Test public void testGetModeWinMinifiedPropertyReplacement() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false } }",
             "var win = {};",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode(win).minified) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false }; }",
             "var win = {};",
             "var $mode = { getMode: getMode };",
             "  if (true) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
  }

  @Test public void testGetModePreserve() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false } }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode()) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { minified: false }; }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode()) {",
             "    console.log('hello world');",
             "  }",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { otherProp: true } }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().otherProp) {",
             "    console.log('hello world');",
             "  }",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "function getMode() { return { otherProp: true }; }",
             "var $mode = { getMode: getMode };",
             "  if ($mode.getMode().otherProp) {",
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
             "const IS_DEV = false;",
             "const IS_MINIFIED = true;",
             "const IS_SOMETHING = true;",
            "})()"));
  }

  @Test public void testRemoveAmpAddExtensionCallWithExplicitContext() throws Exception {
    test(
        LINE_JOINER.join(
            "var a = 'hello';",
            "self.AMP.extension('hello', '0.1', function(AMP) {",
            "  var a = 'world';",
            "  console.log(a);",
            "});",
            "console.log(a);"),
        LINE_JOINER.join(
            "var a = 'hello';",
            "(function(AMP) {",
            "  var a = 'world';",
            "  console.log(a);",
            "})(self.AMP);",
            "console.log(a);"));
  }

  @Test public void testRemoveAmpAddExtensionCallWithNoContext() throws Exception {
    test(
        LINE_JOINER.join(
            "var a = 'hello';",
            "AMP.extension('hello', '0.1', function(AMP) {",
            "  var a = 'world';",
            "  console.log(a);",
            "});",
            "console.log(a);"),
        LINE_JOINER.join(
            "var a = 'hello';",
            "(function(AMP) {",
            "  var a = 'world';",
            "  console.log(a);",
            "})(self.AMP);",
            "console.log(a);"));
  }
}
