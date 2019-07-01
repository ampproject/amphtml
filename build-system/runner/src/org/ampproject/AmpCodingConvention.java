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

import com.google.common.collect.ImmutableCollection;
import com.google.common.collect.ImmutableList;
import com.google.javascript.jscomp.ClosureCodingConvention;
import com.google.javascript.jscomp.CodingConvention;
import com.google.javascript.jscomp.CodingConvention.AssertionFunctionSpec;
import com.google.javascript.jscomp.CodingConventions;
import com.google.javascript.rhino.jstype.JSType;
import com.google.javascript.rhino.jstype.JSTypeNative;

import java.util.ArrayList;
import java.util.Collection;


/**
 * A coding convention for AMP.
 */
public final class AmpCodingConvention extends CodingConventions.Proxy {

  /** By default, decorate the ClosureCodingConvention. */
  public AmpCodingConvention() {
    this(new ClosureCodingConvention());
  }

  /** Decorates a wrapped CodingConvention. */
  public AmpCodingConvention(CodingConvention convention) {
    super(convention);
  }

  /**
   * {@inheritDoc}
   * Because AMP objects can travel between compilation units, we consider
   * non-private methods exported.
   * Should we decide to do full-program compilation (for version bound JS
   * delivery), this could go away there.
   */
  @Override public boolean isExported(String name, boolean local) {
    // This stops compiler from inlining functions (local or not) that end with
    // NoInline in their name. Mostly used for externing try-catch to avoid v8
    // de-optimization (https://goo.gl/gvzlDp)
    if (name.endsWith("NoInline")) {
      return true;
    }
    // Bad hack, but we should really not try to inline CSS as these strings can
    // be very long.
    // See https://github.com/ampproject/amphtml/issues/10118
    // cssText is defined in build-system/tasks/css.js#writeCss
    if (name.startsWith("cssText$$module$build$")) {
      return true;
    }

    if (local) {
      return false;
    }
    // This is a special case, of compiler generated super globals.
    // Because we otherwise use ES6 modules throughout, we don't
    // have any other similar variables.
    if (name.startsWith("JSCompiler_")) {
      return false;
    }
    // ES6 generated module names are not exported.
    if (name.contains("$")) {
      return false;
    }
    // Starting with _ explicitly exports a name.
    if (name.startsWith("_")) {
      return true;
    }
    return !name.endsWith("_") && !name.endsWith("ForTesting");
  }

  /**
   * {@inheritDoc}
   * We cannot rename properties we treat as exported, because they may travel
   * between compilation unit.
   */
  @Override public boolean blockRenamingForProperty(String name) {
    return isExported(name, false);
  }
}
