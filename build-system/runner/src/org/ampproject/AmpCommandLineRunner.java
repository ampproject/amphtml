/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.ampproject;

import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.FlagUsageException;
import com.google.javascript.jscomp.PropertyRenamingPolicy;
import com.google.javascript.jscomp.VariableRenamingPolicy;

import java.io.IOException;


/**
 * Sets custom closure compiler flags that cannot be set via the command line.
 */
public class AmpCommandLineRunner extends CommandLineRunner {

  /**
   * Identifies if the runner only needs to do type checking.
   */
  private boolean typecheck_only = false;

  private boolean pseudo_names = false;

  protected AmpCommandLineRunner(String[] args) {
    super(args);
  }

  @Override protected CompilerOptions createOptions() {
    if (typecheck_only) {
      return createTypeCheckingOptions();
    }
    CompilerOptions options = super.createOptions();
    options.setCollapsePropertiesLevel(CompilerOptions.PropertyCollapseLevel.ALL);
    options.setDevirtualizeMethods(true);
    options.setExtractPrototypeMemberDeclarations(true);
    options.setSmartNameRemoval(true);
    options.optimizeCalls = true;
    // Have to turn this off because we cannot know whether sub classes
    // might override a method. In the future this might be doable
    // with using a more complete extern file instead.
    options.setRemoveUnusedPrototypeProperties(false);
    options.setComputeFunctionSideEffects(false);
    // Property renaming. Relies on AmpCodingConvention to be safe.
    options.setRenamingPolicy(VariableRenamingPolicy.ALL,
        PropertyRenamingPolicy.ALL_UNQUOTED);
    options.setGeneratePseudoNames(pseudo_names);
    return options;
  }

  @Override protected void setRunOptions(CompilerOptions options)
      throws IOException, FlagUsageException {
    super.setRunOptions(options);
    options.setCodingConvention(new AmpCodingConvention());
  }

  /**
   * Create the most basic CompilerOptions instance with type checking turned on.
   */
  protected CompilerOptions createTypeCheckingOptions() {
    CompilerOptions options = super.createOptions();
    options.setCheckTypes(true);
    options.setInferTypes(true);
    return options;
  }

  public static void main(String[] args) {
    AmpCommandLineRunner runner = new AmpCommandLineRunner(args);

    for (String arg : args) {
      if (arg.contains("TYPECHECK_ONLY=true")) {
        runner.typecheck_only = true;
      } else if (arg.contains("PSEUDO_NAMES=true")) {
        runner.pseudo_names = true;
      }
    }

    if (runner.shouldRunCompiler()) {
      runner.run();
    }
    if (runner.hasErrors()) {
      System.exit(-1);
    }
  }
}
