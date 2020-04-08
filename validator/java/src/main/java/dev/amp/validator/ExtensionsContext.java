/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator;

import dev.amp.validator.utils.TagSpecUtils;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * The extensions context keeys track of the extensions that the validator has
 * seen, as well as which have been used, which are required to be used, etc.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ExtensionsContext {
  /**
   * A constructor.
   */
  public ExtensionsContext() {
    // |extensionsLoaded tracks the valid <script> tags loading
    // amp extensions which were seen in the document's head. Most extensions
    // are also added to |extensionsUnusedRequired| when encountered in the
    // head. When a tag is seen later in the document which makes use of an
    // extension, that extension is recorded in |extensionsUsed|.

    this.extensionsLoaded = new HashMap<>();
    extensionsLoaded.put("amp-ad", true);

    this.extensionsUnusedRequired = new ArrayList<>();
    this.extensionMissingErrors = new ArrayList<>();
    this.extensionsUsed = new HashMap<>();
  }

  /**
   * Returns a list of errors accrued while processing the
   * head for tags requiring an extension which was not found.
   *
   * @return returns a list of errors found while processing head
   */
  public List<ValidatorProtos.ValidationError> missingExtensionErrors() {
    final List<ValidatorProtos.ValidationError> out = new ArrayList<>();
    for (final ExtensionMissingError err : this.extensionMissingErrors) {
      if (!this.isExtensionLoaded(err.getMissingExtension())) {
        out.add(err.getMaybeError());
      }
    }

    return out;
  }

  /**
   * Returns false if the named extension has not yet been loaded. Note that
   * this assumes that all extensions will be loaded in the document earlier
   * than their first usage. This is true for amp-foo tags, since the
   * extension must be loaded in the head and amp-foo tags are not supported
   * in the head as per HTML spec.
   *
   * @param extension to check for.
   * @return returns true iff extension is loaded.
   */
  public boolean isExtensionLoaded(@Nonnull final String extension) {
    return this.extensionsLoaded.containsKey(extension);
  }

  /**
   * Returns a list of unused extensions which produce validation errors
   * when unused.
   *
   * @return returns a list of unused extensions.
   */
  public List<String> unusedExtensionsRequired() {
    // Compute Difference: extensionsUnusedRequired_ - extensionsUsed_
    final List<String> out = new ArrayList<>();
    for (final String extension : this.extensionsUnusedRequired) {
      if (!(this.extensionsUsed.containsKey(extension))) {
        out.add(extension);
      }
    }
    Collections.sort(out);
    return out;
  }

  /**
   * Update ExtensionContext state when we encounter an amp extension or
   * tag using an extension.
   *
   * @param result a ValidateTagResult.
   */
  public void updateFromTagResult(@Nonnull final ValidateTagResult result) {
    if (result.getBestMatchTagSpec() == null) {
      return;
    }

    final ParsedTagSpec parsedTagSpec = result.getBestMatchTagSpec();
    final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();

    // Keep track of which extensions are loaded.
    if (tagSpec.hasExtensionSpec()) {
      final ValidatorProtos.ExtensionSpec extensionSpec = tagSpec.getExtensionSpec();
      // This is an always present field if extension spec is set.
      final String extensionName = extensionSpec.getName();

      // Record that we have encountered an extension 'load' tag. This will
      // look like <script custom-element=amp-foo ...> or similar.
      this.extensionsLoaded.put(extensionName, true);
      switch (extensionSpec.getRequiresUsage()) {
        case EXEMPTED: // Fallthrough intended:
        case NONE:
          // This extension does not have usage demonstrated by a tag, for
          // example: amp-dynamic-css-classes
          break;
        case ERROR:
          // TODO(powdercloud): Make enum proto defaults work in generated
          // javascript.
        default: // Default is error
          // Record that a loaded extension indicates a new requirement:
          // namely that some tag must make use of this extension.
          this.extensionsUnusedRequired.add(extensionName);
          break;
      }
    }

    // Record presence of a tag, such as <amp-foo> which requires the usage
    // of an amp extension.
    this.recordUsedExtensions(tagSpec.getRequiresExtensionList());
  }

  /**
   * Records extensions that are used within the document.
   *
   * @param extensions the list of extensions.
   */
  public void recordUsedExtensions(@Nonnull final List<String> extensions) {
    for (final String extension : extensions) {
      this.extensionsUsed.put(extension, true);
    }
  }

  /**
   * Record a possible error to report once we have collected all
   * extensions in the document. If the given extension is missing,
   * then report the given error.
   *
   * @param parsedTagSpec parsed tag spec.
   * @param lineCol       a line/col.
   */
  public void recordFutureErrorsIfMissing(@Nonnull final ParsedTagSpec parsedTagSpec,
                                          @Nonnull final Locator lineCol) {
    final ValidatorProtos.TagSpec tagSpec = parsedTagSpec.getSpec();
    for (final String requiredExtension : tagSpec.getRequiresExtensionList()) {
      if (!this.isExtensionLoaded(requiredExtension)) {
        final ValidatorProtos.ValidationError.Builder error = ValidatorProtos.ValidationError.newBuilder();
        error.setSeverity(ValidatorProtos.ValidationError.Severity.ERROR);
        error.setCode(ValidatorProtos.ValidationError.Code.MISSING_REQUIRED_EXTENSION);
        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        params.add(requiredExtension);
        error.addAllParams(params);
        error.setLine(lineCol.getLineNumber());
        error.setCol(lineCol.getColumnNumber());
        error.setSpecUrl(TagSpecUtils.getTagSpecUrl(tagSpec));

        this.extensionMissingErrors.add(new ExtensionMissingError(requiredExtension, error.build()));
      }
    }
  }

  /**
   * Used as a set, based on key names.
   */
  private Map<String, Boolean> extensionsLoaded;

  /**
   * A list of extension unused required.
   */
  private List<String> extensionsUnusedRequired;

  /**
   * Used as a set, based on key names.
   */
  private Map<String, Boolean> extensionsUsed;

  /**
   * Missing errors extension.
   */
  private List<ExtensionMissingError> extensionMissingErrors;
}
