package org.ampproject;

import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilerOptions;


/**
 * Adds a way to add custom options and custom compiler passes.
 */
public class AmpCommandLineRunner extends CommandLineRunner {

  protected AmpCommandLineRunner(String[] args) {
    super(args);
  }

  public static void main(String[] args) {
    AmpCommandLineRunner runner = new AmpCommandLineRunner(args);
    if (runner.shouldRunCompiler()) {
      runner.run();
    }
    if (runner.hasErrors()) {
      System.exit(-1);
    }
  }
}
