
package org.ampproject;

import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.CompilerTestCase;
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

  @Override protected CompilerPass getProcessor(Compiler compiler) {
    return new AmpPass(compiler, /* isProd */ true, suffixTypes);
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
}
