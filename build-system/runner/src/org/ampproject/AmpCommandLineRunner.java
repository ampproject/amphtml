package org.ampproject;


import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.CustomPassExecutionTime;


/**
 * Adds a custom pass for Tree shaking `dev.fine` and `dev.assert` calls.
 */
public class AmpCommandLineRunner extends CommandLineRunner {

  /**
   * List of string suffixes to eliminate from the AST. 
   */
  ImmutableSet<String> suffixTypes = ImmutableSet.of(
      "dev.fine");

  private boolean collapseProperties = false;

  protected AmpCommandLineRunner(String[] args) {
    super(args);
  }

  @Override protected CompilerOptions createOptions() {
    CompilerOptions options = super.createOptions();
    AmpPass ampPass = new AmpPass(getCompiler(), suffixTypes);
    options.setCollapseProperties(collapseProperties);
    options.addCustomPass(CustomPassExecutionTime.BEFORE_OPTIMIZATIONS, ampPass);
    return options;
  }

  protected void setCollapseProperties(boolean value) {
    collapseProperties = value;
  }

  public static void main(String[] args) {
    boolean collapse = false;
    // NOTE(erwinm): temporary until we figure out a way to either
    // add new flags or a way to read the passed in args
    // easier as the flag information is private.
    for (String arg : args) {
      if (arg.contains("common_js_entry_module") &&
          arg.contains("extensions")) {
        collapse = true;
      }
    }

    AmpCommandLineRunner runner = new AmpCommandLineRunner(args);
    runner.setCollapseProperties(collapse);

    if (runner.shouldRunCompiler()) {
      runner.run();
    }
    if (runner.hasErrors()) {
      System.exit(-1);
    }
  }
}
