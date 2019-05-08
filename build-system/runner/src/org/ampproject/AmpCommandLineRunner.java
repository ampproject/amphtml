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


import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import com.google.javascript.jscomp.CommandLineRunner;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.CustomPassExecutionTime;
import com.google.javascript.jscomp.FlagUsageException;
import com.google.javascript.jscomp.PropertyRenamingPolicy;
import com.google.javascript.jscomp.VariableRenamingPolicy;
import com.google.javascript.rhino.IR;
import com.google.javascript.rhino.Node;

import java.io.IOException;
import java.util.Set;


/**
 * Adds a custom pass for Tree shaking `dev.fine` and `dev.assert` calls.
 */
public class AmpCommandLineRunner extends CommandLineRunner {

  /**
   * Identifies if the runner only needs to do type checking.
   */
  private boolean typecheck_only = false;

  private boolean pseudo_names = false;

  private boolean is_production_env = true;

  private boolean single_file_compilation = false;

  private String amp_version = "";

  /**
   * List of string suffixes to eliminate from the AST.
   */
  ImmutableSet<String> suffixTypes = ImmutableSet.of(
      "dev$$module$src$log().assert()",
      "dev$$module$src$log().fine()",
      "dev$$module$src$log().assertElement()",
      "dev$$module$src$log().assertString()",
      "dev$$module$src$log().assertNumber()",
      "dev$$module$src$log().assertArray()",
      "dev$$module$src$log().assertBoolean()",
      "devAssert$$module$src$log()",
      "user$$module$src$log().fine()"
      );


  ImmutableMap<String, Node> assignmentReplacements = ImmutableMap.of(
      "IS_MINIFIED",
      IR.trueNode());

  ImmutableMap<String, Node> prodAssignmentReplacements = ImmutableMap.of(
      "IS_DEV",
      IR.falseNode());

  protected AmpCommandLineRunner(String[] args) {
    super(args);
  }

  @Override protected CompilerOptions createOptions() {
    if (typecheck_only) {
      return createTypeCheckingOptions();
    }
    CompilerOptions options = super.createOptions();
    options.setCollapsePropertiesLevel(CompilerOptions.PropertyCollapseLevel.ALL);
    AmpPass ampPass = new AmpPass(getCompiler(), is_production_env, suffixTypes,
        assignmentReplacements, prodAssignmentReplacements, amp_version, single_file_compilation);
    options.addCustomPass(CustomPassExecutionTime.BEFORE_OPTIMIZATIONS, ampPass);
    options.setDevirtualizePrototypeMethods(true);
    options.setExtractPrototypeMemberDeclarations(true);
    options.setSmartNameRemoval(true);
    options.optimizeCalls = true;
    if (!single_file_compilation) {
      // Have to turn this off because we cannot know whether sub classes
      // might override a method. In the future this might be doable
      // with using a more complete extern file instead.
      options.setRemoveUnusedPrototypeProperties(false);
      options.setInlineProperties(false);
      options.setComputeFunctionSideEffects(false);
      // Since we are not computing function side effects, at least let the
      // compiler remove calls to functions with `@nosideeffects`.
      options.setMarkNoSideEffectCalls(true);
      // Property renaming. Relies on AmpCodingConvention to be safe.
      options.setRenamingPolicy(VariableRenamingPolicy.ALL,
          PropertyRenamingPolicy.ALL_UNQUOTED);
    }
    options.setDisambiguatePrivateProperties(true);
    options.setGeneratePseudoNames(pseudo_names);
    return options;
  }

  @Override protected void setRunOptions(CompilerOptions options)
      throws IOException, FlagUsageException {
    super.setRunOptions(options);
    options.setCodingConvention(new AmpCodingConvention(single_file_compilation));
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

    // Scan for TYPECHECK_ONLY string which we pass in as a --define
    for (String arg : args) {
      if (arg.contains("TYPECHECK_ONLY=true")) {
        runner.typecheck_only = true;
      } else if (arg.contains("FORTESTING=true")) {
        runner.is_production_env = false;
      } else if (arg.contains("PSEUDO_NAMES=true")) {
        runner.pseudo_names = true;
      } else if (arg.contains("SINGLE_FILE_COMPILATION=true")) {
        runner.single_file_compilation = true;
      } else if (arg.contains("VERSION=")) {
        runner.amp_version = arg.substring(arg.lastIndexOf("=") + 1);
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
