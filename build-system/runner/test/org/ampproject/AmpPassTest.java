
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

  ImmutableSet<String> suffixTypes = ImmutableSet.of(
      "dev$$module$src$log().assert()",
      "dev$$module$src$log().fine()",
      "devAssert$$module$src$log()"
      );

  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of(
      "IS_MINIFIED",
      IR.trueNode());

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of(
      "IS_DEV",
      IR.falseNode());

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ true, suffixTypes, assignmentReplacements,
        prodAssignmentReplacements, "123");
  }

  @Override protected int getNumRepetitions() {
    // This pass only runs once.
    return 1;
  }

  @Test public void testDevFineRemoval() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  dev$$module$src$log().fine('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  'hello world';",
             "  console.log('this is preserved');",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "  dev$$module$src$log().fine();",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  console.log('this is preserved');",
            "})()"));
  }

  @Test public void testDevAssertRemoval() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  devAssert$$module$src$log('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  'hello world';",
             "  console.log('this is preserved');",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "  devAssert$$module$src$log();",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
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
             "  dev$$module$src$log().assert('hello world');",
             "  console.log('this is preserved');",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  \"hello world\";",
             "  console.log('this is preserved');",
            "})()"));
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var someValue = dev$$module$src$log().assert();",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var someValue;",
             "  console.log('this is preserved', someValue);",
            "})()"));
  }

  @Test public void testDevAssertPreserveFirstArg() throws Exception {
    test(
        LINE_JOINER.join(
             "(function() {",
             "  var someValue = dev$$module$src$log().assert(true, 'This is an error');",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var someValue = true;",
             "  console.log('this is preserved', someValue);",
            "})()"));

    test(
        LINE_JOINER.join(
             "(function() {",
             "  function add(a, b) { return a + b; }",
             "  var someValue = add(dev$$module$src$log().assert(3), dev$$module$src$log().assert(3));",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  function add(a, b) { return a + b; }",
             "  var someValue = add(3, 3);",
             "  console.log('this is preserved', someValue);",
            "})()"));
  }

  @Test public void testShouldPreserveNoneCalls() throws Exception {
    test(
        // Does reliasing
        LINE_JOINER.join(
             "(function() {",
             "  var someValue = dev$$module$src$log().assert;",
             "  console.log('this is preserved', someValue);",
            "})()"),
        LINE_JOINER.join(
             "(function() {",
             "  var someValue = dev$$module$src$log().assert;",
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

  @Test public void testAmpVersionReplacement() throws Exception {
    test(
        LINE_JOINER.join(
            "var a = `test${internalRuntimeVersion$$module$src$internal_version()}ing`;",
            "var b = 'test' + internalRuntimeVersion$$module$src$internal_version() + 'ing';",
            "var c = internalRuntimeVersion$$module$src$internal_version();"),
        LINE_JOINER.join(
            "var a = `test${'123'}ing`;",
            "var b = 'test' + '123' + 'ing';",
            "var c = '123';"));
  }
}
