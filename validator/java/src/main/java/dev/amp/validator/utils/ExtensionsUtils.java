package dev.amp.validator.utils;

import dev.amp.validator.Context;
import dev.amp.validator.ParsedHtmlTag;
import dev.amp.validator.ValidatorProtos;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

import static dev.amp.validator.utils.ExtensionsUtils.ScriptReleaseVersion.LTS;
import static dev.amp.validator.utils.ExtensionsUtils.ScriptReleaseVersion.UNKNOWN;

/**
 * Utils to handle extension validation
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ExtensionsUtils {
  /**
   * Private constructor.
   */
  private ExtensionsUtils() {
  }

  // If any script in the page uses LTS, all scripts must use LTS. This is used to
  // record when a script is seen and validate following script tags.
  public enum ScriptReleaseVersion {
    /**
     * UNKNOWN
     */
    UNKNOWN,
    /**
     * STANDARD
     */
    STANDARD,
    /**
     * LTS
     */
    LTS,
  }

  /**
   * Tests if a tag is an extension script tag.
   *
   * @param tag to test
   * @return true iff a tag is an extension script tag
   */
  public static boolean isExtensionScript(final ParsedHtmlTag tag) {
    // checks for a falsy value of ExtensionScriptNameAttribute,
    // falsy means null or empty string
    return !extensionScriptNameAttribute(tag).equals("");
  }

  /**
   * Tests if a tag is the AMP runtime script tag.
   *
   * @param tag to test
   * @return true iff a tag is the AMP runtime script tag.
   */
  public static boolean isAmpRuntimeScript(final ParsedHtmlTag tag) {
    final String src = (tag.attrsByKey().get("src") != null) ? tag.attrsByKey().get("src") : "";
    return isAsyncScriptTag(tag) && !isExtensionScript(tag)
      && src.startsWith("https://cdn.ampproject.org/") && src.endsWith("/v0.js");
  }

  /**
   * Tests if a tag is an async script tag.
   *
   * @param tag to test
   * @return true iff a tag is an async script tag.
   */
  public static boolean isAsyncScriptTag(final ParsedHtmlTag tag) {
    return tag.upperName().equals("SCRIPT") && tag.attrsByKey().
      containsKey("async") && tag.attrsByKey().containsKey("src");
  }

  /**
   * Tests if a URL is for the LTS version of a script.
   *
   * @param url to test
   * @return true iff a URL is for the LTS version of a script.
   */
  public static boolean isLtsScriptUrl(@Nonnull final String url) {
    return url.startsWith("https://cdn.ampproject.org/lts/");
  }

  /**
   * Gets the name attribute for an extension script tag.
   *
   * @param tag to extract name attribute from
   * @return name attribute for an extension script tag
   */
  public static String extensionScriptNameAttribute(@Nonnull final ParsedHtmlTag tag) {
    if (tag.upperName().equals("SCRIPT")) {
      final String[] myStringArray = new String[]{"custom-element", "custom-template", "host-service"};
      for (final String attribute : myStringArray) {
        if (tag.attrsByKey().containsKey(attribute)) {
          return attribute;
        }
      }
    }
    return "";
  }

  /**
   * Gets the extension name for an extension script tag.
   *
   * @param tag to get extension name from
   * @return extension name for an extension script tag
   */
  public static String extensionScriptName(final ParsedHtmlTag tag) {
    final String nameAttr = extensionScriptNameAttribute(tag);
    if (nameAttr != null) {
      // Extension script names are required to be in lowercase by the validator,
      // so we don't need to lowercase them here.
      return (tag.attrsByKey().get(nameAttr) != null) ? tag.attrsByKey().get(nameAttr) : "";
    }
    return "";
  }

  /**
   * Validates that LTS is used for either all script sources or none.
   *
   * @param srcAttr the attr to check
   * @param tagSpec the spec to check against
   * @param context global context
   * @param result  record to update
   */
  public static void validateScriptSrcAttr(@Nonnull final String srcAttr, @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                           @Nonnull final Context context, @Nonnull final ValidatorProtos.ValidationResult.Builder result) {
    if (context.getScriptReleaseVersion() == UNKNOWN) {
      return;
    }
    final ExtensionsUtils.ScriptReleaseVersion scriptReleaseVersion = isLtsScriptUrl(srcAttr) ? LTS
      : ExtensionsUtils.ScriptReleaseVersion.STANDARD;
    if (context.getScriptReleaseVersion() != scriptReleaseVersion) {
      List<String> params = new ArrayList<>();
      final String specName = (tagSpec.hasExtensionSpec())
        ? tagSpec.getExtensionSpec().getName() : tagSpec.getSpecName();
      params.add(specName);
      context.addError(
        scriptReleaseVersion == LTS
          ? ValidatorProtos.ValidationError.Code.LTS_SCRIPT_AFTER_NON_LTS
          : ValidatorProtos.ValidationError.Code.NON_LTS_SCRIPT_AFTER_LTS,
        context.getLineCol(), params,
        "https://amp.dev/documentation/guides-and-tutorials/learn/spec/amphtml#required-markup",
        result);
    }
  }
}
