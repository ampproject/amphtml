package org.ampproject;


import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilerOptions;


/**
 * Adds a way to add custom options and custom compiler passes.
 */
public class AmpCommandLineRunner extends CommandLineRunner {

  private boolean collapseProps = false;

  protected AmpCommandLineRunner(String[] args) {
    super(args);
  }

  @Override protected CompilerOptions createOptions() {
    CompilerOptions options = super.createOptions();
    options.setCollapseProperties(collapseProps);
    return options;
  }
  
  protected void setCollapseProps(boolean value) {
    collapseProps = value;
  }

  public static void main(String[] args) {
    boolean collapseValue = false;
     
    // NOTE: temporary until we figure out a way to either
    // add new flags or a way to read the passed in args
    // easier as the flag information is private.
    for (String arg : args) {
      if (arg.contains("common_js_entry_module") && arg.contains("extensions")) {
        collapseValue = true;
      }
    }

    AmpCommandLineRunner runner = new AmpCommandLineRunner(args);
    runner.setCollapseProps(collapseValue);

    if (runner.shouldRunCompiler()) {
      runner.run();
    }
    if (runner.hasErrors()) {
      System.exit(-1);
    }
  }
}
